import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

interface TrafficCheckResult {
    is_allowed: boolean;
    reject_reason: string | null;
    current_spike_ratio: number;
    current_concurrent: number;
}

// POST - Check and update traffic state (called by middleware)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const action = body.action as string; // 'check', 'increment', 'decrement'

        const adminClient = createAdminClient();

        if (action === 'check') {
            // Check if request should be allowed and increment request count
            // Use raw SQL call since RPC types are strict
            const { data, error } = await adminClient
                .from('traffic_state')
                .select('*')
                .eq('id', 1)
                .single();

            if (error) {
                console.error('Traffic state fetch error:', error);
                // Fallback - allow on error
                return NextResponse.json({
                    allowed: true,
                    reason: null,
                    spike_ratio: 0,
                    concurrent: 0,
                });
            }

            // Simple check without RPC (RPC requires DB function setup)
            const state = data as {
                baseline_traffic: number;
                current_traffic: number;
                concurrent_users: number;
                recovery_progress: number;
                request_count_window: number;
            };

            // Update request count
            await adminClient
                .from('traffic_state')
                .update({
                    request_count_window: (state?.request_count_window || 0) + 1,
                    last_updated: new Date().toISOString(),
                } as never)
                .eq('id', 1);

            // Calculate spike ratio
            const spikeRatio = ((state?.current_traffic || 1) / Math.max(state?.baseline_traffic || 1, 1)) * 100;

            // For now, allow all (proper protection requires RPC function)
            return NextResponse.json({
                allowed: true,
                reason: null,
                spike_ratio: spikeRatio,
                concurrent: state?.concurrent_users || 0,
            });
        }

        if (action === 'increment') {
            // Increment concurrent users
            const { data: current } = await adminClient
                .from('traffic_state')
                .select('concurrent_users')
                .eq('id', 1)
                .single();

            await adminClient
                .from('traffic_state')
                .update({
                    concurrent_users: ((current as unknown as { concurrent_users: number })?.concurrent_users || 0) + 1,
                } as never)
                .eq('id', 1);

            return NextResponse.json({ success: true });
        }

        if (action === 'decrement') {
            // Decrement concurrent users
            const { data: current } = await adminClient
                .from('traffic_state')
                .select('concurrent_users')
                .eq('id', 1)
                .single();

            await adminClient
                .from('traffic_state')
                .update({
                    concurrent_users: Math.max(0, ((current as unknown as { concurrent_users: number })?.concurrent_users || 0) - 1),
                } as never)
                .eq('id', 1);

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Traffic state error:', error);
        // On error, allow request (fail-open)
        return NextResponse.json({
            allowed: true,
            reason: null,
            error: 'Internal error, allowing request',
        });
    }
}

// GET - Get current traffic state (for dashboard)
export async function GET() {
    try {
        const adminClient = createAdminClient();

        const { data, error } = await adminClient
            .from('traffic_state')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            console.error('Get traffic state error:', error);
            return NextResponse.json({
                baseline_traffic: 10,
                current_traffic: 0,
                spike_ratio: 0,
                concurrent_users: 0,
                is_overloaded: false,
                recovery_progress: 1,
            });
        }

        const state = data as {
            baseline_traffic: number;
            current_traffic: number;
            concurrent_users: number;
            is_overloaded: boolean;
            recovery_progress: number;
        };

        // Calculate spike ratio
        const spikeRatio = ((state?.current_traffic || 0) / Math.max(state?.baseline_traffic || 1, 1)) * 100;

        return NextResponse.json({
            ...state,
            spike_ratio: spikeRatio,
        });
    } catch (error) {
        console.error('Get traffic state error:', error);
        return NextResponse.json(
            { error: 'Failed to get traffic state' },
            { status: 500 }
        );
    }
}
