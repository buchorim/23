'use client';

import { useCallback, useState } from 'react';
import { Editor } from '@tiptap/react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    CheckSquare,
    Quote,
    Minus,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Image as ImageIcon,
    Video,
    Youtube,
    Link as LinkIcon,
    Unlink,
    Table,
    Undo,
    Redo,
    Highlighter,
    Superscript,
    Subscript,
    Maximize,
    Eye,
} from 'lucide-react';

interface ToolbarProps {
    editor: Editor;
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`toolbar-btn ${isActive ? 'active' : ''}`}
            title={title}
        >
            {children}
        </button>
    );
}

export function EditorToolbar({ editor }: ToolbarProps) {
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [showYoutubeInput, setShowYoutubeInput] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [showVideoUpload, setShowVideoUpload] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Upload file to server
    const uploadFile = useCallback(async (file: File, folder: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (res.ok) {
            const data = await res.json();
            return data.url;
        } else {
            const data = await res.json();
            throw new Error(data.error || 'Upload failed');
        }
    }, []);

    const handleImageUpload = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Hanya file gambar yang diperbolehkan');
            return;
        }
        setIsUploading(true);
        try {
            const url = await uploadFile(file, 'images');
            editor.chain().focus().setImage({ src: url }).run();
            setShowImageUpload(false);
        } catch (err) {
            alert((err as Error).message || 'Gagal upload gambar');
        } finally {
            setIsUploading(false);
        }
    }, [editor, uploadFile]);

    const handleVideoUpload = useCallback(async (file: File) => {
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!validTypes.includes(file.type)) {
            alert('Hanya video MP4, WebM, atau OGG yang diperbolehkan');
            return;
        }
        if (file.size > 100 * 1024 * 1024) {
            alert('Ukuran video maksimal 100MB');
            return;
        }
        setIsUploading(true);
        try {
            const url = await uploadFile(file, 'videos');
            // Insert video as HTML
            const videoHtml = `<div class="video-container" data-video-src="${url}"><video src="${url}" controls style="width:100%;border-radius:16px;"></video></div>`;
            editor.commands.insertContent(videoHtml);
            setShowVideoUpload(false);
        } catch (err) {
            alert((err as Error).message || 'Gagal upload video');
        } finally {
            setIsUploading(false);
        }
    }, [editor, uploadFile]);

    const addLink = useCallback(() => {
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl('');
            setShowLinkInput(false);
        }
    }, [editor, linkUrl]);

    const removeLink = useCallback(() => {
        editor.chain().focus().unsetLink().run();
    }, [editor]);

    const addYoutube = useCallback(() => {
        if (youtubeUrl) {
            editor.commands.setYoutubeVideo({ src: youtubeUrl });
            setYoutubeUrl('');
            setShowYoutubeInput(false);
        }
    }, [editor, youtubeUrl]);

    const addTable = useCallback(() => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }, [editor]);

    return (
        <div className="editor-toolbar">
            {/* Text Formatting */}
            <div className="toolbar-group">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Tebal (Ctrl+B)"
                >
                    <Bold size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Miring (Ctrl+I)"
                >
                    <Italic size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    title="Garis Bawah (Ctrl+U)"
                >
                    <Underline size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Coret"
                >
                    <Strikethrough size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    isActive={editor.isActive('highlight')}
                    title="Stabilo"
                >
                    <Highlighter size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive('code')}
                    title="Kode"
                >
                    <Code size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                    isActive={editor.isActive('superscript')}
                    title="Superscript"
                >
                    <Superscript size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                    isActive={editor.isActive('subscript')}
                    title="Subscript"
                >
                    <Subscript size={18} />
                </ToolbarButton>
            </div>

            {/* Headings */}
            <div className="toolbar-group">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 size={18} />
                </ToolbarButton>
            </div>

            {/* Lists */}
            <div className="toolbar-group">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Daftar Bullet"
                >
                    <List size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Daftar Nomor"
                >
                    <ListOrdered size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    isActive={editor.isActive('taskList')}
                    title="Daftar Tugas"
                >
                    <CheckSquare size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Kutipan"
                >
                    <Quote size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Garis Horizontal"
                >
                    <Minus size={18} />
                </ToolbarButton>
            </div>

            {/* Alignment */}
            <div className="toolbar-group">
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    title="Rata Kiri"
                >
                    <AlignLeft size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    title="Rata Tengah"
                >
                    <AlignCenter size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    title="Rata Kanan"
                >
                    <AlignRight size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    isActive={editor.isActive({ textAlign: 'justify' })}
                    title="Rata Kiri-Kanan"
                >
                    <AlignJustify size={18} />
                </ToolbarButton>
            </div>

            {/* Media */}
            <div className="toolbar-group">
                <ToolbarButton
                    onClick={() => setShowImageUpload(!showImageUpload)}
                    title="Sisipkan Gambar"
                    disabled={isUploading}
                >
                    <ImageIcon size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => setShowVideoUpload(!showVideoUpload)}
                    title="Upload Video"
                    disabled={isUploading}
                >
                    <Video size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => setShowYoutubeInput(!showYoutubeInput)}
                    title="Video YouTube"
                >
                    <Youtube size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    isActive={editor.isActive('link')}
                    title="Sisipkan Link"
                >
                    <LinkIcon size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={removeLink}
                    disabled={!editor.isActive('link')}
                    title="Hapus Link"
                >
                    <Unlink size={18} />
                </ToolbarButton>
                <ToolbarButton onClick={addTable} title="Sisipkan Tabel">
                    <Table size={18} />
                </ToolbarButton>
            </div>

            {/* History */}
            <div className="toolbar-group">
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo (Ctrl+Y)"
                >
                    <Redo size={18} />
                </ToolbarButton>
            </div>

            {/* View */}
            <div className="toolbar-group">
                <ToolbarButton onClick={() => { }} title="Preview">
                    <Eye size={18} />
                </ToolbarButton>
                <ToolbarButton onClick={() => { }} title="Layar Penuh">
                    <Maximize size={18} />
                </ToolbarButton>
            </div>

            {/* Image Upload Popover */}
            {showImageUpload && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: 'var(--spacing-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 10,
                    minWidth: '280px',
                }}>
                    <p style={{ fontWeight: 500, marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem' }}>
                        Upload Gambar
                    </p>
                    <div
                        style={{
                            border: '2px dashed var(--border-medium)',
                            borderRadius: 'var(--border-radius-md)',
                            padding: 'var(--spacing-lg)',
                            textAlign: 'center',
                            cursor: isUploading ? 'wait' : 'pointer',
                        }}
                        onClick={() => {
                            if (isUploading) return;
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleImageUpload(file);
                            };
                            input.click();
                        }}
                    >
                        {isUploading ? 'Mengupload...' : 'Klik untuk pilih gambar'}
                    </div>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowImageUpload(false)}
                        style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}
                    >
                        Batal
                    </button>
                </div>
            )}

            {/* Video Upload Popover */}
            {showVideoUpload && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: 'var(--spacing-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 10,
                    minWidth: '280px',
                }}>
                    <p style={{ fontWeight: 500, marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem' }}>
                        Upload Video
                    </p>
                    <div
                        style={{
                            border: '2px dashed var(--border-medium)',
                            borderRadius: 'var(--border-radius-md)',
                            padding: 'var(--spacing-lg)',
                            textAlign: 'center',
                            cursor: isUploading ? 'wait' : 'pointer',
                        }}
                        onClick={() => {
                            if (isUploading) return;
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'video/mp4,video/webm,video/ogg';
                            input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleVideoUpload(file);
                            };
                            input.click();
                        }}
                    >
                        {isUploading ? 'Mengupload...' : 'Klik untuk pilih video (max 100MB)'}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)', textAlign: 'center' }}>
                        MP4, WebM, OGG
                    </p>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowVideoUpload(false)}
                        style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}
                    >
                        Batal
                    </button>
                </div>
            )}

            {/* Link Input Popover */}
            {showLinkInput && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: 'var(--spacing-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 10,
                    display: 'flex',
                    gap: 'var(--spacing-sm)',
                }}>
                    <input
                        type="url"
                        placeholder="https://example.com"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="form-input"
                        style={{ width: '250px' }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={addLink}>
                        Tambah
                    </button>
                </div>
            )}

            {/* YouTube Input Popover */}
            {showYoutubeInput && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: 'var(--spacing-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 10,
                    display: 'flex',
                    gap: 'var(--spacing-sm)',
                }}>
                    <input
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="form-input"
                        style={{ width: '300px' }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={addYoutube}>
                        Tambah
                    </button>
                </div>
            )}
        </div>
    );
}
