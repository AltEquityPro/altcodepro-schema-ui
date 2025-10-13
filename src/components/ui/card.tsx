"use client";
import * as React from "react";
import {
  cn,
  classesFromStyleProps,
  getAccessibilityProps,
  resolveAnimation,
  resolveBinding,
} from "../../lib/utils";
import { AnyObj, CardElement, EventHandler, UIElement } from "../../types";
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
  state: AnyObj,
  t: (key: string) => string,
  runEventHandler?: ((handler?: EventHandler | undefined, dataOverride?: AnyObj | undefined) => Promise<void>) | undefined
}

function CardRenderer({ element, runEventHandler, state, t }: CardRendererProps) {
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
            {element.media && <ElementResolver state={state} t={t} element={element.media} runEventHandler={runEventHandler} />}
            {element.badge && <ElementResolver state={state} t={t} element={element.badge} runEventHandler={runEventHandler} />}
            {element.title && <CardTitle><ElementResolver state={state} t={t} element={element.title} runEventHandler={runEventHandler} /></CardTitle>}
            {element.description && (
              <CardDescription><ElementResolver state={state} t={t} element={element.description} runEventHandler={runEventHandler} /></CardDescription>
            )}
            {element.action && <CardAction><ElementResolver state={state} t={t} element={element.action} runEventHandler={runEventHandler} /></CardAction>}
            {element.header && <ElementResolver state={state} t={t} element={element.header} runEventHandler={runEventHandler} />}
          </CardHeader>
        )}

      {/* Content */}
      <CardContent>
        {element.content && <RenderChildren children={element.content} runEventHandler={runEventHandler} />}
        {element.children && <RenderChildren children={element.children} runEventHandler={runEventHandler} />}
      </CardContent>

      {/* Footer */}
      {element.footer && (
        <CardFooter>
          <RenderChildren children={element.footer} runEventHandler={runEventHandler} />
        </CardFooter>
      )}
    </Card>
  );

  // Clickable wrapper (smooth transition)
  if (element.clickable && element.href) {
    return (
      <a
        href={String(resolveBinding(element.href, state, t))}
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
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter
};