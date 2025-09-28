"use client"

import * as React from "react"
import { useMemo, useRef, useEffect, useState } from "react"
import { cn, resolveBinding } from "@/src/lib/utils"
import type { AnyObj, EventHandler, TimelineElement } from "@/src/types"
import { useAppState } from "@/src/schema/StateContext"
import { useActionHandler } from "@/src/schema/Actions"
import {
    CalendarClock,
    CheckCircle2,
    Clock,
    Flag,
    Info,
    Loader2,
    Mail,
    MapPin,
    PlayCircle,
    Rocket,
    Star,
    User,
    Bell,
    Circle,
} from "lucide-react"
import { Button } from "./button"

const ICONS: Record<string, React.ComponentType<any>> = {
    clock: Clock,
    calendar: CalendarClock,
    check: CheckCircle2,
    flag: Flag,
    info: Info,
    mail: Mail,
    map: MapPin,
    play: PlayCircle,
    rocket: Rocket,
    star: Star,
    user: User,
    bell: Bell,
    circle: Circle,
}

function resolveIcon(name?: string) {
    if (!name) return Circle
    const key = String(name).toLowerCase().trim()
    return ICONS[key] || Circle
}

/* -------------------------------------------------------------------------- */
/*                               Time Utilities                                */
/* -------------------------------------------------------------------------- */

function parseDate(d?: any) {
    if (!d) return null
    const dt = new Date(d)
    return isNaN(dt.getTime()) ? null : dt
}

function formatGroup(ts: Date, mode: "day" | "month" | "year" | "none") {
    if (mode === "none") return ""
    if (mode === "year") return String(ts.getFullYear())
    if (mode === "month") {
        return ts.toLocaleString(undefined, { month: "long", year: "numeric" })
    }
    // day
    return ts.toLocaleDateString()
}

/* -------------------------------------------------------------------------- */
/*                             Renderer Component                              */
/* -------------------------------------------------------------------------- */

interface TimelineRendererProps {
    element: TimelineElement
    state?: AnyObj
    t?: (key: string) => string
    runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
}

