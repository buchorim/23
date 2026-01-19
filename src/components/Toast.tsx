'use client';

import { X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { useToast, Toast as ToastType } from '@/hooks/useToast';

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
};

function ToastItem({ toast, onClose }: { toast: ToastType; onClose: () => void }) {
    const Icon = icons[toast.type];

    return (
        <div className={`toast toast-${toast.type}`}>
            <Icon className="toast-icon" />
            <div className="toast-content">
                <div className="toast-title">{toast.title}</div>
                {toast.message && <div className="toast-message">{toast.message}</div>}
                {toast.action && (
                    <button
                        className="btn btn-sm btn-secondary"
                        onClick={toast.action.onClick}
                        style={{ marginTop: '8px' }}
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>
            <X className="toast-close" onClick={onClose} />
        </div>
    );
}

export function ToastContainer() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}
