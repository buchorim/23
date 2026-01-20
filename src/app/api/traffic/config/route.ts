import { NextRequest, NextResponse } from 'next/server';
import { checkAdminDbAvailable, dbErrorResponse } from '@/lib/supabase';

interface ConfigRow {
    key: string;
    value: number;
    description: string;
}

// GET - Get all traffic config
export async function GET() {
    const db = checkAdminDbAvailable();
    if (!db.available) {
        // Return default config if not available
        return NextResponse.json({
            config: {
                spike_trigger_percentage: 120,
                hard_overload_percentage: 200,
                max_concurrent_users: 1000,
                recovery_rate: 0.1,
                baseline_alpha: 0.1,
                window_seconds: 60,
            }
        });
    }

    try {
        const { data, error } = await db.client
            .from('traffic_config')
            .select('*')
            .order('key');

        if (error) throw error;

        // Convert to object
        const config: Record<string, number> = {};
        (data as ConfigRow[] || []).forEach(row => {
            config[row.key] = row.value;
        });

        return NextResponse.json({ config });
    } catch (error) {
        console.error('Get traffic config error:', error);
        return NextResponse.json({
            config: {
                spike_trigger_percentage: 120,
                hard_overload_percentage: 200,
                max_concurrent_users: 1000,
                recovery_rate: 0.1,
                baseline_alpha: 0.1,
                window_seconds: 60,
            }
        });
    }
}

// POST - Update traffic config
export async function POST(request: NextRequest) {
    const db = checkAdminDbAvailable();
    if (!db.available) {
        return db.response;
    }

    try {
        const body = await request.json();
        const updates = body.config as Record<string, number>;

        if (!updates || typeof updates !== 'object') {
            return NextResponse.json(
                { error: 'Config object required' },
                { status: 400 }
            );
        }

        // Update each config value
        for (const [key, value] of Object.entries(updates)) {
            const { error } = await db.client
                .from('traffic_config')
                .update({ value } as never)
                .eq('key', key);

            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return dbErrorResponse(error);
    }
}
