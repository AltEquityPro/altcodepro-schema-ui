'use client';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { cn, deepResolveBindings } from '../../lib/utils';
import { UIDefinition } from '../../types';
import { useAppState } from '../../schema/StateContext';

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
    const inputClass =
        'text-xs bg-transparent border border-[var(--acp-border)] rounded px-1 py-0.5 w-full focus:outline-none focus:border-[var(--acp-primary)]';

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

const BindingsViewer: React.FC<{
    state: Record<string, any>;
    screenDef: UIDefinition;
}> = ({ state, screenDef }) => {
    const { t } = useAppState();
    const [bindings, setBindings] = useState<
        { expr: string; resolved: any; error?: string }[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const extractBindingsFromScreen = useCallback((obj: any): Set<string> => {
        const bindings = new Set<string>();
        const regex = /{{(.*?)}}/g;
        const walk = (node: any) => {
            if (typeof node === 'string') {
                let match;
                while ((match = regex.exec(node))) bindings.add(match[1].trim());
            } else if (Array.isArray(node)) node.forEach(walk);
            else if (node && typeof node === 'object')
                Object.values(node).forEach(walk);
        };
        walk(obj);
        return bindings;
    }, []);

    const screenBindings = useMemo(
        () => extractBindingsFromScreen(screenDef),
        [screenDef, extractBindingsFromScreen]
    );

    const resolveAllBindings = useCallback(() => {
        setLoading(true);
        const results: { expr: string; resolved: any; error?: string }[] = [];
        Array.from(screenBindings).forEach((expr) => {
            try {
                const resolved = deepResolveBindings(`{{${expr}}}`, state, t);
                results.push({ expr, resolved });
            } catch (err) {
                results.push({ expr, resolved: null, error: String(err) });
            }
        });
        setBindings(results);
        setLoading(false);
    }, [screenBindings, state, t]);

    useEffect(() => {
        resolveAllBindings();
    }, []); // resolve once initially

    const filtered = useMemo(() => {
        if (!search) return bindings;
        const term = search.toLowerCase();
        return bindings.filter(
            ({ expr, resolved }) =>
                expr.toLowerCase().includes(term) ||
                JSON.stringify(resolved)?.toLowerCase().includes(term)
        );
    }, [bindings, search]);

    return (
        <div className="flex flex-col gap-2">
            {/* Search + Refresh */}
            <div className="flex justify-between items-center gap-2 mb-2">
                <input
                    type="text"
                    placeholder="🔍 Search bindings..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="text-[10px] px-2 py-0.5 border border-[var(--acp-border)] rounded bg-[var(--acp-muted)] flex-1"
                />
                <button
                    onClick={resolveAllBindings}
                    disabled={loading}
                    className="text-[10px] border px-2 py-0.5 rounded hover:bg-[var(--acp-primary)] hover:text-white transition"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-[var(--acp-secondary-700)] text-xs italic">
                    Resolving bindings...
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-gray-500 text-xs italic">
                    No bindings detected.
                </div>
            ) : (
                filtered.map(({ expr, resolved, error }, i) => (
                    <div
                        key={i}
                        className={cn(
                            'flex flex-col border-b border-[var(--acp-border)] py-1',
                            error ? 'text-red-500' : 'text-[var(--acp-primary-700)]'
                        )}
                    >
                        <div className="font-mono text-[var(--acp-secondary-700)] mb-1">{`{{${expr}}}`}</div>
                        <div
                            className={cn(
                                'text-[10px] break-all whitespace-pre-wrap text-[var(--acp-secondary-600)] bg-[var(--acp-muted)] rounded p-1',
                                error && 'text-red-500'
                            )}
                        >
                            {error
                                ? `⚠️ ${error}`
                                : typeof resolved === 'object'
                                    ? JSON.stringify(resolved, null, 2)
                                    : String(resolved ?? '')}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export const StateTreeViewer: React.FC<{
    state: Record<string, any>;
    setState: (path: string, value: any) => void;
    screenDef: UIDefinition;
}> = ({ state, setState, screenDef }) => {
    const [visible, setVisible] = useState(true);
    const [width, setWidth] = useState(360);
    const [resizing, setResizing] = useState(false);
    const [activeTab, setActiveTab] = useState<'state' | 'bindings'>('state');
    const [copySuccess, setCopySuccess] = useState('');
    const startX = useRef(0);
    const startW = useRef(width);

    /** Resize logic */
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

    /** Copy JSON */
    const handleCopy = async () => {
        try {
            const dataToCopy =
                activeTab === 'bindings'
                    ? 'Use Copy inside Bindings tab'
                    : state;
            const json = JSON.stringify(dataToCopy, null, 2);
            await navigator.clipboard.writeText(json);
            setCopySuccess('✅ Copied!');
            setTimeout(() => setCopySuccess(''), 1500);
        } catch {
            setCopySuccess('❌ Failed');
        }
    };

    return (
        <>
            {visible && <div className="hidden lg:block" style={{ width }} />}
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
                        🧠 Debug Panel
                    </span>
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={() => setActiveTab('state')}
                            className={cn(
                                'px-2 py-0.5 text-xs rounded',
                                activeTab === 'state'
                                    ? 'bg-[var(--acp-primary)] text-white'
                                    : 'bg-muted text-foreground'
                            )}
                        >
                            State
                        </button>
                        <button
                            onClick={() => setActiveTab('bindings')}
                            className={cn(
                                'px-2 py-0.5 text-xs rounded',
                                activeTab === 'bindings'
                                    ? 'bg-[var(--acp-primary)] text-white'
                                    : 'bg-muted text-foreground'
                            )}
                        >
                            Bindings
                        </button>
                        <button
                            onClick={handleCopy}
                            title="Copy JSON"
                            className="text-xs px-2 py-0.5 rounded border border-[var(--acp-border)] hover:bg-[var(--acp-primary)] hover:text-white transition"
                        >
                            📋 Copy
                        </button>
                        <span className="text-[10px] text-green-600">{copySuccess}</span>
                        <button
                            onClick={() => setVisible((v) => !v)}
                            className="text-[var(--acp-primary)] hover:text-[var(--acp-primary-600)] text-xs font-medium"
                        >
                            {visible ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-3 text-xs font-mono leading-tight">
                    {activeTab === 'bindings' ? (
                        <BindingsViewer state={state} screenDef={screenDef} />
                    ) : (
                        Object.entries(state).map(([k, v], index) => (
                            <StateNode
                                key={`${k}_${index}`}
                                name={k}
                                value={v}
                                path={k}
                                setState={setState}
                            />
                        ))
                    )}
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
