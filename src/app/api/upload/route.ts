import { NextRequest, NextResponse } from 'next/server';
import { checkAdminDbAvailable, dbErrorResponse } from '@/lib/supabase';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/apiAuth';

// POST /api/upload - Upload file ke Supabase Storage
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
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'uploads';

        if (!file) {
            return NextResponse.json(
                { error: 'File tidak ditemukan' },
                { status: 400 }
            );
        }

        // Check file size (max 50MB)
        const MAX_SIZE = 50 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: 'Ukuran file terlalu besar. Maksimal 50MB.' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const safeName = file.name
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .toLowerCase();
        const fileName = `${folder}/${timestamp}-${safeName}`;

        // Upload to Supabase Storage
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const { data, error } = await db.client.storage
            .from('media')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (error) {
            console.error('Upload error:', error);
            throw error;
        }

        // Get public URL
        const { data: urlData } = db.client.storage
            .from('media')
            .getPublicUrl(data.path);

        return NextResponse.json({
            url: urlData.publicUrl,
            filename: file.name,
            size: file.size,
            type: file.type,
        });
    } catch (error) {
        return dbErrorResponse(error);
    }
}
