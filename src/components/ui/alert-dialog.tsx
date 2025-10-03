"use client";
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { ChevronDownIcon } from "lucide-react";
import { motion } from "framer-motion";

import {
  cn,
  resolveBinding,
  variants,
  classesFromStyleProps,
  getAccessibilityProps,
  resolveAnimation,
} from "../../lib/utils";
import { ElementResolver } from "../../schema/ElementResolver";
import { AlertDialogElement, UIElement } from "../../types";
import { useAppState } from "../../schema/StateContext";
import { useActionHandler } from "../../schema/Actions";

/** -----------------------------------
 * AnimatedBox — works with Radix `asChild`
 * ----------------------------------- */
type AnimatedBoxProps = React.ComponentProps<"div"> & {
  animations?: AlertDialogElement["animations"];
};

const AnimatedBox = React.forwardRef<HTMLDivElement, AnimatedBoxProps>(
  ({ animations, className, style, children, ...rest }, ref) => {
    if (!animations) {
      return (
        <div ref={ref} className={className} style={style} {...rest}>
          {children}
        </div>
      );
    }

    const anim = resolveAnimation(animations);

    // animate.css / css → merge className + style on a regular div
    if (animations.framework === "animate.css" || animations.framework === "css") {
      const aClass = (anim as any)?.className || "";
      const aStyle = (anim as any)?.style || {};
      return (
        <div
          ref={ref}
          className={cn(className, aClass)}
          style={{ ...aStyle, ...style }}
          {...rest}
        >
          {children}
        </div>
      );
    }

    // framer-motion → motion.div with normalized props
    if (animations.framework === "framer-motion") {
      const motionProps = anim as any; // already normalized
      return (
        <motion.div ref={ref as any} className={className} style={style} {...motionProps} {...rest}>
          {children}
        </motion.div>
      );
    }

    // gsap → div with ref; run gsap on mount
    if (animations.framework === "gsap") {
      const localRef = React.useRef<HTMLDivElement>(null);
      React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);
      React.useEffect(() => {
        const cfg = (anim as any)?.gsap;
        if (!localRef.current || !cfg) return;
        import("gsap")
          .then(({ default: gsap }) => {
            if (cfg.from && cfg.to) gsap.fromTo(localRef.current, cfg.from, cfg);
            else gsap.to(localRef.current, cfg);
          })
          .catch(() => { });
      }, [anim]);
      const aClass = (anim as any)?.className || "";
      const aStyle = (anim as any)?.style || {};
      return (
        <div
          ref={localRef}
          className={cn(className, aClass)}
          style={{ ...aStyle, ...style }}
          {...rest}
        >
          {children}
        </div>
      );
    }

    return (
      <div ref={ref} className={className} style={style} {...rest}>
        {children}
      </div>
    );
  }
);
AnimatedBox.displayName = "AnimatedBox";

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
  runtime,
  ...rest
}: {
  element: AlertDialogElement;
  runtime: any;
  className?: string;
}) {
  const { state, t } = useAppState();
  const { runEventHandler } = useActionHandler({ runtime });

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
      onOpenChange={(open) => runEventHandler(element.onOpenChange, { open })}
      {...rest}
    >
      {element.trigger && (
        <AlertDialogPrimitive.Trigger asChild>
          <ElementResolver element={element.trigger} runtime={runtime} />
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
          <AnimatedBox
            animations={element.animations}
            className={cn(
              "bg-background fixed z-50 grid w-full max-w-[calc(100%-2rem)]",
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
              <ElementResolver key={child.id} element={child} runtime={runtime} />
            ))}

            {/* Footer actions */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {element.cancelButton && (
                <AlertDialogPrimitive.Cancel className={cn(variants({ variant: "outline" }))} asChild>
                  <ElementResolver element={element.cancelButton} runtime={runtime} />
                </AlertDialogPrimitive.Cancel>
              )}

              {element.actionButton && (
                <AlertDialogPrimitive.Action className={cn(variants())} asChild>
                  <ElementResolver element={element.actionButton} runtime={runtime} />
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
                      <ElementResolver element={btn} runtime={runtime} />
                    </AlertDialogPrimitive.Cancel>
                  );
                }
                return (
                  <AlertDialogPrimitive.Action
                    key={i}
                    className={cn(
                      variants({
                        variant: btn.role === "destructive" ? "destructive" : "default",
                      })
                    )}
                    asChild
                  >
                    <ElementResolver element={btn} runtime={runtime} />
                  </AlertDialogPrimitive.Action>
                );
              })}
            </div>
          </AnimatedBox>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

export {
  AlertDialogRenderer,

};
