"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

interface RichTextInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextInput({ value, onChange, placeholder, className }: RichTextInputProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: placeholder || "Start typing…" }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <div className={`border rounded-md p-2 bg-background ${className || ""}`}>
            <EditorContent editor={editor} className="prose max-w-none dark:prose-invert" />
        </div>
    );
}
