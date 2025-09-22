"use client";
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";
interface MarkdownInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
}

export function MarkdownInput({ value, onChange, placeholder, className }: MarkdownInputProps) {
    return (
        <div className="container">
            <MDEditor
                value={value}
                onChange={onChange as any}
                previewOptions={{
                    rehypePlugins: [[rehypeSanitize]],
                }}
            />
            <MDEditor.Markdown source={value} style={{ whiteSpace: 'pre-wrap' }} />
        </div>
    );
}
