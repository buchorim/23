import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/apiAuth';

interface ConfigRow {
    key: string;
    value: number;
    description: string;
}

// GET - Get all traffic config
export async function GET() {
    try {
        const adminClient = createAdminClient();

        const { data, error } = await adminClient
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
        return NextResponse.json(
            { error: 'Failed to get traffic config' },
            { status: 500 }
        );
    }
}

// POST - Update traffic config
export async function POST(request: NextRequest) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
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

        const adminClient = createAdminClient();

        // Update each config value
        for (const [key, value] of Object.entries(updates)) {
            const { error } = await adminClient
                .from('traffic_config')
                .update({ value } as never)
                .eq('key', key);

            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update traffic config error:', error);
        return NextResponse.json(
            { error: 'Failed to update traffic config' },
            { status: 500 }
        );
    }
}
