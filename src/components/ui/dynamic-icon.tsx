"use client";
import * as LucideIcons from "lucide-react";
import * as React from "react";

/**
 * Dynamically renders a Lucide icon by name.
 * Example:
 *   <DynamicIcon name="CheckCircle" className="text-green-500" size={20} />
 */
export function DynamicIcon({
  name,
  ...props
}: {
  name?: string;
  [key: string]: any;
}) {
  if (!name) return null;
  const Icon = (LucideIcons as any)[name] || (LucideIcons as any)[name?.charAt(0).toUpperCase() + name?.slice(1)];
  return Icon ? <Icon {...props} /> : null;
}
