'use client';

import { useState, useEffect, useCallback } from 'react';
import { Type, Upload, X, Check, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { useToast } from '@/hooks/useToast';
import { useAdmin } from '@/hooks/useAdmin';

interface FontSetting {
    name: string;
    url: string | null;
    isCustom: boolean;
}

const defaultFonts = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Outfit', value: 'Outfit, sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' },
];

// Hook untuk mengambil dan apply font global
export function useGlobalFont() {
    const [font, setFont] = useState<FontSetting>({ name: 'Inter', url: null, isCustom: false });
    const [isLoading, setIsLoading] = useState(true);

    const loadFont = useCallback(async () => {
        try {
            const res = await fetch('/api/settings/font');
            if (res.ok) {
                const data = await res.json();
                setFont(data.font);
                applyFont(data.font);
            }
        } catch (error) {
            console.error('Error loading font:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFont();
    }, [loadFont]);

    return { font, isLoading, refresh: loadFont };
}

// Apply font ke document
function applyFont(font: FontSetting) {
    if (font.isCustom && font.url) {
        // Load custom font
        const style = document.createElement('style');
        style.id = 'custom-font-style';
        style.textContent = `
      @font-face {
        font-family: 'CustomFont';
        src: url('${font.url}') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `;

        // Remove existing custom font style
        const existing = document.getElementById('custom-font-style');
        if (existing) existing.remove();

        document.head.appendChild(style);
        document.documentElement.style.setProperty('--font-primary', "'CustomFont', sans-serif");
    } else {
        // Use default font
        document.documentElement.style.setProperty('--font-primary', `'${font.name}', sans-serif`);
    }
}

interface GlobalFontSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved?: () => void;
}

export function GlobalFontSettings({ isOpen, onClose, onSaved }: GlobalFontSettingsProps) {
    const { success, error } = useToast();
    const [mode, setMode] = useState<'select' | 'upload'>('select');
    const [selectedFont, setSelectedFont] = useState('Inter');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentFont, setCurrentFont] = useState<FontSetting | null>(null);

    // Load current font on open
    useEffect(() => {
        if (isOpen) {
            fetch('/api/settings/font')
                .then(res => res.json())
                .then(data => {
                    setCurrentFont(data.font);
                    if (!data.font.isCustom) {
                        setSelectedFont(data.font.name);
                    }
                })
                .catch(console.error);
        }
    }, [isOpen]);

    const handleSelectFont = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/settings/font', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: selectedFont,
                    url: null,
                    isCustom: false,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                applyFont(data.font);
                success('Berhasil', 'Font berhasil diubah untuk semua pengunjung');
                onSaved?.();
                onClose();
            } else {
                const data = await res.json();
                error('Gagal', data.error || 'Tidak dapat menyimpan font');
            }
        } catch {
            error('Gagal', 'Terjadi kesalahan');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUploadFont = async (file: File) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload/font', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                applyFont(data.font);
                success('Berhasil', data.message || 'Font custom berhasil diupload');
                onSaved?.();
                onClose();
            } else {
                const data = await res.json();
                error('Gagal', data.error || 'Tidak dapat mengupload font');
            }
        } catch {
            error('Gagal', 'Terjadi kesalahan saat upload');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Pengaturan Font Global"
            size="md"
            footer={
                mode === 'select' ? (
                    <>
                        <button className="btn btn-secondary" onClick={onClose}>
                            Batal
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSelectFont}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                            Simpan
                        </button>
                    </>
                ) : null
            }
        >
            {/* Current Font Info */}
            {currentFont && (
                <div style={{
                    padding: 'var(--spacing-md)',
                    background: 'var(--accent-blue-bg)',
                    borderRadius: 'var(--border-radius-md)',
                    marginBottom: 'var(--spacing-lg)',
                }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--accent-blue)' }}>
                        <strong>Font Aktif:</strong> {currentFont.name}
                        {currentFont.isCustom && ' (Custom)'}
                    </p>
                </div>
            )}

            {/* Mode Tabs */}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
                <button
                    className={`btn ${mode === 'select' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setMode('select')}
                >
                    <Type size={16} />
                    Pilih Font
                </button>
                <button
                    className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setMode('upload')}
                >
                    <Upload size={16} />
                    Upload Custom
                </button>
            </div>

            {mode === 'select' ? (
                <>
                    <div className="form-group">
                        <label className="form-label">Pilih Font</label>
                        <select
                            className="form-input form-select"
                            value={selectedFont}
                            onChange={(e) => setSelectedFont(e.target.value)}
                        >
                            {defaultFonts.map((font) => (
                                <option key={font.name} value={font.name}>
                                    {font.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Preview</label>
                        <div
                            style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--border-radius-md)',
                                fontFamily: `'${selectedFont}', sans-serif`,
                            }}
                        >
                            <p style={{ marginBottom: 'var(--spacing-sm)', fontWeight: 600, fontSize: '1.125rem' }}>
                                Dokumentasi Easy.Store
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Ini adalah contoh teks dengan font {selectedFont}. Font ini akan diterapkan ke seluruh website untuk semua pengunjung.
                            </p>
                        </div>
                    </div>
                </>
            ) : (
                <div>
                    <div
                        style={{
                            border: '2px dashed var(--border-medium)',
                            borderRadius: 'var(--border-radius-md)',
                            padding: 'var(--spacing-xl)',
                            textAlign: 'center',
                            cursor: isUploading ? 'wait' : 'pointer',
                            opacity: isUploading ? 0.7 : 1,
                        }}
                        onClick={() => {
                            if (isUploading) return;
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.woff2';
                            input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleUploadFont(file);
                            };
                            input.click();
                        }}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 size={32} color="var(--accent-blue)" className="spin" />
                                <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
                                    Mengupload font...
                                </p>
                            </>
                        ) : (
                            <>
                                <Upload size={32} color="var(--text-muted)" />
                                <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
                                    Klik untuk upload font custom
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                                    Format: <strong>WOFF2 only</strong> (maksimal 2MB)
                                </p>
                            </>
                        )}
                    </div>

                    <div style={{
                        marginTop: 'var(--spacing-md)',
                        padding: 'var(--spacing-md)',
                        background: 'var(--warning-bg)',
                        borderRadius: 'var(--border-radius-md)',
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                    }}>
                        <strong>Tips:</strong> Gunakan format WOFF2 untuk performa dan kompatibilitas terbaik.
                        Kamu bisa convert font di <a href="https://cloudconvert.com/ttf-to-woff2" target="_blank" rel="noopener" style={{ color: 'var(--accent-blue)' }}>cloudconvert.com</a>
                    </div>
                </div>
            )}
        </Modal>
    );
}

// Button untuk admin
export function GlobalFontSettingsButton() {
    const { isAdmin } = useAdmin();
    const [isOpen, setIsOpen] = useState(false);
    const { refresh } = useGlobalFont();

    if (!isAdmin) return null;

    return (
        <>
            <button
                className="btn btn-ghost btn-icon"
                onClick={() => setIsOpen(true)}
                title="Pengaturan Font Global"
            >
                <Type size={18} />
            </button>
            <GlobalFontSettings
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSaved={refresh}
            />
        </>
    );
}
