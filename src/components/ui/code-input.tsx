"use client";

import CodeMirror from "@uiw/react-codemirror";
import 'codemirror/keymap/sublime';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/theme/monokai.css';

interface CodeInputProps {
    value: string;
    onChange: (val: string) => void;
    language?: string;
    placeholder?: string;
    className?: string;
}

export function CodeInput({ value, onChange, placeholder, className }: CodeInputProps) {
    return (
        <div className={`border rounded-md overflow-hidden ${className || ""}`}>
            <CodeMirror
                value={value}
                height="300px"
                onChange={(val) => onChange(val)}
                basicSetup={{ autocompletion: true, lineNumbers: true, highlightActiveLine: true }}
            />
            {placeholder && !value && (
                <div className="absolute top-2 left-2 text-muted-foreground text-sm pointer-events-none">
                    {placeholder}
                </div>
            )}
        </div>
    );
}
