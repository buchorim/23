'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Search, Upload, Image as ImageIcon, X, Trash2, Plus, User as UserIcon,
    // Media & Entertainment
    Youtube, Music, Tv, Film, Video, Play, Headphones, Radio, Podcast, Mic,
    // Shopping & Store
    ShoppingCart, ShoppingBag, Store, CreditCard, Wallet, Gift, Package, Box,
    // Technology
    Smartphone, Laptop, Monitor, Tablet, Wifi, Cloud, Server, Database, Code,
    // Communication
    MessageCircle, Mail, Phone, Send, Bell, Megaphone,
    // Files & Documents
    File, FileText, Folder, Image, Camera, Download,
    // Social
    Users, User, Heart, Star, ThumbsUp, Share2, Link,
    // Gaming
    Gamepad2, Trophy, Target, Zap,
    // Education
    BookOpen, GraduationCap, Lightbulb, Brain,
    // Business
    Briefcase, Building, Calendar, Clock, CheckCircle,
    // Security
    Lock, Shield, Key, Eye,
    // Navigation
    Home, Settings, Menu,
    // Misc
    Globe, Map, Sun, Moon, Coffee, Pizza, Sparkles, Flame, Rocket,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Icon categories with Lucide icons
const iconCategories = [
    {
        name: 'Media',
        icons: [
            { name: 'youtube', icon: Youtube, label: 'YouTube' },
            { name: 'music', icon: Music, label: 'Musik' },
            { name: 'tv', icon: Tv, label: 'TV' },
            { name: 'film', icon: Film, label: 'Film' },
            { name: 'video', icon: Video, label: 'Video' },
            { name: 'play', icon: Play, label: 'Play' },
            { name: 'headphones', icon: Headphones, label: 'Headphones' },
            { name: 'radio', icon: Radio, label: 'Radio' },
            { name: 'podcast', icon: Podcast, label: 'Podcast' },
            { name: 'mic', icon: Mic, label: 'Mic' },
        ],
    },
    {
        name: 'Store',
        icons: [
            { name: 'shopping-cart', icon: ShoppingCart, label: 'Keranjang' },
            { name: 'shopping-bag', icon: ShoppingBag, label: 'Tas' },
            { name: 'store', icon: Store, label: 'Toko' },
            { name: 'credit-card', icon: CreditCard, label: 'Kartu' },
            { name: 'wallet', icon: Wallet, label: 'Dompet' },
            { name: 'gift', icon: Gift, label: 'Hadiah' },
            { name: 'package', icon: Package, label: 'Paket' },
            { name: 'box', icon: Box, label: 'Box' },
        ],
    },
    {
        name: 'Tech',
        icons: [
            { name: 'smartphone', icon: Smartphone, label: 'HP' },
            { name: 'laptop', icon: Laptop, label: 'Laptop' },
            { name: 'monitor', icon: Monitor, label: 'Monitor' },
            { name: 'tablet', icon: Tablet, label: 'Tablet' },
            { name: 'wifi', icon: Wifi, label: 'WiFi' },
            { name: 'cloud', icon: Cloud, label: 'Cloud' },
            { name: 'server', icon: Server, label: 'Server' },
            { name: 'database', icon: Database, label: 'Database' },
            { name: 'code', icon: Code, label: 'Code' },
        ],
    },
    {
        name: 'Komunikasi',
        icons: [
            { name: 'message-circle', icon: MessageCircle, label: 'Pesan' },
            { name: 'mail', icon: Mail, label: 'Email' },
            { name: 'phone', icon: Phone, label: 'Telepon' },
            { name: 'send', icon: Send, label: 'Kirim' },
            { name: 'bell', icon: Bell, label: 'Notifikasi' },
            { name: 'megaphone', icon: Megaphone, label: 'Pengumuman' },
        ],
    },
    {
        name: 'File',
        icons: [
            { name: 'file', icon: File, label: 'File' },
            { name: 'file-text', icon: FileText, label: 'Dokumen' },
            { name: 'folder', icon: Folder, label: 'Folder' },
            { name: 'image', icon: Image, label: 'Gambar' },
            { name: 'camera', icon: Camera, label: 'Kamera' },
            { name: 'download', icon: Download, label: 'Download' },
        ],
    },
    {
        name: 'Sosial',
        icons: [
            { name: 'users', icon: Users, label: 'Grup' },
            { name: 'user', icon: User, label: 'User' },
            { name: 'heart', icon: Heart, label: 'Suka' },
            { name: 'star', icon: Star, label: 'Bintang' },
            { name: 'thumbs-up', icon: ThumbsUp, label: 'Like' },
            { name: 'share-2', icon: Share2, label: 'Share' },
            { name: 'link', icon: Link, label: 'Link' },
        ],
    },
    {
        name: 'Game',
        icons: [
            { name: 'gamepad-2', icon: Gamepad2, label: 'Game' },
            { name: 'trophy', icon: Trophy, label: 'Trophy' },
            { name: 'target', icon: Target, label: 'Target' },
            { name: 'zap', icon: Zap, label: 'Zap' },
        ],
    },
    {
        name: 'Edukasi',
        icons: [
            { name: 'book-open', icon: BookOpen, label: 'Buku' },
            { name: 'graduation-cap', icon: GraduationCap, label: 'Wisuda' },
            { name: 'lightbulb', icon: Lightbulb, label: 'Ide' },
            { name: 'brain', icon: Brain, label: 'Otak' },
        ],
    },
    {
        name: 'Bisnis',
        icons: [
            { name: 'briefcase', icon: Briefcase, label: 'Kerja' },
            { name: 'building', icon: Building, label: 'Gedung' },
            { name: 'calendar', icon: Calendar, label: 'Kalender' },
            { name: 'clock', icon: Clock, label: 'Waktu' },
            { name: 'check-circle', icon: CheckCircle, label: 'Selesai' },
        ],
    },
    {
        name: 'Lainnya',
        icons: [
            { name: 'globe', icon: Globe, label: 'Globe' },
            { name: 'map', icon: Map, label: 'Peta' },
            { name: 'sun', icon: Sun, label: 'Matahari' },
            { name: 'moon', icon: Moon, label: 'Bulan' },
            { name: 'coffee', icon: Coffee, label: 'Kopi' },
            { name: 'pizza', icon: Pizza, label: 'Pizza' },
            { name: 'sparkles', icon: Sparkles, label: 'Sparkle' },
            { name: 'flame', icon: Flame, label: 'Api' },
            { name: 'rocket', icon: Rocket, label: 'Roket' },
            { name: 'home', icon: Home, label: 'Rumah' },
            { name: 'settings', icon: Settings, label: 'Setting' },
            { name: 'lock', icon: Lock, label: 'Kunci' },
            { name: 'shield', icon: Shield, label: 'Shield' },
            { name: 'key', icon: Key, label: 'Key' },
            { name: 'eye', icon: Eye, label: 'Mata' },
        ],
    },
];

