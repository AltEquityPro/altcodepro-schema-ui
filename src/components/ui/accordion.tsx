"use client";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";

import {
  classesFromStyleProps,
  cn,
  getAccessibilityProps,
  resolveBinding,
} from "../../lib/utils";
import { ElementResolver } from "../../schema/ElementResolver";
import { AccordionElement, AnyObj, EventHandler, UIElement } from "../../types";


function AccordionRenderer({
  state,
  setState,
  t,
  element,
  runEventHandler,
}: {
  state: AnyObj,
  t: (key: string) => string
  element: AccordionElement;
  setState: (path: string, value: any) => void;
  runEventHandler?: (handler?: EventHandler | undefined, dataOverride?: AnyObj | undefined) => Promise<void>;
}) {
  const multiple = !!element.multiple;
  const collapsible = !!element.collapsible;
  const rawExpanded = resolveBinding(element.expandedItem, state, t); // string | string[]
  const normalizedExpanded =
    rawExpanded == null || rawExpanded === ""
      ? undefined
      : Array.isArray(rawExpanded)
        ? rawExpanded.filter(Boolean)
        : rawExpanded;
  const type = multiple ? "multiple" : "single";
  const accessibilityProps = getAccessibilityProps(element.accessibility);
  const rootClass = classesFromStyleProps(element.styles);

  return (
    <div >
      <AccordionPrimitive.Root
        type={type as any}
        collapsible={!multiple && collapsible}
        value={normalizedExpanded as any}
        onValueChange={(v: any) => runEventHandler?.(element.onChange, { value: v })}
        className={cn("w-full", rootClass)}
        {...accessibilityProps}
      >
        {element.items?.map((item, index) => {
          const itemId = item.id || `${element.id}-item-${index}`;
          return (
            <AccordionPrimitive.Item
              key={itemId}
              value={itemId}
              className="border-b last:border-b-0"
            >
              <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger
                  className={cn(
                    "focus-visible:border-ring focus-visible:ring-ring/50",
                    "flex flex-1 items-start justify-between gap-4",
                    "rounded-md py-4 text-left text-sm font-medium transition-all outline-none",
                    "hover:underline focus-visible:ring-[1px]",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "[&[data-state=open]>svg]:rotate-180"
                  )}
                >
                  {resolveBinding((item.title as any).binding || item.title, state, t) || (typeof item.title == 'string' ? t(item.title as any) : '')}
                  <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>

              <AccordionPrimitive.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm">
                <div className="pt-0 pb-4">
                  {item.content?.map((child: UIElement) => (
                    <ElementResolver state={state} setState={setState} t={t} key={child.id} element={child} runEventHandler={runEventHandler} />
                  ))}
                </div>
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          )
        })}
      </AccordionPrimitive.Root>
    </div>
  );
}

export { AccordionRenderer };
