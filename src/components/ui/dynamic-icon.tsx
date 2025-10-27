"use client";
import * as LucideIcons from "lucide-react";

/**
 * 🧩 DynamicIcon — resolves Lucide icon names automatically.
 * Supports kebab-case, snake_case, lowercase, or PascalCase names.
 * Example:
 *   <DynamicIcon name="layout-dashboard" className="h-5 w-5 text-primary-600" />
 *   <DynamicIcon name="CheckCircle" size={18} />
 */
export function DynamicIcon({
  name,
  className = "h-4 w-4 mr-2 text-foreground cursor-pointer",
  size,
  ...props
}: {
  name?: string;
  className?: string;
  size?: number;
  [key: string]: any;
}) {
  if (!name) return null;

  // 🔄 Normalize to PascalCase (e.g., "layout-dashboard" → "LayoutDashboard")
  const normalized = name
    .replace(/[_-]+/g, " ")
    ?.split(" ")
    ?.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

  const Icon = (LucideIcons as any)[normalized];

  if (!Icon) {
    console.warn(`⚠️ Lucide icon not found for: "${name}" (resolved to "${normalized}")`);
    return null;
  }

  return <Icon className={className} size={size} {...props} />;
}
