"use client";
import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"
const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--acp-primary)]",
  {
    variants: {
      variant: {
        default: "bg-transparent text-[var(--acp-foreground)] hover:bg-[color-mix(in_srgb,var(--acp-primary)10%,transparent)]",
        outline:
          "border border-[var(--acp-border)] text-[var(--acp-foreground)] bg-transparent hover:bg-[color-mix(in_srgb,var(--acp-primary)10%,transparent)]",
      },
      size: {
        sm: "h-8 px-1.5 min-w-8",
        default: "h-9 px-2 min-w-9",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
