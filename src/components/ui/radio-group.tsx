"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn, resolveBinding } from "../../lib/utils"
import { AnyObj, EventHandler, RadioGroupElement } from "../../types"
import wrapWithMotion from "./wrapWithMotion"
import { Label } from "@radix-ui/react-label"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

function RadioGroupRenderer({
  element,
  state,
  t,
  runEventHandler,
}: {
  element: RadioGroupElement
  state: AnyObj
  t: (key: string) => string
  runEventHandler: (
    handler?: EventHandler,
    dataOverride?: AnyObj
  ) => Promise<void>
}) {
  const value = resolveBinding(element.value, state, t)
  const options = resolveBinding(element.options, state, t) || []

  return wrapWithMotion(
    element,
    <RadioGroup
      value={value}
      onValueChange={(v) =>
        runEventHandler(element.onChange, { value: v })
      }
      className={element.styles?.className}
    >
      {options.map((opt: any) => {
        const id = `${element.id}-${opt.value}`
        return (
          <div key={opt.value} className="flex items-center space-x-2">
            <RadioGroupItem value={opt.value} id={id} />
            <Label htmlFor={id}>{resolveBinding(opt.label, state, t)}</Label>
          </div>
        )
      })}
    </RadioGroup>
  )
}
export { RadioGroupRenderer, RadioGroup, RadioGroupItem }
