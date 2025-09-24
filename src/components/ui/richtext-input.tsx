"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { cn } from "@/src/lib/utils"
import { EditorElement } from "@/src/types"

interface RichTextEditorProps {
    value: string
    onChange?: (val: string) => void
    placeholder?: string
    className?: string
    toolbar?: EditorElement["toolbar"]
}

export function RichTextEditor({
    value,
    onChange,
    placeholder,
    className,
    toolbar,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: placeholder || "Start typing…" }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML())
        },
    })

    if (!editor) return null

    return (
        <div className={cn("border rounded-md bg-background", className)}>
            {/* Toolbar */}
            {toolbar && (
                <div className="flex gap-2 border-b p-2">
                    {toolbar.bold && (
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={editor.isActive("bold") ? "font-bold" : ""}
                        >
                            B
                        </button>
                    )}
                    {toolbar.italic && (
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={editor.isActive("italic") ? "italic" : ""}
                        >
                            I
                        </button>
                    )}
                    {toolbar.bulletList && (
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                        >
                            • List
                        </button>
                    )}
                </div>
            )}

            {/* Content */}
            <EditorContent
                editor={editor}
                className="prose max-w-none dark:prose-invert p-2"
            />
        </div>
    )
}
