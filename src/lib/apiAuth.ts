import crypto from 'crypto';
import { NextRequest } from 'next/server';

// Secret key for verifying tokens
const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'dev-secret-key-change-in-production';

/**
 * Verify admin token from Authorization header
 * Format: Authorization: Bearer <token>
 */
export function verifyAdminToken(token: string): boolean {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const parts = decoded.split(':');
        if (parts.length !== 3) return false;

        const [role, timestamp, signature] = parts;
        if (role !== 'admin') return false;

        // Check if token is not too old (24 hours)
        const tokenTime = parseInt(timestamp, 10);
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (now - tokenTime > maxAge) return false;

        // Verify signature
        const payload = `${role}:${timestamp}`;
        const expectedSignature = crypto
            .createHmac('sha256', SECRET_KEY)
            .update(payload)
            .digest('hex');

        return signature === expectedSignature;
    } catch {
        return false;
    }
}

/**
 * Extract token from request headers or cookies
 */
export function getTokenFromRequest(request: NextRequest): string | null {
    // Check Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    // Check cookies
    const tokenCookie = request.cookies.get('admin_token');
    if (tokenCookie?.value) {
        return tokenCookie.value;
    }

    // Check X-Admin-Token header (for API calls from frontend)
    const xAdminToken = request.headers.get('x-admin-token');
    if (xAdminToken) {
        return xAdminToken;
    }

    return null;
}

/**
 * Check if request is authenticated as admin
 * Returns { authenticated: true } or { authenticated: false, error: string }
 */
export function checkAdminAuth(request: NextRequest): { authenticated: boolean; error?: string } {
    const token = getTokenFromRequest(request);

    if (!token) {
        return { authenticated: false, error: 'Token tidak ditemukan' };
    }

    if (!verifyAdminToken(token)) {
        return { authenticated: false, error: 'Token tidak valid atau sudah kadaluarsa' };
    }

    return { authenticated: true };
}

/**
 * JSON response for unauthorized access
 */
export function unauthorizedResponse(error: string = 'Akses tidak diizinkan') {
    return Response.json(
        { error },
        { status: 401 }
    );
}
