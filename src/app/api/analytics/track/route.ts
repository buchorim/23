import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// POST - Track page view
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            page_path,
            page_title,
            visitor_id,
            session_id,
            referrer,
            duration_seconds,
        } = body;

        if (!page_path || !visitor_id || !session_id) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get device type from user agent
        const userAgent = request.headers.get('user-agent') || '';
        const deviceType = /mobile|android|iphone|ipad/i.test(userAgent)
            ? 'mobile'
            : 'desktop';

        const adminClient = createAdminClient();
        const insertData = {
            page_path,
            page_title: page_title || null,
            visitor_id,
            session_id,
            referrer: referrer || null,
            user_agent: userAgent,
            device_type: deviceType,
            duration_seconds: duration_seconds || 0,
        };

        const { error } = await adminClient
            .from('page_views')
            .insert(insertData as never);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking page view:', error);
        return NextResponse.json(
            { error: 'Failed to track' },
            { status: 500 }
        );
    }
}
