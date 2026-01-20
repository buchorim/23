'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity, Users, TrendingUp, Gauge, RefreshCw, Settings, AlertTriangle, CheckCircle, Ban, Trash2, Plus } from 'lucide-react';
import { getAuthHeaders } from '@/lib/api';

interface TrafficState {
    baseline_traffic: number;
    current_traffic: number;
    spike_ratio: number;
    concurrent_users: number;
    is_overloaded: boolean;
    recovery_progress: number;
}

interface TrafficConfig {
    spike_trigger_percentage: number;
    hard_overload_percentage: number;
    max_concurrent_users: number;
    recovery_rate: number;
    baseline_alpha: number;
    window_seconds: number;
}

interface BlockedIP {
    id: string;
    ip_address: string;
    reason: string;
    blocked_at: string;
    expires_at: string | null;
    is_permanent: boolean;
}

export function TrafficProtectionDashboard() {
    const [state, setState] = useState<TrafficState | null>(null);
    const [config, setConfig] = useState<TrafficConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showConfig, setShowConfig] = useState(false);
    const [editConfig, setEditConfig] = useState<Partial<TrafficConfig>>({});
    const [isSaving, setIsSaving] = useState(false);

    // IP Blocking state
    const [blockedIps, setBlockedIps] = useState<BlockedIP[]>([]);
    const [showIpManager, setShowIpManager] = useState(false);
    const [newIpToBlock, setNewIpToBlock] = useState('');
    const [blockReason, setBlockReason] = useState('');
    const [isBlockingIp, setIsBlockingIp] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [stateRes, configRes] = await Promise.all([
                fetch('/api/traffic/state'),
                fetch('/api/traffic/config'),
            ]);

            if (stateRes.ok) {
                const stateData = await stateRes.json();
                setState(stateData);
            }

            if (configRes.ok) {
                const configData = await configRes.json();
                setConfig(configData.config);
                // Only set editConfig on initial load to preserve user edits
                setEditConfig(prev =>
                    Object.keys(prev).length === 0 ? configData.config : prev
                );
            }
        } catch (err) {
            console.error('Error fetching traffic data:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchBlockedIps = useCallback(async () => {
        try {
            const res = await fetch('/api/traffic/blocked-ips');
            if (res.ok) {
                const data = await res.json();
                setBlockedIps(data.blockedIps || []);
            }
        } catch (err) {
            console.error('Error fetching blocked IPs:', err);
        }
    }, []);

    useEffect(() => {
        fetchData();
        fetchBlockedIps();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData, fetchBlockedIps]);

    const handleBlockIp = async () => {
        if (!newIpToBlock.trim()) return;
        setIsBlockingIp(true);
        try {
            const res = await fetch('/api/traffic/blocked-ips', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    ip_address: newIpToBlock.trim(),
                    reason: blockReason || 'Manually blocked',
                    is_permanent: false,
                    expires_hours: 24,
                }),
            });
            if (res.ok) {
                setNewIpToBlock('');
                setBlockReason('');
                fetchBlockedIps();
            }
        } catch (err) {
            console.error('Error blocking IP:', err);
        } finally {
            setIsBlockingIp(false);
        }
    };

    const handleUnblockIp = async (id: string) => {
        try {
            const res = await fetch(`/api/traffic/blocked-ips?id=${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                fetchBlockedIps();
            }
        } catch (err) {
            console.error('Error unblocking IP:', err);
        }
    };

    const handleSaveConfig = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/traffic/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config: editConfig }),
            });
            if (res.ok) {
                setConfig(editConfig as TrafficConfig);
                alert('Konfigurasi berhasil disimpan!');
            }
        } catch (err) {
            console.error('Error saving config:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Memuat status traffic...
            </div>
        );
    }

    const spikeRatio = state?.spike_ratio || 0;
    const isOverloaded = state?.is_overloaded || false;
    const statusColor = isOverloaded ? '#ef4444' : spikeRatio > (config?.spike_trigger_percentage || 120) ? '#f59e0b' : '#10b981';

    return (
        <div>
            {/* Status Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <div style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: statusColor,
                        animation: isOverloaded ? 'pulse 1s infinite' : 'none',
                    }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {isOverloaded ? 'Overloaded' : spikeRatio > (config?.spike_trigger_percentage || 120) ? 'Spike Detected' : 'Normal'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={fetchData}
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
                    </button>
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: showConfig ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                            color: showConfig ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.8125rem',
                        }}
                    >
                        <Settings size={14} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '20px',
            }}>
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
                        <Activity size={14} />
                        Spike Ratio
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: statusColor,
                    }}>
                        {spikeRatio.toFixed(1)}%
                    </div>
                </div>

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
                        Concurrent Users
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                    }}>
                        {(state?.concurrent_users || 0).toLocaleString()}
                    </div>
                </div>

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
                        Traffic (req/s)
                    </div>
                    <div style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                    }}>
                        <span>{(state?.current_traffic || 0).toFixed(2)}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}> / {(state?.baseline_traffic || 0).toFixed(2)}</span>
                    </div>
                </div>

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
                        <Gauge size={14} />
                        Recovery Progress
                    </div>
                    <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginTop: '8px',
                    }}>
                        <div style={{
                            width: `${(state?.recovery_progress || 0) * 100}%`,
                            height: '100%',
                            background: statusColor,
                            transition: 'width 0.3s ease',
                        }} />
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            <div style={{
                padding: '12px 16px',
                background: isOverloaded ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
            }}>
                {isOverloaded ? (
                    <>
                        <AlertTriangle size={16} color="#ef4444" />
                        <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                            Traffic protection aktif. Beberapa request sedang ditolak.
                        </span>
                    </>
                ) : (
                    <>
                        <CheckCircle size={16} color="#10b981" />
                        <span style={{ color: '#10b981', fontSize: '0.875rem' }}>
                            Semua request diizinkan.
                        </span>
                    </>
                )}
            </div>

            {/* Config Panel */}
            {showConfig && config && (
                <div style={{
                    padding: '16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                }}>
                    <div style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '16px',
                        color: 'var(--text-primary)',
                    }}>
                        Konfigurasi Protection
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { key: 'spike_trigger_percentage', label: 'Spike Trigger (%)', suffix: '%' },
                            { key: 'hard_overload_percentage', label: 'Hard Overload (%)', suffix: '%' },
                            { key: 'max_concurrent_users', label: 'Max Concurrent Users', suffix: '' },
                            { key: 'recovery_rate', label: 'Recovery Rate', suffix: '' },
                        ].map(({ key, label, suffix }) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <label style={{
                                    flex: 1,
                                    fontSize: '0.8125rem',
                                    color: 'var(--text-secondary)',
                                }}>
                                    {label}
                                </label>
                                <input
                                    type="number"
                                    value={editConfig[key as keyof TrafficConfig] || 0}
                                    onChange={(e) => setEditConfig({
                                        ...editConfig,
                                        [key]: parseFloat(e.target.value),
                                    })}
                                    style={{
                                        width: '100px',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-medium)',
                                        background: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.875rem',
                                    }}
                                />
                                {suffix && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{suffix}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleSaveConfig}
                        disabled={isSaving}
                        style={{
                            width: '100%',
                            marginTop: '16px',
                            padding: '10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'var(--accent-blue)',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: isSaving ? 'wait' : 'pointer',
                        }}
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                    </button>
                </div>
            )}

            {/* IP Manager Panel */}
            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={() => setShowIpManager(!showIpManager)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-medium)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                    }}
                >
                    <Ban size={16} />
                    IP Blocking ({blockedIps.length})
                </button>

                {showIpManager && (
                    <div style={{
                        marginTop: '12px',
                        padding: '16px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '12px',
                    }}>
                        {/* Add IP Form */}
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '8px' }}>
                                Block IP Address
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <input
                                    type="text"
                                    placeholder="192.168.1.100"
                                    value={newIpToBlock}
                                    onChange={(e) => setNewIpToBlock(e.target.value)}
                                    style={{
                                        flex: 1,
                                        minWidth: '120px',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-medium)',
                                        background: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.875rem',
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Alasan (opsional)"
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    style={{
                                        flex: 1,
                                        minWidth: '120px',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-medium)',
                                        background: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.875rem',
                                    }}
                                />
                                <button
                                    onClick={handleBlockIp}
                                    disabled={isBlockingIp || !newIpToBlock.trim()}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: '#ef4444',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        cursor: isBlockingIp ? 'wait' : 'pointer',
                                    }}
                                >
                                    <Plus size={14} />
                                    Block
                                </button>
                            </div>
                        </div>

                        {/* Blocked IPs List */}
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '8px' }}>
                            Blocked IPs
                        </div>
                        {blockedIps.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                                Tidak ada IP yang diblokir
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                {blockedIps.map((ip) => (
                                    <div
                                        key={ip.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 12px',
                                            background: 'var(--bg-primary)',
                                            borderRadius: '6px',
                                            border: '1px solid var(--border-light)',
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                                {ip.ip_address}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {ip.reason}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleUnblockIp(ip.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: '1px solid var(--border-medium)',
                                                background: 'transparent',
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Trash2 size={12} />
                                            Unblock
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