export function TimelineRenderer(props: TimelineRendererProps) {
    // Self-wire if not provided
    const ctx = (() => {
        try {
            return useAppState()
        } catch {
            return null
        }
    })()
    const {
        state = ctx?.state ?? {},
        t = ctx?.t ?? ((k: string) => k),
    } = props

    const actionCtx = (() => {
        try {
            return useActionHandler({ runtime: {}, globalConfig: undefined, screen: undefined })
        } catch {
            return null
        }
    })()
    const runEvent =
        props.runEventHandler ??
        actionCtx?.runEventHandler ??
        (async () => {
            /* no-op */
        })

    const el = props.element

    // Resolve booleans/bindings
    const resolvedLoading = Boolean(
        typeof el.loading === "object" ? resolveBinding(el.loading, state, t) : el.loading
    )
    const emptyText = resolveBinding(el.emptyText, state, t) || (t("timeline.empty") || "No items yet")

    const hasMore = Boolean(
        typeof el.hasMore === "object" ? resolveBinding(el.hasMore, state, t) : el.hasMore
    )

    const orientation = el.orientation ?? "vertical"
    const align = el.align ?? (orientation === "vertical" ? "alternate" : "center")
    const compact = el.compact ?? false
    const showTimeAxis = el.showTimeAxis ?? (orientation === "vertical")
    const showNowMarker = el.showNowMarker ?? true
    const groupBy = el.groupBy ?? "none"
    const sort = el.sort ?? "desc"

    // Hydrate items: prefer dataSourceId
    const rawItems: AnyObj[] = useMemo(() => {
        const ds = el.dataSourceId ? state[el.dataSourceId] : null
        if (Array.isArray(ds)) return ds
        return el.items || []
    }, [el.dataSourceId, el.items, state])

    // Resolve bindings per item
    const items = useMemo(() => {
        const mapped = rawItems.map((it: AnyObj, idx: number) => {
            const title = resolveBinding(it.title, state, t)
            const description = resolveBinding(it.description, state, t)
            const tsRaw = resolveBinding(it.timestamp, state, t)
            const ts = parseDate(tsRaw)
            const icon = resolveBinding(it.icon, state, t)
            const color = resolveBinding(it.color, state, t)
            const badge = resolveBinding(it.badge, state, t)
            const meta = resolveBinding(it.meta, state, t)
            const disabled = typeof it.disabled === "object" ? !!resolveBinding(it.disabled, state, t) : !!it.disabled

            return {
                ...it,
                id: it.id ?? String(idx),
                title,
                description,
                timestamp: ts,
                timestampRaw: tsRaw,
                icon,
                color,
                badge,
                meta,
                disabled,
            }
        })

        // sort by timestamp
        const withTime = mapped.filter((m) => m.timestamp)
        const withoutTime = mapped.filter((m) => !m.timestamp)
        withTime.sort((a: any, b: any) =>
            sort === "asc"
                ? (a.timestamp as Date).getTime() - (b.timestamp as Date).getTime()
                : (b.timestamp as Date).getTime() - (a.timestamp as Date).getTime()
        )
        return [...withTime, ...withoutTime]
    }, [rawItems, sort, state, t])

    // Grouping
    const grouped = useMemo(() => {
        if (groupBy === "none") return [{ key: "", items }]
        const map = new Map<string, AnyObj[]>()
        items.forEach((it) => {
            const key = it.timestamp ? formatGroup(it.timestamp, groupBy) : t("timeline.ungrouped") || "Other"
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(it)
        })
        return Array.from(map.entries()).map(([key, list]) => ({ key, items: list }))
    }, [items, groupBy, t])

    // Focus ring & keyboard navigation
    const containerRef = useRef<HTMLDivElement>(null)
    const [focusIndex, setFocusIndex] = useState<number>(-1)

    useEffect(() => {
        if (focusIndex < 0) return
        const node = containerRef.current?.querySelector<HTMLElement>(`[data-ti="${focusIndex}"]`)
        node?.focus()
        node?.scrollIntoView({ block: "nearest", inline: "nearest" })
    }, [focusIndex])

    const flatItems: AnyObj[] = useMemo(
        () => grouped.flatMap((g) => g.items),
        [grouped]
    )

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!flatItems.length) return
        if (e.key === "ArrowDown" || (orientation === "horizontal" && e.key === "ArrowRight")) {
            e.preventDefault()
            setFocusIndex((i) => Math.min(i + 1, flatItems.length - 1))
        } else if (e.key === "ArrowUp" || (orientation === "horizontal" && e.key === "ArrowLeft")) {
            e.preventDefault()
            setFocusIndex((i) => Math.max(i - 1, 0))
        }
    }

    // Styles
    const isVertical = orientation === "vertical"
    const altAlign = align === "alternate"
    const baseGap = compact ? "gap-2" : "gap-4"

    /* --------------------------------- Render -------------------------------- */

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
            {/* Vertical axis & Now marker */}
            {isVertical && showTimeAxis && (
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border pointer-events-none" aria-hidden />
            )}
            {isVertical && showTimeAxis && showNowMarker && (
                <NowMarker />
            )}

            {/* Loading state */}
            {resolvedLoading && (
                <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("loading") || "Loading…"}
                </div>
            )}

            {/* Empty state */}
            {!resolvedLoading && flatItems.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">
                    {emptyText}
                </div>
            )}

            {/* Groups */}
            {grouped.map((group, gi) => (
                <div key={`grp-${gi}`} className={cn("flex w-full", isVertical ? "flex-col" : "flex-row items-stretch")}>
                    {groupBy !== "none" && (
                        <GroupHeader
                            label={group.key}
                            orientation={orientation}
                            compact={compact}
                        />
                    )}

                    <div
                        className={cn(
                            "flex",
                            isVertical ? "flex-col" : "flex-row",
                            baseGap
                        )}
                    >
                        {group.items.map((it, idxInGroup) => {
                            const globalIndex = grouped.slice(0, gi).reduce((acc, g) => acc + g.items.length, 0) + idxInGroup
                            const Icon = resolveIcon(it.icon)
                            const side =
                                !isVertical ? "center"
                                    : altAlign ? (globalIndex % 2 === 0 ? "left" : "right")
                                        : align

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
                                    onKeyDown={(e) => {
                                        if ((e.key === "Enter" || e.key === " ") && !it.disabled) {
                                            e.preventDefault()
                                            handleItemClick(runEvent, el, it)
                                        }
                                    }}
                                    onClick={() => !it.disabled && handleItemClick(runEvent, el, it)}
                                >
                                    <TimelineItem
                                        item={it}
                                        side={side}
                                        vertical={isVertical}
                                        showAxis={showTimeAxis}
                                        compact={compact}
                                        Icon={Icon}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}

            {/* Load more */}
            {!resolvedLoading && hasMore && (
                <div className={cn("flex justify-center", isVertical ? "mt-3" : "mt-0 ml-3")}>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runEvent(el.onLoadMore, { id: el.id })}
                    >
                        {t("load_more") || "Load more"}
                    </Button>
                </div>
            )}
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/*                                Subcomponents                                */
/* -------------------------------------------------------------------------- */

function GroupHeader({
    label,
    orientation,
    compact,
}: {
    label: string
    orientation: "horizontal" | "vertical"
    compact: boolean
}) {
    if (!label) return null
    const pad = compact ? "py-1" : "py-2"
    return orientation === "vertical" ? (
        <div className={cn("pl-14", pad)}>
            <div className="text-xs font-medium text-muted-foreground">{label}</div>
        </div>
    ) : (
        <div className={cn("pr-3", pad)}>
            <div className="text-xs font-medium text-muted-foreground">{label}</div>
        </div>
    )
}

function TimelineItem({
    item,
    side,
    vertical,
    showAxis,
    compact,
    Icon,
}: {
    item: AnyObj
    side: "left" | "right" | "alternate" | "center"
    vertical: boolean
    showAxis: boolean
    compact: boolean
    Icon: React.ComponentType<any>
}) {
    const timestampText =
        item.timestamp instanceof Date
            ? item.timestamp.toLocaleString()
            : item.timestampRaw || ""

    const dotColor = item.color || "var(--primary)"

    if (vertical) {
        // Vertical layout
        return (
            <div
                className={cn(
                    "grid grid-cols-[1fr_auto_1fr] items-start",
                    compact ? "gap-2" : "gap-3",
                    side === "left" && "text-right",
                    side === "right" && "text-left"
                )}
            >
                {/* Left content (when side = left) */}
                <div className={cn("min-w-0", side === "right" && "opacity-0 pointer-events-none select-none")}>
                    <ItemCard item={item} timestampText={timestampText} align="right" compact={compact} />
                </div>

                {/* Axis + dot */}
                <div className="relative flex flex-col items-center">
                    {showAxis && <div className="w-px flex-1 bg-border" aria-hidden />}
                    <div
                        className="relative z-10 grid place-items-center"
                        aria-hidden
                    >
                        <div
                            className="w-2.5 h-2.5 rounded-full ring-4 ring-background"
                            style={{ backgroundColor: dotColor }}
                        />
                        <Icon className="absolute -top-6 h-4 w-4 text-muted-foreground" />
                    </div>
                    {showAxis && <div className="w-px flex-1 bg-border" aria-hidden />}
                </div>

                {/* Right content (when side = right) */}
                <div className={cn("min-w-0", side === "left" && "opacity-0 pointer-events-none select-none")}>
                    <ItemCard item={item} timestampText={timestampText} align="left" compact={compact} />
                </div>
            </div>
        )
    }

    // Horizontal layout
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
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground">
                        {item.badge}
                    </span>
                )}
                {item.meta && (
                    <span className="text-[10px] text-muted-foreground">{item.meta}</span>
                )}
            </div>
            <div className={cn("mt-2 w-full")}>
                <ItemCard item={item} timestampText={timestampText} align="left" compact={compact} />
            </div>
        </div>
    )
}

function ItemCard({
    item,
    timestampText,
    align,
    compact,
}: {
    item: AnyObj
    timestampText: string
    align: "left" | "right"
    compact: boolean
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
                    {item.title && (
                        <div className="font-medium truncate">{item.title}</div>
                    )}
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
                    {item.badge && (
                        <span className="px-1.5 py-0.5 rounded bg-muted">{item.badge}</span>
                    )}
                    {item.meta && <span className="text-muted-foreground">{item.meta}</span>}
                </div>
            )}
        </div>
    )
}

function NowMarker() {
    // simple visual marker; could be tied to current time for advanced use
    return (
        <div
            className="absolute left-[0.875rem] top-1 w-1.5 h-1.5 rounded-full bg-destructive shadow"
            title="Now"
            aria-label="Now"
        />
    )
}

/* -------------------------------------------------------------------------- */
/*                                Event Helpers                                */
/* -------------------------------------------------------------------------- */

async function handleItemClick(
    runEvent: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>,
    el: TimelineElement,
    item: AnyObj
) {
    // Prefer item.onClick, fallback to element.onItemClick
    if (item.onClick) {
        await runEvent(item.onClick, { id: item.id })
        return
    }
    if (el.onItemClick) {
        await runEvent(el.onItemClick, { id: item.id })
    }
}
