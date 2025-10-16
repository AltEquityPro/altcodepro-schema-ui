"use client";

import React from "react";
import type { UIProject } from "@/types";

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
    const customCss = project?.globalStyles?.projectStyle ?? "";
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

    /* 🌗 Detect and apply dark mode */
    React.useEffect(() => {
        const html = document.documentElement;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        const useDark =
            colorScheme === "dark" ||
            (colorScheme.includes("light dark") && prefersDark);

        if (useDark) {
            html.dataset.theme = "dark";
            html.classList.add("dark"); // <-- add this line
        } else {
            html.dataset.theme = "light";
            html.classList.remove("dark");
        }

    }, [colorScheme]);

    /* 🎨 Set global CSS variables */
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

  html, body {
    font-family: var(--acp-font);
    font-size: var(--acp-font-size-base);
    background-color: var(--acp-background);
    color: var(--acp-foreground);
    transition: background-color 0.3s ease, color 0.3s ease;
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
