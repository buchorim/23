import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, supabase } from '@/lib/supabase';

// GET /api/categories - Ambil semua kategori
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ categories: data });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Gagal memuat kategori' },
            { status: 500 }
        );
    }
}

// POST /api/categories - Buat kategori baru (admin only)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, slug, icon } = body;

        if (!name || !slug) {
            return NextResponse.json(
                { error: 'Nama dan slug wajib diisi' },
                { status: 400 }
            );
        }

        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('categories')
            .insert({ name, slug, icon: icon || '📦' })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'Slug sudah digunakan' },
                    { status: 400 }
                );
            }
            throw error;
        }

        return NextResponse.json({ category: data }, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Gagal membuat kategori' },
            { status: 500 }
        );
    }
}

// PATCH /api/categories - Update kategori (admin only)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, slug, icon, display_order } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'ID kategori diperlukan' },
                { status: 400 }
            );
        }

        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('categories')
            .update({ name, slug, icon, display_order })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ category: data });
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Gagal memperbarui kategori' },
            { status: 500 }
        );
    }
}

// DELETE /api/categories - Hapus kategori (admin only)
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID kategori diperlukan' },
                { status: 400 }
            );
        }

        const adminClient = createAdminClient();

        // Check if category has documents
        const { count } = await adminClient
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', id);

        if (count && count > 0) {
            return NextResponse.json(
                { error: 'Tidak bisa menghapus kategori yang masih memiliki dokumen' },
                { status: 400 }
            );
        }

        const { error } = await adminClient
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Gagal menghapus kategori' },
            { status: 500 }
        );
    }
}
