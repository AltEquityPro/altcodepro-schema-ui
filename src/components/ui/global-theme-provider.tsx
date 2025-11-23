"use client";

import React from "react";
import type { UIProject } from "../../types";

/* =======================================================
🎨 Color Utility Helpers
======================================================= */
function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function buildScaleCSS(varName: string) {
  const lighten: Record<number, number> = { 50: 92, 100: 84, 200: 72, 300: 60, 400: 48 };
  const darken: Record<number, number> = { 600: 16, 700: 28, 800: 40, 900: 52, 950: 64 };
  return `
  --${varName}-50:  color-mix(in srgb, var(--${varName}) ${lighten[50]}%, white);
  --${varName}-100: color-mix(in srgb, var(--${varName}) ${lighten[100]}%, white);
  --${varName}-200: color-mix(in srgb, var(--${varName}) ${lighten[200]}%, white);
  --${varName}-300: color-mix(in srgb, var(--${varName}) ${lighten[300]}%, white);
  --${varName}-400: color-mix(in srgb, var(--${varName}) ${lighten[400]}%, white);
  --${varName}-500: var(--${varName});
  --${varName}-600: color-mix(in srgb, var(--${varName}) ${100 - darken[600]}%, black);
  --${varName}-700: color-mix(in srgb, var(--${varName}) ${100 - darken[700]}%, black);
  --${varName}-800: color-mix(in srgb, var(--${varName}) ${100 - darken[800]}%, black);
  --${varName}-900: color-mix(in srgb, var(--${varName}) ${100 - darken[900]}%, black);
  --${varName}-950: color-mix(in srgb, var(--${varName}) ${100 - darken[950]}%, black);
  `;
}

function buildUtilityClasses(name: "primary" | "secondary") {
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const cls: string[] = [];

  cls.push(`
.text-${name} { color: var(--acp-${name}); }
.bg-${name} { background-color: var(--acp-${name}); }
.border-${name} { border-color: var(--acp-${name}); }
`);

  for (const s of shades) {
    cls.push(`
.text-${name}-${s} { color: var(--acp-${name}-${s}); }
.bg-${name}-${s} { background-color: var(--acp-${name}-${s}); }
.border-${name}-${s} { border-color: var(--acp-${name}-${s}); }

.bg-${name}-${s}\\/50 { background-color: color-mix(in srgb, var(--acp-${name}-${s}) 50%, transparent); }
.bg-${name}-${s}\\/20 { background-color: color-mix(in srgb, var(--acp-${name}-${s}) 20%, transparent); }
.bg-${name}-${s}\\/10 { background-color: color-mix(in srgb, var(--acp-${name}-${s}) 10%, transparent); }
`);
  }

  return cls.join("\n");
}

