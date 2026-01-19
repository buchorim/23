'use client';

import Link from 'next/link';
import { BookOpen, Settings, LogOut } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { CategoryDropdown } from './CategoryDropdown';
import { useAdmin } from '@/hooks/useAdmin';
import type { Category } from '@/types/database';

interface HeaderProps {
    categories?: Category[];
}

export function Header({ categories = [] }: HeaderProps) {
    const { isAdmin, logout } = useAdmin();

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
                        <div className="logo-icon">
                            <BookOpen size={16} />
                        </div>
                        <span>Easy.Store</span>
                    </Link>

                    <SearchBar placeholder="Cari dokumentasi..." />

                    <CategoryDropdown categories={categories} />
                </div>
            </header>
        </>
    );
}
