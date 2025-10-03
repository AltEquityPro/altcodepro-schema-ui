"use client";

import * as React from "react";
import {
    cn,
    isVisible,
    classesFromStyleProps,
    getAccessibilityProps,
} from "../../lib/utils";
import { ContainerElement, AnyObj, ActionRuntime } from "../../types";
import { RenderChildren } from "../../schema/RenderChildren";

/**
 * Build Tailwind classes for a container layout
 */
function buildContainerClasses(container: ContainerElement): string {
    const { layout, gap, justify, align, wrap, cols, rows, autoCols, autoRows } =
        container;

    const base = {
        flex: "flex",
        grid: "grid",
        block: "block",
        row: "flex flex-row",
        column: "flex flex-col",
    }[layout] || "flex";

    const defaults = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6";

    const justifyClass = justify ? `justify-${justify}` : "";
    const alignClass = align ? `items-${align}` : "";
    const wrapClass = wrap ? "flex-wrap" : "";
    const gapClass = gap
        ? typeof gap === "number"
            ? `gap-${gap}`
            : `gap-[${gap}]`
        : "";

    const gridCols = cols ? `grid-cols-${cols}` : "";
    const gridRows = rows ? `grid-rows-${rows}` : "";
    const gridAutoCols = autoCols ? `auto-cols-${autoCols}` : "";
    const gridAutoRows = autoRows ? `auto-rows-${autoRows}` : "";

    return cn(
        defaults,
        base,
        justifyClass,
        alignClass,
        wrapClass,
        gapClass,
        gridCols,
        gridRows,
        gridAutoCols,
        gridAutoRows,
        classesFromStyleProps(container.styles)
    );
}

/**
 * Merge responsive overrides (sm, md, lg, xl)
 */
function applyResponsiveOverrides(
    container: ContainerElement
): ContainerElement {
    if (!container.responsiveLayout) return container;

    // clone to avoid mutation
    let merged: ContainerElement = { ...container, ...container.styles };

    for (const [bp, overrides] of Object.entries(container.responsiveLayout)) {
        if (!overrides) continue;
        const bpPrefix = `${bp}:`;

        if (overrides.layout) {
            merged.styles!.className = cn(
                merged.styles?.className,
                `${bpPrefix}${overrides.layout}`
            );
        }
        if (overrides.gap) {
            merged.styles!.className = cn(
                merged.styles?.className,
                typeof overrides.gap === "number"
                    ? `${bpPrefix}gap-${overrides.gap}`
                    : `${bpPrefix}gap-[${overrides.gap}]`
            );
        }
        if (overrides.justify) {
            merged.styles!.className = cn(
                merged.styles?.className,
                `${bpPrefix}justify-${overrides.justify}`
            );
        }
        if (overrides.align) {
            merged.styles!.className = cn(
                merged.styles?.className,
                `${bpPrefix}items-${overrides.align}`
            );
        }
        if (overrides.cols) {
            merged.styles!.className = cn(
                merged.styles?.className,
                `${bpPrefix}grid-cols-${overrides.cols}`
            );
        }
        if (overrides.rows) {
            merged.styles!.className = cn(
                merged.styles?.className,
                `${bpPrefix}grid-rows-${overrides.rows}`
            );
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
    runtime

}: {
    element: ContainerElement;
    state?: AnyObj;
    runtime: ActionRuntime;
    t?: (s: string) => string;
}) {
    const container = applyResponsiveOverrides(element);

    if (!isVisible(container.visibility, state, t)) return null;

    const classes = buildContainerClasses(container);
    const accessibilityProps = getAccessibilityProps(
        container.accessibility,
        state,
        t
    );

    return (
        <div
            id={container.id}
            data-slot="container"
            className={classes}
            style={{
                zIndex: container.zIndex,
            }}
            {...accessibilityProps}
        >
            {container.children && (
                <RenderChildren children={container.children} runtime={runtime} />
            )}
        </div>
    );
}
