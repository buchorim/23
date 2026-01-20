import { NextRequest, NextResponse } from 'next/server';
import { checkAdminDbAvailable, dbErrorResponse } from '@/lib/supabase';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/apiAuth';

interface BlockedIP {
    id: string;
    ip_address: string;
    reason: string;
    request_count: number;
    blocked_at: string;
    expires_at: string | null;
    is_permanent: boolean;
}

// GET - List all blocked IPs
export async function GET(request: NextRequest) {
    const db = checkAdminDbAvailable();
    if (!db.available) {
        return NextResponse.json({ blockedIps: [] });
    }

    try {
        const { data, error } = await db.client
            .from('blocked_ips')
            .select('*')
            .order('blocked_at', { ascending: false });

        if (error) throw error;

        // Filter out expired non-permanent blocks
        const now = new Date();
        const activeBlocks = (data as BlockedIP[] || []).filter(ip => {
            if (ip.is_permanent) return true;
            if (!ip.expires_at) return true;
            return new Date(ip.expires_at) > now;
        });

        return NextResponse.json({ blockedIps: activeBlocks });
    } catch (error) {
        console.error('Get blocked IPs error:', error);
        return NextResponse.json({ blockedIps: [] });
    }
}

// POST - Block an IP
export async function POST(request: NextRequest) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    const db = checkAdminDbAvailable();
    if (!db.available) {
        return db.response;
    }

    try {
        const body = await request.json();
        const { ip_address, reason, is_permanent, expires_hours } = body;

        if (!ip_address) {
            return NextResponse.json(
                { error: 'IP address diperlukan' },
                { status: 400 }
            );
        }

        const expires_at = is_permanent
            ? null
            : new Date(Date.now() + (expires_hours || 24) * 60 * 60 * 1000).toISOString();

        const { data, error } = await db.client
            .from('blocked_ips')
            .upsert({
                ip_address,
                reason: reason || 'Manually blocked by admin',
                is_permanent: is_permanent || false,
                expires_at,
                blocked_at: new Date().toISOString(),
            } as never, { onConflict: 'ip_address' })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, blockedIp: data });
    } catch (error) {
        return dbErrorResponse(error);
    }
}

// DELETE - Unblock an IP
export async function DELETE(request: NextRequest) {
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
        const ip = searchParams.get('ip');
        const id = searchParams.get('id');

        if (!ip && !id) {
            return NextResponse.json(
                { error: 'IP address atau ID diperlukan' },
                { status: 400 }
            );
        }

        let query = db.client.from('blocked_ips').delete();

        if (id) {
            query = query.eq('id', id);
        } else if (ip) {
            query = query.eq('ip_address', ip);
        }

        const { error } = await query;

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return dbErrorResponse(error);
    }
}
