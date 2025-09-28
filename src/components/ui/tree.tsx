"use client"

import * as React from "react"
import { useMemo, useRef, useState, useCallback } from "react"
import {
    ChevronDown,
    ChevronRight,
    Folder,
    File,
    MoreHorizontal,
    CheckSquare,
    Square,
    MinusSquare,
} from "lucide-react"
import { cn, resolveBinding } from "../../lib/utils"
import type { AnyObj, EventHandler, TreeElement, TreeNodeElement } from "../../types"
import { useAppState } from "../../schema/StateContext"

/* -------------------------------------------------------------------------- */
/*                                   Utils                                    */
/* -------------------------------------------------------------------------- */

type TreeNodeResolved = Omit<TreeNodeElement, "label" | "description" | "badge" | "children"> & {
    label: string
    description?: string
    badge?: string | number
    children?: TreeNodeResolved[]
}

/** Map schema node → resolved node (bindings resolved) */
function resolveNode(n: TreeNodeElement, state: AnyObj, t: (k: string) => string): TreeNodeResolved {
    return {
        ...n,
        label: String(resolveBinding(n.label, state, t) ?? ""),
        description: n.description !== undefined ? String(resolveBinding(n.description, state, t) ?? "") : undefined,
        badge: n.badge !== undefined ? resolveBinding(n.badge as any, state, t) : undefined,
        children: n.children?.map((c) => resolveNode(c, state, t)),
    }
}

/** Returns the set of initially expanded node ids (based on schema expanded flags) */
function collectInitiallyExpanded(nodes: TreeNodeElement[] | undefined, acc: Set<string> = new Set()): Set<string> {
    if (!nodes) return acc
    for (const n of nodes) {
        if (n.expanded) acc.add(n.id)
        if (n.children?.length) collectInitiallyExpanded(n.children, acc)
    }
    return acc
}

type TriState = "checked" | "unchecked" | "indeterminate"
function computeTriState(
    node: TreeNodeResolved,
    selected: Set<string>,
    checkStrictly: boolean
): TriState {
    if (checkStrictly || !node.children?.length) {
        return selected.has(node.id) ? "checked" : "unchecked"
    }
    let checkedCount = 0
    let indeterminate = false
    for (const c of node.children || []) {
        const st = computeTriState(c, selected, checkStrictly)
        if (st === "checked") checkedCount++
        else if (st === "indeterminate") indeterminate = true
    }
    if (indeterminate) return "indeterminate"
    if (checkedCount === 0) return selected.has(node.id) ? "checked" : "unchecked"
    if (checkedCount === (node.children?.length || 0)) return "checked"
    return "indeterminate"
}

function applyCascadeSelection(
    node: TreeNodeResolved,
    next: Set<string>,
    select: boolean
) {
    if (select) next.add(node.id)
    else next.delete(node.id)
    node.children?.forEach((c) => applyCascadeSelection(c, next, select))
}

function resolveIcon(icon?: string, isFolder?: boolean) {
    if (!icon) return isFolder ? Folder : File
    const key = icon.toLowerCase()
    if (key === "folder") return Folder
    if (key === "file") return File
    // Fallbacks; you can expand this map to your icon set
    return isFolder ? Folder : File
}

/* Simple fuzzy-ish label filter */
function filterTree(nodes: TreeNodeResolved[], query: string): TreeNodeResolved[] {
    if (!query.trim()) return nodes
    const q = query.trim().toLowerCase()
    const matchNode = (n: TreeNodeResolved): TreeNodeResolved | null => {
        const selfMatch =
            n.label.toLowerCase().includes(q) ||
            (n.description?.toLowerCase().includes(q) ?? false) ||
            (String(n.badge ?? "").toLowerCase().includes(q) && !!n.badge)
        const kids: TreeNodeResolved[] = []
        n.children?.forEach((c) => {
            const m = matchNode(c)
            if (m) kids.push(m)
        })
        if (selfMatch || kids.length) {
            return { ...n, children: kids }
        }
        return null
    }
    const out: TreeNodeResolved[] = []
    nodes.forEach((n) => {
        const m = matchNode(n)
        if (m) out.push(m)
    })
    return out
}

/* -------------------------------------------------------------------------- */
/*                                TreeRenderer                                */
/* -------------------------------------------------------------------------- */

