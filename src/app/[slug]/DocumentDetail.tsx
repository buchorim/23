'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Trash2, Calendar, Tag } from 'lucide-react';
import { Header } from '@/components/Header';
import { TiptapEditor } from '@/components/Editor/TiptapEditor';
import { Modal, ConfirmModal } from '@/components/Modal';
import { ToastContainer } from '@/components/Toast';
import { ToastProvider, useToast } from '@/hooks/useToast';
import { useAdmin } from '@/hooks/useAdmin';
import { getAuthHeaders } from '@/lib/api';
import type { DocumentWithCategory, Category } from '@/types/database';

interface DocumentDetailProps {
    document: DocumentWithCategory;
}

function DocumentDetailContent({ document: initialDoc }: DocumentDetailProps) {
    const router = useRouter();
    const { isAdmin } = useAdmin();
    const { success, error } = useToast();

    const [document, setDocument] = useState(initialDoc);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editContent, setEditContent] = useState(document.content);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/documents', {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    id: document.id,
                    content: editContent,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setDocument(data.document);
                setIsEditing(false);
                success('Berhasil', 'Dokumen berhasil disimpan');
            } else {
                const data = await res.json();
                error('Gagal', data.error || 'Tidak dapat menyimpan');
            }
        } catch (err) {
            console.error('Error saving:', err);
            error('Gagal', 'Terjadi kesalahan saat menyimpan');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/documents?id=${document.id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (res.ok) {
                success('Berhasil', 'Dokumen dihapus');
                router.push('/');
            } else {
                const data = await res.json();
                error('Gagal', data.error || 'Tidak dapat menghapus');
            }
        } catch (err) {
            console.error('Error deleting:', err);
            error('Gagal', 'Terjadi kesalahan saat menghapus');
        }
    };

    const contentWidth = document.settings?.contentWidth || 'medium';
    const containerClass = contentWidth === 'narrow' ? 'container-narrow' :
        contentWidth === 'wide' ? 'container-wide' : 'container';

    return (
        <>
            <Header categories={[]} />

            <div className={`container ${containerClass}`} style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
                {/* Breadcrumb & Actions */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--spacing-lg)',
                    flexWrap: 'wrap',
                    gap: 'var(--spacing-md)',
                }}>
                    <Link href="/" className="btn btn-ghost">
                        <ArrowLeft size={18} />
                        Kembali
                    </Link>

                    {isAdmin && (
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            {isEditing ? (
                                <>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditContent(document.content);
                                        }}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Edit2 size={16} />
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => setShowDeleteModal(true)}
                                    >
                                        <Trash2 size={16} />
                                        Hapus
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Document Header */}
                {document.settings?.showTitle !== false && (
                    <h1 style={{ marginBottom: 'var(--spacing-md)' }}>{document.title}</h1>
                )}

                {/* Meta Info */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-xl)',
                    flexWrap: 'wrap',
                }}>
                    {document.settings?.showCategory !== false && document.categories && (
                        <span className="card-category">
                            {document.categories.icon} {document.categories.name}
                        </span>
                    )}

                    {document.settings?.showUpdated !== false && (
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-xs)',
                            color: 'var(--text-muted)',
                            fontSize: '0.875rem',
                        }}>
                            <Calendar size={14} />
                            Diperbarui {formatDate(document.updated_at)}
                        </span>
                    )}

                    {document.tags && document.tags.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                            <Tag size={14} color="var(--text-muted)" />
                            {document.tags.map((tag) => (
                                <span
                                    key={tag}
                                    style={{
                                        padding: '2px 8px',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        color: 'var(--text-secondary)',
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <TiptapEditor
                    content={isEditing ? editContent : document.content}
                    onChange={setEditContent}
                    editable={isEditing}
                />
            </div>

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Hapus Dokumen"
                message={`Yakin ingin menghapus "${document.title}"? Tindakan ini tidak dapat dibatalkan.`}
            />

            <ToastContainer />
        </>
    );
}

export function DocumentDetail({ document }: DocumentDetailProps) {
    return (
        <ToastProvider>
            <DocumentDetailContent document={document} />
        </ToastProvider>
    );
}
