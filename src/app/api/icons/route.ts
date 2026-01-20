import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all user icons
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('user_icons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ icons: data || [] });
    } catch (error) {
        console.error('Error fetching user icons:', error);
        return NextResponse.json(
            { error: 'Gagal memuat icon' },
            { status: 500 }
        );
    }
}

// POST - Add new user icon
export async function POST(request: NextRequest) {
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
        const { data, error } = await supabase
            .from('user_icons')
            .insert(insertData as never)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ icon: data });
    } catch (error) {
        console.error('Error adding user icon:', error);
        return NextResponse.json(
            { error: 'Gagal menyimpan icon' },
            { status: 500 }
        );
    }
}

// DELETE - Remove user icon
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID diperlukan' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('user_icons')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user icon:', error);
        return NextResponse.json(
            { error: 'Gagal menghapus icon' },
            { status: 500 }
        );
    }
}
