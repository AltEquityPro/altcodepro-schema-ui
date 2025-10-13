"use client";

import * as React from "react";
import { cn, resolveBinding } from "../../lib/utils";
import type { AnyObj, EventHandler, ListElement, ListItemElement } from "../../types";
import { List as VirtualList } from "react-window";
import { estimateItemHeight, ListItemRenderer } from "./list_item";

type Density = "comfortable" | "compact";

interface ListRendererProps {
    element: ListElement;
    runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>;
    state: AnyObj;
    t: (key: string) => string;
    density?: Density;
    showDividers?: boolean;
    virtualizeAfter?: number;
}

export function ListRenderer({
    element,
    state,
    t,
    runEventHandler,
    density = "comfortable",
    showDividers = true,
    virtualizeAfter = 60,
}: ListRendererProps) {
    const items = element.items ?? [];
    const useVirtual = typeof window !== "undefined" && items.length > virtualizeAfter;

    // Keyboard focus tracking
    const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);
    const focusItem = (idx: number) => {
        const el = itemRefs.current[idx];
        if (el) el.focus();
    };
    const onFocusNext = (idx: number) => () => {
        if (idx < items.length - 1) focusItem(idx + 1);
    };
    const onFocusPrev = (idx: number) => () => {
        if (idx > 0) focusItem(idx - 1);
    };

    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
    const Tag = element.ordered ? ("ol" as const) : ("ul" as const);

    /* -------------------------------------------------------------------------- */
    /*                          Non-Virtualized (small list)                      */
    /* -------------------------------------------------------------------------- */
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
                        const resolved = resolveItem(item, state, t);
                        return (
                            <div
                                key={resolved.id || i}
                                ref={(el: any) => (itemRefs.current[i] = el)}
                                onFocus={() => setSelectedIndex(i)}
                            >
                                <ListItemRenderer
                                    element={resolved}
                                    runEventHandler={async (h, data) => {
                                        setSelectedIndex(i);
                                        await runEventHandler?.(h, data);
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
                        );
                    })
                )}
            </Tag>
        );
    }

    /* -------------------------------------------------------------------------- */
    /*                          Virtualized (large list)                          */
    /* -------------------------------------------------------------------------- */
    const Row = React.useCallback(
        ({
            index,
            style,
            items: rowItems,
        }: {
            index: number;
            style: React.CSSProperties;
            items: ListItemElement[];
        }) => {
            const original = rowItems[index];
            const resolved = resolveItem(original, state, t);
            return (
                <div
                    key={resolved.id ?? index}
                    style={style}
                    ref={(el: any) => (itemRefs.current[index] = el)}
                    onFocus={() => setSelectedIndex(index)}
                    role="listitem"
                >
                    <ListItemRenderer
                        element={resolved}
                        runEventHandler={async (h, data) => {
                            setSelectedIndex(index);
                            await runEventHandler?.(h, data);
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
            );
        },
        [state, t, runEventHandler, showDividers, selectedIndex, density]
    );

    const rowHeight = React.useCallback(
        (index: number, { items }: { items: ListItemElement[] }) => {
            const resolved = resolveItem(items[index], state, t);
            const hasChildren = !!resolved.children?.length;
            return estimateItemHeight(resolved, density, hasChildren);
        },
        [state, t, density]
    );

    return (
        <div
            role="list"
            className={cn("w-full h-96 rounded-md border bg-card", element.styles?.className)}
            data-slot="list"
        >
            {items.length === 0 ? (
                <EmptyState />
            ) : (
                <VirtualList
                    rowComponent={Row as any}
                    rowCount={items.length}
                    rowHeight={rowHeight as any}
                    rowProps={{ items }}
                    overscanCount={6}
                    style={{ height: "100%", width: "100%" }}
                />
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function resolveItem(item: ListItemElement, state: AnyObj, t: (k: string) => string): ListItemElement {
    return {
        ...item,
        text: resolveBinding(item.text, state, t),
        description: item.description
            ? typeof item.description === "string"
                ? resolveBinding(item.description, state, t)
                : item.description
            : undefined,
    };
}

function EmptyState() {
    return (
        <div className="flex items-center justify-center p-6 text-sm text-muted-foreground h-full">
            No items to display.
        </div>
    );
}
