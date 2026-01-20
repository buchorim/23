import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, supabase } from '@/lib/supabase';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/apiAuth';

export interface FontSetting {
    name: string;
    url: string | null;
    isCustom: boolean;
}

// GET /api/settings/font - Ambil font setting global
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'font')
            .single();

        if (error) {
            // Return default if not found
            return NextResponse.json({
                font: { name: 'Inter', url: null, isCustom: false }
            });
        }

        return NextResponse.json({ font: (data as { value: FontSetting }).value });
    } catch (error) {
        console.error('Error fetching font setting:', error);
        return NextResponse.json(
            { font: { name: 'Inter', url: null, isCustom: false } }
        );
    }
}

// POST /api/settings/font - Update font setting (admin only)
export async function POST(request: NextRequest) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    try {
        const body = await request.json();
        const { name, url, isCustom } = body as FontSetting;

        if (!name) {
            return NextResponse.json(
                { error: 'Nama font wajib diisi' },
                { status: 400 }
            );
        }

        const adminClient = createAdminClient();
        const fontValue = { name, url: url || null, isCustom: isCustom || false };
        const upsertData = {
            key: 'font',
            value: fontValue,
            updated_at: new Date().toISOString(),
        };
        const { error } = await adminClient
            .from('site_settings')
            .upsert(upsertData as never, { onConflict: 'key' });

        if (error) throw error;

        return NextResponse.json({ font: fontValue });
    } catch (error) {
        console.error('Error updating font setting:', error);
        return NextResponse.json(
            { error: 'Gagal menyimpan pengaturan font' },
            { status: 500 }
        );
    }
}
