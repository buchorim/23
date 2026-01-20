'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Settings, Type, Image as ImageIcon, Megaphone, Upload, Trash2, Check, BarChart3, Shield } from 'lucide-react';
import { TrafficDashboard } from './TrafficDashboard';
import { TrafficProtectionDashboard } from './TrafficProtectionDashboard';

interface FontSetting {
    name: string;
    url: string | null;
    isCustom: boolean;
}

interface Announcement {
    id: string;
    title: string;
    message: string;
    type: string;
    active: boolean;
    show_once: boolean;
}

const PRESET_FONTS = [
    { name: 'Inter', label: 'Inter (Default)' },
    { name: 'Outfit', label: 'Outfit' },
    { name: 'Poppins', label: 'Poppins' },
    { name: 'Roboto', label: 'Roboto' },
];

interface AdminSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AdminSettingsModal({ isOpen, onClose }: AdminSettingsModalProps) {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'protection' | 'font' | 'icon' | 'announcement'>('dashboard');
    const [font, setFont] = useState<FontSetting>({ name: 'Inter', url: null, isCustom: false });
    const [siteIcon, setSiteIcon] = useState<string | null>(null);
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Announcement form
    const [annTitle, setAnnTitle] = useState('');
    const [annMessage, setAnnMessage] = useState('');
    const [annType, setAnnType] = useState('info');
    const [annShowOnce, setAnnShowOnce] = useState(true);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch font
            const fontRes = await fetch('/api/settings/font');
            if (fontRes.ok) {
                const data = await fontRes.json();
                if (data.font) setFont(data.font);
            }

