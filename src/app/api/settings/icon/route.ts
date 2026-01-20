import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, supabase } from '@/lib/supabase';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/apiAuth';

// GET - Fetch site icon
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'site_icon')
            .single();

        if (error) {
            return NextResponse.json({ icon: null });
        }

        return NextResponse.json({ icon: (data as { value: { url: string } }).value });
    } catch (error) {
        console.error('Error fetching site icon:', error);
        return NextResponse.json({ icon: null });
    }
}

// POST - Update site icon
export async function POST(request: NextRequest) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    try {
        const body = await request.json();
        const url = body.url as string;

        if (!url) {
            return NextResponse.json(
                { error: 'URL wajib diisi' },
                { status: 400 }
            );
        }

        const adminClient = createAdminClient();
        const upsertData = {
            key: 'site_icon',
            value: { url },
            updated_at: new Date().toISOString(),
        };

        const { error } = await adminClient
            .from('site_settings')
            .upsert(upsertData as never, { onConflict: 'key' });

        if (error) throw error;

        return NextResponse.json({ icon: { url } });
    } catch (error) {
        console.error('Error saving site icon:', error);
        return NextResponse.json(
            { error: 'Gagal menyimpan icon' },
            { status: 500 }
        );
    }
}
