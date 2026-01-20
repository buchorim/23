'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Generate unique visitor ID (stored in localStorage)
function getVisitorId(): string {
    if (typeof window === 'undefined') return '';

    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
        visitorId = 'v_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
}

// Generate session ID (stored in sessionStorage)
function getSessionId(): string {
    if (typeof window === 'undefined') return '';

    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
        sessionId = 's_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
}

export function usePageTracking() {
    const pathname = usePathname();
    const startTimeRef = useRef<number>(Date.now());
    const lastPathRef = useRef<string>('');

    useEffect(() => {
        // Skip tracking for API routes
        if (pathname.startsWith('/api')) return;

        const visitorId = getVisitorId();
        const sessionId = getSessionId();

        // Track page duration when leaving
        const trackDuration = () => {
            if (lastPathRef.current) {
                const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

                // Send duration update (fire and forget)
                navigator.sendBeacon('/api/analytics/track', JSON.stringify({
                    page_path: lastPathRef.current,
                    page_title: document.title,
                    visitor_id: visitorId,
                    session_id: sessionId,
                    referrer: document.referrer,
                    duration_seconds: duration,
                }));
            }
        };

        // Track new page view
        const trackPageView = async () => {
            try {
                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        page_path: pathname,
                        page_title: document.title,
                        visitor_id: visitorId,
                        session_id: sessionId,
                        referrer: document.referrer,
                        duration_seconds: 0,
                    }),
                });
            } catch (err) {
                // Silently fail - analytics shouldn't break the app
                console.debug('Analytics tracking failed:', err);
            }
        };

        // Reset timer and track
        startTimeRef.current = Date.now();
        lastPathRef.current = pathname;
        trackPageView();

        // Track duration on page leave
        window.addEventListener('beforeunload', trackDuration);

        return () => {
            window.removeEventListener('beforeunload', trackDuration);
        };
    }, [pathname]);
}
