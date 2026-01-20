import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET - Export analytics data as CSV
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'current'; // current, archive, all
        const format = searchParams.get('format') || 'csv';
        const startDate = searchParams.get('start');
        const endDate = searchParams.get('end');

        const adminClient = createAdminClient();

        let data: Record<string, unknown>[] = [];

        if (type === 'current' || type === 'all') {
            let query = adminClient
                .from('page_views')
                .select('*')
                .order('created_at', { ascending: false });

            if (startDate) {
                query = query.gte('created_at', startDate);
            }
            if (endDate) {
                query = query.lte('created_at', endDate);
            }

            const { data: currentData, error } = await query;
            if (error) throw error;
            data = [...data, ...(currentData || [])];
        }

        if (type === 'archive' || type === 'all') {
            let query = adminClient
                .from('page_views_archive')
                .select('*')
                .order('created_at', { ascending: false });

            if (startDate) {
                query = query.gte('created_at', startDate);
            }
            if (endDate) {
                query = query.lte('created_at', endDate);
            }

            const { data: archiveData, error } = await query;
            if (!error && archiveData) {
                data = [...data, ...archiveData.map(row => ({ ...(row as Record<string, unknown>), is_archived: true }))];
            }
        }

        if (format === 'json') {
            return NextResponse.json({
                data,
                count: data.length,
                type,
                exported_at: new Date().toISOString(),
            });
        }

        // Generate CSV
        if (data.length === 0) {
            return new NextResponse('No data to export', { status: 404 });
        }

        const headers = [
            'id', 'page_path', 'page_title', 'visitor_id', 'session_id',
            'referrer', 'device_type', 'duration_seconds', 'created_at', 'is_archived'
        ];

        const csvRows = [
            headers.join(','),
            ...data.map(row =>
                headers.map(h => {
                    const val = row[h as keyof typeof row];
                    if (val === null || val === undefined) return '';
                    const str = String(val);
                    // Escape quotes and wrap in quotes if contains comma
                    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                        return `"${str.replace(/"/g, '""')}"`;
                    }
                    return str;
                }).join(',')
            )
        ];

        const csv = csvRows.join('\n');
        const filename = `analytics_${type}_${new Date().toISOString().split('T')[0]}.csv`;

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Error exporting analytics:', error);
        return NextResponse.json(
            { error: 'Failed to export analytics' },
            { status: 500 }
        );
    }
}
