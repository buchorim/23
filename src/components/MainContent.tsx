'use client';

import { useAdmin } from '@/hooks/useAdmin';

interface MainContentProps {
    children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
    const { isAdmin } = useAdmin();

    return (
        <main className={`main-content ${isAdmin ? 'admin-mode' : ''}`}>
            {children}
        </main>
    );
}
