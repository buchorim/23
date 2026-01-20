import { NextRequest, NextResponse } from 'next/server';
import { checkAdminDbAvailable, dbErrorResponse } from '@/lib/supabase';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/apiAuth';

// GET - Export analytics data as CSV
export async function GET(request: NextRequest) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    const db = checkAdminDbAvailable();
    if (!db.available) {
        return db.response;
    }

    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'current';
        const format = searchParams.get('format') || 'csv';
        const startDate = searchParams.get('start');
        const endDate = searchParams.get('end');

        let data: Record<string, unknown>[] = [];

        if (type === 'current' || type === 'all') {
            let query = db.client
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
            let archiveQuery = db.client
                .from('page_views_archive')
                .select('*')
                .order('created_at', { ascending: false });

            if (startDate) {
                archiveQuery = archiveQuery.gte('created_at', startDate);
            }
            if (endDate) {
                archiveQuery = archiveQuery.lte('created_at', endDate);
            }

            const { data: archiveData } = await archiveQuery;
            if (archiveData) {
                data = [...data, ...archiveData];
            }
        }

        if (format === 'json') {
            return NextResponse.json({ data, count: data.length });
        }

        // CSV format
        if (data.length === 0) {
            return new NextResponse('No data to export', { status: 404 });
        }

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row =>
                headers.map(h => {
                    const val = row[h];
                    if (val === null || val === undefined) return '';
                    if (typeof val === 'string' && val.includes(',')) {
                        return `"${val.replace(/"/g, '""')}"`;
                    }
                    return String(val);
                }).join(',')
            )
        ];

        return new NextResponse(csvRows.join('\n'), {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="analytics_${type}_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        return dbErrorResponse(error);
    }
}
