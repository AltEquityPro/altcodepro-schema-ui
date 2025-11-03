"use client";

import { memo, useEffect, useMemo, useState } from "react";
import {
    ChevronDown,
    ChevronRight,
    CheckSquare,
    Square,
    MinusSquare,
} from "lucide-react";
import { cn, detectFileIcon, resolveBinding, resolveDataSourceValue } from "../../lib/utils";
import type { AnyObj, EventHandler, TreeElement, TreeNodeElement } from "../../types";
import { DynamicIcon } from "./dynamic-icon";

type TreeNodeResolved = Omit<
    TreeNodeElement,
    "label" | "description" | "badge" | "children"
> & {
    label: string;
    description?: string;
    badge?: string | number;
    children?: TreeNodeResolved[];
};

type TriState = "checked" | "unchecked" | "indeterminate";

/** Unified tree data mapper that also resolves bindings */
function mapTreeNode(
    data: AnyObj,
    map?: TreeElement["mapping"],
    hasExpandHandler = false,
    state?: AnyObj,
    t?: (k: string) => string
): TreeNodeResolved {
    if (!map) map = {};

    const get = (path?: string) => {
        if (!path) return undefined;
        const val = path.split(".").reduce((acc, key) => acc?.[key], data);
        return typeof val === "string" && state && t ? resolveBinding(val, state, t) : val;
    };

    const childrenData =
        Array.isArray(get(map.children)) && get(map.children)?.length
            ? get(map.children)
            : Array.isArray(data.children)
                ? data.children
                : [];
    const fileName = get(map.label) || data.name || data.filename || data.file || "";
    const icon = detectFileIcon(fileName, hasExpandHandler, !!childrenData?.length);

    return {
        ...data,
        id: get(map.id) ?? data.id ?? crypto.randomUUID(),
        label: String(get(map.label) ?? data.name ?? ""),
        description: get(map.description),
        badge: get(map.badge),
        icon,
        lazy: hasExpandHandler,
        children: Array.isArray(childrenData)
            ? childrenData.map((c: AnyObj) =>
                mapTreeNode(c, map, hasExpandHandler, state, t)
            )
            : [],
    } as TreeNodeResolved;
}

/** Returns initially expanded node IDs */
function collectInitiallyExpanded(
    nodes: TreeNodeElement[] | undefined,
    acc: Set<string> = new Set()
): Set<string> {
    if (!nodes) return acc;
    for (const n of nodes) {
        if (n.expanded) acc.add(n.id);
        if (n.children?.length) collectInitiallyExpanded(n.children, acc);
    }
    return acc;
}

/** Compute tri-state selection */
function computeTriState(
    node: TreeNodeResolved,
    selected: Set<string>,
    checkStrictly: boolean
): TriState {
    if (checkStrictly || !node.children?.length) {
        return selected.has(node.id) ? "checked" : "unchecked";
    }
    let checkedCount = 0;
    let indeterminate = false;
    for (const c of node.children || []) {
        const st = computeTriState(c, selected, checkStrictly);
        if (st === "checked") checkedCount++;
        else if (st === "indeterminate") indeterminate = true;
    }
    if (indeterminate) return "indeterminate";
    if (checkedCount === 0) return selected.has(node.id) ? "checked" : "unchecked";
    if (checkedCount === (node.children?.length || 0)) return "checked";
    return "indeterminate";
}

/** Filter tree nodes by query */
function filterTree(nodes: TreeNodeResolved[], query: string): TreeNodeResolved[] {
    if (!query.trim()) return nodes;
    const q = query.trim().toLowerCase();

    const matchNode = (n: TreeNodeResolved): TreeNodeResolved | null => {
        const selfMatch =
            n.label.toLowerCase().includes(q) ||
            (n.description?.toLowerCase().includes(q) ?? false) ||
            (String(n.badge ?? "").toLowerCase().includes(q) && !!n.badge);
        const kids: TreeNodeResolved[] = [];
        n.children?.forEach((c) => {
            const m = matchNode(c);
            if (m) kids.push(m);
        });
        if (selfMatch || kids.length) {
            return { ...n, children: kids };
        }
        return null;
    };

    const out: TreeNodeResolved[] = [];
    nodes.forEach((n) => {
        const m = matchNode(n);
        if (m) out.push(m);
    });
    return out;
}

/** Safe path getter */
function getByPath(obj: AnyObj, path?: string): any {
    if (!path) return undefined;
    return path
        .replace(/\[|\]/g, ".")
        .split(".")
        .filter(Boolean)
        .reduce((acc, key) => acc?.[key], obj);
}

interface TreeRendererProps {
    element: TreeElement;
    state: AnyObj;
    t: (key: string) => string;
    runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>;
}

