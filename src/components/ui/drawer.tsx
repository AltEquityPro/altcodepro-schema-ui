"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn, resolveBinding } from "../../lib/utils"
import { RenderChildren } from "../../schema/RenderChildren"
import { useAppState } from "../../schema/StateContext"
import { AnyObj, DrawerElement, EventHandler } from "../../types"
import wrapWithMotion from "./wrapWithMotion"
function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background text-foreground fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}
interface DrawerRendererProps {
  element: DrawerElement
  runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
}

function DrawerRenderer({ element, runEventHandler }: DrawerRendererProps) {
  const { state, t } = useAppState()
  const drawer = element

  // resolve bindings
  const open = resolveBinding(drawer.isOpen, state, t) ?? false
  const title = resolveBinding(drawer.title, state, t)
  const description = resolveBinding(drawer.description, state, t)

  const handleOpenChange = (next: boolean) => {
    runEventHandler?.(drawer.onOpenChange, { open: next })
  }

  // map size → Tailwind classes
  const sizeClass = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
  }[drawer.size || ""] || (typeof drawer.size === "string" ? drawer.size : "")

  return wrapWithMotion(element,
    <DrawerPrimitive.Root
      data-slot="drawer"
      direction={drawer.direction || "right"}
      open={open}
      onOpenChange={handleOpenChange}
    >
      {/* Trigger */}
      {drawer.trigger && (
        <DrawerTrigger asChild>
          <RenderChildren children={[drawer.trigger]} />
        </DrawerTrigger>
      )}

      {/* Portal + Content */}
      <DrawerPortal>
        <DrawerOverlay />
        <DrawerContent
          className={cn(sizeClass, drawer.styles?.className)}
          style={{ zIndex: drawer.zIndex }}
          aria-label={resolveBinding(drawer.accessibility?.ariaLabel, state, t)}
          aria-hidden={!drawer.visibility?.show}
        >
          {/* Header */}
          {(title || description) && (
            <DrawerHeader>
              {title && <DrawerTitle>{title}</DrawerTitle>}
              {description && <DrawerDescription>{description}</DrawerDescription>}
            </DrawerHeader>
          )}

          {/* Body */}
          <RenderChildren children={drawer.content} />

          {/* Footer */}
          {drawer.footer && drawer.footer.length > 0 && (
            <DrawerFooter>
              <RenderChildren children={drawer.footer} />
            </DrawerFooter>
          )}

          {/* Optional close button */}
          {drawer.showCloseButton && (
            <div className="absolute top-2 right-2">
              <DrawerClose className="text-muted-foreground hover:text-foreground">
                ✕
              </DrawerClose>
            </div>
          )}
        </DrawerContent>
      </DrawerPortal>
    </DrawerPrimitive.Root>
  )
}
export {
  DrawerRenderer,
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
