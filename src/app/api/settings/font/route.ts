import { NextRequest, NextResponse } from 'next/server';
import { checkDbAvailable, checkAdminDbAvailable, dbErrorResponse } from '@/lib/supabase';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/apiAuth';

export interface FontSetting {
    name: string;
    url: string | null;
    isCustom: boolean;
}

// GET /api/settings/font - Ambil font setting global
export async function GET() {
    const db = checkDbAvailable();
    if (!db.available) {
        return NextResponse.json({
            font: { name: 'Inter', url: null, isCustom: false }
        });
    }

    try {
        const { data, error } = await db.client
            .from('site_settings')
            .select('value')
            .eq('key', 'font')
            .single();

        if (error) {
            return NextResponse.json({
                font: { name: 'Inter', url: null, isCustom: false }
            });
        }

        return NextResponse.json({ font: (data as { value: FontSetting }).value });
    } catch (error) {
        console.error('Error fetching font setting:', error);
        return NextResponse.json({
            font: { name: 'Inter', url: null, isCustom: false }
        });
    }
}

// POST /api/settings/font - Update font setting (admin only)
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
        const { name, url, isCustom } = body as FontSetting;

        if (!name) {
            return NextResponse.json(
                { error: 'Nama font wajib diisi' },
                { status: 400 }
            );
        }

        const upsertData = {
            key: 'font',
            value: { name, url: url || null, isCustom: isCustom || false },
            updated_at: new Date().toISOString(),
        };

        const { error } = await db.client
            .from('site_settings')
            .upsert(upsertData as never, { onConflict: 'key' });

        if (error) throw error;

        return NextResponse.json({
            font: { name, url: url || null, isCustom: isCustom || false }
        });
    } catch (error) {
        return dbErrorResponse(error);
    }
}
