"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn, resolveBinding } from "../../lib/utils"
import { AnyObj, EventHandler, SheetElement } from "../../types"
import wrapWithMotion from "./wrapWithMotion"
import { ElementResolver } from "../../schema/ElementResolver"
import { RenderChildren } from "../../schema/RenderChildren"
import { XIcon } from "lucide-react"

function useSheetShortcuts(
  shortcuts: SheetElement["shortcuts"],
  onClose: () => void,
  onToggle: () => void
) {
  React.useEffect(() => {
    if (!shortcuts || shortcuts.length === 0) return
    function handleKey(e: KeyboardEvent) {
      if (shortcuts) {
        for (const s of shortcuts) {
          if (e.key.toLowerCase() === s.key.toLowerCase()) {
            if (s.action === "close") onClose()
            if (s.action === "toggle") onToggle()
          }
        }
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [shortcuts, onClose, onToggle])
}


function Sheet(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetContent({
  className,
  children,
  direction = "right",
  showCloseButton = false,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  direction?: "left" | "right" | "top" | "bottom"
  showCloseButton?: boolean
}) {
  const base =
    "bg-background text-foreground fixed z-50 flex flex-col shadow-lg border data-[state=open]:animate-in data-[state=closed]:animate-out"

  const position = {
    right: "inset-y-0 right-0 w-3/4 max-w-sm border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
    left: "inset-y-0 left-0 w-3/4 max-w-sm border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
    top: "inset-x-0 top-0 h-1/3 max-h-[80vh] border-b data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
    bottom: "inset-x-0 bottom-0 h-1/3 max-h-[80vh] border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
  }[direction]

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="bg-black/50 fixed inset-0 z-40" />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(base, position, className)}
        {...props}
      >
        {showCloseButton && (
          <SheetClose className="absolute top-4 right-4 rounded-xs p-1 text-muted-foreground hover:text-foreground">
            <XIcon className="size-5" />
            <span className="sr-only">Close</span>
          </SheetClose>
        )}
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("p-4 border-b flex flex-col gap-1", className)} {...props} />
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("p-4 border-t mt-auto", className)} {...props} />
}

function SheetTitle(props: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="sheet-title" className="font-semibold" {...props} />
}

function SheetDescription(props: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="sheet-description" className="text-sm text-muted-foreground" {...props} />
}

function SheetRenderer({
  element,
  runEventHandler,
  state,
  t,
}: {
  element: SheetElement
  runEventHandler: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
  state: AnyObj
  t: (key: string) => string
}) {
  const open = resolveBinding(element.isOpen, state, t) ?? false

  const handleOpenChange = (next: boolean) => {
    runEventHandler(element.onOpenChange, { open: next })
  }

  useSheetShortcuts(
    element.shortcuts,
    () => handleOpenChange(false),
    () => handleOpenChange(!open)
  )

  return wrapWithMotion(
    element,
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {element.trigger && (
        <SheetTrigger asChild>
          <ElementResolver element={element.trigger} runtime={{}} />
        </SheetTrigger>
      )}
      <SheetContent
        direction={element.direction || "right"}
        showCloseButton={element.showCloseButton}
      >
        <SheetHeader>
          {element.title && <SheetTitle>{resolveBinding(element.title, state, t)}</SheetTitle>}
          {element.description && <SheetDescription>{resolveBinding(element.description, state, t)}</SheetDescription>}
        </SheetHeader>
        <RenderChildren children={element.content} />
        {element.footer && (
          <SheetFooter>
            <RenderChildren children={element.footer} />
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

export {
  SheetRenderer,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
