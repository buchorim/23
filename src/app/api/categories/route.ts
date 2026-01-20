import { NextRequest, NextResponse } from 'next/server';
import { checkDbAvailable, checkAdminDbAvailable, dbErrorResponse } from '@/lib/supabase';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/apiAuth';

// GET /api/categories - Ambil semua kategori
export async function GET() {
    const db = checkDbAvailable();
    if (!db.available) {
        return db.response;
    }

    try {
        const { data, error } = await db.client
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ categories: data });
    } catch (error) {
        return dbErrorResponse(error);
    }
}

// POST /api/categories - Buat kategori baru (admin only)
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
        const name = body.name as string;
        const slug = body.slug as string;
        const icon = (body.icon as string) || '📦';

        if (!name || !slug) {
            return NextResponse.json(
                { error: 'Nama dan slug wajib diisi' },
                { status: 400 }
            );
        }

        const insertData = { name, slug, icon };

        const { data, error } = await db.client
            .from('categories')
            .insert(insertData as never)
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

        return NextResponse.json({ category: data });
    } catch (error) {
        return dbErrorResponse(error);
    }
}

// PATCH /api/categories - Update kategori (admin only)
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
            name: body.name as string | undefined,
            slug: body.slug as string | undefined,
            icon: body.icon as string | undefined,
            display_order: body.display_order as number | undefined,
        };

        if (!id) {
            return NextResponse.json(
                { error: 'ID kategori diperlukan' },
                { status: 400 }
            );
        }

        const { data, error } = await db.client
            .from('categories')
            .update(updateData as never)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ category: data });
    } catch (error) {
        return dbErrorResponse(error);
    }
}

// DELETE /api/categories - Hapus kategori (admin only)
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
                { error: 'ID kategori diperlukan' },
                { status: 400 }
            );
        }

        // Check if category has documents
        const { count } = await db.client
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', id);

        if (count && count > 0) {
            return NextResponse.json(
                { error: 'Tidak bisa menghapus kategori yang masih memiliki dokumen' },
                { status: 400 }
            );
        }

        const { error } = await db.client
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return dbErrorResponse(error);
    }
}