// Get all icons flat
const allIcons = iconCategories.flatMap(cat => cat.icons);

// Get icon component by name
export function getIconByName(name: string): LucideIcon | null {
    const found = allIcons.find(i => i.name === name);
    return found ? found.icon : null;
}

// Check if icon is a URL (custom uploaded icon)
function isIconUrl(name: string): boolean {
    return name.startsWith('http') || name.startsWith('/') || name.startsWith('data:');
}

// User icon type
interface UserIconType {
    id: string;
    name: string;
    url: string;
    created_at: string;
}

// Render icon by name or URL
export function IconByName({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
    // Custom uploaded icon (URL)
    if (isIconUrl(name)) {
        return (
            <img
                src={name}
                alt="icon"
                width={size}
                height={size}
                style={{ objectFit: 'contain' }}
                className={className}
            />
        );
    }

    // Lucide icon
    const IconComponent = getIconByName(name);
    if (IconComponent) {
        return <IconComponent size={size} className={className} />;
    }

    // Fallback to text (emoji compatibility)
    return <span style={{ fontSize: size * 0.8 }}>{name}</span>;
}

interface IconPickerProps {
    value: string;
    onChange: (iconName: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'library' | 'my-icons' | 'upload'>('library');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [userIcons, setUserIcons] = useState<UserIconType[]>([]);
    const [newIconName, setNewIconName] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch user icons
    const fetchUserIcons = useCallback(async () => {
        try {
            const res = await fetch('/api/icons');
            if (res.ok) {
                const data = await res.json();
                setUserIcons(data.icons || []);
            }
        } catch (err) {
            console.error('Error fetching user icons:', err);
        }
    }, []);

    useEffect(() => {
        if (isOpen && mode === 'my-icons') {
            fetchUserIcons();
        }
    }, [isOpen, mode, fetchUserIcons]);

    // Close on click outside
    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (containerRef.current && containerRef.current.contains(event.target as Node)) {
            return;
        }
        if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
            return;
        }
        setIsOpen(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            const timeout = setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 10);
            return () => {
                clearTimeout(timeout);
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [isOpen, handleClickOutside]);

    const filteredIcons = searchQuery
        ? allIcons.filter(i =>
            i.name.includes(searchQuery.toLowerCase()) ||
            i.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : iconCategories[activeCategory].icons;

    const handleSelect = (iconName: string) => {
        onChange(iconName);
        setIsOpen(false);
        setSearchQuery('');
    };

    // Handle custom icon upload and save
    const handleUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Hanya file gambar yang diperbolehkan');
            return;
        }

        if (file.size > 500 * 1024) {
            alert('Ukuran icon maksimal 500KB');
            return;
        }

        if (!newIconName.trim()) {
            alert('Masukkan nama icon terlebih dahulu');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'icons');

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) {
                const data = await uploadRes.json();
                alert(data.error || 'Gagal upload icon');
                return;
            }

            const uploadData = await uploadRes.json();

            // Save to user_icons table
            const saveRes = await fetch('/api/icons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newIconName.trim(),
                    url: uploadData.url,
                }),
            });

            if (saveRes.ok) {
                fetchUserIcons();
                setNewIconName('');
                setMode('my-icons');
            } else {
                const data = await saveRes.json();
                alert(data.error || 'Gagal menyimpan icon');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Gagal upload icon');
        } finally {
            setIsUploading(false);
        }
    };

    // Delete user icon
    const handleDeleteUserIcon = async (id: string) => {
        if (!confirm('Hapus icon ini?')) return;

        try {
            const res = await fetch(`/api/icons?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchUserIcons();
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    // Get icon label for display
    const getIconLabel = () => {
        if (isIconUrl(value)) {
            const userIcon = userIcons.find(i => i.url === value);
            return userIcon?.name || 'Custom Icon';
        }
        return allIcons.find(i => i.name === value)?.label || value || 'Pilih Icon';
    };

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-secondary"
                style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    gap: 'var(--spacing-sm)',
                }}
            >
                <IconByName name={value} size={18} />
                <span style={{ flex: 1, textAlign: 'left' }}>{getIconLabel()}</span>
            </button>

            {/* Preview - How icon looks on web */}
            <div style={{
                marginTop: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
            }}>
                <div style={{ marginBottom: '4px' }}>Preview:</div>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)',
                    padding: '2px 8px',
                    background: 'var(--accent-blue-bg)',
                    color: 'var(--accent-blue)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderRadius: '4px',
                }}>
                    <IconByName name={value} size={14} />
                    Nama Kategori
                </div>
            </div>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        minWidth: '360px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--border-radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 1000,
                        overflow: 'hidden',
                    }}
                >
                    {/* Mode tabs */}
                    <div style={{
                        display: 'flex',
                        borderBottom: '1px solid var(--border-light)',
                        padding: '4px',
                        gap: '4px',
                    }}>
                        <button
                            type="button"
                            onClick={() => setMode('library')}
                            style={{
                                flex: 1,
                                padding: '6px 8px',
                                fontSize: '0.75rem',
                                background: mode === 'library' ? 'var(--accent-blue-bg)' : 'transparent',
                                color: mode === 'library' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                border: 'none',
                                borderRadius: 'var(--border-radius-sm)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                            }}
                        >
                            <Menu size={12} />
                            Library
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode('my-icons');
                                fetchUserIcons();
                            }}
                            style={{
                                flex: 1,
                                padding: '6px 8px',
                                fontSize: '0.75rem',
                                background: mode === 'my-icons' ? 'var(--accent-blue-bg)' : 'transparent',
                                color: mode === 'my-icons' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                border: 'none',
                                borderRadius: 'var(--border-radius-sm)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                            }}
                        >
                            <UserIcon size={12} />
                            Icon Saya
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('upload')}
                            style={{
                                flex: 1,
                                padding: '6px 8px',
                                fontSize: '0.75rem',
                                background: mode === 'upload' ? 'var(--accent-blue-bg)' : 'transparent',
                                color: mode === 'upload' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                border: 'none',
                                borderRadius: 'var(--border-radius-sm)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                            }}
                        >
                            <Plus size={12} />
                            Upload
                        </button>
                    </div>

                    {mode === 'library' && (
                        <>
                            {/* Search */}
                            <div style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border-light)' }}>
                                <div style={{ position: 'relative' }}>
                                    <Search
                                        size={14}
                                        style={{
                                            position: 'absolute',
                                            left: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-muted)',
                                        }}
                                    />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Cari icon..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ paddingLeft: '32px', height: '32px', fontSize: '0.8125rem' }}
                                    />
                                </div>
                            </div>

                            {/* Category tabs */}
                            {!searchQuery && (
                                <div
                                    style={{
                                        display: 'flex',
                                        overflowX: 'auto',
                                        borderBottom: '1px solid var(--border-light)',
                                        padding: '4px',
                                        gap: '2px',
                                    }}
                                >
                                    {iconCategories.map((cat, index) => (
                                        <button
                                            key={cat.name}
                                            type="button"
                                            onClick={() => setActiveCategory(index)}
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: '0.75rem',
                                                background: activeCategory === index ? 'var(--accent-blue-bg)' : 'transparent',
                                                color: activeCategory === index ? 'var(--accent-blue)' : 'var(--text-muted)',
                                                border: 'none',
                                                borderRadius: 'var(--border-radius-sm)',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Icon grid */}
                            <div style={{ padding: 'var(--spacing-sm)', maxHeight: '200px', overflowY: 'auto' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                                    {filteredIcons.map((iconData) => {
                                        const IconComp = iconData.icon;
                                        const isSelected = value === iconData.name;
                                        return (
                                            <button
                                                key={iconData.name}
                                                type="button"
                                                onClick={() => handleSelect(iconData.name)}
                                                title={iconData.label}
                                                style={{
                                                    padding: '8px',
                                                    background: isSelected ? 'var(--accent-blue-bg)' : 'transparent',
                                                    color: isSelected ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                                    border: 'none',
                                                    borderRadius: 'var(--border-radius-sm)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <IconComp size={20} />
                                            </button>
                                        );
                                    })}
                                </div>
                                {filteredIcons.length === 0 && (
                                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: 'var(--spacing-md)' }}>
                                        Tidak ada icon ditemukan
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {mode === 'my-icons' && (
                        <div style={{ padding: 'var(--spacing-md)' }}>
                            {userIcons.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--text-muted)' }}>
                                    <ImageIcon size={32} style={{ opacity: 0.5 }} />
                                    <p style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.875rem' }}>Belum ada icon tersimpan</p>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => setMode('upload')}
                                        style={{ marginTop: 'var(--spacing-md)' }}
                                    >
                                        <Upload size={14} />
                                        Upload Icon
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-sm)' }}>
                                    {userIcons.map((icon) => {
                                        const isSelected = value === icon.url;
                                        return (
                                            <div
                                                key={icon.id}
                                                style={{
                                                    position: 'relative',
                                                    padding: 'var(--spacing-sm)',
                                                    background: isSelected ? 'var(--accent-blue-bg)' : 'var(--bg-secondary)',
                                                    borderRadius: 'var(--border-radius-sm)',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                }}
                                                onClick={() => handleSelect(icon.url)}
                                            >
                                                <img
                                                    src={icon.url}
                                                    alt={icon.name}
                                                    width={32}
                                                    height={32}
                                                    style={{ objectFit: 'contain' }}
                                                />
                                                <p style={{
                                                    fontSize: '0.6875rem',
                                                    color: 'var(--text-secondary)',
                                                    marginTop: '4px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {icon.name}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteUserIcon(icon.id);
                                                    }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '2px',
                                                        right: '2px',
                                                        padding: '2px',
                                                        background: 'rgba(255,255,255,0.9)',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        color: 'var(--error)',
                                                        opacity: 0.7,
                                                    }}
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {mode === 'upload' && (
                        <div style={{ padding: 'var(--spacing-md)' }}>
                            {/* Icon name input */}
                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                    Nama Icon
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newIconName}
                                    onChange={(e) => setNewIconName(e.target.value)}
                                    placeholder="Contoh: Logo Spotify"
                                    style={{ height: '32px', fontSize: '0.8125rem' }}
                                />
                            </div>

                            {/* Upload area */}
                            <div
                                style={{
                                    border: '2px dashed var(--border-medium)',
                                    borderRadius: 'var(--border-radius-md)',
                                    padding: 'var(--spacing-lg)',
                                    textAlign: 'center',
                                    cursor: isUploading ? 'wait' : 'pointer',
                                    opacity: isUploading ? 0.7 : 1,
                                }}
                                onClick={() => {
                                    if (isUploading) return;
                                    if (!newIconName.trim()) {
                                        alert('Masukkan nama icon terlebih dahulu');
                                        return;
                                    }
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/png,image/webp,image/svg+xml';
                                    input.onchange = (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (file) handleUpload(file);
                                    };
                                    input.click();
                                }}
                            >
                                {isUploading ? (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Mengupload...</p>
                                ) : (
                                    <>
                                        <Upload size={24} color="var(--text-muted)" />
                                        <p style={{ marginTop: 'var(--spacing-xs)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            Klik untuk upload
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            PNG, WebP, SVG (transparent) - Max 500KB
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
