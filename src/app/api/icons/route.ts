import { NextRequest, NextResponse } from 'next/server';
import { checkDbAvailable, checkAdminDbAvailable, dbErrorResponse } from '@/lib/supabase';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/apiAuth';

// GET - Fetch all user icons
export async function GET() {
    const db = checkDbAvailable();
    if (!db.available) {
        return NextResponse.json({ icons: [] });
    }

    try {
        const { data, error } = await db.client
            .from('user_icons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ icons: data || [] });
    } catch (error) {
        console.error('Error fetching user icons:', error);
        return NextResponse.json({ icons: [] });
    }
}

// POST - Add new user icon
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
        const { name, url } = body;

        if (!name || !url) {
            return NextResponse.json(
                { error: 'Nama dan URL diperlukan' },
                { status: 400 }
            );
        }

        const insertData = { name: name as string, url: url as string };
        const { data, error } = await db.client
            .from('user_icons')
            .insert(insertData as never)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ icon: data });
    } catch (error) {
        return dbErrorResponse(error);
    }
}

// DELETE - Remove user icon
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
                { error: 'ID diperlukan' },
                { status: 400 }
            );
        }

        const { error } = await db.client
            .from('user_icons')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return dbErrorResponse(error);
    }
}
