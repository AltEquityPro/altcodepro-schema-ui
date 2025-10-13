"use client";

import * as React from "react";
import { useMemo, useRef, useEffect, useState } from "react";
import { cn, resolveBinding } from "../../lib/utils";
import type { AnyObj, EventHandler, TimelineElement } from "../../types";
import { Button } from "./button";
import { Loader2 } from "lucide-react";
import { DynamicIcon } from "./dynamic-icon";

/* ------------------------------ Utilities ------------------------------ */
function parseDate(d?: any) {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
}

function formatGroup(ts: Date, mode: "day" | "month" | "year" | "none") {
    if (mode === "none") return "";
    if (mode === "year") return String(ts.getFullYear());
    if (mode === "month")
        return ts.toLocaleString(undefined, { month: "long", year: "numeric" });
    return ts.toLocaleDateString();
}

/* ----------------------------- Main Renderer ----------------------------- */
interface TimelineRendererProps {
    element: TimelineElement;
    state: AnyObj;
    t: (key: string) => string;
    runEventHandler?: (
        handler?: EventHandler,
        dataOverride?: AnyObj
    ) => Promise<void>;
}

export function TimelineRenderer({
    element: el,
    t,
    state,
    runEventHandler,
}: TimelineRendererProps) {
    const resolvedLoading = Boolean(
        typeof el.loading === "object" ? resolveBinding(el.loading, state, t) : el.loading
    );
    const emptyText =
        resolveBinding(el.emptyText, state, t) || t("timeline.empty") || "No items yet";
    const hasMore = Boolean(
        typeof el.hasMore === "object" ? resolveBinding(el.hasMore, state, t) : el.hasMore
    );

    const orientation = el.orientation ?? "vertical";
    const align = el.align ?? (orientation === "vertical" ? "alternate" : "center");
    const compact = el.compact ?? false;
    const showTimeAxis = el.showTimeAxis ?? orientation === "vertical";
    const showNowMarker = el.showNowMarker ?? true;
    const groupBy = el.groupBy ?? "none";
    const sort = el.sort ?? "desc";

    // Hydrate items
    const rawItems = useMemo(() => {
        const ds = el.dataSourceId ? state[el.dataSourceId] : null;
        return Array.isArray(ds) ? ds : el.items || [];
    }, [el.dataSourceId, el.items, state]);

    const items = useMemo(() => {
        const mapped = rawItems.map((it: any, idx: number) => {
            const title = resolveBinding(it.title, state, t);
            const description = resolveBinding(it.description, state, t);
            const tsRaw = resolveBinding(it.timestamp, state, t);
            const ts = parseDate(tsRaw);
            return {
                ...it,
                id: it.id ?? `tl-${idx}`,
                title,
                description,
                timestamp: ts,
                timestampRaw: tsRaw,
                icon: resolveBinding(it.icon, state, t),
                color: resolveBinding(it.color, state, t),
                badge: resolveBinding(it.badge, state, t),
                meta: resolveBinding(it.meta, state, t),
                disabled:
                    typeof it.disabled === "object"
                        ? !!resolveBinding(it.disabled, state, t)
                        : !!it.disabled,
            };
        });

        // Sort by time
        const withTime = mapped.filter((m) => m.timestamp);
        const withoutTime = mapped.filter((m) => !m.timestamp);
        withTime.sort((a, b) =>
            sort === "asc"
                ? (a.timestamp as Date).getTime() - (b.timestamp as Date).getTime()
                : (b.timestamp as Date).getTime() - (a.timestamp as Date).getTime()
        );
        return [...withTime, ...withoutTime];
    }, [rawItems, sort, state, t]);

    const grouped = useMemo(() => {
        if (groupBy === "none") return [{ key: "", items }];
        const map = new Map<string, AnyObj[]>();
        items.forEach((it) => {
            const key = it.timestamp
                ? formatGroup(it.timestamp, groupBy)
                : t("timeline.ungrouped") || "Other";
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(it);
        });
        return Array.from(map.entries()).map(([key, list]) => ({ key, items: list }));
    }, [items, groupBy, t]);

    /* ------------------------ Accessibility + Nav ------------------------ */
    const containerRef = useRef<HTMLDivElement>(null);
    const [focusIndex, setFocusIndex] = useState(-1);
    const flatItems = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

    useEffect(() => {
        if (focusIndex < 0) return;
        const node = containerRef.current?.querySelector<HTMLElement>(
            `[data-ti="${focusIndex}"]`
        );
        node?.focus();
        node?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }, [focusIndex]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!flatItems.length) return;
        if (e.key === "ArrowDown" || (orientation === "horizontal" && e.key === "ArrowRight")) {
            e.preventDefault();
            setFocusIndex((i) => Math.min(i + 1, flatItems.length - 1));
        } else if (e.key === "ArrowUp" || (orientation === "horizontal" && e.key === "ArrowLeft")) {
            e.preventDefault();
            setFocusIndex((i) => Math.max(i - 1, 0));
        }
    };

    const isVertical = orientation === "vertical";
    const altAlign = align === "alternate";
    const baseGap = compact ? "gap-2" : "gap-4";

    /* ------------------------------- Render ------------------------------- */
    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full",
                isVertical ? "flex flex-col" : "flex overflow-x-auto snap-x snap-mandatory",
                el.styles?.className
            )}
            role="list"
            aria-busy={resolvedLoading ? "true" : "false"}
            tabIndex={0}
            onKeyDown={onKeyDown}
        >
            {/* Axis + Marker */}
            {isVertical && showTimeAxis && (
                <>
                    <div
                        className="absolute left-4 top-0 bottom-0 w-px bg-border pointer-events-none"
                        aria-hidden
                    />
                    {showNowMarker && <NowMarker />}
                </>
            )}

            {/* Loading / Empty */}
            {resolvedLoading && (
                <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("loading") || "Loading…"}
                </div>
            )}
            {!resolvedLoading && flatItems.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">{emptyText}</div>
            )}

            {/* Groups */}
            {grouped.map((group, gi) => (
                <div
                    key={`grp-${gi}-${group.key}`}
                    className={cn("flex w-full", isVertical ? "flex-col" : "flex-row items-stretch")}
                >
                    {groupBy !== "none" && (
                        <GroupHeader label={group.key} orientation={orientation} compact={compact} />
                    )}
                    <div className={cn("flex", isVertical ? "flex-col" : "flex-row", baseGap)}>
                        {group.items.map((it, idxInGroup) => {
                            const globalIndex =
                                grouped.slice(0, gi).reduce((acc, g) => acc + g.items.length, 0) + idxInGroup;
                            const side =
                                !isVertical
                                    ? "center"
                                    : altAlign
                                        ? globalIndex % 2 === 0
                                            ? "left"
                                            : "right"
                                        : align;

                            return (
                                <div
                                    key={it.id}
                                    data-ti={globalIndex}
                                    role="listitem"
                                    tabIndex={0}
                                    className={cn(
                                        "relative outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-md",
                                        isVertical ? "min-h-0" : "snap-start"
                                    )}
                                    onClick={async () => {
                                        if (it.disabled) return;
                                        await runEventHandler?.(it.onClick || el.onItemClick, it);
                                    }}
                                    onKeyDown={async (e) => {
                                        if ((e.key === "Enter" || e.key === " ") && !it.disabled) {
                                            e.preventDefault();
                                            await runEventHandler?.(it.onClick || el.onItemClick, it);
                                        }
                                    }}
                                >
                                    <TimelineItem
                                        item={it}
                                        side={side}
                                        vertical={isVertical}
                                        showAxis={showTimeAxis}
                                        compact={compact}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Load More */}
            {!resolvedLoading && hasMore && el.onLoadMore && (
                <div className={cn("flex justify-center", isVertical ? "mt-3" : "mt-0 ml-3")}>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => await runEventHandler?.(el.onLoadMore)}
                    >
                        {t("load_more") || "Load more"}
                    </Button>
                </div>
            )}
        </div>
    );
}

/* ----------------------------- Subcomponents ----------------------------- */

function GroupHeader({
    label,
    orientation,
    compact,
}: {
    label: string;
    orientation: "horizontal" | "vertical";
    compact: boolean;
}) {
    if (!label) return null;
    const pad = compact ? "py-1" : "py-2";
    return orientation === "vertical" ? (
        <div className={cn("pl-14", pad)}>
            <div className="text-xs font-medium text-muted-foreground">{label}</div>
        </div>
    ) : (
        <div className={cn("pr-3", pad)}>
            <div className="text-xs font-medium text-muted-foreground">{label}</div>
        </div>
    );
}

function TimelineItem({
    item,
    side,
    vertical,
    showAxis,
    compact,
}: {
    item: AnyObj;
    side: "left" | "right" | "alternate" | "center";
    vertical: boolean;
    showAxis: boolean;
    compact: boolean;
}) {
    const timestampText =
        item.timestamp instanceof Date
            ? item.timestamp.toLocaleString()
            : item.timestampRaw || "";
    const dotColor = item.color || "var(--primary)";

    if (vertical) {
        return (
            <div
                className={cn(
                    "grid grid-cols-[1fr_auto_1fr] items-start",
                    compact ? "gap-2" : "gap-3",
                    side === "left" && "text-right",
                    side === "right" && "text-left"
                )}
            >
                {/* Left */}
                <div
                    className={cn(
                        "min-w-0",
                        side === "right" && "opacity-0 pointer-events-none select-none"
                    )}
                >
                    <ItemCard item={item} timestampText={timestampText} align="right" compact={compact} />
                </div>

                {/* Axis + Dot */}
                <div className="relative flex flex-col items-center">
                    {showAxis && <div className="w-px flex-1 bg-border" aria-hidden />}
                    <div className="relative z-10 grid place-items-center" aria-hidden>
                        <div
                            className="w-2.5 h-2.5 rounded-full ring-4 ring-background"
                            style={{ backgroundColor: dotColor }}
                        />
                        <DynamicIcon
                            name={item.icon}
                            className="absolute -top-6 h-4 w-4 text-muted-foreground"
                        />
                    </div>
                    {showAxis && <div className="w-px flex-1 bg-border" aria-hidden />}
                </div>

                {/* Right */}
                <div
                    className={cn(
                        "min-w-0",
                        side === "left" && "opacity-0 pointer-events-none select-none"
                    )}
                >
                    <ItemCard item={item} timestampText={timestampText} align="left" compact={compact} />
                </div>
            </div>
        );
    }

    // Horizontal
    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-start px-4",
                compact ? "py-2" : "py-3",
                "min-w-[280px]"
            )}
        >
            <div className="flex items-center gap-2">
                <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: dotColor }}
                    aria-hidden
                />
                <DynamicIcon name={item.icon} className="h-4 w-4 text-muted-foreground" aria-hidden />
                {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground">
                        {item.badge}
                    </span>
                )}
                {item.meta && <span className="text-[10px] text-muted-foreground">{item.meta}</span>}
            </div>
            <div className="mt-2 w-full">
                <ItemCard item={item} timestampText={timestampText} align="left" compact={compact} />
            </div>
        </div>
    );
}

