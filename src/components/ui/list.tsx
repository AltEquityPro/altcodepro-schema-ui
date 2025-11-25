"use client";

import React, { useMemo, useCallback } from "react";
import { cleanDataSourceId, cn, resolveBinding } from "../../lib/utils";
import { RenderChildren } from "../../schema/RenderChildren";
import type { AnyObj, EventHandler, ListElement, UIElement } from "../../types";
import { List, useDynamicRowHeight, useListRef, RowComponentProps } from "react-window";

interface ListRendererProps {
    element: ListElement;
    runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>;
    state: AnyObj;
    setState: (path: string, value: any) => void;
    t: (key: string) => string;
}

export function ListRenderer({
    element,
    state,
    setState,
    t,
    runEventHandler,
}: ListRendererProps) {
    const listRef = useListRef(null);
    const dynamicHeight = useDynamicRowHeight({ defaultRowHeight: 56 });

    const orientation = element.orientation || "vertical"; // new property
    const isHorizontal = orientation === "horizontal";

    const items = useMemo<any[]>(
        () => (element.dataSourceId ? state[cleanDataSourceId(element.dataSourceId)] || [] : element.items || []),
        [element.dataSourceId, element.items, state]
    );

    const handleRowClick = useCallback(
        async (item: any, index: number) => {
            if (element.onEvent?.onSelect && runEventHandler) {
                await runEventHandler(element.onEvent.onSelect, { item, index });
            }
        },
        [element, runEventHandler]
    );

    const Row = useCallback(
        ({ index, style }: RowComponentProps) => {
            const item = items[index];
            const resolvedChildren =
                (element.children as UIElement[])?.length > 0
                    ? element.children
                    : [
                        {
                            id: `row_${index}`,
                            type: "text",
                            name: `Row ${index}`,
                            content:
                                typeof item === "object"
                                    ? resolveBinding(item.label || item.name || JSON.stringify(item), state, t)
                                    : String(item),
                            alignment: "left",
                            tag: "div",
                        },
                    ];

            return (
                <div
                    key={index}
                    style={style}
                    className={cn(
                        "flex items-center border-(--acp-border) dark:border-(--acp-border-dark) cursor-pointer select-none",
                        isHorizontal
                            ? "px-3 py-2 border-r hover:bg-(--acp-hover)"
                            : "px-3 py-2 border-b hover:bg-(--acp-hover)",
                        element.styles?.className
                    )}
                    onClick={() => handleRowClick(item, index)}
                >
                    <RenderChildren
                        children={resolvedChildren as any}
                        t={t}
                        state={{ ...state, currentItem: item }}
                        setState={setState}
                        runEventHandler={runEventHandler}
                    />
                </div>
            );
        },
        [items, element, state, t, setState, runEventHandler, handleRowClick, isHorizontal]
    );

    if (isHorizontal) {
        return (
            <div
                role="list"
                className={cn(
                    "w-full overflow-x-auto hide-scrollbar flex flex-row gap-4",
                    element.styles?.className
                )}
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="shrink-0 min-w-[300px]"
                        onClick={() => handleRowClick(item, index)}
                    >
                        <RenderChildren
                            children={element.children || []}
                            t={t}
                            state={{ ...state, currentItem: item }}
                            setState={setState}
                            runEventHandler={runEventHandler}
                        />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div
            role="list"
            className={cn(
                "w-full rounded-md border border-(--acp-border) dark:border-(--acp-border-dark) bg-card overflow-hidden",
                element.styles?.className
            )}
            data-slot="list"
        >
            <List
                rowComponent={Row}
                rowCount={items.length}
                rowHeight={dynamicHeight}
                rowProps={{ state, t, runEventHandler }}
                overscanCount={5}
                defaultHeight={element.virtualHeight || 400}
                listRef={listRef}
            />
        </div>
    );
}
