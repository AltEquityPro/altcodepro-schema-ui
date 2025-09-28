"use client";
import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn, resolveBinding } from "../../lib/utils"
import { buttonVariants } from "./button"
import { ElementResolver } from "../../schema/ElementResolver"
import { AlertDialogElement, UIElement } from "../../types"
import { useAppState } from "../../schema/StateContext"
import { useActionHandler } from "../../schema/Actions"

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  )
}

function AlertDialogRenderer({
  element,
  runtime,
}: {
  element: AlertDialogElement
  runtime: any
}) {
  const { state, t } = useAppState()
  const { runEventHandler } = useActionHandler({ runtime })

  const isOpen = resolveBinding(element.isOpen, state, t)

  return (
    <AlertDialogPrimitive.Root
      open={!!isOpen}
      onOpenChange={(open) =>
        runEventHandler(element.onOpenChange, { open })
      }
    >
      {element.trigger && (
        <AlertDialogPrimitive.Trigger asChild>
          <ElementResolver element={element.trigger} runtime={runtime} />
        </AlertDialogPrimitive.Trigger>
      )}

      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out"
        />
        <AlertDialogPrimitive.Content
          className={cn(
            "bg-background fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-6 shadow-lg duration-200",
          )}
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

          {/* Children inside dialog */}
          {element.content?.map((child: UIElement) => (
            <ElementResolver key={child.id} element={child} runtime={runtime} />
          ))}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {/* cancelButton / actionButton */}
            {element.cancelButton && (
              <AlertDialogPrimitive.Cancel
                className={cn(buttonVariants({ variant: "outline" }))}
                asChild
              >
                <ElementResolver element={element.cancelButton} runtime={runtime} />
              </AlertDialogPrimitive.Cancel>
            )}
            {element.actionButton && (
              <AlertDialogPrimitive.Action
                className={cn(buttonVariants())}
                asChild
              >
                <ElementResolver element={element.actionButton} runtime={runtime} />
              </AlertDialogPrimitive.Action>
            )}

            {/* Multi-action mode */}
            {element.actions?.map((btn, i) => {
              if (btn.role === "cancel") {
                return (
                  <AlertDialogPrimitive.Cancel
                    key={i}
                    className={cn(buttonVariants({ variant: "outline" }))}
                    asChild
                  >
                    <ElementResolver element={btn} runtime={runtime} />
                  </AlertDialogPrimitive.Cancel>
                )
              }
              return (
                <AlertDialogPrimitive.Action
                  key={i}
                  className={cn(
                    buttonVariants({
                      variant: btn.role === "destructive" ? "destructive" : "default",
                    })
                  )}
                  asChild
                >
                  <ElementResolver element={btn} runtime={runtime} />
                </AlertDialogPrimitive.Action>
              )
            })}
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}
export {
  AlertDialogRenderer,
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
