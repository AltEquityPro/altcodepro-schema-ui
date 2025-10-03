"use client";

import {
  classesFromStyleProps,
  getAccessibilityProps,
  resolveAnimation,
  resolveBinding,
} from "@/lib/utils";
import { Binding, ButtonElement } from "@/types";
import clsx from "clsx";
import { motion } from "framer-motion";
import React, { useMemo } from "react";
import { DynamicIcon } from "./dynamic-icon";
import { useActionHandler } from "@/schema/Actions";
import { useAppState } from "@/schema/StateContext";

/* ----------------------------
 * Variant + Size Maps
 * ---------------------------- */
const buttonVariants: Record<string, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500",
  secondary:
    "bg-gray-300 hover:bg-gray-400 focus:ring-2 focus:ring-gray-400",
  success:
    "bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500",
  warning:
    "bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400",
  outline:
    "border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-gray-400",
};

const sizeClasses: Record<string, string> = {
  default: "h-9 px-4 py-2 has-[>svg]:px-3",
  sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-sm",
  lg: "h-10 rounded-md px-6 has-[>svg]:px-4 text-base",
  icon: "size-9",
};

/* ----------------------------
 * Design-system Button
 * ---------------------------- */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: "default" | "sm" | "lg" | "icon";
}

export function Button({
  children,
  variant = "primary",
  className,
  size = "default",
  ...props
}: ButtonProps) {
  const variantClass = buttonVariants[variant] ?? "";
  const sizeClass = sizeClasses[size] ?? "";

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none",
        variantClass,
        sizeClass,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ----------------------------
 * Schema-driven ButtonRenderer
 * ---------------------------- */
export function ButtonRenderer({
  element,
  runtime,
}: {
  element: ButtonElement;
  runtime: Record<string, any>;
}) {
  const { state, t } = useAppState();
  const { runEventHandler } = useActionHandler({ runtime });

  const variantClass = buttonVariants[element.variant ?? "primary"] ?? "";
  const sizeClass = sizeClasses[element.size ?? "default"] ?? "";
  const styles = classesFromStyleProps(element.styles);
  const accessibilityProps = getAccessibilityProps(element.accessibility);
  const animationProps: any = resolveAnimation(element.animations);

  const resolvedBinding = useMemo(
    () => (binding: Binding) => resolveBinding(binding, state, t),
    [state, t]
  );

  const disabled =
    typeof element.disabled === "boolean"
      ? element.disabled
      : String(resolvedBinding(element.disabled as any)) === "true";

  // Choose motion.button only if animations are defined
  const Comp: any =
    element.animations?.framework === "framer-motion"
      ? motion.button
      : "button";

  return (
    <Comp
      {...(element.animations?.framework === "framer-motion"
        ? animationProps
        : {})}
      className={clsx(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none",
        variantClass,
        sizeClass,
        styles,
        element.styles?.className
      )}
      disabled={disabled}
      onClick={() => element.onClick && runEventHandler(element.onClick)}
      style={{ zIndex: element.zIndex, ...(animationProps?.style || {}) }}
      {...accessibilityProps}
    >
      {element.iconLeft?.name && (
        <DynamicIcon name={element.iconLeft.name} className="mr-1" />
      )}
      {resolvedBinding(element.text)}
      {element.iconRight?.name && (
        <DynamicIcon name={element.iconRight.name} className="ml-1" />
      )}
    </Comp>
  );
}

