import { NextRequest, NextResponse } from 'next/server';
import { checkAdminDbAvailable } from '@/lib/supabase';

interface TrafficState {
    id: number;
    baseline_traffic: number;
    current_traffic: number;
    spike_ratio: number;
    request_count_window: number;
    concurrent_users: number;
    is_overloaded: boolean;
    recovery_progress: number;
    last_updated: string;
}

// Default traffic state when database not available
const DEFAULT_STATE: TrafficState = {
    id: 1,
    baseline_traffic: 10,
    current_traffic: 0,
    spike_ratio: 0,
    request_count_window: 0,
    concurrent_users: 0,
    is_overloaded: false,
    recovery_progress: 1,
    last_updated: new Date().toISOString(),
};

// GET - Get traffic state
export async function GET() {
    const db = checkAdminDbAvailable();
    if (!db.available) {
        return NextResponse.json(DEFAULT_STATE);
    }

    try {
        const { data, error } = await db.client
            .from('traffic_state')
            .select('*')
            .eq('id', 1)
            .single();

        if (error || !data) {
            return NextResponse.json(DEFAULT_STATE);
        }

        // Apply decay to concurrent_users for display
        const state = data as TrafficState;
        const lastUpdated = new Date(state.last_updated).getTime();
        const now = Date.now();
        const elapsedSeconds = (now - lastUpdated) / 1000;

        // Decay concurrent_users: reduce by 50% every 10 seconds of inactivity
        if (elapsedSeconds > 5) {
            const decayFactor = Math.pow(0.5, elapsedSeconds / 10);
            state.concurrent_users = Math.floor((state.concurrent_users || 0) * decayFactor);

            // Reset spike if window expired
            const windowSeconds = 60; // default
            if (elapsedSeconds >= windowSeconds) {
                state.request_count_window = 0;
                state.current_traffic = 0;
                state.spike_ratio = 0;
            }
        }

        return NextResponse.json(state);
    } catch (error) {
        console.error('Get traffic state error:', error);
        return NextResponse.json(DEFAULT_STATE);
    }
}

