"use client";

import React, { useMemo, useCallback } from "react";
import { cleanDataSourceId, cn, resolveBinding } from "../../lib/utils";
import { RenderChildren } from "../../schema/RenderChildren";
import { ElementType, type AnyObj, type EventHandler, type ListElement, type UIElement } from "../../types";
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
            if (element.onEvent && runEventHandler) {
                await runEventHandler(element.onEvent, { item, index });
            }
        },
        [element, runEventHandler]
    );
    const Row = useCallback(
        ({ index, style }: RowComponentProps) => {
            const item = items[index];

            const isFaq = !!item?.description;
            const hasChildren = Array.isArray(item?.children) && item.children.length > 0;
            const hasMedia = !!item?.media;
            const iconEl: UIElement | null = item?.icon
                ? {
                    ...item.icon,
                    id: `row_icon_${index}`,
                    type: ElementType.icon, // ensure correct renderer
                }
                : null;
            let resolvedChildren: UIElement[] = [];

            /* ------------------------------------------------------
               1️⃣ FAQ MODE
            ------------------------------------------------------ */
            if (isFaq) {
                resolvedChildren = [
                    {
                        id: `faq_question_${index}`,
                        type: ElementType.text,
                        tag: "div",
                        name: "FAQ Question",
                        content: resolveBinding(
                            item.label || item.name || item.title || item.text || item.question,
                            state,
                            t
                        ),
                        styles: {
                            className: "font-semibold text-base mb-1"
                        }
                    },
                    {
                        id: `faq_answer_${index}`,
                        type: ElementType.text,
                        tag: "div",
                        name: "FAQ Answer",
                        content: resolveBinding(item.description, state, t),
                        styles: {
                            className: "text-muted-foreground text-sm leading-relaxed"
                        }
                    }
                ] as any;
            }

            if (hasChildren) {
                resolvedChildren.push(item.children);
            }

            /* ------------------------------------------------------
               3️⃣ MEDIA SUPPORT (image, video, avatar, icon, etc.)
               Example item.media:
               {
                   type: "image",
                   src: "https://img...",
                   alt: "Thumbnail"
               }
            ------------------------------------------------------ */
            if (hasMedia) {
                resolvedChildren.push(...[
                    {
                        id: `media_${index}`,
                        type: ElementType.image,
                        mediaType: item.media.type || "image",
                        src: item.media.src,
                        alt: item.media.alt,
                        className: item.media.className || "w-16 h-16 rounded-md object-cover mb-2",
                    } as any,
                    {
                        id: `media_text_${index}`,
                        type: ElementType.text,
                        tag: "div",
                        content: resolveBinding(
                            item.label || item.name || item.text || item.content,
                            state,
                            t
                        ),
                        styles: {
                            className: "text-base font-medium"
                        }
                    }
                ] as any);
            }
            if (iconEl) {
                resolvedChildren.push(iconEl);
            }

            (element.children as UIElement[])?.length > 0
                ? resolvedChildren.push(...element.children as any)
                : resolvedChildren.push({
                    id: `row_${index}`,
                    type: ElementType.text,
                    tag: "div",
                    content: resolveBinding(
                        item.label || item.name || item.text || item.content,
                        state,
                        t
                    )
                } as any)

            return (
                <div
                    key={index}
                    style={style}
                    className={cn(
                        "flex flex-col cursor-pointer px-4 py-3 border-b last:border-0",
                        "hover:bg-muted/40 transition-colors",
                        element.styles?.className
                    )}
                    onClick={() => handleRowClick(item, index)}
                >
                    <RenderChildren
                        children={resolvedChildren}
                        state={{ ...state, currentItem: item }}
                        setState={setState}
                        runEventHandler={runEventHandler}
                        t={t}
                    />
                </div>
            );
        },
        [items, element, state, t, setState, runEventHandler, handleRowClick]
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