export function TreeRenderer({ element, runEventHandler, state, t }: TreeRendererProps) {
    const persistKey = `tree_${element.id || element.dataSourceId}_${window.location.pathname}`;
    const selectable = element.selectable ?? false;
    const multiple = element.multiple ?? false;
    const checkStrictly = element.checkStrictly ?? false;
    const disableToggleOnLabel = element.disableToggleOnLabel ?? false;
    const searchable = element.searchable ?? false;
    const showBadges = element.showBadges ?? true;
    const showDescriptions = element.showDescriptions ?? true;
    const draggable = element.draggable ?? false;

    const emptyLabel = String(resolveBinding(element.emptyLabel ?? "No items", state, t));
    const loadingLabel = String(resolveBinding(element.loadingLabel ?? "Loading…", state, t));
    const searchPlaceholder = String(resolveBinding(element.searchPlaceholder ?? "Search…", state, t));

    const rawData = useMemo<AnyObj[]>(
        () =>
            element.dataSourceId
                ? resolveDataSourceValue(element.dataSourceId, state) || []
                : element.nodes || [],
        [element.dataSourceId, element.nodes, state]
    );

    const resolvedNodes = useMemo<TreeNodeResolved[]>(
        () =>
            Array.isArray(rawData)
                ? rawData.map((item) =>
                    mapTreeNode(item, element.mapping, !!element.onNodeExpand, state, t)
                )
                : [],
        [rawData, element.mapping, element.onNodeExpand, state, t]
    );

    const [expanded, setExpanded] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem(persistKey);
            return saved ? new Set(JSON.parse(saved)) : collectInitiallyExpanded(resolvedNodes);
        } catch {
            return collectInitiallyExpanded(resolvedNodes);
        }
    });
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
    const [query, setQuery] = useState("");
    useEffect(() => {
        try {
            localStorage.setItem(persistKey, JSON.stringify(Array.from(expanded)));
        } catch {
            // ignore storage write errors
        }
    }, [expanded, persistKey]);

    useEffect(() => {
        const saved = localStorage.getItem(persistKey);
        if (saved) {
            const ids: any = new Set(JSON.parse(saved));
            setExpanded(ids);
        }
    }, [resolvedNodes, persistKey]);


    const viewNodes = useMemo(
        () => (searchable && query ? filterTree(resolvedNodes, query) : resolvedNodes),
        [resolvedNodes, searchable, query]
    );

    const toggleExpand = useMemo(() => {
        return async (node: TreeNodeResolved) => {
            const next = new Set(expanded);
            const willExpand = !next.has(node.id);
            willExpand ? next.add(node.id) : next.delete(node.id);
            setExpanded(next);

            if (willExpand) {
                setLoadingIds((s) => new Set([...s, node.id]));
                await runEventHandler?.(element.onNodeExpand, { id: node.id, expanded: true, node });

                const expandHandler = element.onNodeExpand;
                if (expandHandler?.params?.statePath) {
                    const childData = getByPath(
                        state,
                        expandHandler.params.statePath.replace("{{event.id}}", node.id)
                    );
                    if (Array.isArray(childData)) {
                        node.children = childData.map((c: AnyObj) =>
                            mapTreeNode(c, element.mapping, !!element.onNodeExpand, state, t)
                        );
                    }
                }

                setLoadingIds((s) => {
                    const n = new Set(s);
                    n.delete(node.id);
                    return n;
                });
            }
        };
        // ✅ dependencies: only update when truly necessary
    }, [expanded, runEventHandler, element.onNodeExpand, element.mapping, state, t]);

    const toggleSelect = useMemo(() => {
        return async (node: TreeNodeResolved) => {
            if (!selectable) return;
            const next = new Set(selected);
            next.has(node.id) ? next.delete(node.id) : next.add(node.id);
            setSelected(next);

            await runEventHandler?.(element.onNodeSelect, {
                id: node.id,
                selected: next.has(node.id),
                node,
                event: { id: node.id, label: node.label, data: node },
            });
        };
    }, [selectable, selected, runEventHandler, element.onNodeSelect]);

    return (
        <div
            className={cn("rounded-md bg-card shadow-sm text-sm", element.styles?.className)}
            role="tree"
            tabIndex={0}
        >
            {searchable && (
                <div className="p-2">
                    <input
                        type="text"
                        className="w-full rounded-md bg-(--acp-background) dark:bg-(--acp-background-dark) text-(--acp-foreground) dark:text-(--acp-foreground-dark) px-3 py-2"
                        placeholder={searchPlaceholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search"
                    />
                </div>
            )}

            <div className={cn("p-2 overflow-x-auto overflow-y-visible", "whitespace-nowrap min-w-full")}>
                {viewNodes.length === 0 ? (
                    <Empty label={emptyLabel} />
                ) : (
                    <ul className="space-y-1">
                        {viewNodes.map((n) => (
                            <TreeRow
                                key={n.id}
                                node={n}
                                depth={0}
                                expanded={expanded}
                                selected={selected}
                                showBadges={showBadges}
                                showDescriptions={showDescriptions}
                                disableToggleOnLabel={disableToggleOnLabel}
                                checkStrictly={checkStrictly}
                                selectable={selectable}
                                multiple={multiple}
                                onToggleExpand={toggleExpand}
                                onToggleSelect={toggleSelect}
                                runEventHandler={runEventHandler}
                                loadingIds={loadingIds}
                                loadingLabel={loadingLabel}
                                draggable={draggable}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}


const TreeRow = memo(function TreeRow({
    node,
    depth,
    expanded,
    selected,
    showBadges,
    showDescriptions,
    disableToggleOnLabel,
    checkStrictly,
    selectable,
    multiple,
    onToggleExpand,
    onToggleSelect,
    runEventHandler,
    loadingIds,
    loadingLabel,
    draggable,
}: any) {
    const hasChildren = !!node.children?.length || (node as any).lazy;
    const isOpen = expanded.has(node.id);
    const tri: TriState = computeTriState(node, selected, checkStrictly);
    const isLoading = loadingIds.has(node.id);

    const labelClick = () => {
        if (!disableToggleOnLabel && hasChildren) onToggleExpand(node);
        else if (selectable) onToggleSelect(node);
    };

    return (
        <li role="treeitem" aria-expanded={hasChildren ? isOpen : undefined}>
            <div
                className={cn(
                    "group relative flex items-start gap-1 rounded px-2 py-1 hover:bg-accent focus:bg-accent outline-none"
                )}
                style={{ paddingLeft: depth * 16 + 8 }}
            >
                {hasChildren ? (
                    <button
                        type="button"
                        className="mt-0.5 shrink-0 rounded p-0.5 hover:bg-muted"
                        aria-label={isOpen ? "Collapse" : "Expand"}
                        onClick={() => onToggleExpand(node)}
                    >
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                ) : (
                    <span className="w-4 h-4 mt-0.5 shrink-0" />
                )}

                {selectable && multiple && (
                    <button
                        type="button"
                        className="mt-0.5 shrink-0 p-0.5 rounded hover:bg-muted"
                        aria-checked={tri === "checked"}
                        onClick={() => onToggleSelect(node)}
                    >
                        {tri === "checked" ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                        ) : tri === "indeterminate" ? (
                            <MinusSquare className="h-4 w-4 text-primary" />
                        ) : (
                            <Square className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>
                )}

                <DynamicIcon
                    name={node.icon || (hasChildren ? "Folder" : "File")}
                    colorIcon={true}
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                />

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="text-left wrap-break-word whitespace-normal"
                            onClick={labelClick}
                        >
                            {node.label}
                        </button>
                        {showBadges && node.badge !== undefined && (
                            <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px]">
                                {String(node.badge)}
                            </span>
                        )}
                    </div>
                    {showDescriptions && node.description && (
                        <div className="text-[11px] text-muted-foreground ">{node.description}</div>
                    )}
                </div>
            </div>

            {hasChildren && isOpen && (
                <ul className="space-y-1">
                    {isLoading ? (
                        <li className="pl-10 text-xs text-muted-foreground">{loadingLabel}</li>
                    ) : (
                        node.children?.map((c: any) => (
                            <TreeRow
                                key={c.id}
                                node={c}
                                depth={depth + 1}
                                expanded={expanded}
                                selected={selected}
                                showBadges={showBadges}
                                showDescriptions={showDescriptions}
                                disableToggleOnLabel={disableToggleOnLabel}
                                checkStrictly={checkStrictly}
                                selectable={selectable}
                                multiple={multiple}
                                onToggleExpand={onToggleExpand}
                                onToggleSelect={onToggleSelect}
                                runEventHandler={runEventHandler}
                                loadingIds={loadingIds}
                                loadingLabel={loadingLabel}
                                draggable={draggable}
                            />
                        ))
                    )}
                </ul>
            )}
        </li>
    );
},
    (prev, next) =>
        prev.node.id === next.node.id &&
        prev.expanded === next.expanded &&
        prev.selected === next.selected &&
        prev.loadingIds === next.loadingIds
);


/* -------------------------------------------------------------------------- */
/* Small Components */
/* -------------------------------------------------------------------------- */
function Empty({ label }: { label: string }) {
    return <div className="py-8 text-center text-sm text-muted-foreground">{label}</div>;
}
