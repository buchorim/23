'use client';

import { useState, useCallback } from 'react';
import { Upload, Link as LinkIcon, X, Download } from 'lucide-react';
import { UploadProgress } from './UploadProgress';

interface ImageUploadProps {
    onUpload: (url: string) => void;
    onCancel?: () => void;
}

export function ImageUpload({ onUpload, onCancel }: ImageUploadProps) {
    const [mode, setMode] = useState<'upload' | 'url'>('upload');
    const [url, setUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleFileSelect = useCallback(async (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Hanya file gambar yang diperbolehkan');
            return;
        }

        // Validate file size (max 10MB for images)
        if (file.size > 10 * 1024 * 1024) {
            setError('Ukuran gambar maksimal 10MB');
            return;
        }

        setError('');
        setUploadFile(file);
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'images');

        try {
            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 200);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);

            if (res.ok) {
                const data = await res.json();
                setUploadProgress(100);
                setTimeout(() => {
                    onUpload(data.url);
                }, 300);
            } else {
                const data = await res.json();
                setError(data.error || 'Gagal mengupload gambar');
                setIsUploading(false);
                setUploadProgress(0);
            }
        } catch {
            setError('Terjadi kesalahan saat upload');
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [onUpload]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    const handleUrlSubmit = () => {
        if (url.trim()) {
            onUpload(url.trim());
        }
    };

    if (isUploading && uploadFile) {
        return (
            <UploadProgress
                fileName={uploadFile.name}
                progress={uploadProgress}
                fileSize={uploadFile.size}
                uploadedSize={Math.floor(uploadFile.size * (uploadProgress / 100))}
                onCancel={() => {
                    setIsUploading(false);
                    setUploadProgress(0);
                    setUploadFile(null);
                }}
            />
        );
    }

    return (
        <div style={{
            padding: 'var(--spacing-md)',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--border-radius-md)',
        }}>
            {/* Tab buttons */}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                <button
                    className={`btn btn-sm ${mode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setMode('upload')}
                >
                    <Upload size={14} />
                    Upload
                </button>
                <button
                    className={`btn btn-sm ${mode === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setMode('url')}
                >
                    <LinkIcon size={14} />
                    URL
                </button>
                {onCancel && (
                    <button className="btn btn-ghost btn-sm" onClick={onCancel} style={{ marginLeft: 'auto' }}>
                        <X size={14} />
                    </button>
                )}
            </div>

            {mode === 'upload' ? (
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    style={{
                        border: '2px dashed var(--border-medium)',
                        borderRadius: 'var(--border-radius-md)',
                        padding: 'var(--spacing-xl)',
                        textAlign: 'center',
                        cursor: 'pointer',
                    }}
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileSelect(file);
                        };
                        input.click();
                    }}
                >
                    <Upload size={32} color="var(--text-muted)" />
                    <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
                        Klik atau drag gambar ke sini
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                        Maksimal 10MB (JPG, PNG, GIF, WebP)
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <input
                        type="url"
                        className="form-input"
                        placeholder="https://example.com/gambar.jpg"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button className="btn btn-primary" onClick={handleUrlSubmit}>
                        Sisipkan
                    </button>
                </div>
            )}

            {error && (
                <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: 'var(--spacing-sm)' }}>
                    {error}
                </p>
            )}
        </div>
    );
}

// Image display component with download button
interface ImageDisplayProps {
    src: string;
    alt?: string;
    onRemove?: () => void;
}

export function ImageDisplay({ src, alt = '', onRemove }: ImageDisplayProps) {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = src;
        link.download = alt || 'image';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <img src={src} alt={alt} style={{ maxWidth: '100%', borderRadius: 'var(--border-radius-md)' }} />
            <div
                style={{
                    position: 'absolute',
                    top: 'var(--spacing-sm)',
                    right: 'var(--spacing-sm)',
                    display: 'flex',
                    gap: 'var(--spacing-xs)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                }}
                className="image-actions"
            >
                <button
                    className="btn btn-secondary btn-icon btn-sm"
                    onClick={handleDownload}
                    title="Download"
                >
                    <Download size={14} />
                </button>
                {onRemove && (
                    <button
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={onRemove}
                        title="Hapus"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}
