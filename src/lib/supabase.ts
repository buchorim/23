import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Flag to check if supabase is properly configured
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;
export const isAdminConfigured = !!supabaseUrl && !!serviceRoleKey;

// Create clients only if configured
let _supabaseClient: SupabaseClient<Database> | null = null;
let _adminClient: SupabaseClient<Database> | null = null;

function getSupabaseClient(): SupabaseClient<Database> | null {
    if (!isSupabaseConfigured) return null;
    if (_supabaseClient) return _supabaseClient;

    _supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
    return _supabaseClient;
}

function getAdminClient(): SupabaseClient<Database> | null {
    if (!isAdminConfigured) return null;
    if (_adminClient) return _adminClient;

    _adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
    return _adminClient;
}

// Export clients (may be null)
export const supabase = getSupabaseClient();

// Export function that returns non-null client or throws
export function createAdminClient(): SupabaseClient<Database> {
    const client = getAdminClient();
    if (!client) {
        throw new Error('Database admin client not configured');
    }
    return client;
}

// Helper response for database not configured
export function dbNotConfiguredResponse() {
    return NextResponse.json(
        {
            error: 'Database belum dikonfigurasi',
            message: 'Hubungi administrator untuk setup Supabase',
            code: 'DB_NOT_CONFIGURED'
        },
        { status: 503 }
    );
}

// Helper response for database error
export function dbErrorResponse(error: unknown) {
    console.error('Database error:', error);
    return NextResponse.json(
        {
            error: 'Terjadi kesalahan database',
            message: error instanceof Error ? error.message : 'Unknown error',
            code: 'DB_ERROR'
        },
        { status: 500 }
    );
}

// Check if database is available
export function checkDbAvailable(): { available: true; client: SupabaseClient<Database> } | { available: false; response: NextResponse } {
    const client = getSupabaseClient();
    if (!client) {
        return { available: false, response: dbNotConfiguredResponse() };
    }
    return { available: true, client };
}

// Check if admin database is available  
export function checkAdminDbAvailable(): { available: true; client: SupabaseClient<Database> } | { available: false; response: NextResponse } {
    const client = getAdminClient();
    if (!client) {
        return { available: false, response: dbNotConfiguredResponse() };
    }
    return { available: true, client };
}
