"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn, resolveBinding } from "@/src/lib/utils"
import wrapWithMotion from "./wrapWithMotion";
import { AnyObj, ProgressElement } from "@/src/types";
function Progress({
  className,
  value,
  indeterminate = false,
  label,
  labelPosition = "outside",
  srOnlyLabel = false,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  value?: number
  indeterminate?: boolean
  label?: string
  labelPosition?: "inside" | "outside" | "none"
  srOnlyLabel?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(
          "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(
            "bg-primary h-full flex-1 transition-all",
            indeterminate && "animate-progress-indeterminate"
          )}
          style={
            indeterminate
              ? undefined
              : { transform: `translateX(-${100 - (value || 0)}%)` }
          }
        >
          {label &&
            labelPosition === "inside" &&
            !srOnlyLabel && (
              <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                {label}
              </span>
            )}
        </ProgressPrimitive.Indicator>
      </ProgressPrimitive.Root>

      {label &&
        labelPosition === "outside" &&
        !srOnlyLabel && (
          <span className="text-xs text-muted-foreground">{label}</span>
        )}

      {label && srOnlyLabel && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  )
}

function ProgressRenderer({
  element,
  state,
  t,
}: {
  element: ProgressElement
  state: AnyObj
  t: (key: string) => string
}) {
  const value = resolveBinding(element.value, state, t)
  const indeterminate =
    resolveBinding(element.indeterminate, state, t) ?? value == null
  const label = element.label ? resolveBinding(element.label, state, t) : '%'

  return wrapWithMotion(
    element,
    <Progress
      value={value}
      indeterminate={indeterminate}
      label={label}
      labelPosition={element.labelPosition}
      srOnlyLabel={resolveBinding(element.srOnlyLabel, state, t)}
      className={element.styles?.className}
    />
  )
}
export { ProgressRenderer, Progress }
