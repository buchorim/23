'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, Users, Clock, TrendingUp, Monitor, Smartphone, RefreshCw, Download, Archive, Calendar } from 'lucide-react';

interface Stats {
    totalViews: number;
    uniqueVisitors: number;
    avgDuration: number;
    growthPercent: number;
    mobileViews: number;
    desktopViews: number;
}

interface TopPage {
    path: string;
    count: number;
}

interface ChartDataPoint {
    date: string;
    views: number;
    visitors: number;
}

export function TrafficDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [topPages, setTopPages] = useState<TopPage[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState('7d');
    const [isExporting, setIsExporting] = useState(false);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/analytics/stats?period=${period}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
                setTopPages(data.topPages);
                setChartData(data.chartData);
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setIsLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
    };

    // Calculate max for chart scaling
    const maxViews = Math.max(...chartData.map(d => d.views), 1);

    // Export handlers
    const handleExport = async (type: 'current' | 'archive' | 'all') => {
        setIsExporting(true);
        try {
            const url = `/api/analytics/export?type=${type}&format=csv`;
            const link = document.createElement('a');
            link.href = url;
            link.download = `analytics_${type}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Export error:', err);
            alert('Gagal mengekspor data');
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Memuat statistik...
            </div>
        );
    }

    return (
        <div>
            {/* Controls */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
            }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['7d', '30d', 'all'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                background: period === p ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                                color: period === p ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                            }}
                        >
                            {p === '7d' ? '7 Hari' : p === '30d' ? '30 Hari' : 'Semua'}
                        </button>
                    ))}
                </div>
                <button
                    onClick={fetchStats}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                    }}
                >
                    <RefreshCw size={14} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '20px',
            }}>
                {/* Total Views */}
                <div style={{
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                    }}>
                        <Eye size={14} />
                        Page Views
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                    }}>
                        {stats?.totalViews.toLocaleString() || 0}
                    </div>
                </div>

                {/* Unique Visitors */}
                <div style={{
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                    }}>
                        <Users size={14} />
                        Pengunjung
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                    }}>
                        {stats?.uniqueVisitors.toLocaleString() || 0}
                    </div>
                </div>

                {/* Avg Duration */}
                <div style={{
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                    }}>
                        <Clock size={14} />
                        Rata-rata Stay
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                    }}>
                        {formatDuration(stats?.avgDuration || 0)}
                    </div>
                </div>

                {/* Growth */}
                <div style={{
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                    }}>
                        <TrendingUp size={14} />
                        Pertumbuhan
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: (stats?.growthPercent || 0) >= 0 ? '#10b981' : '#ef4444',
                    }}>
                        {(stats?.growthPercent || 0) >= 0 ? '+' : ''}{stats?.growthPercent || 0}%
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div style={{
                padding: '16px',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                marginBottom: '20px',
            }}>
                <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '16px',
                    color: 'var(--text-primary)',
                }}>
                    Trafik 7 Hari Terakhir
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '4px',
                    height: '120px',
                }}>
                    {chartData.map((d, i) => (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                            }}
                        >
                            <div style={{
                                fontSize: '0.625rem',
                                color: 'var(--text-muted)',
                            }}>
                                {d.views}
                            </div>
                            <div
                                style={{
                                    width: '100%',
                                    height: `${Math.max((d.views / maxViews) * 80, 4)}px`,
                                    background: 'linear-gradient(to top, var(--accent-blue), var(--accent-blue-light))',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.3s ease',
                                }}
                            />
                            <div style={{
                                fontSize: '0.625rem',
                                color: 'var(--text-muted)',
                            }}>
                                {formatDate(d.date)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Device Breakdown */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '20px',
            }}>
                <div style={{
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <Monitor size={16} color="var(--accent-blue)" />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        Desktop: {stats?.desktopViews || 0}
                    </span>
                </div>
                <div style={{
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <Smartphone size={16} color="var(--accent-blue)" />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        Mobile: {stats?.mobileViews || 0}
                    </span>
                </div>
            </div>

            {/* Top Pages */}
            {topPages.length > 0 && (
                <div style={{
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                }}>
                    <div style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '12px',
                        color: 'var(--text-primary)',
                    }}>
                        Halaman Populer
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {topPages.map((page, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 0',
                                    borderBottom: i < topPages.length - 1 ? '1px solid var(--border-light)' : 'none',
                                }}
                            >
                                <span style={{
                                    fontSize: '0.8125rem',
                                    color: 'var(--text-secondary)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '200px',
                                }}>
                                    {page.path === '/' ? 'Beranda' : page.path}
                                </span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: 'var(--accent-blue)',
                                }}>
                                    {page.count} views
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Export Section */}
            <div style={{
                padding: '16px',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                marginTop: '20px',
            }}>
                <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '12px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <Download size={16} />
                    Export Data
                </div>
                <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginBottom: '12px',
                }}>
                    Data aktif tersimpan sampai 10 tahun. Setelah itu menjadi arsip (hanya bisa didownload).
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => handleExport('current')}
                        disabled={isExporting}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'var(--accent-blue)',
                            color: 'white',
                            cursor: isExporting ? 'wait' : 'pointer',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                        }}
                    >
                        <Calendar size={14} />
                        Data Aktif (10 Tahun)
                    </button>
                    <button
                        onClick={() => handleExport('archive')}
                        disabled={isExporting}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)',
                            cursor: isExporting ? 'wait' : 'pointer',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                        }}
                    >
                        <Archive size={14} />
                        Data Arsip
                    </button>
                    <button
                        onClick={() => handleExport('all')}
                        disabled={isExporting}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-medium)',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            cursor: isExporting ? 'wait' : 'pointer',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                        }}
                    >
                        <Download size={14} />
                        Semua Data
                    </button>
                </div>
            </div>
        </div>
    );
}