interface TreeRendererProps {
    element: TreeElement
    // If you’re using inside a scope without StateProvider, pass state + t; otherwise taken from context
    state?: AnyObj
    t?: (key: string) => string
    runEventHandler: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
}

export function TreeRenderer(props: TreeRendererProps) {
    const { element, runEventHandler } = props
    const ctx = safeAppState()
    const state = props.state ?? ctx?.state ?? {}
    const t = props.t ?? ctx?.t ?? ((k: string) => k)

    const selectable = element.selectable ?? false
    const multiple = element.multiple ?? false
    const checkStrictly = element.checkStrictly ?? false
    const disableToggleOnLabel = element.disableToggleOnLabel ?? false
    const searchable = element.searchable ?? false
    const showBadges = element.showBadges ?? true
    const showDescriptions = element.showDescriptions ?? true
    const draggable = element.draggable ?? false

    const emptyLabel = String(resolveBinding(element.emptyLabel ?? "No items", state, t))
    const loadingLabel = String(resolveBinding(element.loadingLabel ?? "Loading…", state, t))
    const searchPlaceholder = String(resolveBinding(element.searchPlaceholder ?? "Search…", state, t))

    // Root nodes: either from dataSourceId (state-fed) or inline nodes
    const rawNodes = useMemo<TreeNodeElement[]>(
        () => (element.dataSourceId ? (state[element.dataSourceId] || []) : (element.nodes || [])),
        [element.dataSourceId, element.nodes, state]
    )

    const resolvedNodes = useMemo<TreeNodeResolved[]>(
        () => rawNodes.map((n) => resolveNode(n, state, t)),
        [rawNodes, state, t]
    )

    // Expanded nodes
    const [expanded, setExpanded] = useState<Set<string>>(
        () => collectInitiallyExpanded(rawNodes)
    )
    const isExpanded = useCallback((id: string) => expanded.has(id), [expanded])

    // Selection (single/multiple)
    const [selected, setSelected] = useState<Set<string>>(new Set())

    // Lazy loading marker
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

    // Search
    const [query, setQuery] = useState("")
    const viewNodes = useMemo(
        () => (searchable && query ? filterTree(resolvedNodes, query) : resolvedNodes),
        [resolvedNodes, searchable, query]
    )

    // Focus / keyboard nav
    const rowOrder = useMemo(() => linearize(viewNodes, expanded), [viewNodes, expanded])
    const [focusedId, setFocusedId] = useState<string | null>(rowOrder[0]?.id ?? null)
    const containerRef = useRef<HTMLDivElement>(null)

    /* ----------------------- Node expand/collapse toggle ---------------------- */
    const toggleExpand = async (node: TreeNodeResolved) => {
        const next = new Set(expanded)
        const willExpand = !next.has(node.id)
        if (willExpand) next.add(node.id)
        else next.delete(node.id)
        setExpanded(next)

        // Node event + element event
        await Promise.all([
            runEventHandler((node as any).onExpand, { id: node.id, expanded: willExpand }),
            runEventHandler(element.onNodeExpand, { id: node.id, expanded: willExpand }),
        ])

        // Handle lazy children
        const isLazy = (node as any).lazy && willExpand && !node.children?.length
        if (isLazy && element.onLoadChildren && !loadingIds.has(node.id)) {
            setLoadingIds((s) => new Set(s).add(node.id))
            // Ask schema to load; it should call callback(children)
            await runEventHandler(element.onLoadChildren, {
                id: node.id,
                callback: (children: TreeNodeElement[]) => {
                    // Put into state so that next render resolves them
                    // Convention: tree child data go under state[`${element.id}:children:${node.id}`]
                    const key = `${element.id}:children:${node.id}`
                    ctx?.setState?.(key, children)
                },
            })
            setLoadingIds((s) => {
                const n = new Set(s)
                n.delete(node.id)
                return n
            })

            // Merge loaded children (from state) into rawNodes via dataSourceId or local state
            // If you already pipe children back into the main dataSource state, they’ll show automatically.
            // Otherwise, read from the convention key above and graft them here:
            const graft = state[`${element.id}:children:${node.id}`]
            if (Array.isArray(graft) && graft.length) {
                // Prefer a pure source-of-truth (data layer). If you *need* to mutate ephemeral UI state locally,
                // you could keep an “overrides” map here. We keep it stateless and rely on data layer to update state.
            }
        }
    }

    /* ---------------------------- Select toggle logic ---------------------------- */
    const toggleSelect = async (node: TreeNodeResolved) => {
        if (!selectable || (node as any).disabled) return

        const next = new Set(selected)
        const currentlySelected = next.has(node.id)

        if (!multiple) {
            next.clear()
            if (!currentlySelected) next.add(node.id)
        } else {
            // multiple + tri-state cascade when NOT strict
            const tri = computeTriState(node, selected, checkStrictly)
            if (!checkStrictly && node.children?.length) {
                // Toggle whole subtree to the opposite of current tri-state
                const target = tri !== "checked"
                applyCascadeSelection(node, next, target)
            } else {
                // Strict or leaf: just toggle this node
                if (currentlySelected) next.delete(node.id)
                else next.add(node.id)
            }
        }

        setSelected(next)
        await Promise.all([
            runEventHandler((node as any).onSelect, { id: node.id, selected: next.has(node.id) }),
            runEventHandler(element.onNodeSelect, { id: node.id, selected: next.has(node.id) }),
        ])
    }

    /* ---------------------------- Keyboard navigation --------------------------- */
    const focusIndex = focusedId ? rowOrder.findIndex((x) => x.id === focusedId) : -1

    const focusByIndex = (idx: number) => {
        const clamped = Math.max(0, Math.min(rowOrder.length - 1, idx))
        const n = rowOrder[clamped]
        if (n) setFocusedId(n.id)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!rowOrder.length) return
        if (focusIndex < 0) setFocusedId(rowOrder[0].id)

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                focusByIndex(focusIndex + 1)
                break
            case "ArrowUp":
                e.preventDefault()
                focusByIndex(focusIndex - 1)
                break
            case "ArrowRight": {
                e.preventDefault()
                const n = rowOrder[focusIndex]
                if (!n) break
                const node = findNode(viewNodes, n.id)
                if (!node) break
                if (node.children?.length && !isExpanded(node.id)) {
                    toggleExpand(node)
                } else {
                    // move to first child if already expanded
                    focusByIndex(focusIndex + 1)
                }
                break
            }
            case "ArrowLeft": {
                e.preventDefault()
                const n = rowOrder[focusIndex]
                if (!n) break
                const node = findNode(viewNodes, n.id)
                if (!node) break
                if (node.children?.length && isExpanded(node.id)) {
                    toggleExpand(node)
                } else {
                    // move focus to parent
                    const parentIndex = findParentIndex(rowOrder, n.id)
                    if (parentIndex >= 0) focusByIndex(parentIndex)
                }
                break
            }
            case " ":
            case "Enter": {
                e.preventDefault()
                const n = rowOrder[focusIndex]
                if (!n) break
                const node = findNode(viewNodes, n.id)
                if (!node) break
                // Space toggles selection; Enter toggles expand if caret disabled on label
                if (e.key === " " && selectable) {
                    toggleSelect(node)
                } else {
                    toggleExpand(node)
                }
                break
            }
        }
    }

    /* --------------------------------- DnD (HTML5) -------------------------------- */
    const dragInfo = useRef<{ parentId: string | null; fromIndex: number } | null>(null)

    const handleDragStart = (parentId: string | null, index: number) => (ev: React.DragEvent) => {
        if (!draggable) return
        dragInfo.current = { parentId, fromIndex: index }
        ev.dataTransfer.effectAllowed = "move"
    }
    const handleDragOver = () => (ev: React.DragEvent) => {
        if (!draggable) return
        ev.preventDefault()
        ev.dataTransfer.dropEffect = "move"
    }
    const handleDrop = (parentId: string | null, toIndex: number) => async (ev: React.DragEvent) => {
        if (!draggable) return
        ev.preventDefault()
        const d = dragInfo.current
        dragInfo.current = null
        if (!d) return
        if (d.parentId !== parentId || d.fromIndex === toIndex) return
        // Schema layer does actual reordering and state update:
        await runEventHandler(element.onReorder, {
            parentId,
            fromIndex: d.fromIndex,
            toIndex,
        })
    }

    /* --------------------------------- Context menu ------------------------------- */
    const handleContextMenu =
        (node: TreeNodeResolved) => async (e: React.MouseEvent) => {
            e.preventDefault()
            await Promise.all([
                runEventHandler((node as any).onContextMenu, { id: node.id }),
                runEventHandler(element.onContextMenu, { id: node.id }),
            ])
        }

    /* ---------------------------------- Render ----------------------------------- */

    return (
        <div
            ref={containerRef}
            className={cn(
                "rounded-md border bg-card shadow-sm text-sm",
                element.styles?.className
            )}
            role="tree"
            aria-multiselectable={selectable && multiple ? true : undefined}
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {/* Search */}
            {searchable && (
                <div className="p-2 border-b">
                    <input
                        type="text"
                        className="w-full rounded-md border bg-background px-3 py-2"
                        placeholder={searchPlaceholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search"
                    />
                </div>
            )}

            {/* Body */}
            <div className="p-2">
                {viewNodes.length === 0 ? (
                    <Empty label={emptyLabel} />
                ) : (
                    <ul className="space-y-1">
                        {viewNodes.map((n, idx) => (
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
                                isFocused={focusedId === n.id}
                                setFocusedId={setFocusedId}
                                onToggleExpand={toggleExpand}
                                onToggleSelect={toggleSelect}
                                onContextMenu={handleContextMenu}
                                onAction={(actionId) =>
                                    runEventHandler((n as any).onAction, { id: n.id, actionId })
                                }
                                // DnD
                                draggable={draggable}
                                onDragStart={handleDragStart(null, idx)}
                                onDragOver={handleDragOver()}
                                onDrop={handleDrop(null, idx)}
                                loadingIds={loadingIds}
                                loadingLabel={loadingLabel}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/*                              TreeRow (recursive)                            */
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
    isFocused,
    setFocusedId,
    onToggleExpand,
    onToggleSelect,
    onContextMenu,
    onAction,
    draggable,
    onDragStart,
    onDragOver,
    onDrop,
    loadingIds,
    loadingLabel,
}: {
    node: TreeNodeResolved
    depth: number
    expanded: Set<string>
    selected: Set<string>
    showBadges: boolean
    showDescriptions: boolean
    disableToggleOnLabel: boolean
    checkStrictly: boolean
    selectable: boolean
    multiple: boolean
    isFocused: boolean
    setFocusedId: (id: string) => void
    onToggleExpand: (node: TreeNodeResolved) => void
    onToggleSelect: (node: TreeNodeResolved) => void
    onContextMenu: (node: TreeNodeResolved) => (e: React.MouseEvent) => void
    onAction: (actionId: string) => void
    draggable: boolean
    onDragStart: (e: React.DragEvent) => void
    onDragOver: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent) => void
    loadingIds: Set<string>
    loadingLabel: string
}) {
    const hasChildren = !!node.children?.length || (node as any).lazy
    const isOpen = expanded.has(node.id)
    const tri: TriState = computeTriState(node, selected, checkStrictly)
    const Icon = resolveIcon(node.icon, hasChildren)
    const isLoading = loadingIds.has(node.id)

    const labelClick = () => {
        if (!disableToggleOnLabel && hasChildren) onToggleExpand(node)
        else if (selectable) onToggleSelect(node)
    }

    return (
        <li role="treeitem" aria-expanded={hasChildren ? isOpen : undefined}>
            {/* Row */}
            <div
                className={cn(
                    "group relative flex items-start gap-1 rounded px-2 py-1 hover:bg-accent focus:bg-accent outline-none",
                    isFocused && "ring-2 ring-primary"
                )}
                style={{ paddingLeft: depth * 16 + 8 }}
                onClick={() => setFocusedId(node.id)}
                onContextMenu={onContextMenu(node)}
                draggable={draggable}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
            >
                {/* Caret */}
                {hasChildren ? (
                    <button
                        type="button"
                        className="mt-0.5 shrink-0 rounded p-0.5 hover:bg-muted"
                        aria-label={isOpen ? "Collapse" : "Expand"}
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggleExpand(node)
                        }}
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
                        className={cn(
                            "mt-0.5 shrink-0 p-0.5 rounded hover:bg-muted",
                            (node as any).disabled && "opacity-50 cursor-not-allowed"
                        )}
                        aria-checked={tri === "checked"}
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggleSelect(node)
                        }}
                        disabled={(node as any).disabled}
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

                {/* Icon */}
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0 text-muted-foreground")} />

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className={cn(
                                "truncate text-left",
                                (node as any).disabled && "cursor-not-allowed opacity-60"
                            )}
                            onClick={(e) => {
                                e.stopPropagation()
                                labelClick()
                            }}
                            disabled={(node as any).disabled}
                        >
                            <span className={cn(node.color && `text-[${node.color}]`)}>{node.label}</span>
                        </button>

                        {/* Badge */}
                        {showBadges && node.badge !== undefined && node.badge !== "" && (
                            <span className="inline-flex shrink-0 items-center rounded bg-muted px-1.5 py-0.5 text-[10px]">
                                {String(node.badge)}
                            </span>
                        )}

                        {/* Row actions (kebab) */}
                        {(node as any).actions?.length ? (
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition">
                                <Menu
                                    items={(node as any).actions}
                                    onAction={(id) => onAction(id)}
                                />
                            </div>
                        ) : null}
                    </div>

                    {/* Description */}
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
                    ) : node.children?.length ? (
                        node.children.map((c, idx) => (
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
                                isFocused={false}
                                setFocusedId={setFocusedId}
                                onToggleExpand={onToggleExpand}
                                onToggleSelect={onToggleSelect}
                                onContextMenu={onContextMenu}
                                onAction={(actionId) => onAction(actionId)}
                                draggable={draggable}
                                onDragStart={onDragStart}
                                onDragOver={onDragOver}
                                onDrop={onDrop}
                                loadingIds={loadingIds}
                                loadingLabel={loadingLabel}
                            />
                        ))
                    ) : (
                        <li className="pl-10 text-xs text-muted-foreground">{/* empty branch */}</li>
                    )}
                </ul>
            )}
        </li>
    )
}

