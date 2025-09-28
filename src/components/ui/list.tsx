"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import type {
    AnyObj,
    EventHandler,
    ListElement,
    ListItemElement,
} from "../../types"
import { useAppState } from "../../schema/StateContext"

/**
 * If you want virtualization, this imports your `react-window` List variant
 * that supports `rowComponent`, `rowProps`, and function `rowHeight`.
 * (Matches the API you shared.)
 */
import { List as VirtualList } from "react-window"
import { estimateItemHeight, ListItemRenderer } from "./list_item"

type Density = "comfortable" | "compact"

interface ListRendererProps {
    element: ListElement
    runEventHandler: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
    /** Optional – if not provided, uses AppState context */
    state?: AnyObj
    t?: (key: string) => string
    /** Optional visual toggles */
    density?: Density
    showDividers?: boolean
    /** Virtualization threshold (defaults to 60) */
    virtualizeAfter?: number
}

export function ListRenderer(props: ListRendererProps) {
    const {
        element,
        runEventHandler,
        density = "comfortable",
        showDividers = true,
        virtualizeAfter = 60,
    } = props

    const ctx = safeUseAppState()
    const state = props.state ?? ctx.state
    const t = props.t ?? ctx.t

    const items = element.items ?? []
    const useVirtual = items.length > virtualizeAfter

    // Keyboard focus handling for arrow up/down navigation
    const itemRefs = React.useRef<(HTMLDivElement | null)[]>([])

    const focusItem = (idx: number) => {
        const el = itemRefs.current[idx]
        if (el) el.focus()
    }

    const onFocusNext = (idx: number) => () => {
        if (idx < items.length - 1) focusItem(idx + 1)
    }
    const onFocusPrev = (idx: number) => () => {
        if (idx > 0) focusItem(idx - 1)
    }

    // Selection highlight (purely visual; click triggers onClick as usual)
    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

    const Tag = element.ordered ? ("ol" as const) : ("ul" as const)

    // ===== Non-virtual path (small lists) =====
    if (!useVirtual) {
        return (
            <Tag
                role="list"
                className={cn(
                    "list-inside space-y-1",
                    element.ordered ? "list-decimal" : "list-none",
                    element.styles?.className
                )}
                data-slot="list"
            >
                {items.length === 0 ? (
                    <EmptyState />
                ) : (
                    items.map((item, i) => {
                        const resolved = resolveItem(item, state, t)
                        const hasChildren = !!resolved.children?.length
                        return (
                            <div
                                key={resolved.id || i}
                                ref={(el) => (itemRefs.current[i] = el) as any}
                                onFocus={() => setSelectedIndex(i)}
                            >
                                <ListItemRenderer
                                    element={resolved}
                                    runEventHandler={async (h, data) => {
                                        setSelectedIndex(i)
                                        await runEventHandler(h, data)
                                    }}
                                    state={state}
                                    t={t}
                                    selected={selectedIndex === i}
                                    index={i}
                                    density={density}
                                    showDivider={showDividers && i < items.length - 1}
                                    onFocusNext={onFocusNext(i)}
                                    onFocusPrev={onFocusPrev(i)}
                                />
                            </div>
                        )
                    })
                )}
            </Tag>
        )
    }

    // ===== Virtualized path (large lists) =====
    // Height estimator compatible with your react-window variant (rowHeight function)
    type RowProps = {
        items: ListItemElement[]
    }
    const rowHeight = (index: number, { items }: RowProps) => {
        const item = items[index]
        const resolved = resolveItem(item, state, t)
        const hasChildren = !!resolved.children?.length
        return estimateItemHeight(resolved, density, hasChildren)
    }

    const Row = ({
        index,
        style,
        items: rowItems,
    }: {
        index: number
        style: React.CSSProperties
        items: ListItemElement[]
    }) => {
        const original = rowItems[index]
        const resolved = resolveItem(original, state, t)
        return (
            <div
                key={resolved.id ?? index}
                style={style}
                ref={(el) => (itemRefs.current[index] = el as any)}
                onFocus={() => setSelectedIndex(index)}
            >
                <ListItemRenderer
                    element={resolved}
                    runEventHandler={async (h, data) => {
                        setSelectedIndex(index)
                        await runEventHandler(h, data)
                    }}
                    state={state}
                    t={t}
                    selected={selectedIndex === index}
                    index={index}
                    density={density}
                    showDivider={showDividers && index < items.length - 1}
                    onFocusNext={onFocusNext(index)}
                    onFocusPrev={onFocusPrev(index)}
                />
            </div>
        )
    }

    return (
        <div
            role="list"
            className={cn(
                "w-full h-96 rounded-md border bg-card",
                element.styles?.className
            )}
            data-slot="list"
        >
            {items.length === 0 ? (
                <EmptyState />
            ) : (
                <VirtualList<RowProps>
                    rowComponent={Row as any}
                    rowCount={items.length}
                    rowHeight={rowHeight as any}
                    rowProps={{ items }}
                    overscanCount={6}
                    style={{ height: "100%", width: "100%" }}
                />
            )}
        </div>
    )
}

/* =================== Helpers =================== */

function resolveItem(item: ListItemElement, state: AnyObj, t: (k: string) => string) {
    // Shallow-resolve only fields we need to render quickly; children renderers will resolve their own bindings
    return {
        ...item,
        text: item.text,
        description: item.description,
    } as ListItemElement
}

function EmptyState() {
    return (
        <div className="p-6 text-sm text-muted-foreground text-center">
            No items to display.
        </div>
    )
}

function safeUseAppState() {
    try {
        return useAppState()
    } catch {
        return {
            state: {} as AnyObj,
            t: (k: string) => k,
        }
    }
}
