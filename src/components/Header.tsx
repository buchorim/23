'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Settings, LogOut } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { CategoryDropdown } from './CategoryDropdown';
import { AdminSettingsModal } from './AdminSettingsModal';
import { useAdmin } from '@/hooks/useAdmin';
import type { Category } from '@/types/database';

interface HeaderProps {
    categories?: Category[];
}

export function Header({ categories = [] }: HeaderProps) {
    const { isAdmin, logout } = useAdmin();
    const [showSettings, setShowSettings] = useState(false);
    const [siteIcon, setSiteIcon] = useState<string | null>(null);

    // Fetch site icon
    useEffect(() => {
        fetch('/api/settings/icon')
            .then(res => res.json())
            .then(data => {
                if (data.icon?.url) {
                    setSiteIcon(data.icon.url);
                }
            })
            .catch(console.error);
    }, []);

    return (
        <>
            {isAdmin && (
                <div className="admin-bar">
                    <span className="admin-bar-badge">
                        <Settings size={14} />
                        Mode Admin
                    </span>
                    <span style={{ flex: 1 }} />
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowSettings(true)}
                        style={{ color: 'white' }}
                    >
                        <Settings size={14} />
                        Pengaturan
                    </button>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={logout}
                        style={{ color: 'white' }}
                    >
                        <LogOut size={14} />
                        Keluar
                    </button>
                </div>
            )}
            <header className="header" style={{ top: isAdmin ? '32px' : 0 }}>
                <div className="header-inner">
                    <Link href="/" className="logo">
                        {siteIcon ? (
                            <img
                                src={siteIcon}
                                alt="Logo"
                                style={{
                                    width: 28,
                                    height: 28,
                                    objectFit: 'contain',
                                    borderRadius: 'var(--border-radius-sm)',
                                }}
                            />
                        ) : (
                            <div className="logo-icon">
                                <BookOpen size={16} />
                            </div>
                        )}
                        <span>Easy.Store</span>
                    </Link>

                    <SearchBar placeholder="Cari dokumentasi..." />

                    <CategoryDropdown categories={categories} />
                </div>
            </header>

            {isAdmin && (
                <AdminSettingsModal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </>
    );
}