/* =======================================================
🌈 Global Theme Provider
======================================================= */
export function GlobalThemeProvider({
  project,
  children,
}: {
  project: UIProject;
  children: React.ReactNode;
}) {
  const customCss = project?.globalStyles?.customCss ?? "";
  const theme = project?.globalStyles?.theme ?? {};

  const {
    fontFamily = "Inter, system-ui, sans-serif",
    fontSizeBase = "16px",
    colorScheme = "light dark",
    primaryColorLight = "#0c74cf",
    primaryColorDark = "#1a8fff",
    secondaryColorLight = "#6b7280",
    secondaryColorDark = "#9ca3af",
    backgroundLight = "#ffffff",
    backgroundDark = "#0b0b0b",
    foregroundLight = "#111111",
    foregroundDark = "#f5f5f5",
    borderLight = "#e5e7eb",
    borderDark = "#2f2f2f",
    accentLight = "#f472b6",
    accentDark = "#db2777",
  } = theme;

  React.useEffect(() => {
    const root = document.documentElement;
    const setVar = (k: string, v?: string) => v && root.style.setProperty(k, v);

    setVar("--acp-font", fontFamily);
    setVar("--acp-font-size-base", fontSizeBase);
    setVar("--acp-primary", primaryColorLight);
    setVar("--acp-primary-dark", primaryColorDark);
    setVar("--acp-secondary", secondaryColorLight);
    setVar("--acp-secondary-dark", secondaryColorDark);
    setVar("--acp-border", borderLight);
    setVar("--acp-border-dark", borderDark);
    setVar("--acp-accent", accentLight);
    setVar("--acp-accent-dark", accentDark);
    setVar("--acp-background", backgroundLight);
    setVar("--acp-background-dark", backgroundDark);
    setVar("--acp-foreground", foregroundLight);
    setVar("--acp-foreground-dark", foregroundDark);

    const p = hexToRgb(primaryColorLight);
    if (p) root.style.setProperty("--acp-primary-rgb", `${p[0]},${p[1]},${p[2]}`);
  }, [
    fontFamily,
    fontSizeBase,
    primaryColorLight,
    primaryColorDark,
    secondaryColorLight,
    secondaryColorDark,
    backgroundLight,
    backgroundDark,
    borderLight,
    borderDark,
    accentLight,
    accentDark,
  ]);

  /* 🧠 Memoized CSS string for performance */
  const computedCss = React.useMemo(() => `
  :root {
    color-scheme: ${colorScheme};
    ${buildScaleCSS("acp-primary")}
    ${buildScaleCSS("acp-secondary")}
  }

  @media (prefers-color-scheme: dark) {
    :root {
      ${buildScaleCSS("acp-primary")}
      ${buildScaleCSS("acp-secondary")}
    }
  }
  @media (prefers-color-scheme: dark) {
    .bg-\[var\(--acp-primary\)\] {
      background-color: var(--acp-primary-dark) !important;
    }
    .bg-\[var\(--acp-secondary\)\] {
      background-color: var(--acp-secondary-dark) !important;
    }
  }
  html, body {
    font-family: var(--acp-font);
    font-size: var(--acp-font-size-base);
    background-color: var(--acp-background);
    color: var(--acp-foreground);
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  /* Base border color */
  *, *::before, *::after {
    border-color: var(--acp-border);
  }

  @media (prefers-color-scheme: dark) {
    *, *::before, *::after {
      border-color: var(--acp-border-dark);
    }
  }

  /* =======================================================
    🧠 AI-Compatible Semantic Utility Layer
    Ensures all AI-generated Tailwind/Shadcn classes work.
======================================================= */

/* --- Backgrounds --- */
.bg-background { background-color: var(--acp-background) !important; }
.bg-foreground { background-color: var(--acp-foreground) !important; }
.bg-card { background-color: var(--acp-background) !important; }
.bg-muted { background-color: color-mix(in srgb, var(--acp-foreground) 6%, var(--acp-background)) !important; }
.bg-popover { background-color: var(--acp-background) !important; }
.bg-primary { background-color: var(--acp-primary) !important; }
.bg-secondary { background-color: var(--acp-secondary) !important; }
.bg-accent { background-color: var(--acp-accent) !important; }
.bg-destructive { background-color: var(--acp-accent) !important; } /* reusing accent */

/* Opacity variants often generated by AI */
.bg-muted/50 { background-color: color-mix(in srgb, var(--acp-foreground) 6%, transparent) !important; }

/* --- Texts --- */
.text-foreground { color: var(--acp-foreground) !important; }
.text-background { color: var(--acp-background) !important; }
.text-muted { color: color-mix(in srgb, var(--acp-foreground) 60%, var(--acp-background)) !important; }
.text-muted-foreground { color: color-mix(in srgb, var(--acp-foreground) 45%, var(--acp-background)) !important; }
.text-popover-foreground { color: var(--acp-foreground) !important; }
.text-primary { color: var(--acp-primary) !important; }
.text-primary-foreground { color: var(--acp-background) !important; }
.text-secondary { color: var(--acp-secondary) !important; }
.text-secondary-foreground { color: var(--acp-background) !important; }
.text-accent { color: var(--acp-accent) !important; }
.text-accent-foreground { color: var(--acp-background) !important; }
.text-destructive { color: var(--acp-accent) !important; }
.text-destructive-foreground { color: var(--acp-background) !important; }

/* --- Borders --- */
.border-border { border-color: var(--acp-border) !important; }
.border-input { border-color: var(--acp-border) !important; }
.border-muted { border-color: color-mix(in srgb, var(--acp-foreground) 20%, var(--acp-background)) !important; }
.border-primary { border-color: var(--acp-primary) !important; }
.border-secondary { border-color: var(--acp-secondary) !important; }
.border-accent { border-color: var(--acp-accent) !important; }
.border-destructive { border-color: var(--acp-accent) !important; }

/* --- Shadows AI often assumes exist --- */
.shadow-card { 
  box-shadow: 0 2px 10px color-mix(in srgb, var(--acp-foreground) 8%, transparent);
}
.shadow-muted {
  box-shadow: 0 2px 4px color-mix(in srgb, var(--acp-foreground) 5%, transparent);
}

/* --- Rings (common) --- */
.ring-primary { 
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--acp-primary) 40%, transparent) !important;
}

/* =======================================================
    🌙 Dark mode variants 
======================================================= */
@media (prefers-color-scheme: dark) {
  .bg-background { background-color: var(--acp-background-dark) !important; }
  .text-foreground { color: var(--acp-foreground-dark) !important; }
  .border-border { border-color: var(--acp-border-dark) !important; }

  .bg-card { background-color: var(--acp-background-dark) !important; }
  .bg-popover { background-color: var(--acp-background-dark) !important; }

  .text-muted { color: color-mix(in srgb, var(--acp-foreground-dark) 50%, var(--acp-background-dark)) !important; }
  .text-muted-foreground { color: color-mix(in srgb, var(--acp-foreground-dark) 35%, var(--acp-background-dark)) !important; }

  .shadow-card {
    box-shadow: 0 2px 10px color-mix(in srgb, var(--acp-foreground-dark) 20%, transparent);
  }
}

  .border,
  .border-input,
  .border-muted,
  .border-neutral,
  [data-slot="input"],
  [data-slot="textarea"],
  [data-slot="select"] {
    border-color: var(--acp-border) !important;
  }

  @media (prefers-color-scheme: dark) {
    .border,
    .border-input,
    .border-muted,
    .border-neutral,
    [data-slot="input"],
    [data-slot="textarea"],
    [data-slot="select"] {
      border-color: var(--acp-border-dark) !important;
    }
  }

  :focus-visible {
    outline-color: var(--acp-primary);
  }

  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    border-color: var(--acp-primary) !important;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--acp-primary) 30%, transparent);
  }

  /* Invalid states */
  [aria-invalid="true"] {
    border-color: var(--acp-accent) !important;
  }

  /* Smooth transition */
  input, textarea, select, button, [data-slot="input"] {
      transition: border-color 0.25s ease, box-shadow 0.25s ease, background-color 0.3s ease;
  }
  @media (prefers-color-scheme: dark) {
    body {
      background-color: var(--acp-background-dark);
      color: var(--acp-foreground-dark);
    }
  }
  .group:hover .group-hover\:visible {
    transition-delay: 100ms;
  }

  ${buildUtilityClasses("primary")}
  ${buildUtilityClasses("secondary")}
  ${customCss}
`, [colorScheme, customCss]);

  /* 🧩 Inject computed CSS */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: computedCss }} />
      {children}
    </>
  );
}
