export default function OverloadPage() {
    return (
        <html lang="id">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Website Sedang Ramai - Easy.Store</title>
            </head>
            <body style={{
                margin: 0,
                padding: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                color: '#e4e4e7',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{
                    maxWidth: 480,
                    textAlign: 'center',
                    padding: 20,
                }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        background: 'rgba(59, 130, 246, 0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                    }}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={40}
                            height={40}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="#3b82f6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        marginBottom: 16,
                        color: '#f4f4f5',
                    }}>
                        Website Sedang Ramai
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        lineHeight: 1.6,
                        color: '#a1a1aa',
                        marginBottom: 32,
                    }}>
                        Maaf, website sedang mengalami lonjakan pengunjung.
                        Silakan tunggu beberapa saat sebelum mencoba lagi.
                    </p>
                    <a
                        href="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '14px 28px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: '1rem',
                            fontWeight: 500,
                            textDecoration: 'none',
                        }}
                    >
                        Coba Lagi
                    </a>
                </div>
            </body>
        </html>
    );
}
