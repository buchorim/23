'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Edit2, Trash2, FileText } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { IconByName } from './IconPicker';
import type { DocumentWithCategory } from '@/types/database';

interface DocumentCardProps {
    document: DocumentWithCategory;
    onEdit?: (doc: DocumentWithCategory) => void;
    onDelete?: (doc: DocumentWithCategory) => void;
}

export function DocumentCard({ document, onEdit, onDelete }: DocumentCardProps) {
    const { isAdmin } = useAdmin();

    return (
        <div className="card">
            <Link href={`/${document.slug}`}>
                {document.thumbnail_url ? (
                    <Image
                        src={document.thumbnail_url}
                        alt={document.title}
                        width={400}
                        height={250}
                        className="card-thumbnail"
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <div
                        className="card-thumbnail"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--bg-secondary)',
                        }}
                    >
                        <FileText size={48} color="var(--text-muted)" />
                    </div>
                )}
            </Link>

            <div className="card-body">
                <Link href={`/${document.slug}`}>
                    <h3 className="card-title">{document.title}</h3>
                </Link>

                {document.categories && (
                    <span className="card-category">
                        <IconByName name={document.categories.icon} size={14} />
                        {document.categories.name}
                    </span>
                )}

                {isAdmin && (
                    <div className="card-actions">
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onEdit?.(document)}
                        >
                            <Edit2 size={14} />
                            Edit
                        </button>
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onDelete?.(document)}
                        >
                            <Trash2 size={14} />
                            Hapus
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