            // Fetch announcement
            const annRes = await fetch('/api/announcements');
            if (annRes.ok) {
                const data = await annRes.json();
                if (data.announcement) {
                    setAnnouncement(data.announcement);
                    setAnnTitle(data.announcement.title);
                    setAnnMessage(data.announcement.message);
                    setAnnType(data.announcement.type);
                    setAnnShowOnce(data.announcement.show_once);
                }
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchSettings();
        }
    }, [isOpen, fetchSettings]);

    // Font handlers
    const handleFontChange = async (fontName: string) => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/settings/font', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: fontName, url: null, isCustom: false }),
            });
            if (res.ok) {
                const data = await res.json();
                setFont(data.font);
                document.documentElement.style.setProperty('--font-family', fontName);
            }
        } catch (err) {
            console.error('Error saving font:', err);
        } finally {
            setIsSaving(false);
        }
    };

    // Site icon handlers
    const handleIconUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Hanya file gambar yang diperbolehkan');
            return;
        }
        if (file.size > 500 * 1024) {
            alert('Ukuran maksimal 500KB');
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'icons');

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (uploadRes.ok) {
                const data = await uploadRes.json();
                setSiteIcon(data.url);

                // Save to settings
                await fetch('/api/settings/icon', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: data.url }),
                });
            }
        } catch (err) {
            console.error('Error uploading icon:', err);
        } finally {
            setIsSaving(false);
        }
    };

    // Announcement handlers
    const handleSaveAnnouncement = async () => {
        if (!annTitle || !annMessage) {
            alert('Judul dan pesan wajib diisi');
            return;
        }

        setIsSaving(true);
        try {
            const method = announcement ? 'PATCH' : 'POST';
            const body = {
                ...(announcement ? { id: announcement.id } : {}),
                title: annTitle,
                message: annMessage,
                type: annType,
                show_once: annShowOnce,
                active: true,
            };

            const res = await fetch('/api/announcements', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                const data = await res.json();
                setAnnouncement(data.announcement);
                alert('Pengumuman berhasil disimpan!');
            }
        } catch (err) {
            console.error('Error saving announcement:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAnnouncement = async () => {
        if (!announcement || !confirm('Hapus pengumuman ini?')) return;

        setIsSaving(true);
        try {
            await fetch(`/api/announcements?id=${announcement.id}`, {
                method: 'DELETE',
            });
            setAnnouncement(null);
            setAnnTitle('');
            setAnnMessage('');
            setAnnType('info');
            setAnnShowOnce(true);
        } catch (err) {
            console.error('Error deleting announcement:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'var(--bg-primary)',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    zIndex: 1001,
                    width: '90%',
                    maxWidth: '560px',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-light)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Settings size={20} />
                        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
                            Pengaturan Admin
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'var(--bg-secondary)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--border-light)',
                    padding: '0 20px',
                }}>
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                        { id: 'protection', label: 'Protection', icon: Shield },
                        { id: 'announcement', label: 'Pengumuman', icon: Megaphone },
                        { id: 'font', label: 'Font', icon: Type },
                        { id: 'icon', label: 'Icon', icon: ImageIcon },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '12px 16px',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
                                color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                transition: 'all 0.2s',
                            }}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            Memuat...
                        </div>
                    ) : (
                        <>
                            {/* Dashboard Tab */}
                            {activeTab === 'dashboard' && (
                                <TrafficDashboard />
                            )}

                            {/* Protection Tab */}
                            {activeTab === 'protection' && (
                                <TrafficProtectionDashboard />
                            )}

                            {/* Announcement Tab */}
                            {activeTab === 'announcement' && (
                                <div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
                                            Judul
                                        </label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={annTitle}
                                            onChange={(e) => setAnnTitle(e.target.value)}
                                            placeholder="Judul pengumuman"
                                        />
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
                                            Pesan
                                        </label>
                                        <textarea
                                            className="form-input"
                                            value={annMessage}
                                            onChange={(e) => setAnnMessage(e.target.value)}
                                            placeholder="Isi pesan pengumuman..."
                                            rows={4}
                                            style={{ resize: 'vertical' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
                                                Tipe
                                            </label>
                                            <select
                                                className="form-input"
                                                value={annType}
                                                onChange={(e) => setAnnType(e.target.value)}
                                            >
                                                <option value="info">Info (Biru)</option>
                                                <option value="warning">Warning (Kuning)</option>
                                                <option value="success">Success (Hijau)</option>
                                            </select>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
                                                Tampilkan
                                            </label>
                                            <select
                                                className="form-input"
                                                value={annShowOnce ? 'once' : 'always'}
                                                onChange={(e) => setAnnShowOnce(e.target.value === 'once')}
                                            >
                                                <option value="once">Sekali saja</option>
                                                <option value="always">Selalu</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSaveAnnouncement}
                                            disabled={isSaving}
                                            style={{ flex: 1 }}
                                        >
                                            <Check size={16} />
                                            {announcement ? 'Update' : 'Buat'} Pengumuman
                                        </button>
                                        {announcement && (
                                            <button
                                                className="btn btn-ghost"
                                                onClick={handleDeleteAnnouncement}
                                                disabled={isSaving}
                                                style={{ color: 'var(--error)' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Font Tab */}
                            {activeTab === 'font' && (
                                <div>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.875rem' }}>
                                        Pilih font untuk seluruh website:
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {PRESET_FONTS.map((f) => (
                                            <button
                                                key={f.name}
                                                onClick={() => handleFontChange(f.name)}
                                                disabled={isSaving}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '12px 16px',
                                                    background: font.name === f.name ? 'var(--accent-blue-bg)' : 'var(--bg-secondary)',
                                                    border: font.name === f.name ? '2px solid var(--accent-blue)' : '2px solid transparent',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontFamily: f.name,
                                                    fontSize: '0.9375rem',
                                                    color: 'var(--text-primary)',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {f.label}
                                                {font.name === f.name && (
                                                    <Check size={18} color="var(--accent-blue)" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Icon Tab */}
                            {activeTab === 'icon' && (
                                <div>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.875rem' }}>
                                        Upload icon/logo untuk website (akan muncul di favicon dan header):
                                    </p>

                                    {siteIcon && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            padding: '16px',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: '12px',
                                            marginBottom: '16px',
                                        }}>
                                            <img
                                                src={siteIcon}
                                                alt="Site icon"
                                                style={{
                                                    width: '64px',
                                                    height: '64px',
                                                    objectFit: 'contain',
                                                    borderRadius: '8px',
                                                    background: 'white',
                                                }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 500 }}>Icon Aktif</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    Terlihat di favicon dan header
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        style={{
                                            border: '2px dashed var(--border-medium)',
                                            borderRadius: '12px',
                                            padding: '32px',
                                            textAlign: 'center',
                                            cursor: isSaving ? 'wait' : 'pointer',
                                        }}
                                        onClick={() => {
                                            if (isSaving) return;
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.accept = 'image/png,image/jpeg,image/webp,image/svg+xml';
                                            input.onchange = (e) => {
                                                const file = (e.target as HTMLInputElement).files?.[0];
                                                if (file) handleIconUpload(file);
                                            };
                                            input.click();
                                        }}
                                    >
                                        <Upload size={32} color="var(--text-muted)" />
                                        <p style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                            {isSaving ? 'Mengupload...' : 'Klik untuk upload icon baru'}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            PNG, JPG, WebP, SVG - Max 500KB
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
