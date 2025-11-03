"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import {
  cn,
  resolveBinding,
  classesFromStyleProps,
  getAccessibilityProps,
} from "../../lib/utils";
import { ElementResolver } from "../../schema/ElementResolver";
import { AnyObj, BreadcrumbElement, EventHandler, UIElement } from "../../types";
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
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm wrap-break-word sm:gap-2.5",
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
      className={cn("text-(--acp-foreground) dark:text-(--acp-foreground-dark) transition-colors", className)}
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
      className={cn("text-(--acp-foreground) dark:text-(--acp-foreground-dark) font-normal", className)}
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
  state: AnyObj;
  setState: (path: string, value: any) => void;
  t: (key: string) => string,
  runEventHandler?: ((handler?: EventHandler | undefined, dataOverride?: AnyObj | undefined) => Promise<void>) | undefined
}
function BreadcrumbRenderer({ state, setState, t, element, runEventHandler }: BreadcrumbRendererProps) {


  // Styles, accessibility, animations
  const schemaClass = classesFromStyleProps(element.styles);
  const acc = getAccessibilityProps(element.accessibility);

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

  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn(schemaClass)}
      {...acc}
    >
      <BreadcrumbList>
        {items?.map((item, i) => {
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
                  runEventHandler?.(item.onClick, { item });
                }
              }}
            >
              {item.iconLeft && (
                <ElementResolver state={state} setState={setState} t={t} element={item.iconLeft as UIElement} runEventHandler={runEventHandler} />
              )}
              {label}
              {item.iconRight && (
                <ElementResolver state={state} setState={setState} t={t} element={item.iconRight as UIElement} runEventHandler={runEventHandler} />
              )}
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>
              {item.iconLeft && (
                <ElementResolver state={state} setState={setState} t={t} element={item.iconLeft as UIElement} runEventHandler={runEventHandler} />
              )}
              {label}
              {item.iconRight && (
                <ElementResolver state={state} setState={setState} t={t} element={item.iconRight as UIElement} runEventHandler={runEventHandler} />
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
    </nav>
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
