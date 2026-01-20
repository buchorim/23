import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Messages for different rejection reasons
const MESSAGES = {
    hard_overload: {
        title: 'Website Sedang Sangat Ramai',
        message: 'Maaf, website sedang mengalami lonjakan pengunjung yang sangat tinggi. Mohon tunggu beberapa saat sebelum mencoba lagi.',
    },
    spike_rejection: {
        title: 'Website Sedang Ramai',
        message: 'Website sedang ramai dikunjungi. Silakan coba lagi dalam beberapa detik.',
    },
    max_concurrent: {
        title: 'Terlalu Banyak Pengguna',
        message: 'Akses gagal karena terlalu banyak pengguna aktif. Silakan coba lagi sebentar.',
    },
};

// Generate overload HTML page
function generateOverloadPage(reason: keyof typeof MESSAGES): string {
    const { title, message } = MESSAGES[reason] || MESSAGES.hard_overload;

    return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Easy.Store</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #e4e4e7;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            max-width: 480px;
            text-align: center;
            animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .icon {
            width: 80px;
            height: 80px;
            background: rgba(59, 130, 246, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
        }
        .icon svg {
            width: 40px;
            height: 40px;
            color: #3b82f6;
        }
        h1 {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 16px;
            color: #f4f4f5;
        }
        p {
            font-size: 1rem;
            line-height: 1.6;
            color: #a1a1aa;
            margin-bottom: 32px;
        }
        .retry-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 28px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }
        .retry-btn:hover {
            background: #2563eb;
            transform: translateY(-2px);
        }
        .retry-btn:disabled {
            background: #52525b;
            cursor: not-allowed;
            transform: none;
        }
        .countdown {
            margin-top: 16px;
            font-size: 0.875rem;
            color: #71717a;
        }
        .progress-bar {
            width: 200px;
            height: 4px;
            background: rgba(255,255,255,0.1);
            border-radius: 2px;
            margin: 16px auto 0;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: #3b82f6;
            width: 0%;
            animation: progress 10s linear forwards;
        }
        @keyframes progress {
            to { width: 100%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h1>${title}</h1>
        <p>${message}</p>
        <button class="retry-btn" id="retryBtn" onclick="window.location.reload()">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Coba Lagi
        </button>
        <div class="countdown" id="countdown">Mencoba ulang dalam <span id="timer">10</span> detik...</div>
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
    </div>
    <script>
        let seconds = 10;
        const timer = document.getElementById('timer');
        const btn = document.getElementById('retryBtn');
        const interval = setInterval(() => {
            seconds--;
            timer.textContent = seconds;
            if (seconds <= 0) {
                clearInterval(interval);
                window.location.reload();
            }
        }, 1000);
    </script>
</body>
</html>`;
}

// Paths to exclude from traffic protection
const EXCLUDED_PATHS = [
    '/api/',
    '/_next/',
    '/favicon.ico',
    '/overload',
    '/robots.txt',
    '/sitemap.xml',
];

// Simple in-memory cache for traffic state (Edge has no persistent state)
let cachedState: { allowed: boolean; reason: string | null; timestamp: number } | null = null;
const CACHE_TTL = 1000; // 1 second

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Skip excluded paths
    if (EXCLUDED_PATHS.some(excluded => path.startsWith(excluded))) {
        return NextResponse.next();
    }

    // Skip static assets
    if (path.includes('.') && !path.endsWith('.html')) {
        return NextResponse.next();
    }

    try {
        // Check cache first
        const now = Date.now();
        if (cachedState && now - cachedState.timestamp < CACHE_TTL) {
            if (!cachedState.allowed && cachedState.reason) {
                return new NextResponse(
                    generateOverloadPage(cachedState.reason as keyof typeof MESSAGES),
                    {
                        status: cachedState.reason === 'max_concurrent' ? 429 : 503,
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8',
                            'Retry-After': '10',
                            'Cache-Control': 'no-store',
                        },
                    }
                );
            }
            return NextResponse.next();
        }

        // Check traffic state via API
        const baseUrl = request.nextUrl.origin;
        const response = await fetch(`${baseUrl}/api/traffic/state`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'check' }),
        });

        if (response.ok) {
            const data = await response.json();

            // Update cache
            cachedState = {
                allowed: data.allowed,
                reason: data.reason,
                timestamp: now,
            };

            if (!data.allowed && data.reason) {
                return new NextResponse(
                    generateOverloadPage(data.reason as keyof typeof MESSAGES),
                    {
                        status: data.reason === 'max_concurrent' ? 429 : 503,
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8',
                            'Retry-After': '10',
                            'Cache-Control': 'no-store',
                        },
                    }
                );
            }

            // Increment traffic counter (fire and forget)
            fetch(`${baseUrl}/api/traffic/state`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'increment' }),
            }).catch(() => { /* ignore errors */ });
        }

        // Allow request
        return NextResponse.next();
    } catch (error) {
        // On error, allow request (fail-open)
        console.error('Middleware error:', error);
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
