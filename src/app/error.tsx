'use client';

import { useEffect } from 'react';
import { RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { ERROR_PAGES } from '@/lib/errors';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="error-page">
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="error-code">500</div>
                <h1 className="error-title">{ERROR_PAGES[500].title}</h1>
                <p className="error-message">{ERROR_PAGES[500].message}</p>

                <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                    <button onClick={reset} className="btn btn-primary">
                        <RefreshCw size={18} />
                        {ERROR_PAGES[500].buttonText}
                    </button>
                    <Link href="/" className="btn btn-secondary">
                        <Home size={18} />
                        Kembali ke Beranda
                    </Link>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div style={{
                        marginTop: 'var(--spacing-xl)',
                        padding: 'var(--spacing-md)',
                        background: 'var(--error-bg)',
                        borderRadius: 'var(--border-radius-md)',
                        textAlign: 'left',
                        maxWidth: '500px',
                    }}>
                        <p style={{ fontWeight: 600, color: 'var(--error)', marginBottom: 'var(--spacing-sm)' }}>
                            Detail Error (Development Only):
                        </p>
                        <code style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            {error.message}
                        </code>
                    </div>
                )}
            </div>
        </div>
    );
}
