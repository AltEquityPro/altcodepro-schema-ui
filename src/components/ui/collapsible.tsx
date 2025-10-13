"use client";
import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { cn, resolveBinding } from "../../lib/utils"
import { ElementResolver } from "../../schema/ElementResolver"
import { AnyObj, CollapsibleElement, EventHandler, UIElement } from "../../types"

function Collapsible({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      className={cn("w-full", className)}
      {...props}
    />
  )
}

function CollapsibleTrigger({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn("cursor-pointer", className)}
      {...props}
    />
  )
}

function CollapsibleContent({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      className={cn(
        "overflow-hidden data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up",
        className
      )}
      {...props}
    />
  )
}

interface CollapsibleRendererProps {
  element: CollapsibleElement
  runtime?: Record<string, any>
  state?: Record<string, any>
  t?: (key: string) => string;
  setState: (path: string, value: any) => void;
  runEventHandler?: ((handler?: EventHandler | undefined, dataOverride?: AnyObj | undefined) => Promise<void>) | undefined
}

function CollapsibleRenderer({
  element,
  state = {},
  t = (s) => s,
  setState,
  runEventHandler
}: CollapsibleRendererProps) {
  return (
    <Collapsible
      open={resolveBinding(element.open, state, t)}
      onOpenChange={(open) => runEventHandler?.(element.onOpenChange, { open })}
    >
      {element.trigger && (
        <CollapsibleTrigger asChild>
          <ElementResolver state={state} setState={setState} t={t} element={element.trigger} runEventHandler={runEventHandler} />
        </CollapsibleTrigger>
      )}

      <CollapsibleContent>
        {element.content?.map((child: UIElement) => (
          <ElementResolver state={state} setState={setState} t={t} key={child.id} element={child} runEventHandler={runEventHandler} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
export { CollapsibleRenderer, Collapsible, CollapsibleTrigger, CollapsibleContent }
