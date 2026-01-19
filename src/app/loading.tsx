export default function Loading() {
    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-xl)' }}>
            {/* Hero skeleton */}
            <div className="hero">
                <div className="skeleton skeleton-title" style={{ margin: '0 auto', marginBottom: 'var(--spacing-md)' }} />
                <div className="skeleton skeleton-text" style={{ width: '40%', margin: '0 auto', marginBottom: 'var(--spacing-lg)' }} />
                <div className="skeleton" style={{ height: '44px', maxWidth: '500px', margin: '0 auto' }} />
            </div>

            {/* Category tabs skeleton */}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton" style={{ width: '100px', height: '36px' }} />
                ))}
            </div>

            {/* Document grid skeleton */}
            <div className="document-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="card">
                        <div className="skeleton card-thumbnail" />
                        <div className="card-body">
                            <div className="skeleton skeleton-title" />
                            <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
