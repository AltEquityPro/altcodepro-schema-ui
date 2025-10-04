"use client"

import * as React from "react"
import type { AnyObj, EventHandler, IconElement, ListItemElement } from "../../types"
import { cn, resolveBinding } from "../../lib/utils"
import { useAppState } from "../../schema/StateContext"
import { DynamicIcon } from "../../components/ui/dynamic-icon"
import { RenderChildren } from "../../schema/RenderChildren"

/** Small helper so this renderer works with or without explicit state/t props */
function useStateAndT(
    incomingState?: AnyObj,
    incomingT?: (k: string) => string
) {
    try {
        const ctx = useAppState()
        return {
            state: incomingState ?? ctx.state,
            t: incomingT ?? ctx.t,
        }
    } catch {
        return {
            state: incomingState ?? {},
            t: incomingT ?? ((k: string) => k),
        }
    }
}

export interface ListItemRendererProps {
    element: ListItemElement
    runEventHandler: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
    /** Optional – falls back to AppState if not provided */
    state?: AnyObj
    t?: (key: string) => string
    /** Visual state controlled by parent list (selection, focus, density, dividers, etc.) */
    selected?: boolean
    index?: number
    showDivider?: boolean
    density?: "comfortable" | "compact"
    onFocusNext?: () => void
    onFocusPrev?: () => void
}

export function ListItemRenderer(props: ListItemRendererProps) {
    const {
        element,
        runEventHandler,
        selected = false,
        index,
        showDivider,
        density = "comfortable",
        onFocusNext,
        onFocusPrev,
    } = props

    const { state, t } = useStateAndT(props.state, props.t)

    // Resolve bindings
    const primary = resolveBinding(element.text, state, t) ?? ""
    const secondary =
        element.description ? resolveBinding(element.description, state, t) : undefined

    // icon: either IconElement schema or render children prefix
    const iconEl = element.icon as IconElement | undefined

    const handleActivate = () =>
        runEventHandler(element.onClick, {
            id: element.id,
            index,
            text: primary,
            description: secondary,
        })

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleActivate()
        } else if (e.key === "ArrowDown") {
            e.preventDefault()
            onFocusNext?.()
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            onFocusPrev?.()
        }
    }

    const basePad = density === "compact" ? "py-2 px-2" : "py-3 px-3"
    const textSizes =
        density === "compact"
            ? "text-sm [&_[data-desc]]:text-xs"
            : "text-base [&_[data-desc]]:text-sm"

    return (
        <div
            role="listitem"
            tabIndex={0}
            aria-selected={selected || undefined}
            onKeyDown={onKeyDown}
            onClick={handleActivate}
            className={cn(
                "group relative cursor-pointer rounded-md outline-none",
                basePad,
                "hover:bg-accent/60 focus-visible:ring-[1px] focus-visible:ring-ring/50",
                selected && "bg-accent",
                element.styles?.className
            )}
            data-slot="list-item"
        >
            <div className={cn("flex items-start gap-3", textSizes)}>
                {/* Leading icon / custom child */}
                {iconEl ? (
                    <DynamicIcon
                        name={(iconEl as any).name}
                        className={cn("mt-0.5 h-5 w-5 shrink-0 text-muted-foreground")}
                    />
                ) : element.children?.length ? (
                    <div className="shrink-0 mt-0.5">
                        <RenderChildren children={element.children} />
                    </div>
                ) : null}

                {/* Texts */}
                <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{primary}</div>
                    {secondary ? (
                        <div data-desc className="mt-0.5 truncate text-muted-foreground">
                            {secondary}
                        </div>
                    ) : null}
                </div>

                {/* Trailing affordance (optional chevron) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                    {/* minimalist disclosure affordance; replace with icon if you prefer */}
                    ·
                </div>
            </div>

            {showDivider && (
                <div className="pointer-events-none absolute bottom-0 left-3 right-3 border-b border-border" />
            )}
        </div>
    )
}

/**
 * A small utility used by ListRenderer to estimate row height for variable content.
 * This keeps virtualization smooth without DOM measuring.
 */
export function estimateItemHeight(
    item: ListItemElement,
    density: "comfortable" | "compact",
    hasChildren: boolean
) {
    const base = density === "compact" ? 40 : 52 // base height (title only)
    const hasDescription = !!item.description
    const descAdd = hasDescription ? (density === "compact" ? 14 : 18) : 0
    const childAdd = hasChildren ? (density === "compact" ? 10 : 14) : 0
    return base + descAdd + childAdd
}
