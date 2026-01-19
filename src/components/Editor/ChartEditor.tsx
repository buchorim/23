'use client';

import { useState } from 'react';
import { Plus, Trash2, BarChart3, LineChart, PieChart } from 'lucide-react';
import { Modal } from '../Modal';

export type ChartType = 'bar' | 'line' | 'pie';

interface ChartData {
    labels: string[];
    values: number[];
    title: string;
    type: ChartType;
}

interface ChartEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (chartData: ChartData) => void;
}

export function ChartEditor({ isOpen, onClose, onInsert }: ChartEditorProps) {
    const [chartType, setChartType] = useState<ChartType>('bar');
    const [title, setTitle] = useState('');
    const [labels, setLabels] = useState<string[]>(['Item 1', 'Item 2', 'Item 3']);
    const [values, setValues] = useState<number[]>([10, 20, 30]);

    const addRow = () => {
        setLabels([...labels, `Item ${labels.length + 1}`]);
        setValues([...values, 0]);
    };

    const removeRow = (index: number) => {
        if (labels.length > 1) {
            setLabels(labels.filter((_, i) => i !== index));
            setValues(values.filter((_, i) => i !== index));
        }
    };

    const updateLabel = (index: number, value: string) => {
        const newLabels = [...labels];
        newLabels[index] = value;
        setLabels(newLabels);
    };

    const updateValue = (index: number, value: number) => {
        const newValues = [...values];
        newValues[index] = value;
        setValues(newValues);
    };

    const handleInsert = () => {
        onInsert({
            type: chartType,
            title,
            labels,
            values,
        });
        // Reset
        setTitle('');
        setLabels(['Item 1', 'Item 2', 'Item 3']);
        setValues([10, 20, 30]);
        onClose();
    };

    const maxValue = Math.max(...values);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Sisipkan Grafik"
            size="lg"
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
            {/* Chart Type Selection */}
            <div className="form-group">
                <label className="form-label">Jenis Grafik</label>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button
                        className={`btn ${chartType === 'bar' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setChartType('bar')}
                    >
                        <BarChart3 size={16} />
                        Bar
                    </button>
                    <button
                        className={`btn ${chartType === 'line' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setChartType('line')}
                    >
                        <LineChart size={16} />
                        Line
                    </button>
                    <button
                        className={`btn ${chartType === 'pie' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setChartType('pie')}
                    >
                        <PieChart size={16} />
                        Pie
                    </button>
                </div>
            </div>

            {/* Chart Title */}
            <div className="form-group">
                <label className="form-label">Judul Grafik</label>
                <input
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Penjualan Bulanan"
                />
            </div>

            {/* Data Editor */}
            <div className="form-group">
                <label className="form-label">Data</label>
                <div style={{
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--border-radius-md)',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 100px 40px',
                        gap: '1px',
                        background: 'var(--border-light)',
                    }}>
                        <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>
                            Label
                        </div>
                        <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>
                            Nilai
                        </div>
                        <div style={{ background: 'var(--bg-secondary)' }} />

                        {labels.map((label, index) => (
                            <>
                                <input
                                    key={`label-${index}`}
                                    type="text"
                                    value={label}
                                    onChange={(e) => updateLabel(index, e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        border: 'none',
                                        background: 'var(--bg-primary)',
                                        fontSize: '0.875rem',
                                    }}
                                />
                                <input
                                    key={`value-${index}`}
                                    type="number"
                                    value={values[index]}
                                    onChange={(e) => updateValue(index, parseInt(e.target.value) || 0)}
                                    style={{
                                        padding: '8px 12px',
                                        border: 'none',
                                        background: 'var(--bg-primary)',
                                        fontSize: '0.875rem',
                                    }}
                                />
                                <button
                                    key={`delete-${index}`}
                                    onClick={() => removeRow(index)}
                                    disabled={labels.length <= 1}
                                    style={{
                                        padding: '8px',
                                        border: 'none',
                                        background: 'var(--bg-primary)',
                                        color: labels.length <= 1 ? 'var(--text-muted)' : 'var(--error)',
                                        cursor: labels.length <= 1 ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        ))}
                    </div>
                </div>
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={addRow}
                    style={{ marginTop: 'var(--spacing-sm)' }}
                >
                    <Plus size={14} />
                    Tambah Baris
                </button>
            </div>

            {/* Preview */}
            <div className="form-group">
                <label className="form-label">Preview</label>
                <div style={{
                    padding: 'var(--spacing-md)',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--border-radius-md)',
                }}>
                    {title && (
                        <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>
                            {title}
                        </div>
                    )}

                    {chartType === 'bar' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {labels.map((label, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '80px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {label}
                                    </span>
                                    <div style={{ flex: 1, height: '20px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                width: `${(values[index] / maxValue) * 100}%`,
                                                height: '100%',
                                                background: 'var(--accent-blue)',
                                                borderRadius: '4px',
                                            }}
                                        />
                                    </div>
                                    <span style={{ width: '40px', fontSize: '0.75rem', textAlign: 'right' }}>
                                        {values[index]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {chartType === 'pie' && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            [Pie chart preview]
                        </div>
                    )}

                    {chartType === 'line' && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            [Line chart preview]
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
