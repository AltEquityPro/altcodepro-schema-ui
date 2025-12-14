"use client";

import {
  classesFromStyleProps,
  getAccessibilityProps,
  resolveBinding,
} from "../../lib/utils";
import { AnyObj, Binding, ButtonElement, EventHandler } from "../../types";
import clsx from "clsx";
import React, { useMemo } from "react";
import { DynamicIcon } from "./dynamic-icon";


/* ----------------------------
 * Theme-Aware Button Variants
 * ---------------------------- */
const buttonVariants: Record<string, string> = {
  /* 🌊 PRIMARY: brand color focus */
  primary: `
    bg-[var(--acp-primary)]
    dark:bg-[var(--acp-primary-dark)]
    text-white
    hover:bg-[var(--acp-primary-700)]
    focus:ring-2 focus:ring-[var(--acp-primary-400)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  /* 🩶 SECONDARY: neutral tone, subtle contrast */
  secondary: `
    bg-[var(--acp-secondary)]
    dark:bg-[var(--acp-secondary-dark)]
    text-white
    hover:bg-[var(--acp-secondary-700)]
    focus:ring-2 focus:ring-[var(--acp-secondary-400)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  /* ⚪ OUTLINE: transparent with border */
  outline: `
    border border-[var(--acp-border)] dark:border-[var(--acp-border-dark)]  dark:border-[var(--acp-border-dark)]
    bg-transparent
    text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)] 
    hover:bg-[color-mix(in_srgb,var(--acp-foreground)10%,transparent)]
    focus:ring-2 focus:ring-[var(--acp-primary)]
    focus:border-[var(--acp-primary)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  /* 🎨 TERTIARY: soft background accent */
  tertiary: `
    bg-[color-mix(in_srgb,var(--acp-secondary)10%,transparent)]
    dark:bg-[color-mix(in_srgb,var(--acp-secondary-dark)10%,transparent)]
    text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)] 
    hover:bg-[color-mix(in_srgb,var(--acp-secondary)20%,transparent)]
    focus:ring-2 focus:ring-[var(--acp-secondary)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  /* 🔗 LINK: no background, underline on hover */
  link: `
    text-[var(--acp-primary)]
    underline-offset-4
    hover:underline
    hover:text-[var(--acp-primary-700)]
    focus:ring-2 focus:ring-[var(--acp-primary)]
    bg-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  /* 👻 GHOST: text only, transparent background */
  ghost: `
    text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)] 
    bg-transparent
    border-0
    hover:bg-[color-mix(in_srgb,var(--acp-foreground)8%,transparent)]
    focus:ring-2 focus:ring-[var(--acp-primary)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  success: `
    bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-400
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  warning: `
    bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  danger: `
    bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
};


const sizeClasses: Record<string, string> = {
  default: "px-4 py-2 has-[>svg]:px-3",
  sm: "rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-sm",
  lg: "rounded-md px-6 has-[>svg]:px-4 text-base",
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
  const variantClass = className?.includes('bg-') && className?.includes('text-') ? "" : buttonVariants[variant] ?? "";
  const sizeClass = variant !== 'link' ? sizeClasses[size] ?? "" : "";

  return (
    <button
      className={clsx(
        "inline-flex cursor-pointer items-center justify-center rounded-md font-medium transition-colors focus:outline-none",
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
  runEventHandler,
  state,
  t

}: {
  state: AnyObj;
  t: (key: string) => string,
  element: ButtonElement;
  runEventHandler?: ((handler?: EventHandler | undefined, dataOverride?: AnyObj | undefined) => Promise<void>) | undefined
}) {

  const sizeClass = sizeClasses[element.size ?? "default"]
  const styles = classesFromStyleProps(element.styles);
  const accessibilityProps = getAccessibilityProps(element.accessibility);
  const variantClass = buttonVariants[(element.variant || 'primary')]

  const resolvedBinding = useMemo(
    () => (binding: Binding) => resolveBinding(binding, state, t) || '',
    [state, t]
  );

  const disabled =
    typeof element.disabled === "boolean"
      ? element.disabled
      : String(resolvedBinding(element.disabled as any)) === "true";

  let label = resolvedBinding(element.text);
  if (label === element.text) {
    label = t(element.text as any) || label;
  }
  return (
    <button
      className={clsx(
        "inline-flex items-center  cursor-pointer  justify-center rounded-md font-medium transition-colors focus:outline-none",
        variantClass,
        sizeClass,
        styles,
        element.styles?.className || ' m-1'
      )}
      id={element?.id}
      title={element?.tooltip ? resolvedBinding(element.tooltip) : undefined}
      data-i118key={(element.text as any)?.binding || element.text}
      data-variant={element.variant}
      disabled={disabled}
      type={element.isSubmit ? 'submit' : "button"}
      onClick={() => {
        const handler = element.onClick || element.onEvent;
        handler && runEventHandler?.(handler);
      }}
      style={{ zIndex: element.zIndex }}
      {...accessibilityProps}
    >
      {element.iconLeft?.name && (
        <DynamicIcon {...element.iconLeft} name={element.iconLeft.name} className="mr-1" />
      )}
      {label}
      {element.iconRight?.name && (
        <DynamicIcon {...element.iconRight} name={element.iconRight.name} className="ml-1" />
      )}
    </button>
  );
}

