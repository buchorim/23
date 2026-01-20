'use client';

import { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, CheckCircle, Megaphone } from 'lucide-react';

interface Announcement {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    show_once: boolean;
}

export function AnnouncementPopup() {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        fetchAnnouncement();
    }, []);

    const fetchAnnouncement = async () => {
        try {
            const res = await fetch('/api/announcements');
            if (res.ok) {
                const data = await res.json();
                if (data.announcement) {
                    // Check if already dismissed
                    const dismissedId = localStorage.getItem('dismissed_announcement');
                    if (dismissedId === data.announcement.id && data.announcement.show_once) {
                        return;
                    }
                    setAnnouncement(data.announcement);
                    setTimeout(() => setIsVisible(true), 100);
                }
            }
        } catch (err) {
            console.error('Error fetching announcement:', err);
        }
    };

    const handleDismiss = () => {
        setIsClosing(true);
        if (announcement?.show_once) {
            localStorage.setItem('dismissed_announcement', announcement.id);
        }
        setTimeout(() => {
            setIsVisible(false);
            setAnnouncement(null);
        }, 300);
    };

    if (!announcement) return null;

    const iconMap = {
        info: <Info size={24} />,
        warning: <AlertTriangle size={24} />,
        success: <CheckCircle size={24} />,
    };

    const colorMap = {
        info: 'var(--accent-blue)',
        warning: '#f59e0b',
        success: '#10b981',
    };

    const bgColorMap = {
        info: 'rgba(59, 130, 246, 0.1)',
        warning: 'rgba(245, 158, 11, 0.1)',
        success: 'rgba(16, 185, 129, 0.1)',
    };

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                    opacity: isVisible && !isClosing ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: isVisible ? 'auto' : 'none',
                }}
                onClick={handleDismiss}
            />

            {/* Popup */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) scale(${isVisible && !isClosing ? 1 : 0.9})`,
                    background: 'var(--bg-primary)',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    zIndex: 10000,
                    width: '90%',
                    maxWidth: '440px',
                    opacity: isVisible && !isClosing ? 1 : 0,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                }}
            >
                {/* Header accent */}
                <div
                    style={{
                        height: '4px',
                        background: colorMap[announcement.type],
                    }}
                />

                <div style={{ padding: '24px' }}>
                    {/* Icon & Title */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px',
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: bgColorMap[announcement.type],
                            color: colorMap[announcement.type],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {iconMap[announcement.type]}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '0.75rem',
                                color: colorMap[announcement.type],
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}>
                                <Megaphone size={12} />
                                Pengumuman
                            </div>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                margin: 0,
                            }}>
                                {announcement.title}
                            </h3>
                        </div>
                        <button
                            onClick={handleDismiss}
                            style={{
                                background: 'var(--bg-secondary)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                transition: 'all 0.2s',
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Message */}
                    <p style={{
                        fontSize: '0.9375rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                    }}>
                        {announcement.message}
                    </p>

                    {/* Action button */}
                    <button
                        onClick={handleDismiss}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            marginTop: '20px',
                            padding: '12px',
                            background: colorMap[announcement.type],
                        }}
                    >
                        Mengerti
                    </button>
                </div>
            </div>
        </>
    );
}
