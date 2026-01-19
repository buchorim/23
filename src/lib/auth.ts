// Konstanta untuk admin authentication
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@easy.store';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'secret123';

/**
 * Decode dan validasi admin credentials dari URL parameter
 * Format: ?admin=BASE64(email:password)
 */
export function validateAdminCredentials(encodedCredentials: string): boolean {
    try {
        const decoded = atob(encodedCredentials);
        const [email, password] = decoded.split(':');
        return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    } catch {
        return false;
    }
}

/**
 * Generate encoded admin credentials untuk URL
 */
export function generateAdminToken(): string {
    return btoa(`${ADMIN_EMAIL}:${ADMIN_PASSWORD}`);
}

/**
 * Check admin status dari localStorage
 */
export function isAdminAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('easy_store_admin') === 'true';
}

/**
 * Set admin session
 */
export function setAdminSession(authenticated: boolean): void {
    if (typeof window === 'undefined') return;
    if (authenticated) {
        localStorage.setItem('easy_store_admin', 'true');
    } else {
        localStorage.removeItem('easy_store_admin');
    }
}

/**
 * Logout admin
 */
export function logoutAdmin(): void {
    setAdminSession(false);
}
