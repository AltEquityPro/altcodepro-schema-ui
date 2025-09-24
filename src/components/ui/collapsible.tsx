import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { cn, resolveBinding } from "@/src/lib/utils"
import { ElementResolver } from "@/src/schema/ElementResolver"
import { CollapsibleElement, UIElement } from "@/src/types"

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
  t?: (key: string) => string
  runEventHandler?: (handler?: any, ctx?: any) => void
}

function CollapsibleRenderer({
  element,
  runtime = {},
  state = {},
  t = (s) => s,
  runEventHandler = () => { },
}: CollapsibleRendererProps) {
  return (
    <Collapsible
      open={resolveBinding(element.open, state, t)}
      onOpenChange={(open) => runEventHandler(element.onOpenChange, { open })}
    >
      {element.trigger && (
        <CollapsibleTrigger asChild>
          <ElementResolver element={element.trigger} runtime={runtime} />
        </CollapsibleTrigger>
      )}

      <CollapsibleContent>
        {element.content?.map((child: UIElement) => (
          <ElementResolver key={child.id} element={child} runtime={runtime} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
export { CollapsibleRenderer, Collapsible, CollapsibleTrigger, CollapsibleContent }
