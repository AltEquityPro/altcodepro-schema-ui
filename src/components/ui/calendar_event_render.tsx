"use client"

import * as React from "react"
import { AnyObj, CalendarEventElement, EventHandler } from "../../types"
import { resolveBinding, cn } from "../../lib/utils"
import { Button } from "./button"

interface CalendarEventRendererProps {
    element: CalendarEventElement
    state: AnyObj
    t: (key: string) => string
    runEventHandler: (
        handler?: EventHandler | undefined,
        dataOverride?: AnyObj
    ) => Promise<void>
}

export function CalendarEventRenderer({
    element,
    state,
    t,
    runEventHandler,
}: CalendarEventRendererProps) {
    const title = resolveBinding(element.title, state, t)
    const startVal = element.start ? new Date(resolveBinding(element.start, state, t)) : null
    const endVal = element.end ? new Date(resolveBinding(element.end, state, t)) : null
    const location = element.location ? resolveBinding(element.location, state, t) : undefined
    const description = element.description ? resolveBinding(element.description, state, t) : undefined
    const btnLabel = element.eventBtnLabel ? resolveBinding(element.eventBtnLabel, state, t) : null

    const handleClick = () => runEventHandler(element.onClick, { id: element.id })

    return (
        <div
            className={cn(
                "rounded-md border bg-card p-3 shadow-sm transition hover:bg-accent/50",
                element.styles?.className
            )}
        >
            <div className="flex flex-col gap-1">
                <h4 className="font-medium leading-none">{title}</h4>
                <div className="text-xs text-muted-foreground">
                    {element.allDay
                        ? "All day"
                        : `${startVal ? startVal.toLocaleString() : ""}${startVal && endVal ? " → " : ""
                        }${endVal ? endVal.toLocaleString() : ""}`}
                </div>
                {location && (
                    <div className="text-xs text-muted-foreground">{location}</div>
                )}
                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
            </div>

            {element.onClick && btnLabel && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                        e.stopPropagation()
                        handleClick()
                    }}
                >
                    {btnLabel}
                </Button>
            )}
        </div>
    )
}
