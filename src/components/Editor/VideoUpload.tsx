'use client';

import { useState, useCallback } from 'react';
import { Upload, Video, Download, X, Play, Pause, Loader2 } from 'lucide-react';
import { UploadProgress } from './UploadProgress';

interface VideoUploadProps {
    onUpload: (url: string) => void;
    onCancel?: () => void;
}

export function VideoUpload({ onUpload, onCancel }: VideoUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleFileSelect = useCallback(async (file: File) => {
        // Validate file type
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!validTypes.includes(file.type)) {
            setError('Format video tidak didukung. Gunakan MP4, WebM, atau OGG.');
            return;
        }

        // Validate file size (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
            setError('Ukuran video maksimal 100MB');
            return;
        }

        setError('');
        setUploadFile(file);
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'videos');

        try {
            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 5;
                });
            }, 300);

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
                setError(data.error || 'Gagal mengupload video');
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <Video size={18} />
                    Upload Video
                </span>
                {onCancel && (
                    <button className="btn btn-ghost btn-sm" onClick={onCancel}>
                        <X size={14} />
                    </button>
                )}
            </div>

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
                    input.accept = 'video/mp4,video/webm,video/ogg';
                    input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleFileSelect(file);
                    };
                    input.click();
                }}
            >
                <Upload size={32} color="var(--text-muted)" />
                <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
                    Klik atau drag video ke sini
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                    Maksimal 100MB (MP4, WebM, OGG)
                </p>
            </div>

            {error && (
                <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: 'var(--spacing-sm)' }}>
                    {error}
                </p>
            )}
        </div>
    );
}

// Video player component with curved edges and native controls
interface VideoPlayerProps {
    src: string;
    onRemove?: () => void;
}

export function VideoPlayer({ src, onRemove }: VideoPlayerProps) {
    const [isLoading, setIsLoading] = useState(true);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = src;
        link.download = 'video';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="video-player-wrapper">
            {isLoading && (
                <div className="video-loading">
                    <Loader2 size={32} className="spin" />
                    <p>Memuat video...</p>
                </div>
            )}
            <video
                src={src}
                controls
                controlsList="nodownload"
                preload="metadata"
                onLoadedData={() => setIsLoading(false)}
                style={{
                    display: isLoading ? 'none' : 'block',
                    width: '100%',
                    maxHeight: '400px',
                    borderRadius: '16px',
                    background: '#000',
                }}
            />
            <div className="video-actions">
                <button className="btn btn-secondary btn-sm" onClick={handleDownload}>
                    <Download size={14} />
                    Download
                </button>
                {onRemove && (
                    <button className="btn btn-danger btn-sm" onClick={onRemove}>
                        <X size={14} />
                        Hapus
                    </button>
                )}
            </div>
            <style jsx>{`
        .video-player-wrapper {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: #000;
          margin: var(--spacing-md) 0;
        }
        .video-loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          gap: var(--spacing-sm);
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .video-actions {
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
          display: flex;
          gap: var(--spacing-xs);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .video-player-wrapper:hover .video-actions {
          opacity: 1;
        }
      `}</style>
        </div>
    );
}
