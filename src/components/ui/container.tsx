"use client";

import * as React from "react";
import { cn, resolveBinding } from "../../lib/utils";
import { ContainerElement, AnyObj } from "../../types";
import { RenderChildren } from "../../schema/RenderChildren";

/**
 * Build Tailwind classes for a container layout
 */
function buildContainerClasses(container: ContainerElement): string {
    const { layout, gap, justify, align, wrap, cols, rows, autoCols, autoRows } = container;

    const base = {
        flex: "flex",
        grid: "grid",
        block: "block",
        row: "flex flex-row",
        column: "flex flex-col",
    }[layout] || "flex";

    const justifyClass = justify ? `justify-${justify}` : "";
    const alignClass = align ? `items-${align}` : "";
    const wrapClass = wrap ? "flex-wrap" : "";
    const gapClass = gap ? (typeof gap === "number" ? `gap-${gap}` : `gap-[${gap}]`) : "";

    const gridCols = cols ? `grid-cols-${cols}` : "";
    const gridRows = rows ? `grid-rows-${rows}` : "";
    const gridAutoCols = autoCols ? `auto-cols-${autoCols}` : "";
    const gridAutoRows = autoRows ? `auto-rows-${autoRows}` : "";

    return cn(
        base,
        justifyClass,
        alignClass,
        wrapClass,
        gapClass,
        gridCols,
        gridRows,
        gridAutoCols,
        gridAutoRows,
        container.styles?.className,
    );
}

/**
 * Merge responsive overrides (sm, md, lg, xl)
 */
function applyResponsiveOverrides(container: ContainerElement): ContainerElement {
    if (!container.responsiveLayout) return container;

    let merged: ContainerElement = { ...container };

    for (const [bp, overrides] of Object.entries(container.responsiveLayout)) {
        if (!overrides) continue;

        // Add Tailwind responsive classes
        const bpPrefix = `${bp}:`;

        if (overrides.layout) {
            merged.styles = {
                ...merged.styles,
                className: cn(merged.styles?.className, `${bpPrefix}${overrides.layout}`),
            };
        }

        if (overrides.gap) {
            merged.styles = {
                ...merged.styles,
                className: cn(
                    merged.styles?.className,
                    typeof overrides.gap === "number"
                        ? `${bpPrefix}gap-${overrides.gap}`
                        : `${bpPrefix}gap-[${overrides.gap}]`
                ),
            };
        }

        if (overrides.justify) {
            merged.styles = {
                ...merged.styles,
                className: cn(merged.styles?.className, `${bpPrefix}justify-${overrides.justify}`),
            };
        }

        if (overrides.align) {
            merged.styles = {
                ...merged.styles,
                className: cn(merged.styles?.className, `${bpPrefix}items-${overrides.align}`),
            };
        }

        if (overrides.cols) {
            merged.styles = {
                ...merged.styles,
                className: cn(merged.styles?.className, `${bpPrefix}grid-cols-${overrides.cols}`),
            };
        }

        if (overrides.rows) {
            merged.styles = {
                ...merged.styles,
                className: cn(merged.styles?.className, `${bpPrefix}grid-rows-${overrides.rows}`),
            };
        }
    }

    return merged;
}

/**
 * Renderer for ContainerElement
 */
export function ContainerRenderer({
    element,
    state = {},
    t = (s) => s,
}: {
    element: ContainerElement;
    state?: AnyObj;
    t?: (s: string) => string;
}) {
    const container = applyResponsiveOverrides(element);
    const classes = buildContainerClasses(container);

    return (
        <div
            id={container.id}
            data-slot="container"
            aria-label={resolveBinding(container.accessibility?.ariaLabel, state, t)}
            aria-hidden={!container.visibility?.show}
            className={classes}
            style={{ zIndex: container.zIndex }}
        >
            {container.children && <RenderChildren children={container.children} />}
        </div>
    );
}
