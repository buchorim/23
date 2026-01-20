import { NextRequest, NextResponse } from 'next/server';
import { checkAdminDbAvailable } from '@/lib/supabase';

// POST - Track page view (public endpoint, no auth required)
export async function POST(request: NextRequest) {
    const db = checkAdminDbAvailable();
    if (!db.available) {
        // Silently fail if database not available
        return NextResponse.json({ success: false, reason: 'db_unavailable' });
    }

    try {
        const body = await request.json();
        const {
            page_path,
            visitor_id,
            referrer,
            device_type,
            browser,
            os,
            country,
            duration_seconds,
        } = body;

        if (!page_path || !visitor_id) {
            return NextResponse.json(
                { error: 'page_path and visitor_id required' },
                { status: 400 }
            );
        }

        const insertData = {
            page_path,
            visitor_id,
            referrer: referrer || null,
            device_type: device_type || 'unknown',
            browser: browser || null,
            os: os || null,
            country: country || null,
            duration_seconds: duration_seconds || 0,
        };

        const { error } = await db.client
            .from('page_views')
            .insert(insertData as never);

        if (error) {
            console.error('Page view track error:', error);
            return NextResponse.json({ success: false, reason: 'insert_failed' });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Track error:', error);
        return NextResponse.json({ success: false, reason: 'error' });
    }
}
