import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function DocumentNotFound() {
    return (
        <div className="error-page">
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="error-code">404</div>
                <h1 className="error-title">Dokumen Tidak Ditemukan</h1>
                <p className="error-message">
                    Dokumen yang kamu cari tidak ada, mungkin sudah dihapus atau dipindahkan ke lokasi lain.
                </p>

                <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                    <Link href="/" className="btn btn-primary">
                        <Home size={18} />
                        Kembali ke Beranda
                    </Link>
                    <Link href="/" className="btn btn-secondary">
                        <Search size={18} />
                        Cari Dokumen Lain
                    </Link>
                </div>
            </div>
        </div>
    );
}
