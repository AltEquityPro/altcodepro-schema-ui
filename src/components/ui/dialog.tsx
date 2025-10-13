"use client";
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn, resolveBinding } from "../../lib/utils"
import { ElementResolver } from "../../schema/ElementResolver"
import { RenderChildren } from "../../schema/RenderChildren"
import { ModalElement, AnyObj, EventHandler } from "../../types"
import wrapWithMotion from "./wrapWithMotion"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background text-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}
interface ModalRendererProps {
  element: ModalElement
  state: AnyObj;
  t: (key: string) => string,
  runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
}

function ModalRenderer({ element, state, t, runEventHandler }: ModalRendererProps) {

  const modal = element

  // Resolve title/description but ignore external isOpen binding
  const title = resolveBinding(modal.title, state, t)
  const description = resolveBinding(modal.description, state, t)

  // Local open state, defaults to false unless the modal specifies otherwise
  const [open, setOpen] = React.useState(
    typeof modal.isOpen === "boolean"
      ? modal.isOpen
      : resolveBinding(modal.isOpen, state, t) ?? false
  )

  // Close modal helper
  const handleClose = React.useCallback(async () => {
    setOpen(false)
    if (modal.onClose) {
      await runEventHandler?.(modal.onClose)
    }
  }, [modal.onClose, runEventHandler])

  // Optional: expose a way for any inner button action to close modal after completion
  const handleActionWrapper = React.useCallback(
    async (handler?: EventHandler, dataOverride?: AnyObj) => {
      await runEventHandler?.(handler, dataOverride)
      // Auto-close modal if handler is close_modal or API call succeeded
      if (
        handler?.action === "close_modal" ||
        handler?.action === "api_call" ||
        handler?.action === "crud_create" ||
        handler?.action === "crud_update"
      ) {
        setOpen(false)
      }
    },
    [runEventHandler]
  )

  return wrapWithMotion(
    element,
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose()
        else setOpen(true)
      }}
    >
      <DialogContent
        className={cn(modal.styles?.className)}
        style={{ zIndex: modal.zIndex }}
        showCloseButton={!!modal.closeButton}
      >
        {/* Header */}
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}

        {/* Body */}
        <RenderChildren
          children={modal.content}
          runEventHandler={handleActionWrapper}
        />

        {/* Footer (custom close button if provided) */}
        {modal.closeButton && (
          <DialogFooter>
            <ElementResolver
              state={state} t={t}
              element={modal.closeButton}
              runEventHandler={handleActionWrapper}
            />
          </DialogFooter>
        )}

        {/* Built-in Close Button */}
        {!modal.closeButton && (
          <DialogClose
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-4" />
          </DialogClose>
        )}
      </DialogContent>
    </Dialog>
  )
}

export {
  ModalRenderer,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
