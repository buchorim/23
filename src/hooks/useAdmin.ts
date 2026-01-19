'use client';

import { useState, useEffect, useCallback } from 'react';
import { validateAdminCredentials, isAdminAuthenticated, setAdminSession, logoutAdmin } from '@/lib/auth';

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check URL params dan localStorage saat mount
    useEffect(() => {
        // Check URL parameter
        const params = new URLSearchParams(window.location.search);
        const adminParam = params.get('admin');

        if (adminParam) {
            const isValid = validateAdminCredentials(adminParam);
            if (isValid) {
                setAdminSession(true);
                setIsAdmin(true);
                // Hapus param dari URL tanpa reload
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        } else {
            // Check localStorage
            setIsAdmin(isAdminAuthenticated());
        }

        setIsLoading(false);
    }, []);

    const logout = useCallback(() => {
        logoutAdmin();
        setIsAdmin(false);
    }, []);

    return { isAdmin, isLoading, logout };
}
