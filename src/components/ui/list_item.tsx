"use client";

import * as React from "react";
import type { AnyObj, EventHandler, IconElement, ListItemElement } from "../../types";
import { cn, resolveBinding } from "../../lib/utils";
import { DynamicIcon } from "../../components/ui/dynamic-icon";
import { RenderChildren } from "../../schema/RenderChildren";

/* -------------------------------------------------------------------------- */
/*                             ListItemRenderer                               */
/* -------------------------------------------------------------------------- */

export interface ListItemRendererProps {
    element: ListItemElement;
    runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>;
    state: AnyObj;
    t: (key: string) => string;
    selected?: boolean;
    index?: number;
    showDivider?: boolean;
    density?: "comfortable" | "compact";
    onFocusNext?: () => void;
    onFocusPrev?: () => void;
}

export function ListItemRenderer({
    element,
    runEventHandler,
    selected = false,
    index,
    state,
    t,
    showDivider,
    density = "comfortable",
    onFocusNext,
    onFocusPrev,
}: ListItemRendererProps) {
    /* ------------------------------ Text Bindings ----------------------------- */
    const primary = resolveBinding(element.text, state, t) ?? "";

    let secondary: React.ReactNode = null;
    const renderDescObj = (descObj: any, idx: number) => {
        const tag = descObj.tag || "p";
        const Tag: any = tag as keyof JSX.IntrinsicElements;
        const resolvedText = resolveBinding(descObj.content ?? "", state, t);
        if (!resolvedText) return null;
        return (
            <Tag
                key={descObj.id || idx}
                className={cn("mt-0.5 text-muted-foreground", descObj.styles?.className)}
            >
                {resolvedText}
            </Tag>
        );
    };

    if (element.description) {
        if (typeof element.description === "string") {
            const text = resolveBinding(element.description, state, t);
            if (text) secondary = <p className="mt-0.5 text-muted-foreground truncate">{text}</p>;
        } else if (Array.isArray(element.description)) {
            secondary = (
                <div data-desc className="space-y-1">
                    {element.description.map((d, i) => renderDescObj(d, i))}
                </div>
            );
        } else if (typeof element.description === "object") {
            secondary = <div data-desc>{renderDescObj(element.description, 0)}</div>;
        }
    }

    /* ------------------------------- Icon + Click ------------------------------ */
    const iconEl = element.icon as IconElement | undefined;

    const handleActivate = React.useCallback(() => {
        runEventHandler?.(element.onClick, {
            id: element.id,
            index,
            text: primary,
        });
    }, [element, index, primary, runEventHandler]);

    /* ------------------------------ Keyboard Nav ------------------------------ */
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
            case "Enter":
            case " ":
                e.preventDefault();
                handleActivate();
                break;
            case "ArrowDown":
                e.preventDefault();
                onFocusNext?.();
                break;
            case "ArrowUp":
                e.preventDefault();
                onFocusPrev?.();
                break;
        }
    };

    /* ----------------------------- Style Helpers ----------------------------- */
    const basePad = density === "compact" ? "py-2 px-2" : "py-3 px-3";
    const textSizes =
        density === "compact"
            ? "text-sm [&_[data-desc]]:text-xs"
            : "text-base [&_[data-desc]]:text-sm";

    /* --------------------------------- Render -------------------------------- */
    return (
        <div
            role="listitem"
            tabIndex={0}
            aria-selected={selected || undefined}
            onKeyDown={onKeyDown}
            onClick={handleActivate}
            className={cn(
                "group relative cursor-pointer rounded-md outline-none transition-colors",
                basePad,
                "hover:bg-accent/60 focus-visible:ring-[1px] focus-visible:ring-ring/50",
                selected && "bg-accent",
                element.styles?.className
            )}
            data-slot="list-item"
        >
            <div className={cn("flex items-start gap-3", textSizes)}>
                {/* -------------------------- Leading Icon/Child -------------------------- */}
                {iconEl ? (
                    <DynamicIcon
                        name={iconEl.name}
                        className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                    />
                ) : element.children?.length ? (
                    <div className="shrink-0 mt-0.5">
                        <RenderChildren children={element.children} runEventHandler={runEventHandler} />
                    </div>
                ) : null}

                {/* ------------------------------- Text ------------------------------- */}
                <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{primary}</div>
                    {secondary}
                </div>

                {/* ---------------------------- Hover Affordance --------------------------- */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                    ·
                </div>
            </div>

            {showDivider && (
                <div className="pointer-events-none absolute bottom-0 left-3 right-3 border-b border-border" />
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                             Height Estimation                              */
/* -------------------------------------------------------------------------- */
export function estimateItemHeight(
    item: ListItemElement,
    density: "comfortable" | "compact",
    hasChildren: boolean
) {
    const base = density === "compact" ? 40 : 52; // base height
    const hasDescription = !!item.description;
    const descAdd = hasDescription ? (density === "compact" ? 14 : 18) : 0;
    const childAdd = hasChildren ? (density === "compact" ? 10 : 14) : 0;
    return base + descAdd + childAdd;
}
