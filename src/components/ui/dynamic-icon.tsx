import * as LucideIcons from "lucide-react";
import * as React from "react";


export function DynamicIcon({ name, ...props }: { name: string;[key: string]: any; }) {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon {...props} /> : null;
}
