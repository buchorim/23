import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { ERROR_PAGES } from '@/lib/errors';

export default function NotFound() {
    return (
        <div className="error-page">
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="error-code">404</div>
                <h1 className="error-title">{ERROR_PAGES[404].title}</h1>
                <p className="error-message">{ERROR_PAGES[404].message}</p>

                <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                    <Link href="/" className="btn btn-primary">
                        <Home size={18} />
                        {ERROR_PAGES[404].buttonText}
                    </Link>
                    <Link href="/" className="btn btn-secondary">
                        <Search size={18} />
                        Cari Dokumen
                    </Link>
                </div>
            </div>
        </div>
    );
}
