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

        return NextResponse.json(data);
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

        if (action === 'check') {
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
            await db.client
                .from('traffic_state')
                .update({
                    request_count_window: (state.request_count_window || 0) + 1,
                    concurrent_users: (state.concurrent_users || 0) + 1,
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
