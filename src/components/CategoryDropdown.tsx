'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Folder } from 'lucide-react';
import Link from 'next/link';
import { IconByName } from './IconPicker';
import type { Category } from '@/types/database';

interface CategoryDropdownProps {
    categories: Category[];
    currentSlug?: string;
}

export function CategoryDropdown({ categories, currentSlug }: CategoryDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentCategory = categories.find(c => c.slug === currentSlug);

    return (
        <div className={`dropdown ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
            <button
                className="dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Folder size={16} />
                <span>{currentCategory?.name || 'Kategori'}</span>
                <ChevronDown size={16} />
            </button>

            <div className="dropdown-menu">
                <Link
                    href="/"
                    className="dropdown-item"
                    onClick={() => setIsOpen(false)}
                >
                    Semua Kategori
                </Link>
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/?category=${category.slug}`}
                        className="dropdown-item"
                        onClick={() => setIsOpen(false)}
                    >
                        <IconByName name={category.icon} size={16} />
                        <span>{category.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
