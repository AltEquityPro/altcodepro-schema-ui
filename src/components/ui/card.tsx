"use client";
import * as React from "react";
import {
  cn,
  classesFromStyleProps,
  getAccessibilityProps,
  resolveBinding,
} from "../../lib/utils";
import { AnyObj, CardElement, EventHandler } from "../../types";
import { ElementResolver } from "../../schema/ElementResolver";
import { RenderChildren } from "../../schema/RenderChildren";

// Card Variants (professional, minimal borders, smooth hovers)
const cardVariants: Record<NonNullable<CardElement["variant"]>, string> = {
  default:
    "bg-[var(--acp-background)] dark:bg-[var(--acp-background-dark)] text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)] flex flex-col gap-4 rounded-xl p-6 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5",

  outline:
    "bg-transparent text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)] flex flex-col gap-4 rounded-xl border border-[var(--acp-border)] dark:border-[var(--acp-border-dark)] p-6 transition-all duration-300 hover:border-[var(--acp-primary)] hover:shadow-sm",

  ghost:
    "bg-transparent text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)] flex flex-col gap-4 rounded-xl p-6 transition-all duration-300 hover:bg-[color-mix(in_srgb,var(--acp-foreground)_8%,transparent)]",

  elevated:
    "bg-[var(--acp-surface)] text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)] flex flex-col gap-4 rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",

  borderless:
    "bg-[var(--acp-surface)] text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)] flex flex-col gap-4 rounded-xl p-6 transition-all duration-300 hover:shadow-sm",
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
  setState: (path: string, value: any) => void;
  runEventHandler?: ((handler?: EventHandler | undefined, dataOverride?: AnyObj | undefined) => Promise<void>) | undefined
}

function CardRenderer({ element, setState, runEventHandler, state, t }: CardRendererProps) {
  const variantClass = cardVariants[element.variant ?? "default"];
  const schemaClass = classesFromStyleProps(element.styles);
  const acc = getAccessibilityProps(element.accessibility);

  const cardBody = (
    <Card
      className={cn(variantClass, schemaClass)}

      {...acc}
    >
      {(element.media ||
        element.badge ||
        element.title ||
        element.description ||
        element.action ||
        element.header) && (
          <CardHeader className="flex flex-col gap-4">

            {/* MEDIA / BADGE / HEADER */}
            {element.media && (
              <ElementResolver
                state={state}
                setState={setState}
                t={t}
                element={element.media}
                runEventHandler={runEventHandler}
              />
            )}

            {element.badge && (
              <ElementResolver
                state={state}
                setState={setState}
                t={t}
                element={element.badge}
                runEventHandler={runEventHandler}
              />
            )}

            {element.header && (
              <>
                {(typeof element.header === "string" || (element.header as any)?.binding)
                  ? resolveBinding(element.header, state, t)
                  : (
                    <ElementResolver
                      state={state}
                      setState={setState}
                      t={t}
                      element={element.header}
                      runEventHandler={runEventHandler}
                    />
                  )}
              </>
            )}

            {/* TEXT BLOCK */}
            {(element.title || element.description) && (
              <div className="flex flex-col gap-3">
                {element.title && (
                  <CardTitle>
                    {(typeof element.title === "string" || (element.title as any)?.binding)
                      ? resolveBinding(element.title, state, t)
                      : (
                        <ElementResolver
                          state={state}
                          setState={setState}
                          t={t}
                          element={element.title}
                          runEventHandler={runEventHandler}
                        />
                      )}
                  </CardTitle>
                )}

                {element.description && (
                  <CardDescription>
                    {(typeof element.description === "string" || (element.description as any)?.binding)
                      ? resolveBinding(element.description, state, t)
                      : (
                        <ElementResolver
                          state={state}
                          setState={setState}
                          t={t}
                          element={element.description}
                          runEventHandler={runEventHandler}
                        />
                      )}
                  </CardDescription>
                )}
              </div>
            )}

            {/* ACTION — ALWAYS BELOW */}
            {element.action && (
              <div className="pt-4">
                <CardAction className="w-fit">
                  <ElementResolver
                    state={state}
                    setState={setState}
                    t={t}
                    element={element.action}
                    runEventHandler={runEventHandler}
                  />
                </CardAction>
              </div>
            )}

          </CardHeader>
        )}

      {/* Content */}
      <CardContent>
        {element.content && <RenderChildren state={state} setState={setState} t={t} children={element.content} runEventHandler={runEventHandler} />}
        {element.children && <RenderChildren state={state} setState={setState} t={t} children={element.children} runEventHandler={runEventHandler} />}
      </CardContent>

      {/* Footer */}
      {element.footer && (
        <CardFooter>
          <RenderChildren state={state} setState={setState} t={t} children={element.footer} runEventHandler={runEventHandler} />
        </CardFooter>
      )}
    </Card>
  );

  // Clickable wrapper (smooth transition)
  if (element.clickable) {
    const hasHref = !!element.href;
    const hasOnClick = !!element.onEvent;

    const handleClick = async (e: React.MouseEvent) => {
      if (hasHref) return;
      e.preventDefault();
      e.stopPropagation();
      if (hasOnClick && runEventHandler) {
        await runEventHandler(element.onEvent);
      }
    };

    if (hasHref) {
      return (
        <a
          href={resolveBinding(element.href, state, t)}
          className="block transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-(--acp-primary) rounded-xl"
          onClick={handleClick}
        >
          {cardBody}
        </a>
      );
    }

    return (
      <button
        type="button"
        onClick={handleClick}
        className="w-full text-left block transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-(--acp-primary) rounded-xl"
      >
        {cardBody}
      </button>
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