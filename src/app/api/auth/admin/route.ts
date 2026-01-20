import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Secret key for signing tokens - must be set in production
const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'dev-secret-key-change-in-production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'secret123';

// Generate a signed token
function generateToken(): string {
    const timestamp = Date.now();
    const payload = `admin:${timestamp}`;
    const signature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(payload)
        .digest('hex');
    return Buffer.from(`${payload}:${signature}`).toString('base64');
}

// Verify token
function verifyToken(token: string): boolean {
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

// POST - Login with password
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password, token } = body;

        // If token provided, verify it
        if (token) {
            const isValid = verifyToken(token);
            return NextResponse.json({ valid: isValid });
        }

        // If password provided, validate and generate token
        if (password) {
            if (password !== ADMIN_PASSWORD) {
                return NextResponse.json(
                    { error: 'Password salah' },
                    { status: 401 }
                );
            }

            const newToken = generateToken();
            return NextResponse.json({ token: newToken });
        }

        return NextResponse.json(
            { error: 'Password atau token diperlukan' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan' },
            { status: 500 }
        );
    }
}
