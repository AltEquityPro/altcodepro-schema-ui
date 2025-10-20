'use client';
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface StateTreeViewerProps {
    state: Record<string, any>;
    setState: (path: string, value: any) => void;
}

const StateNode: React.FC<{
    name: string;
    value: any;
    path: string;
    setState: (path: string, value: any) => void;
    depth?: number;
}> = ({ name, value, path, setState, depth = 0 }) => {
    const [expanded, setExpanded] = useState(depth < 1);
    const isObject = typeof value === 'object' && value !== null;
    const indent = 'ml-' + Math.min(depth * 3, 12);

    const handleChange = (newVal: any) => setState(path, newVal);

    const renderValue = () => {
        if (isObject) {
            const entries = Object.entries(value);
            return (
                <div className="ml-4 border-l border-[var(--acp-border)] pl-2">
                    {entries.map(([k, v]) => (
                        <StateNode
                            key={k}
                            name={k}
                            value={v}
                            path={`${path}.${k}`}
                            setState={setState}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            );
        }
        const inputClass =
            'text-xs bg-transparent border border-[var(--acp-border)] rounded px-1 py-0.5 w-full focus:outline-none focus:border-[var(--acp-primary)]';
        if (typeof value === 'boolean')
            return (
                <input
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => handleChange(e.target.checked)}
                />
            );
        if (typeof value === 'number')
            return (
                <input
                    type="number"
                    value={value}
                    className={inputClass}
                    onChange={(e) => handleChange(Number(e.target.value))}
                />
            );
        return (
            <input
                type="text"
                value={String(value ?? '')}
                className={inputClass}
                onChange={(e) => handleChange(e.target.value)}
            />
        );
    };

    return (
        <div className="text-xs text-[var(--acp-foreground)] mb-1">
            <div className={cn('flex items-center justify-between', indent)}>
                <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => isObject && setExpanded((e) => !e)}
                >
                    {isObject && (
                        <span className="text-[var(--acp-primary)]">
                            {expanded ? '▼' : '▶'}
                        </span>
                    )}
                    <span className="font-medium text-[var(--acp-secondary-700)]">
                        {name}
                    </span>
                </div>
                {!isObject && <div className="flex-1 ml-2">{renderValue()}</div>}
            </div>
            {isObject && expanded && renderValue()}
        </div>
    );
};

export const StateTreeViewer: React.FC<StateTreeViewerProps> = ({
    state,
    setState,
}) => {
    const [visible, setVisible] = useState(true);
    const [width, setWidth] = useState(340);
    const [resizing, setResizing] = useState(false);
    const startX = useRef(0);
    const startW = useRef(width);

    // Resize handlers
    const onMouseDown = (e: React.MouseEvent) => {
        setResizing(true);
        startX.current = e.clientX;
        startW.current = width;
    };
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!resizing) return;
            const delta = startX.current - e.clientX;
            setWidth(Math.min(600, Math.max(250, startW.current + delta)));
        };
        const onUp = () => setResizing(false);
        if (resizing) {
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [resizing]);

    return (
        <>
            {/* Spacer — prevent overlap with content */}
            {visible && (
                <div
                    className="hidden lg:block"
                    style={{ width, flexShrink: 0, flexGrow: 0 }}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    'fixed top-0 right-0 z-40 h-screen flex flex-col border-l border-[var(--acp-border)] bg-[var(--acp-background)] shadow-xl transition-transform duration-300',
                    visible ? 'translate-x-0' : 'translate-x-full'
                )}
                style={{ width }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-[var(--acp-border)] bg-[var(--acp-background)]">
                    <span className="text-xs font-semibold text-[var(--acp-primary)]">
                        🧠 State Inspector
                    </span>
                    <button
                        onClick={() => setVisible((v) => !v)}
                        className="text-[var(--acp-primary)] hover:text-[var(--acp-primary-600)] text-xs font-medium"
                    >
                        {visible ? 'Hide' : 'Show'}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 bg-[var(--acp-background)]  overflow-auto p-3 text-xs font-mono leading-tight">
                    {Object.entries(state).map(([k, v]) => (
                        <StateNode key={k} name={k} value={v} path={k} setState={setState} />
                    ))}
                </div>

                {/* Resize handle */}
                <div
                    onMouseDown={onMouseDown}
                    className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-[var(--acp-primary)]/30"
                />
            </div>
        </>
    );
};
