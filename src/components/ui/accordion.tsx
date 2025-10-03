"use client";
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import { motion } from "framer-motion";

import {
  classesFromStyleProps,
  cn,
  getAccessibilityProps,
  resolveBinding,
  resolveAnimation,
} from "../../lib/utils";
import { useActionHandler } from "../../schema/Actions";
import { ElementResolver } from "../../schema/ElementResolver";
import { useAppState } from "../../schema/StateContext";
import { AccordionElement, UIElement } from "../../types";

/** Wrapper that applies animations around its children (root-level only) */
function AnimatedWrapper({
  animations,
  children,
}: {
  animations?: AccordionElement["animations"];
  children: React.ReactNode;
}) {
  if (!animations) return <>{children}</>;

  const anim = resolveAnimation(animations);

  // animate.css or CSS inline → normal <div> with classes/styles
  if (animations.framework === "animate.css" || animations.framework === "css") {
    const className = (anim as any)?.className || "";
    const style = (anim as any)?.style || {};
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  // framer-motion → motion.div with normalized props
  if (animations.framework === "framer-motion") {
    const motionProps = anim as any; // normalized by resolveAnimation
    return <motion.div {...motionProps}>{children}</motion.div>;
  }

  // gsap → div with ref; run gsap.fromTo on mount
  if (animations.framework === "gsap") {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      const cfg = (anim as any)?.gsap;
      if (!ref.current || !cfg) return;
      // dynamic import to avoid bundling if gsap not installed
      import("gsap")
        .then(({ default: gsap }) => {
          if (cfg.from && cfg.to) gsap.fromTo(ref.current, cfg.from, cfg);
          else gsap.to(ref.current, cfg);
        })
        .catch(() => { });
    }, [anim]);
    // allow class/style passthrough if resolveAnimation adds them
    const className = (anim as any)?.className || "";
    const style = (anim as any)?.style || {};
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

function AccordionRenderer({
  element,
  runtime,
}: {
  element: AccordionElement;
  runtime: any;
}) {
  const { state, t } = useAppState();
  const { runEventHandler } = useActionHandler({ runtime });

  const multiple = !!element.multiple;
  const collapsible = !!element.collapsible;
  const expanded = resolveBinding(element.expandedItem, state, t); // string | string[]

  const type = multiple ? "multiple" : "single";
  const accessibilityProps = getAccessibilityProps(element.accessibility);
  const rootClass = classesFromStyleProps(element.styles);

  return (
    <AnimatedWrapper animations={element.animations}>
      <AccordionPrimitive.Root
        type={type as any}
        collapsible={!multiple && collapsible}
        value={expanded as any}
        onValueChange={(v: any) => runEventHandler(element.onChange, { value: v })}
        className={cn("w-full", rootClass)}
        {...accessibilityProps}
      >
        {element.items.map((item) => (
          <AccordionPrimitive.Item
            key={item.id}
            value={item.id}
            className="border-b last:border-b-0"
          >
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger
                className={cn(
                  "focus-visible:border-ring focus-visible:ring-ring/50",
                  "flex flex-1 items-start justify-between gap-4",
                  "rounded-md py-4 text-left text-sm font-medium transition-all outline-none",
                  "hover:underline focus-visible:ring-[3px]",
                  "disabled:pointer-events-none disabled:opacity-50",
                  "[&[data-state=open]>svg]:rotate-180"
                )}
              >
                {resolveBinding(item.title, state, t)}
                <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>

            <AccordionPrimitive.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm">
              <div className="pt-0 pb-4">
                {item.content.map((child: UIElement) => (
                  <ElementResolver key={child.id} element={child} runtime={runtime} />
                ))}
              </div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    </AnimatedWrapper>
  );
}

export { AccordionRenderer };