// POST - Update traffic state (for middleware checks)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const action = body.action as string;

        const db = checkAdminDbAvailable();
        if (!db.available) {
            // Return allowed if database not available (fail-open)
            return NextResponse.json({
                allowed: true,
                reason: 'db_unavailable',
                state: DEFAULT_STATE
            });
        }

        // Get current state
        const { data: stateData, error: stateError } = await db.client
            .from('traffic_state')
            .select('*')
            .eq('id', 1)
            .single();

        const state = stateData as TrafficState | null;

        if (stateError || !state) {
            return NextResponse.json({
                allowed: true,
                reason: 'no_state',
                state: DEFAULT_STATE
            });
        }

        // Get config
        const { data: configRows } = await db.client
            .from('traffic_config')
            .select('*');

        const config: Record<string, number> = {};
        (configRows || []).forEach((row: { key: string; value: number }) => {
            config[row.key] = row.value;
        });

        const spikeThreshold = config.spike_trigger_percentage || 120;
        const hardOverload = config.hard_overload_percentage || 200;
        const maxConcurrent = config.max_concurrent_users || 1000;
        const windowSeconds = config.window_seconds || 60;

        // Auto-decay: calculate elapsed time since last update
        const lastUpdated = new Date(state.last_updated).getTime();
        const now = Date.now();
        const elapsedSeconds = (now - lastUpdated) / 1000;

        // Decay concurrent_users: reduce by 50% every 10 seconds of inactivity
        if (elapsedSeconds > 5) {
            const decayFactor = Math.pow(0.5, elapsedSeconds / 10);
            const decayedConcurrent = Math.floor((state.concurrent_users || 0) * decayFactor);
            state.concurrent_users = decayedConcurrent;

            // Reset request_count_window if window expired
            if (elapsedSeconds >= windowSeconds) {
                state.request_count_window = 0;
                state.current_traffic = 0;
                state.spike_ratio = 0;
            }
        }

        if (action === 'check' || action === 'check_and_increment') {
            // First increment if check_and_increment
            if (action === 'check_and_increment') {
                const newRequestCount = (state.request_count_window || 0) + 1;
                const newConcurrent = (state.concurrent_users || 0) + 1;

                // Calculate current traffic (requests per second based on window)
                const windowSeconds = config.window_seconds || 60;
                const currentTraffic = newRequestCount / windowSeconds;

                // Calculate spike ratio vs baseline
                const baseline = state.baseline_traffic || 10;
                const calculatedSpikeRatio = baseline > 0 ? (currentTraffic / baseline) * 100 : 0;

                // Update baseline using exponential moving average
                const alpha = config.baseline_alpha || 0.1;
                const newBaseline = baseline * (1 - alpha) + currentTraffic * alpha;

                // Check if overloaded
                const nowOverloaded = calculatedSpikeRatio >= hardOverload;

                // Update state in database
                const { error: updateError } = await db.client
                    .from('traffic_state')
                    .update({
                        request_count_window: newRequestCount,
                        concurrent_users: newConcurrent,
                        current_traffic: currentTraffic,
                        spike_ratio: calculatedSpikeRatio,
                        baseline_traffic: newBaseline > 0.1 ? newBaseline : baseline,
                        is_overloaded: nowOverloaded,
                        recovery_progress: nowOverloaded ? 0 : 1,
                        last_updated: new Date().toISOString(),
                    } as never)
                    .eq('id', 1);

                if (updateError) {
                    console.error('Traffic update error:', updateError);
                }

                // Update local state for check
                state.spike_ratio = calculatedSpikeRatio;
                state.concurrent_users = newConcurrent;
                state.is_overloaded = nowOverloaded;
            }

            // Check if request should be allowed
            const spikeRatio = state.spike_ratio || 0;
            const concurrent = state.concurrent_users || 0;
            const isOverloaded = state.is_overloaded || false;

            // Hard overload - reject all
            if (spikeRatio >= hardOverload || isOverloaded) {
                return NextResponse.json({
                    allowed: false,
                    reason: 'hard_overload',
                    state,
                });
            }

            // Max concurrent reached
            if (concurrent >= maxConcurrent) {
                return NextResponse.json({
                    allowed: false,
                    reason: 'max_concurrent',
                    state,
                });
            }

            // Spike detected - allow but track
            if (spikeRatio >= spikeThreshold) {
                return NextResponse.json({
                    allowed: true,
                    warning: 'spike_detected',
                    state,
                });
            }

            return NextResponse.json({
                allowed: true,
                state
            });
        }

        if (action === 'increment') {
            // Increment request count and concurrent users
            const newRequestCount = (state.request_count_window || 0) + 1;
            const newConcurrent = (state.concurrent_users || 0) + 1;

            // Calculate current traffic (requests per second based on window)
            const windowSeconds = config.window_seconds || 60;
            const currentTraffic = newRequestCount / windowSeconds;

            // Calculate spike ratio vs baseline
            const baseline = state.baseline_traffic || 10;
            const spikeRatio = baseline > 0 ? (currentTraffic / baseline) * 100 : 0;

            // Update baseline using exponential moving average (slowly adapts)
            const alpha = config.baseline_alpha || 0.1;
            const newBaseline = baseline * (1 - alpha) + currentTraffic * alpha;

            // Check if overloaded
            const isOverloaded = spikeRatio >= (config.hard_overload_percentage || 200);

            await db.client
                .from('traffic_state')
                .update({
                    request_count_window: newRequestCount,
                    concurrent_users: newConcurrent,
                    current_traffic: currentTraffic,
                    spike_ratio: spikeRatio,
                    baseline_traffic: newBaseline > 0.1 ? newBaseline : baseline,
                    is_overloaded: isOverloaded,
                    recovery_progress: isOverloaded ? 0 : 1,
                    last_updated: new Date().toISOString(),
                } as never)
                .eq('id', 1);

            return NextResponse.json({ success: true });
        }

        if (action === 'decrement') {
            // Decrement concurrent users
            await db.client
                .from('traffic_state')
                .update({
                    concurrent_users: Math.max(0, (state.concurrent_users || 0) - 1),
                    last_updated: new Date().toISOString(),
                } as never)
                .eq('id', 1);

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    } catch (error) {
        console.error('Traffic state error:', error);
        // Fail open
        return NextResponse.json({
            allowed: true,
            reason: 'error',
            state: DEFAULT_STATE
        });
    }
}
