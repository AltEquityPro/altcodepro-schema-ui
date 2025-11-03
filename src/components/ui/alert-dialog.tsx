"use client";
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import {
  cn,
  resolveBinding,
  variants,
  classesFromStyleProps,
  getAccessibilityProps,
  resolveAnimation,
} from "../../lib/utils";
import { ElementResolver } from "../../schema/ElementResolver";
import { AlertDialogElement, AnyObj, EventHandler, UIElement } from "../../types";

/** -----------------------------------
 * Helpers for size/position/variant
 * ----------------------------------- */
function contentSizeClass(size: AlertDialogElement["size"]) {
  switch (size) {
    case "sm": return "sm:max-w-sm";
    case "md": return "sm:max-w-md";
    case "lg": return "sm:max-w-lg";
    case "xl": return "sm:max-w-xl";
    case "full": return "w-[calc(100%-1rem)] h-[calc(100%-1rem)] sm:max-w-none";
    default: return "sm:max-w-lg";
  }
}

function contentPositionClass(pos: AlertDialogElement["position"]) {
  switch (pos) {
    case "top":
      return "top-6 left-1/2 -translate-x-1/2";
    case "bottom":
      return "bottom-6 left-1/2 -translate-x-1/2";
    case "center":
    default:
      return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
  }
}

function variantChrome(variant: AlertDialogElement["variant"]) {
  switch (variant) {
    case "info": return "border border-blue-200";
    case "warning": return "border border-amber-200";
    case "danger":
    case "destructive": return "border border-red-200";
    case "success": return "border border-green-200";
    default: return "border";
  }
}

/** -----------------------------------
 * Renderer
 * ----------------------------------- */
function AlertDialogRenderer({
  element,
  className,
  state,
  setState,
  t,
  runEventHandler,
  ...rest
}: {
  element: AlertDialogElement;
  className?: string;
  state: AnyObj;
  setState: (path: string, value: any) => void;
  t: (key: string) => string
  runEventHandler: ((handler?: EventHandler | undefined, dataOverride?: AnyObj | undefined) => Promise<void>) | undefined
}) {

  const isOpen = resolveBinding(element.isOpen, state, t);
  const acc = getAccessibilityProps(element.accessibility);

  // schema-driven classes on the dialog CONTENT (box)
  const contentSchemaClass = classesFromStyleProps(element.styles);

  const sizeClass = contentSizeClass(element.size);
  const posClass = contentPositionClass(element.position || "center");
  const variantClass = variantChrome(element.variant);

  return (
    <AlertDialogPrimitive.Root
      data-slot="alert-dialog"
      open={!!isOpen}
      onOpenChange={(open) => runEventHandler?.(element.onOpenChange, { open })}
      {...rest}
    >
      {element.trigger && (
        <AlertDialogPrimitive.Trigger asChild>
          <ElementResolver state={state} setState={setState} t={t} element={element.trigger} runEventHandler={runEventHandler} />
        </AlertDialogPrimitive.Trigger>
      )}

      <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal">
        {/* Overlay (keep simple; can be extended later for schema-controlled overlay if needed) */}
        <AlertDialogPrimitive.Overlay
          data-slot="alert-dialog-overlay"
          className={cn(
            "fixed inset-0 z-50 bg-black/50",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />

        {/* Content with animations/styles/accessibility using asChild */}
        <AlertDialogPrimitive.Content asChild>
          <div
            className={cn(
              "bg-(--acp-background) dark:bg-(--acp-background-dark) text-(--acp-foreground) dark:text-(--acp-foreground-dark) fixed z-50 grid w-full max-w-[calc(100%-2rem)]",
              posClass,
              sizeClass,
              "gap-4 rounded-lg p-6 shadow-lg duration-200",
              variantClass,
              className,
              contentSchemaClass
            )}
            {...acc}
          >
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <AlertDialogPrimitive.Title className="text-lg font-semibold">
                {resolveBinding(element.title, state, t)}
              </AlertDialogPrimitive.Title>
              {element.description && (
                <AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
                  {resolveBinding(element.description, state, t)}
                </AlertDialogPrimitive.Description>
              )}
            </div>

            {/* Custom content */}
            {element.content?.map((child: UIElement) => (
              <ElementResolver state={state} setState={setState} t={t} key={child.id} element={child} runEventHandler={runEventHandler} />
            ))}

            {/* Footer actions */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {element.cancelButton && (
                <AlertDialogPrimitive.Cancel className={cn(variants({ variant: "outline" }))} asChild>
                  <ElementResolver state={state} setState={setState} t={t} element={element.cancelButton} runEventHandler={runEventHandler} />
                </AlertDialogPrimitive.Cancel>
              )}

              {element.actionButton && (
                <AlertDialogPrimitive.Action className={cn(variants())} asChild>
                  <ElementResolver state={state} setState={setState} t={t} element={element.actionButton} runEventHandler={runEventHandler} />
                </AlertDialogPrimitive.Action>
              )}

              {element.actions?.map((btn, i) => {
                if (btn.role === "cancel") {
                  return (
                    <AlertDialogPrimitive.Cancel
                      key={i}
                      className={cn(variants({ variant: "outline" }))}
                      asChild
                    >
                      <ElementResolver state={state} setState={setState} t={t} element={btn} runEventHandler={runEventHandler} />
                    </AlertDialogPrimitive.Cancel>
                  );
                }
                return (
                  <AlertDialogPrimitive.Action
                    key={i}
                    className={cn(
                      variants({
                        variant: btn.role === "destructive" ? "ghost" : "default",
                      })
                    )}
                    asChild
                  >
                    <ElementResolver state={state} setState={setState} t={t} element={btn} runEventHandler={runEventHandler} />
                  </AlertDialogPrimitive.Action>
                );
              })}
            </div>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

export {
  AlertDialogRenderer,

};
