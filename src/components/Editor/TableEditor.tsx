'use client';

import { useState } from 'react';
import { Plus, Minus, Trash2, Grid3X3 } from 'lucide-react';
import { Modal } from '../Modal';

interface TableEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (rows: number, cols: number, withHeader: boolean) => void;
}

export function TableEditor({ isOpen, onClose, onInsert }: TableEditorProps) {
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);
    const [withHeader, setWithHeader] = useState(true);

    const handleInsert = () => {
        onInsert(rows, cols, withHeader);
        setRows(3);
        setCols(3);
        setWithHeader(true);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Sisipkan Tabel"
            size="sm"
            footer={
                <>
                    <button className="btn btn-secondary" onClick={onClose}>
                        Batal
                    </button>
                    <button className="btn btn-primary" onClick={handleInsert}>
                        Sisipkan
                    </button>
                </>
            }
        >
            {/* Size selector */}
            <div style={{ display: 'flex', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Baris</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <button
                            className="btn btn-secondary btn-icon btn-sm"
                            onClick={() => setRows(Math.max(1, rows - 1))}
                            disabled={rows <= 1}
                        >
                            <Minus size={14} />
                        </button>
                        <input
                            type="number"
                            className="form-input"
                            value={rows}
                            onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                            min={1}
                            max={20}
                            style={{ width: '60px', textAlign: 'center' }}
                        />
                        <button
                            className="btn btn-secondary btn-icon btn-sm"
                            onClick={() => setRows(Math.min(20, rows + 1))}
                            disabled={rows >= 20}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>

                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label className="form-label">Kolom</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <button
                            className="btn btn-secondary btn-icon btn-sm"
                            onClick={() => setCols(Math.max(1, cols - 1))}
                            disabled={cols <= 1}
                        >
                            <Minus size={14} />
                        </button>
                        <input
                            type="number"
                            className="form-input"
                            value={cols}
                            onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                            min={1}
                            max={10}
                            style={{ width: '60px', textAlign: 'center' }}
                        />
                        <button
                            className="btn btn-secondary btn-icon btn-sm"
                            onClick={() => setCols(Math.min(10, cols + 1))}
                            disabled={cols >= 10}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Header toggle */}
            <label className="form-checkbox" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <input
                    type="checkbox"
                    checked={withHeader}
                    onChange={(e) => setWithHeader(e.target.checked)}
                />
                <span>Sertakan baris header</span>
            </label>

            {/* Preview */}
            <div className="form-group">
                <label className="form-label">Preview</label>
                <div style={{
                    padding: 'var(--spacing-md)',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--border-radius-md)',
                    overflow: 'auto',
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.75rem',
                    }}>
                        <tbody>
                            {Array.from({ length: Math.min(rows, 5) }).map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    {Array.from({ length: Math.min(cols, 5) }).map((_, colIndex) => (
                                        <td
                                            key={colIndex}
                                            style={{
                                                border: '1px solid var(--border-light)',
                                                padding: '6px 10px',
                                                background: withHeader && rowIndex === 0 ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                                                fontWeight: withHeader && rowIndex === 0 ? 600 : 400,
                                            }}
                                        >
                                            {withHeader && rowIndex === 0 ? `Header ${colIndex + 1}` : `Cell`}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(rows > 5 || cols > 5) && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-sm)', textAlign: 'center' }}>
                            ...dan {rows > 5 ? `${rows - 5} baris lagi` : ''} {cols > 5 ? `${cols - 5} kolom lagi` : ''}
                        </p>
                    )}
                </div>
            </div>
        </Modal>
    );
}

// Toolbar buttons for table manipulation
interface TableToolbarProps {
    onAddRowAbove: () => void;
    onAddRowBelow: () => void;
    onAddColumnLeft: () => void;
    onAddColumnRight: () => void;
    onDeleteRow: () => void;
    onDeleteColumn: () => void;
    onDeleteTable: () => void;
    onMergeCells: () => void;
}

export function TableToolbar({
    onAddRowAbove,
    onAddRowBelow,
    onAddColumnLeft,
    onAddColumnRight,
    onDeleteRow,
    onDeleteColumn,
    onDeleteTable,
    onMergeCells,
}: TableToolbarProps) {
    return (
        <div style={{
            display: 'flex',
            gap: '2px',
            padding: 'var(--spacing-sm)',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--border-radius-md)',
            marginBottom: 'var(--spacing-sm)',
        }}>
            <button className="toolbar-btn" onClick={onAddRowAbove} title="Tambah baris di atas">
                <Plus size={14} /> ↑
            </button>
            <button className="toolbar-btn" onClick={onAddRowBelow} title="Tambah baris di bawah">
                <Plus size={14} /> ↓
            </button>
            <button className="toolbar-btn" onClick={onAddColumnLeft} title="Tambah kolom di kiri">
                <Plus size={14} /> ←
            </button>
            <button className="toolbar-btn" onClick={onAddColumnRight} title="Tambah kolom di kanan">
                <Plus size={14} /> →
            </button>
            <div style={{ width: '1px', background: 'var(--border-light)', margin: '0 4px' }} />
            <button className="toolbar-btn" onClick={onDeleteRow} title="Hapus baris">
                <Minus size={14} /> baris
            </button>
            <button className="toolbar-btn" onClick={onDeleteColumn} title="Hapus kolom">
                <Minus size={14} /> kolom
            </button>
            <button className="toolbar-btn" onClick={onMergeCells} title="Gabung sel">
                <Grid3X3 size={14} />
            </button>
            <div style={{ width: '1px', background: 'var(--border-light)', margin: '0 4px' }} />
            <button className="toolbar-btn" onClick={onDeleteTable} title="Hapus tabel" style={{ color: 'var(--error)' }}>
                <Trash2 size={14} />
            </button>
        </div>
    );
}
