'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import type { DocumentWithCategory } from '@/types/database';

interface SearchBarProps {
    onSearch?: (query: string) => void;
    placeholder?: string;
    isHero?: boolean;
}

export function SearchBar({
    onSearch,
    placeholder = "Cari tutorial, panduan...",
    isHero = false
}: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<DocumentWithCategory[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (query.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/documents?search=${encodeURIComponent(query)}&limit=5`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.documents || []);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        onSearch?.(value);
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        onSearch?.('');
    };

    return (
        <div
            ref={containerRef}
            className={`search-container ${isHero ? 'hero-search' : ''}`}
        >
            <Search className="search-icon" />
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={query}
                onChange={handleInputChange}
                onFocus={() => results.length > 0 && setIsOpen(true)}
            />
            {query && (
                <button
                    onClick={clearSearch}
                    style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <X size={16} color="#94A3B8" />
                </button>
            )}

            {isOpen && (
                <div className="search-results">
                    {isLoading ? (
                        <div className="search-result-item">
                            <span style={{ color: 'var(--text-muted)' }}>Mencari...</span>
                        </div>
                    ) : results.length > 0 ? (
                        results.map((doc) => (
                            <Link
                                key={doc.id}
                                href={`/${doc.slug}`}
                                className="search-result-item"
                                onClick={() => setIsOpen(false)}
                            >
                                <div>
                                    <div style={{ fontWeight: 500 }}>{doc.title}</div>
                                    {doc.categories && (
                                        <span className="card-category" style={{ marginTop: '4px' }}>
                                            {doc.categories.name}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="search-result-item">
                            <span style={{ color: 'var(--text-muted)' }}>
                                Tidak ada hasil untuk &quot;{query}&quot;
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
