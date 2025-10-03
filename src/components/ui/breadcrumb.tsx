"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import {
  cn,
  resolveBinding,
  classesFromStyleProps,
  getAccessibilityProps,
  resolveAnimation,
} from "../../lib/utils";
import { useAppState } from "../../schema/StateContext";
import { useActionHandler } from "../../schema/Actions";
import { ElementResolver } from "../../schema/ElementResolver";
import { BreadcrumbElement, UIElement } from "../../types";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../components/ui/tooltip";

/* ------------------------
   Base subcomponents
------------------------- */
function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

/* ------------------------
   Renderer
------------------------- */
interface BreadcrumbRendererProps {
  element: BreadcrumbElement;
  runtime?: Record<string, any>;
}

function BreadcrumbRenderer({ element, runtime = {} }: BreadcrumbRendererProps) {
  const { state, t } = useAppState();
  const { runEventHandler } = useActionHandler({ runtime });

  // Styles, accessibility, animations
  const schemaClass = classesFromStyleProps(element.styles);
  const acc = getAccessibilityProps(element.accessibility);
  const anim = resolveAnimation(element.animations);

  // Handle ellipsis logic
  const items = React.useMemo(() => {
    if (!element.ellipsisAfter || element.items.length <= element.ellipsisAfter)
      return element.items;
    const head = element.items.slice(0, 1);
    const tail = element.items.slice(-1);
    return [...head, { id: "ellipsis", label: "…" } as any, ...tail];
  }, [element]);

  // Separator
  const separatorNode = (i: number) => {
    if (i >= items.length - 1) return null;
    switch (element.separator) {
      case "slash":
        return <BreadcrumbSeparator>/</BreadcrumbSeparator>;
      case "dot":
        return <BreadcrumbSeparator>•</BreadcrumbSeparator>;
      case "custom":
        return <BreadcrumbSeparator>{element.separator}</BreadcrumbSeparator>;
      default:
        return <BreadcrumbSeparator />;
    }
  };

  const Wrapper: React.ElementType =
    element.animations?.framework === "framer-motion"
      ? (require("framer-motion").motion.nav as any)
      : "nav";

  return (
    <Wrapper
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn(schemaClass, (anim as any)?.className)}
      style={(anim as any)?.style}
      {...acc}
      {...(element.animations?.framework === "framer-motion" ? (anim as any) : {})}
    >
      <BreadcrumbList>
        {items.map((item, i) => {
          if (item.id === "ellipsis") {
            return (
              <React.Fragment key={`ellipsis-${i}`}>
                <BreadcrumbEllipsis />
                {separatorNode(i)}
              </React.Fragment>
            );
          }

          const label = resolveBinding(item.label, state, t);
          const node = item.href ? (
            <BreadcrumbLink
              href={resolveBinding(item.href, state, t)}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  runEventHandler(item.onClick, { item });
                }
              }}
            >
              {item.iconLeft && (
                <ElementResolver element={item.iconLeft as UIElement} runtime={runtime} />
              )}
              {label}
              {item.iconRight && (
                <ElementResolver element={item.iconRight as UIElement} runtime={runtime} />
              )}
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>
              {item.iconLeft && (
                <ElementResolver element={item.iconLeft as UIElement} runtime={runtime} />
              )}
              {label}
              {item.iconRight && (
                <ElementResolver element={item.iconRight as UIElement} runtime={runtime} />
              )}
            </BreadcrumbPage>
          );

          return (
            <React.Fragment key={item.id}>
              <BreadcrumbItem>
                {element.tooltip ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{node}</TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                ) : (
                  node
                )}
              </BreadcrumbItem>
              {separatorNode(i)}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Wrapper>
  );
}

export {
  BreadcrumbRenderer,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
