'use client';

import { Video, X } from 'lucide-react';

interface UploadProgressProps {
    fileName: string;
    progress: number;
    fileSize: number;
    uploadedSize: number;
    onCancel?: () => void;
}

export function UploadProgress({
    fileName,
    progress,
    fileSize,
    uploadedSize,
    onCancel
}: UploadProgressProps) {
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="upload-progress">
            <div className="upload-progress-header">
                <Video size={18} color="var(--accent-blue)" />
                <span style={{ flex: 1, fontWeight: 500 }}>Mengupload video...</span>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                        }}
                    >
                        <X size={16} color="var(--text-muted)" />
                    </button>
                )}
            </div>

            <div className="upload-progress-bar-container">
                <div
                    className="upload-progress-bar"
                    style={{ width: `${progress}%` }}
                />
                {progress < 100 && (
                    <div
                        className="upload-progress-blur"
                        style={{ left: `${progress}%` }}
                    />
                )}
            </div>

            <div className="upload-progress-info">
                <span>{fileName}</span>
                <span>{formatSize(uploadedSize)} / {formatSize(fileSize)} ({Math.round(progress)}%)</span>
            </div>
        </div>
    );
}
