import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/apiAuth';

interface StatsRow {
    page_path: string;
    visitor_id: string;
    created_at: string;
    duration_seconds: number;
    device_type: string;
}

// GET - Get analytics stats
export async function GET(request: NextRequest) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '7d'; // 7d, 30d, all

        const adminClient = createAdminClient();

        // Calculate date range
        let startDate: Date;
        const now = new Date();

        switch (period) {
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'all':
                startDate = new Date(0);
                break;
            default: // 7d
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        // Fetch page views
        const { data: views, error } = await adminClient
            .from('page_views')
            .select('page_path, visitor_id, created_at, duration_seconds, device_type')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;

        const pageViews = (views || []) as StatsRow[];

        // Calculate stats
        const totalViews = pageViews.length;
        const uniqueVisitors = new Set(pageViews.map(v => v.visitor_id)).size;
        const avgDuration = pageViews.length > 0
            ? Math.round(pageViews.reduce((sum, v) => sum + (v.duration_seconds || 0), 0) / pageViews.length)
            : 0;

        // Device breakdown
        const mobileViews = pageViews.filter(v => v.device_type === 'mobile').length;
        const desktopViews = pageViews.filter(v => v.device_type === 'desktop').length;

        // Top pages
        const pageCounts: Record<string, number> = {};
        pageViews.forEach(v => {
            pageCounts[v.page_path] = (pageCounts[v.page_path] || 0) + 1;
        });
        const topPages = Object.entries(pageCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([path, count]) => ({ path, count }));

        // Daily views for chart (last 7 days)
        const dailyViews: Record<string, number> = {};
        const dailyVisitors: Record<string, Set<string>> = {};

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            dailyViews[dateStr] = 0;
            dailyVisitors[dateStr] = new Set();
        }

        pageViews.forEach(v => {
            const dateStr = v.created_at.split('T')[0];
            if (dailyViews[dateStr] !== undefined) {
                dailyViews[dateStr]++;
                dailyVisitors[dateStr].add(v.visitor_id);
            }
        });

        const chartData = Object.entries(dailyViews).map(([date, views]) => ({
            date,
            views,
            visitors: dailyVisitors[date]?.size || 0,
        }));

        // Calculate growth (compare this week vs last week)
        const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const { data: lastWeekViews } = await adminClient
            .from('page_views')
            .select('id')
            .gte('created_at', lastWeekStart.toISOString())
            .lt('created_at', thisWeekStart.toISOString());

        const lastWeekCount = lastWeekViews?.length || 0;
        const thisWeekCount = totalViews;
        const growthPercent = lastWeekCount > 0
            ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
            : thisWeekCount > 0 ? 100 : 0;

        return NextResponse.json({
            stats: {
                totalViews,
                uniqueVisitors,
                avgDuration,
                growthPercent,
                mobileViews,
                desktopViews,
            },
            topPages,
            chartData,
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
