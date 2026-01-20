'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAdminToken, setAdminToken, validateAdminToken, loginWithPassword, logoutAdmin as logout } from '@/lib/auth';

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check URL params dan validate token saat mount
    useEffect(() => {
        const checkAuth = async () => {
            // Check URL parameter for password
            const params = new URLSearchParams(window.location.search);
            const adminParam = params.get('admin');

            if (adminParam) {
                // Try to login with password
                const success = await loginWithPassword(adminParam);
                if (success) {
                    setIsAdmin(true);
                    // Remove param from URL without reload
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                }
            } else {
                // Validate existing token
                const isValid = await validateAdminToken();
                setIsAdmin(isValid);
            }

            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const handleLogout = useCallback(() => {
        logout();
        setIsAdmin(false);
    }, []);

    return { isAdmin, isLoading, logout: handleLogout };
}
