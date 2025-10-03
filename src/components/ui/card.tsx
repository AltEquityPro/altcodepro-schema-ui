"use client";
import * as React from "react";
import {
  cn,
  classesFromStyleProps,
  getAccessibilityProps,
  resolveAnimation,
} from "../../lib/utils";
import { CardElement, UIElement } from "../../types";
import { ElementResolver } from "../../schema/ElementResolver";

// Card Variants
const cardVariants: Record<NonNullable<CardElement["variant"]>, string> = {
  default:
    "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm transition hover:shadow-md",
  outline:
    "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border-2 border-border py-6 shadow-sm",
  ghost:
    "bg-transparent text-foreground flex flex-col gap-6 rounded-xl py-6 shadow-none hover:bg-muted/20",
  elevated:
    "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-md hover:shadow-lg",
  borderless:
    "bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-none border-none",
};

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card" className={cn(className)} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

interface CardRendererProps {
  element: CardElement;
  runtime?: Record<string, any>;
}

function CardRenderer({ element, runtime = {} }: CardRendererProps) {
  const renderChildren = (children?: UIElement[]) =>
    children?.map((child) => (
      <ElementResolver key={child.id} element={child} runtime={runtime} />
    ));

  const variantClass = cardVariants[element.variant ?? "default"];
  const schemaClass = classesFromStyleProps(element.styles);
  const acc = getAccessibilityProps(element.accessibility);
  const anim = resolveAnimation(element.animations);

  const cardBody = (
    <Card
      className={cn(variantClass, schemaClass, (anim as any)?.className)}
      style={(anim as any)?.style}
      {...acc}
      {...(element.animations?.framework === "framer-motion" ? (anim as any) : {})}
    >
      {/* Header */}
      {(element.media ||
        element.badge ||
        element.title ||
        element.description ||
        element.action ||
        element.header) && (
          <CardHeader>
            {element.media && renderChildren([element.media])}
            {element.badge && renderChildren([element.badge])}
            {element.title && <CardTitle>{renderChildren([element.title])}</CardTitle>}
            {element.description && (
              <CardDescription>{renderChildren([element.description])}</CardDescription>
            )}
            {element.action && <CardAction>{renderChildren([element.action])}</CardAction>}
            {element.header && renderChildren([element.header])}
          </CardHeader>
        )}

      {/* Content */}
      <CardContent>{renderChildren(element.content)}</CardContent>

      {/* Footer */}
      {element.footer && <CardFooter>{renderChildren(element.footer)}</CardFooter>}
    </Card>
  );

  // Clickable wrapper
  if (element.clickable && element.href) {
    return (
      <a href={String(element.href)} className="block">
        {cardBody}
      </a>
    );
  }

  return cardBody;
}

export {
  CardRenderer,
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
