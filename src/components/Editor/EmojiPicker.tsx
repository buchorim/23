'use client';

import { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';

const emojiCategories = [
    {
        name: 'Sering Digunakan',
        emojis: ['👍', '❤️', '😊', '🎉', '✅', '⭐', '🔥', '💡', '📌', '🎯'],
    },
    {
        name: 'Wajah',
        emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘'],
    },
    {
        name: 'Gestur',
        emojis: ['👋', '🤚', '✋', '🖐️', '👌', '🤌', '✌️', '🤞', '👍', '👎', '👏', '🙌', '🤝', '🙏'],
    },
    {
        name: 'Simbol',
        emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '⭐', '🌟', '✨', '💫', '🔥', '💯', '✅', '❌', '⚠️', '💡'],
    },
    {
        name: 'Objek',
        emojis: ['📱', '💻', '🖥️', '📷', '🎬', '🎵', '🎮', '📚', '📝', '📌', '📎', '🔗', '📦', '🎁', '🏆', '🎯'],
    },
];

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    trigger?: React.ReactNode;
}

export function EmojiPicker({ onSelect, trigger }: EmojiPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (emoji: string) => {
        onSelect(emoji);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            {trigger ? (
                <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
            ) : (
                <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    title="Emoji"
                >
                    <Smile size={18} />
                </button>
            )}

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        width: '280px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--border-radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 100,
                        overflow: 'hidden',
                    }}
                >
                    {/* Category tabs */}
                    <div
                        style={{
                            display: 'flex',
                            borderBottom: '1px solid var(--border-light)',
                            padding: '4px',
                            gap: '2px',
                        }}
                    >
                        {emojiCategories.map((cat, index) => (
                            <button
                                key={cat.name}
                                onClick={() => setActiveCategory(index)}
                                style={{
                                    flex: 1,
                                    padding: '6px 4px',
                                    fontSize: '0.75rem',
                                    background: activeCategory === index ? 'var(--accent-blue-bg)' : 'transparent',
                                    color: activeCategory === index ? 'var(--accent-blue)' : 'var(--text-muted)',
                                    border: 'none',
                                    borderRadius: 'var(--border-radius-sm)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                                title={cat.name}
                            >
                                {cat.emojis[0]}
                            </button>
                        ))}
                    </div>

                    {/* Emoji grid */}
                    <div style={{ padding: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(8, 1fr)',
                                gap: '4px',
                            }}
                        >
                            {emojiCategories[activeCategory].emojis.map((emoji, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelect(emoji)}
                                    style={{
                                        padding: '6px',
                                        fontSize: '1.25rem',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: 'var(--border-radius-sm)',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--bg-secondary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
