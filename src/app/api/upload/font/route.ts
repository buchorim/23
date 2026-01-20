import { NextRequest, NextResponse } from 'next/server';
import { checkAdminDbAvailable, dbErrorResponse } from '@/lib/supabase';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/apiAuth';

// POST /api/upload/font - Upload custom font (WOFF2 only)
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

        if (!file) {
            return NextResponse.json(
                { error: 'File tidak ditemukan' },
                { status: 400 }
            );
        }

        // Validate file type - WOFF2 only for stability
        const validTypes = ['font/woff2', 'application/font-woff2'];
        const isWoff2 = validTypes.includes(file.type) || file.name.endsWith('.woff2');

        if (!isWoff2) {
            return NextResponse.json(
                { error: 'Hanya file WOFF2 yang diperbolehkan untuk stabilitas maksimal' },
                { status: 400 }
            );
        }

        // Check file size (max 2MB for fonts)
        const MAX_SIZE = 2 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: 'Ukuran file font terlalu besar. Maksimal 2MB.' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const safeName = file.name
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .toLowerCase();
        const fileName = `fonts/${timestamp}-${safeName}`;

        // Upload to Supabase Storage
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const { data, error } = await db.client.storage
            .from('media')
            .upload(fileName, buffer, {
                contentType: 'font/woff2',
                upsert: false,
            });

        if (error) {
            console.error('Font upload error:', error);
            throw error;
        }

        // Get public URL
        const { data: urlData } = db.client.storage
            .from('media')
            .getPublicUrl(data.path);

        return NextResponse.json({
            url: urlData.publicUrl,
            filename: file.name,
        });
    } catch (error) {
        return dbErrorResponse(error);
    }
}
