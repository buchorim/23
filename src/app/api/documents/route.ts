import { NextRequest, NextResponse } from 'next/server';
import { checkDbAvailable, checkAdminDbAvailable, dbErrorResponse } from '@/lib/supabase';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/apiAuth';

// GET /api/documents - Ambil dokumen dengan filter dan search
export async function GET(request: NextRequest) {
    const db = checkDbAvailable();
    if (!db.available) {
        return NextResponse.json({ documents: [] });
    }

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '50');
        const featured = searchParams.get('featured');

        let query = db.client
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
            const { data: cat } = await db.client
                .from('categories')
                .select('id')
                .eq('slug', category)
                .single();

            if (cat) {
                query = query.eq('category_id', (cat as { id: string }).id);
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
        return NextResponse.json({ documents: [] });
    }
}

// POST /api/documents - Buat dokumen baru (admin only)
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

        const insertData = {
            title,
            slug,
            category_id,
            content: content || '',
            thumbnail_url,
            meta_description,
            published: published ?? false,
            featured: featured ?? false,
            settings: settings || {},
            tags: tags || [],
        };

        const { data, error } = await db.client
            .from('documents')
            .insert(insertData as never)
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

        return NextResponse.json({ document: data });
    } catch (error) {
        return dbErrorResponse(error);
    }
}

// PATCH /api/documents - Update dokumen (admin only)
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

        const updateData = {
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
        };

        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key as keyof typeof updateData] === undefined) {
                delete updateData[key as keyof typeof updateData];
            }
        });

        const { data, error } = await db.client
            .from('documents')
            .update(updateData as never)
            .eq('id', id)
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

        return NextResponse.json({ document: data });
    } catch (error) {
        return dbErrorResponse(error);
    }
}

// DELETE /api/documents - Hapus dokumen (admin only)
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
                { error: 'ID dokumen diperlukan' },
                { status: 400 }
            );
        }

        const { error } = await db.client
            .from('documents')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return dbErrorResponse(error);
    }
}
