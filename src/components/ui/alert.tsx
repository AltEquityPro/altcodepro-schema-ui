"use client";
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

export const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-[var(--acp-background)] dark:bg-[var(--acp-background-dark)] text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)] border-[var(--acp-border)] dark:border-[var(--acp-border-dark)]",
        primary:
          "bg-[color-mix(in_srgb,var(--acp-primary)10%,transparent)] text-[var(--acp-primary)] border-[color-mix(in_srgb,var(--acp-primary)30%,transparent)] [&>svg]:text-[var(--acp-primary)]",
        success:
          "bg-[color-mix(in_srgb,green 10%,transparent)] text-green-700 border-green-300 [&>svg]:text-green-600 dark:text-green-100 dark:border-green-700",
        danger:
          "bg-[color-mix(in_srgb,red 10%,transparent)] text-red-700 border-red-300 [&>svg]:text-red-600 dark:text-red-100 dark:border-red-700",
        warning:
          "bg-[color-mix(in_srgb,yellow 10%,transparent)] text-yellow-800 border-yellow-300 [&>svg]:text-yellow-600 dark:text-yellow-100 dark:border-yellow-700",
        info:
          "bg-[color-mix(in_srgb,blue 10%,transparent)] text-blue-800 border-blue-300 [&>svg]:text-blue-600 dark:text-blue-100 dark:border-blue-700",
        destructive:
          "bg-[color-mix(in_srgb,var(--acp-accent)10%,transparent)] text-[var(--acp-accent)] border-[color-mix(in_srgb,var(--acp-accent)40%,transparent)] [&>svg]:text-[var(--acp-accent)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);


function Alert({
  className,
  variant,
  dismissible,
  onClose,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    dismissible?: boolean
    onClose?: () => void
  }) {
  const [open, setOpen] = React.useState(true)

  if (!open) return null

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {children}
      {dismissible && (
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            onClose?.()
          }}
          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
