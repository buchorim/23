/**
 * Helper functions for making authenticated API calls
 */

const ADMIN_TOKEN_KEY = 'admin_token';

/**
 * Get stored admin token
 */
export function getAdminToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ADMIN_TOKEN_KEY);
}

/**
 * Create headers with admin token for authenticated API calls
 */
export function getAuthHeaders(): HeadersInit {
    const token = getAdminToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['X-Admin-Token'] = token;
    }
    return headers;
}

/**
 * Create headers for form data uploads with admin token
 */
export function getAuthHeadersFormData(): HeadersInit {
    const token = getAdminToken();
    const headers: HeadersInit = {};
    if (token) {
        headers['X-Admin-Token'] = token;
    }
    return headers;
}

/**
 * Authenticated fetch wrapper for JSON API calls
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getAdminToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['X-Admin-Token'] = token;
    }

    return fetch(url, {
        ...options,
        headers,
    });
}

/**
 * Authenticated fetch wrapper for form data uploads
 */
export async function authUpload(url: string, formData: FormData): Promise<Response> {
    const token = getAdminToken();
    const headers: Record<string, string> = {};

    if (token) {
        headers['X-Admin-Token'] = token;
    }

    return fetch(url, {
        method: 'POST',
        headers,
        body: formData,
    });
}
