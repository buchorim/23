import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, supabase } from '@/lib/supabase';

// GET /api/documents - Ambil dokumen dengan filter dan search
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '50');
        const featured = searchParams.get('featured');

        let query = supabase
            .from('documents')
            .select('*, categories(*)')
            .eq('published', true)
            .order('featured', { ascending: false })
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false })
            .limit(limit);

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        if (category) {
            const { data: cat } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', category)
                .single();

            if (cat) {
                query = query.eq('category_id', cat.id);
            }
        }

        if (featured === 'true') {
            query = query.eq('featured', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ documents: data });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: 'Gagal memuat dokumen' },
            { status: 500 }
        );
    }
}

// POST /api/documents - Buat dokumen baru (admin only)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            title,
            slug,
            category_id,
            content,
            thumbnail_url,
            meta_description,
            published,
            featured,
            settings,
            tags
        } = body;

        if (!title || !slug) {
            return NextResponse.json(
                { error: 'Judul dan slug wajib diisi' },
                { status: 400 }
            );
        }

        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('documents')
            .insert({
                title,
                slug,
                category_id: category_id || null,
                content: content || {},
                thumbnail_url,
                meta_description,
                published: published ?? true,
                featured: featured ?? false,
                settings: settings || {
                    showTitle: true,
                    showCategory: true,
                    showUpdated: true,
                    showToc: false,
                    contentWidth: 'medium',
                },
                tags: tags || [],
            })
            .select('*, categories(*)')
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

        return NextResponse.json({ document: data }, { status: 201 });
    } catch (error) {
        console.error('Error creating document:', error);
        return NextResponse.json(
            { error: 'Gagal membuat dokumen' },
            { status: 500 }
        );
    }
}

// PATCH /api/documents - Update dokumen (admin only)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            id,
            title,
            slug,
            category_id,
            content,
            thumbnail_url,
            meta_description,
            published,
            featured,
            display_order,
            settings,
            tags
        } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'ID dokumen diperlukan' },
                { status: 400 }
            );
        }

        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('documents')
            .update({
                title,
                slug,
                category_id,
                content,
                thumbnail_url,
                meta_description,
                published,
                featured,
                display_order,
                settings,
                tags,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select('*, categories(*)')
            .single();

        if (error) throw error;

        return NextResponse.json({ document: data });
    } catch (error) {
        console.error('Error updating document:', error);
        return NextResponse.json(
            { error: 'Gagal memperbarui dokumen' },
            { status: 500 }
        );
    }
}

// DELETE /api/documents - Hapus dokumen (admin only)
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID dokumen diperlukan' },
                { status: 400 }
            );
        }

        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from('documents')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            { error: 'Gagal menghapus dokumen' },
            { status: 500 }
        );
    }
}
