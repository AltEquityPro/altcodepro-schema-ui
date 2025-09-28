"use client";
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn, resolveBinding } from "../../lib/utils"
import { useActionHandler } from "../../schema/Actions"
import { ElementResolver } from "../../schema/ElementResolver"
import { useAppState } from "../../schema/StateContext"
import { AnyObj, BadgeElement, UIElement } from "../../types"
import { Tooltip, TooltipTrigger, TooltipContent } from "../../components/ui/tooltip"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}
interface BadgeRendererProps {
  element: BadgeElement
  runtime?: AnyObj
}

function BadgeRenderer({ element, runtime = {} }: BadgeRendererProps) {
  const { state, t } = useAppState()
  const { runEventHandler } = useActionHandler({ runtime })

  const label = resolveBinding(element.text ?? element.value ?? element.name, state, t)

  const content = element.isDot ? (
    <span className="size-2 rounded-full bg-current" />
  ) : (
    <>
      {element.iconLeft && <ElementResolver element={element.iconLeft as UIElement} runtime={runtime} />}
      {element.maxLength && label?.length > element.maxLength
        ? label.slice(0, element.maxLength) + "…"
        : label}
      {element.iconRight && <ElementResolver element={element.iconRight as UIElement} runtime={runtime} />}
    </>
  )

  const badgeNode = (
    <Badge
      variant={element.variant}
      asChild={element.asChild}
      className={cn(
        element.size === "sm" && "px-1.5 py-0 text-[10px]",
        element.size === "lg" && "px-3 py-1.5 text-sm"
      )}
      onClick={element.onClick ? () => runEventHandler(element.onClick) : undefined}
    >
      {content || "Badge"}
    </Badge>
  )

  if (element.tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badgeNode}</TooltipTrigger>
        <TooltipContent>{resolveBinding(element.tooltip, state, t)}</TooltipContent>
      </Tooltip>
    )
  }

  return badgeNode
}
export { BadgeRenderer, Badge, badgeVariants }
