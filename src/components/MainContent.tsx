'use client';

import { useAdmin } from '@/hooks/useAdmin';
import { AnnouncementPopup } from './AnnouncementPopup';

interface MainContentProps {
    children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
    const { isAdmin } = useAdmin();

    return (
        <main className={`main-content ${isAdmin ? 'admin-mode' : ''}`}>
            {children}
            <AnnouncementPopup />
        </main>
    );
}