function ItemCard({
    item,
    timestampText,
    align,
    compact,
}: {
    item: AnyObj;
    timestampText: string;
    align: "left" | "right";
    compact: boolean;
}) {
    return (
        <div
            className={cn(
                "rounded-md border bg-card shadow-xs",
                compact ? "px-3 py-2" : "px-4 py-3",
                "max-w-[42rem] inline-block text-left"
            )}
            aria-disabled={item.disabled ? "true" : "false"}
        >
            <div className={cn("flex items-start justify-between", compact ? "gap-2" : "gap-3")}>
                <div className="min-w-0">
                    {item.title && <div className="font-medium truncate">{item.title}</div>}
                    {item.description && (
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {item.description}
                        </div>
                    )}
                </div>
                {timestampText && (
                    <div className="text-[10px] text-muted-foreground whitespace-nowrap pl-2">
                        {timestampText}
                    </div>
                )}
            </div>
            {(item.badge || item.meta) && (
                <div className="mt-1 flex items-center gap-2 text-[10px]">
                    {item.badge && <span className="px-1.5 py-0.5 rounded bg-muted">{item.badge}</span>}
                    {item.meta && <span className="text-muted-foreground">{item.meta}</span>}
                </div>
            )}
        </div>
    );
}

function NowMarker() {
    return (
        <div
            className="absolute left-[0.875rem] top-1 w-1.5 h-1.5 rounded-full bg-destructive shadow"
            title="Now"
            aria-label="Now"
        />
    );
}
