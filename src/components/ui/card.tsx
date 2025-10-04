"use client";
import * as React from "react";
import {
  cn,
  classesFromStyleProps,
  getAccessibilityProps,
  resolveAnimation,
  resolveBinding,
} from "../../lib/utils";
import { CardElement, UIElement } from "../../types";
import { ElementResolver } from "../../schema/ElementResolver";
import { RenderChildren } from "../../schema/RenderChildren";

// Card Variants (professional, minimal borders, smooth hovers)
const cardVariants: Record<NonNullable<CardElement["variant"]>, string> = {
  default:
    "bg-card text-card-foreground flex flex-col gap-4 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
  outline:
    "bg-background text-foreground text-foreground flex flex-col gap-4 rounded-xl border border-border p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-sm",
  ghost:
    "bg-transparent text-foreground flex flex-col gap-4 rounded-xl p-6 transition-all duration-300 hover:bg-muted/20",
  elevated:
    "bg-card text-card-foreground flex flex-col gap-4 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
  borderless:
    "bg-card text-card-foreground flex flex-col gap-4 rounded-xl p-6 transition-all duration-300 hover:shadow-sm",
};

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card" className={cn(className)} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-0", // Removed padding for cleaner look
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
      className={cn("leading-tight font-semibold text-lg", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
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
  return <div data-slot="card-content" className={cn("flex-1", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center justify-between pt-4 mt-auto", className)}
      {...props}
    />
  );
}

interface CardRendererProps {
  element: CardElement;
  runtime?: Record<string, any>;
}

function CardRenderer({ element, runtime = {} }: CardRendererProps) {
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
          <CardHeader className="mb-4">
            {element.media && <ElementResolver element={element.media} runtime={runtime} />}
            {element.badge && <ElementResolver element={element.badge} runtime={runtime} />}
            {element.title && <CardTitle><ElementResolver element={element.title} runtime={runtime} /></CardTitle>}
            {element.description && (
              <CardDescription><ElementResolver element={element.description} runtime={runtime} /></CardDescription>
            )}
            {element.action && <CardAction><ElementResolver element={element.action} runtime={runtime} /></CardAction>}
            {element.header && <ElementResolver element={element.header} runtime={runtime} />}
          </CardHeader>
        )}

      {/* Content */}
      <CardContent>
        {element.content && <RenderChildren children={element.content} runtime={runtime} />}
        {element.children && <RenderChildren children={element.children} runtime={runtime} />}
      </CardContent>

      {/* Footer */}
      {element.footer && (
        <CardFooter>
          <RenderChildren children={element.footer} runtime={runtime} />
        </CardFooter>
      )}
    </Card>
  );

  // Clickable wrapper (smooth transition)
  if (element.clickable && element.href) {
    return (
      <a
        href={String(resolveBinding(element.href, runtime, {} as any))}
        className="block transition-colors duration-200 hover:opacity-80"
      >
        {cardBody}
      </a>
    );
  }

  return cardBody;
}

export {
  CardRenderer,
};