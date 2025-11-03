"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import {
  cn,
  resolveBinding,
  classesFromStyleProps,
  getAccessibilityProps,
  resolveAnimation,
} from "../../lib/utils";
import { AnyObj, BadgeElement, EventHandler } from "../../types";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../components/ui/tooltip";
import { DynamicIcon } from "./dynamic-icon";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-1 focus-visible:ring-[var(--acp-primary)] transition-all",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--acp-primary)] text-white hover:bg-[var(--acp-primary-700)]",
        secondary:
          "border-transparent bg-[var(--acp-secondary)] text-white hover:bg-[var(--acp-secondary-700)]",
        outline:
          "text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)] border-[var(--acp-border)] dark:border-[var(--acp-border-dark)] hover:bg-[color-mix(in_srgb,var(--acp-foreground)10%,transparent)]",
        destructive:
          "border-transparent bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

interface BadgeRendererProps {
  element: BadgeElement;
  state: AnyObj;
  t: (key: string) => string,
  runEventHandler?: (handler?: EventHandler | undefined, dataOverride?: AnyObj) => Promise<void>
}

function BadgeRenderer({ element, state, t, runEventHandler }: BadgeRendererProps) {

  const label = resolveBinding(
    element.text ?? element.value ?? element.name,
    state,
    t
  );

  // Schema-driven props
  const schemaClass = classesFromStyleProps(element.styles);
  const acc = getAccessibilityProps(element.accessibility);

  const content = element.isDot ? (
    <span className="size-2 rounded-full bg-current" />
  ) : (
    <>
      {element.iconLeft && (
        <DynamicIcon  {...element.iconLeft} />
      )}
      {element.maxLength && label?.length > element.maxLength
        ? label.slice(0, element.maxLength) + "…"
        : label}
      {element.iconRight && (
        <DynamicIcon {...element.iconRight} />
      )}
    </>
  );

  const badgeNode = (
    <Badge
      variant={element.variant}
      asChild={element.asChild}
      className={cn(
        schemaClass,
        element.size === "sm" && "px-1.5 py-0 text-[10px]",
        element.size === "lg" && "px-3 py-1.5 text-sm",
      )}
      onClick={element.onClick ? () => runEventHandler?.(element.onClick) : undefined}
      {...acc}
    >
      {content || "Badge"}
    </Badge>
  );

  if (element.tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badgeNode}</TooltipTrigger>
        <TooltipContent>
          {resolveBinding(element.tooltip, state, t)}
        </TooltipContent>
      </Tooltip>
    );
  }

  return badgeNode;
}

export { BadgeRenderer, Badge, badgeVariants };
