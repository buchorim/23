'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Youtube } from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { EditorToolbar } from './Toolbar';

interface TiptapEditorProps {
    content: Record<string, unknown>;
    onChange: (content: Record<string, unknown>) => void;
    editable?: boolean;
}

export function TiptapEditor({ content, onChange, editable = true }: TiptapEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'editor-image',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'editor-link',
                },
            }),
            Youtube.configure({
                width: 640,
                height: 360,
                HTMLAttributes: {
                    class: 'editor-youtube',
                },
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'editor-table',
                },
            }),
            TableRow,
            TableCell,
            TableHeader,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Underline,
            Highlight.configure({
                multicolor: true,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Placeholder.configure({
                placeholder: 'Mulai menulis konten dokumentasi...',
            }),
            Subscript,
            Superscript,
            TextStyle,
            Color,
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON());
        },
    });

    // Update editable state when prop changes
    useEffect(() => {
        if (editor) {
            editor.setEditable(editable);
        }
    }, [editor, editable]);

    if (!editor) {
        return (
            <div className="editor-content">
                <div className="skeleton" style={{ height: '400px' }} />
            </div>
        );
    }

    return (
        <div className="editor-wrapper">
            {editable && <EditorToolbar editor={editor} />}
            <div
                className="editor-content"
                onClick={() => editor.commands.focus()}
                style={{ cursor: editable ? 'text' : 'default' }}
            >
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
