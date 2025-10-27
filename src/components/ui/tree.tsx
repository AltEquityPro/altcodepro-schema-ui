"use client";

import { useMemo, useState } from "react";
import {
    ChevronDown,
    ChevronRight,
    CheckSquare,
    Square,
    MinusSquare,
} from "lucide-react";
import { cn, resolveBinding } from "../../lib/utils";
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

/** Map schema node → resolved node (bindings resolved) */
function resolveNode(n: TreeNodeElement, state: AnyObj, t: (k: string) => string): TreeNodeResolved {
    return {
        ...n,
        label: String(resolveBinding(n.label, state, t) ?? ""),
        description:
            n.description !== undefined
                ? String(resolveBinding(n.description, state, t) ?? "")
                : undefined,
        badge: n.badge !== undefined ? resolveBinding(n.badge as any, state, t) : undefined,
        children: n.children?.map((c) => resolveNode(c, state, t)),
    };
}

/** Returns initially expanded node IDs */
function collectInitiallyExpanded(nodes: TreeNodeElement[] | undefined, acc: Set<string> = new Set()): Set<string> {
    if (!nodes) return acc;
    for (const n of nodes) {
        if (n.expanded) acc.add(n.id);
        if (n.children?.length) collectInitiallyExpanded(n.children, acc);
    }
    return acc;
}

type TriState = "checked" | "unchecked" | "indeterminate";
function computeTriState(node: TreeNodeResolved, selected: Set<string>, checkStrictly: boolean): TriState {
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

function applyCascadeSelection(node: TreeNodeResolved, next: Set<string>, select: boolean) {
    if (select) next.add(node.id);
    else next.delete(node.id);
    node.children?.forEach((c) => applyCascadeSelection(c, next, select));
}

/** Simple fuzzy-ish label filter */
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

interface TreeRendererProps {
    element: TreeElement;
    state: AnyObj;
    t: (key: string) => string;
    runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>;
}

export function TreeRenderer({ element, runEventHandler, state, t }: TreeRendererProps) {
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

    const rawNodes = useMemo<TreeNodeElement[]>(
        () => (element.dataSourceId ? state[element.dataSourceId] || [] : element.nodes || []),
        [element.dataSourceId, element.nodes, state]
    );

    const resolvedNodes = useMemo<TreeNodeResolved[]>(
        () => rawNodes?.map((n) => resolveNode(n, state, t)),
        [rawNodes, state, t]
    );

    const [expanded, setExpanded] = useState<Set<string>>(() => collectInitiallyExpanded(rawNodes));
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
    const [query, setQuery] = useState("");
    const viewNodes = useMemo(
        () => (searchable && query ? filterTree(resolvedNodes, query) : resolvedNodes),
        [resolvedNodes, searchable, query]
    );

    /* ----------------------------- Expand toggle ----------------------------- */
    const toggleExpand = async (node: TreeNodeResolved) => {
        const next = new Set(expanded);
        const willExpand = !next.has(node.id);
        willExpand ? next.add(node.id) : next.delete(node.id);
        setExpanded(next);

        await Promise.all([
            runEventHandler?.((node as any).onExpand, { id: node.id, expanded: willExpand }),
            runEventHandler?.(element.onNodeExpand, { id: node.id, expanded: willExpand }),
        ]);
    };

    /* ----------------------------- Selection toggle ----------------------------- */
    const toggleSelect = async (node: TreeNodeResolved) => {
        if (!selectable || (node as any).disabled) return;
        const next = new Set(selected);
        const currentlySelected = next.has(node.id);

        if (!multiple) {
            next.clear();
            if (!currentlySelected) next.add(node.id);
        } else {
            const tri = computeTriState(node, selected, checkStrictly);
            if (!checkStrictly && node.children?.length) {
                const target = tri !== "checked";
                applyCascadeSelection(node, next, target);
            } else {
                if (currentlySelected) next.delete(node.id);
                else next.add(node.id);
            }
        }

        setSelected(next);
        await Promise.all([
            runEventHandler?.((node as any).onSelect, { id: node.id, selected: next.has(node.id) }),
            runEventHandler?.(element.onNodeSelect, { id: node.id, selected: next.has(node.id) }),
        ]);
    };

    return (
        <div
            className={cn("rounded-md  bg-card shadow-sm text-sm", element.styles?.className)}
            role="tree"
            tabIndex={0}
        >
            {/* Search bar */}
            {searchable && (
                <div className="p-2 ">
                    <input
                        type="text"
                        className="w-full rounded-md  bg-background text-foreground px-3 py-2"
                        placeholder={searchPlaceholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search"
                    />
                </div>
            )}

            {/* Tree Body */}
            <div className="p-2">
                {viewNodes.length === 0 ? (
                    <Empty label={emptyLabel} />
                ) : (
                    <ul className="space-y-1">
                        {viewNodes?.map((n) => (
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

/* -------------------------------------------------------------------------- */
/*                               TreeRow (recursive)                          */
/* -------------------------------------------------------------------------- */

function TreeRow({
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
                {/* Caret */}
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

                {/* Checkbox selection (multiple) */}
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

                {/* Dynamic Icon */}
                <DynamicIcon
                    name={node.icon || (hasChildren ? "Folder" : "File")}
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                />

                {/* Label + Badges */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="truncate text-left"
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
                        <div className="text-[11px] text-muted-foreground truncate">{node.description}</div>
                    )}
                </div>
            </div>

            {/* Children */}
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
}

/* -------------------------------------------------------------------------- */
/* Small Components */
/* -------------------------------------------------------------------------- */

function Empty({ label }: { label: string }) {
    return <div className="py-8 text-center text-sm text-muted-foreground">{label}</div>;
}
