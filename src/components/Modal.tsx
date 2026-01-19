'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md'
}: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Close when clicking overlay
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    const sizeStyles = {
        sm: '400px',
        md: '500px',
        lg: '700px',
    };

    return (
        <div
            ref={overlayRef}
            className={`modal-overlay ${isOpen ? 'open' : ''}`}
            onClick={handleOverlayClick}
        >
            <div className="modal" style={{ maxWidth: sizeStyles[size] }}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body">
                    {children}
                </div>

                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// Confirm Modal untuk delete actions
interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Hapus',
    cancelText = 'Batal',
    isLoading = false,
}: ConfirmModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <>
                    <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
                        {cancelText}
                    </button>
                    <button className="btn btn-danger" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? 'Menghapus...' : confirmText}
                    </button>
                </>
            }
        >
            <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
        </Modal>
    );
}
