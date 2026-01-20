// Client-side auth utilities
// Token validation happens server-side via /api/auth/admin

const STORAGE_KEY = 'easy_store_admin_token';

/**
 * Get stored admin token
 */
export function getAdminToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
}

/**
 * Set admin token
 */
export function setAdminToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (token) {
        localStorage.setItem(STORAGE_KEY, token);
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}

/**
 * Validate admin token via API
 */
export async function validateAdminToken(): Promise<boolean> {
    const token = getAdminToken();
    if (!token) return false;

    try {
        const res = await fetch('/api/auth/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });

        if (!res.ok) return false;

        const data = await res.json();
        if (!data.valid) {
            // Token invalid, remove it
            setAdminToken(null);
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Login with password
 */
export async function loginWithPassword(password: string): Promise<boolean> {
    try {
        const res = await fetch('/api/auth/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });

        if (!res.ok) return false;

        const data = await res.json();
        if (data.token) {
            setAdminToken(data.token);
            return true;
        }

        return false;
    } catch {
        return false;
    }
}

/**
 * Logout admin
 */
export function logoutAdmin(): void {
    setAdminToken(null);
}
