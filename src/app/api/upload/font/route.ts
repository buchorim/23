import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// POST /api/upload/font - Upload custom font (WOFF2 only)
export async function POST(request: NextRequest) {
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
                { error: 'Ukuran font maksimal 2MB' },
                { status: 400 }
            );
        }

        // Get font name from filename
        const fontName = file.name.replace('.woff2', '').replace(/[-_]/g, ' ');

        // Upload to Supabase Storage
        const adminClient = createAdminClient();
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const fileName = `fonts/${Date.now()}-${file.name}`;

        const { data, error } = await adminClient.storage
            .from('media')
            .upload(fileName, buffer, {
                contentType: 'font/woff2',
                upsert: false,
            });

        if (error) {
            console.error('Upload error:', error);
            throw error;
        }

        // Get public URL
        const { data: urlData } = adminClient.storage
            .from('media')
            .getPublicUrl(data.path);

        // Update site_settings with new font
        const fontValue = {
            name: fontName,
            url: urlData.publicUrl,
            isCustom: true,
        };

        const upsertData = {
            key: 'font',
            value: fontValue,
            updated_at: new Date().toISOString(),
        };
        await adminClient
            .from('site_settings')
            .upsert(upsertData as never, { onConflict: 'key' });

        return NextResponse.json({
            font: fontValue,
            message: 'Font berhasil diupload dan diaktifkan',
        });
    } catch (error) {
        console.error('Error uploading font:', error);
        return NextResponse.json(
            { error: 'Gagal mengupload font' },
            { status: 500 }
        );
    }
}