/* -------------------------------------------------------------------------- */
/*                                Small pieces                                 */
/* -------------------------------------------------------------------------- */

function Empty({ label }: { label: string }) {
    return (
        <div className="py-8 text-center text-sm text-muted-foreground">
            {label}
        </div>
    )
}

function Menu({
    items,
    onAction,
}: {
    items: { id: string; label: string; icon?: string }[]
    onAction: (id: string) => void
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (!ref.current) return
            if (!ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", onDoc)
        return () => document.removeEventListener("mousedown", onDoc)
    }, [])

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                className="rounded p-1 hover:bg-muted"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>
            {open && (
                <div
                    role="menu"
                    className="absolute right-0 z-10 mt-1 min-w-36 rounded-md border bg-popover p-1 shadow-lg"
                >
                    {items.map((it) => (
                        <button
                            key={it.id}
                            role="menuitem"
                            type="button"
                            className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs hover:bg-accent"
                            onClick={() => {
                                setOpen(false)
                                onAction(it.id)
                            }}
                        >
                            {/* Optional: map icon string to lucide icon here if desired */}
                            <span>{it.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/*                               Tree traversal                                */
/* -------------------------------------------------------------------------- */

function linearize(nodes: TreeNodeResolved[], expanded: Set<string>): { id: string }[] {
    const out: { id: string }[] = []
    const walk = (list: TreeNodeResolved[]) => {
        list.forEach((n) => {
            out.push({ id: n.id })
            if (n.children?.length && expanded.has(n.id)) walk(n.children)
        })
    }
    walk(nodes)
    return out
}

function findNode(nodes: TreeNodeResolved[], id: string): TreeNodeResolved | null {
    for (const n of nodes) {
        if (n.id === id) return n
        if (n.children?.length) {
            const c = findNode(n.children, id)
            if (c) return c
        }
    }
    return null
}

function findParentIndex(order: { id: string }[], id: string): number {
    // This utility assumes linearized order with parent before children.
    // Parent is the nearest previous item that has the current id in its subtree in expanded state.
    // For keyboard UX we approximate by stepping back until we hit a candidate.
    const idx = order.findIndex((o) => o.id === id)
    if (idx <= 0) return -1
    for (let i = idx - 1; i >= 0; i--) {
        // We can’t cheaply verify subtree without structure here; return previous row.
        return i
    }
    return -1
}

/* -------------------------------------------------------------------------- */
/*                                Safe context                                 */
/* -------------------------------------------------------------------------- */

function safeAppState() {
    try {
        return useAppState()
    } catch {
        return null
    }
}
