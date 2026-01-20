import { NextRequest, NextResponse } from 'next/server';
import { checkDbAvailable, checkAdminDbAvailable, dbErrorResponse } from '@/lib/supabase';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/apiAuth';

interface Announcement {
    id: string;
    title: string;
    message: string;
    type: string;
    active: boolean;
    show_once: boolean;
    expires_at: string | null;
    created_at: string;
}

// GET - Fetch active announcement
export async function GET() {
    const db = checkDbAvailable();
    if (!db.available) {
        // Return null announcement instead of error for public endpoint
        return NextResponse.json({ announcement: null });
    }

    try {
        const { data, error } = await db.client
            .from('announcements')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            return NextResponse.json({ announcement: null });
        }

        const announcement = data as Announcement;

        // Check if expired
        if (announcement.expires_at && new Date(announcement.expires_at) < new Date()) {
            return NextResponse.json({ announcement: null });
        }

        return NextResponse.json({ announcement });
    } catch (error) {
        console.error('Error fetching announcement:', error);
        return NextResponse.json({ announcement: null });
    }
}

// POST - Create announcement (admin)
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
        const title = body.title as string;
        const message = body.message as string;
        const type = (body.type as string) || 'info';
        const active = body.active !== undefined ? body.active : true;
        const showOnce = body.show_once !== undefined ? body.show_once : false;
        const expiresAt = body.expires_at as string | null;

        if (!title || !message) {
            return NextResponse.json(
                { error: 'Judul dan pesan wajib diisi' },
                { status: 400 }
            );
        }

        const insertData = {
            title,
            message,
            type,
            active,
            show_once: showOnce,
            expires_at: expiresAt,
        };

        const { data, error } = await db.client
            .from('announcements')
            .insert(insertData as never)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ announcement: data });
    } catch (error) {
        return dbErrorResponse(error);
    }
}

// PATCH - Update announcement (admin)
export async function PATCH(request: NextRequest) {
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
        const id = body.id as string;
        const updateData = {
            title: body.title as string | undefined,
            message: body.message as string | undefined,
            type: body.type as string | undefined,
            active: body.active as boolean | undefined,
            show_once: body.show_once as boolean | undefined,
            expires_at: body.expires_at as string | null | undefined,
        };

        if (!id) {
            return NextResponse.json(
                { error: 'ID pengumuman diperlukan' },
                { status: 400 }
            );
        }

        const { data, error } = await db.client
            .from('announcements')
            .update(updateData as never)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ announcement: data });
    } catch (error) {
        return dbErrorResponse(error);
    }
}

// DELETE - Delete announcement (admin)
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
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID pengumuman diperlukan' },
                { status: 400 }
            );
        }

        const { error } = await db.client
            .from('announcements')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return dbErrorResponse(error);
    }
}
