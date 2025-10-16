// components/ui/global-theme-provider.tsx
"use client";

import React from "react";
import type { UIProject } from "@/types";

function hexToRgb(hex: string): [number, number, number] | null {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
    if (!m) return null;
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function buildScaleCSS(varName: string) {
    // Build CSS vars for 50..950 using color-mix (approx Tailwind-like)
    // 50..400 lighten with white, 500 = base, 600..950 darken with black
    const lighten: Record<number, number> = { 50: 92, 100: 84, 200: 72, 300: 60, 400: 48 };
    const darken: Record<number, number> = { 600: 16, 700: 28, 800: 40, 900: 52, 950: 64 };

    let css = `
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
  --${varName}-950: color-mix(in srgb, var(--${varName}) ${100 - darken[950]}%, black);`;

    return css;
}

function buildUtilityClasses(name: "primary" | "secondary") {
    const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    const cls = [];

    // Base
    cls.push(`
    .text-${name} { color: var(--acp-${name}); }
    .bg-${name} { background-color: var(--acp-${name}); }
    .border-${name} { border-color: var(--acp-${name}); }
  `);

    // Shades
    for (const s of shades) {
        cls.push(`
      .text-${name}-${s} { color: var(--acp-${name}-${s}); }
      .bg-${name}-${s} { background-color: var(--acp-${name}-${s}); }
      .border-${name}-${s} { border-color: var(--acp-${name}-${s}); }

      /* opacity utility like bg-*-950/50 (slash must be escaped) */
      .bg-${name}-${s}\\/${50} { background-color: color-mix(in srgb, var(--acp-${name}-${s}) 50%, transparent); }
      .bg-${name}-${s}\\/${20} { background-color: color-mix(in srgb, var(--acp-${name}-${s}) 20%, transparent); }
      .bg-${name}-${s}\\/${10} { background-color: color-mix(in srgb, var(--acp-${name}-${s}) 10%, transparent); }
    `);
    }

    return cls.join("\n");
}

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
        fontFamily = "Inter, ui-sans-serif, system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif",
        fontSizeBase = "16px",
        colorScheme = "light dark",
        primaryColorLight = "#0c74cf",
        primaryColorDark = "#3b82f6",
        secondaryColorLight = "#6b7280",
        secondaryColorDark = "#9ca3af",

        backgroundLight,
        backgroundDark,
        foregroundLight,
        foregroundDark,
        borderLight,
        borderDark,
        accentLight,
        accentDark,
    } = theme;

    // Choose which to bind to (light by default; dark can be toggled by class or system)
    const primary = primaryColorLight || "#0c74cf";
    const secondary = secondaryColorLight || "#6b7280";

    // Compute RGB once for alpha helpers
    React.useEffect(() => {
        const root = document.documentElement;

        const setVar = (k: string, v: string) => root.style.setProperty(k, v);

        setVar("--acp-font", fontFamily);
        setVar("--acp-font-size-base", fontSizeBase);
        setVar("--acp-primary", primary);
        setVar("--acp-secondary", secondary);
        setVar("--acp-primary-dark", primaryColorDark);
        setVar("--acp-secondary-dark", secondaryColorDark);
        if (backgroundLight) {
            setVar("--acp-background", backgroundLight);
        }
        if (backgroundDark) {
            setVar("--acp-background-dark", backgroundDark);
        }
        if (foregroundLight) {
            setVar("--acp-foreground", foregroundLight);
        }
        if (foregroundDark) {
            setVar("--acp-foreground-dark", foregroundDark);
        }
        if (borderLight) {
            setVar("--acp-border", borderLight);
        }
        if (borderDark) {
            setVar("--acp-border-dark", borderDark);
        }
        if (accentLight) {
            setVar("--acp-accent", accentLight);
        }
        if (accentDark) {
            setVar("--acp-accent-dark", accentDark);
        }
        root.style.setProperty("color-scheme", colorScheme);

        const p = hexToRgb(primary);
        const s = hexToRgb(secondary);
        if (p) setVar("--acp-primary-rgb", `${p[0]}, ${p[1]}, ${p[2]}`);
        if (s) setVar("--acp-secondary-rgb", `${s[0]}, ${s[1]}, ${s[2]}`);

        return () => {
            [
                "--acp-font", "--acp-font-size-base", "--acp-primary", "--acp-secondary",
                "--acp-primary-dark", "--acp-secondary-dark", "--acp-background", "--acp-background-dark",
                "--acp-foreground", "--acp-foreground-dark", "--acp-border", "--acp-border-dark",
                "--acp-accent", "--acp-accent-dark", "--acp-primary-rgb", "--acp-secondary-rgb",
            ].forEach(k => root.style.removeProperty(k));
        };
    }, [
        fontFamily, fontSizeBase, colorScheme,
        primary, secondary, primaryColorDark, secondaryColorDark,
        backgroundLight, backgroundDark, foregroundLight, foregroundDark,
        borderLight, borderDark, accentLight, accentDark
    ]);

    const computedCss = `
    :root {
    color-scheme: ${colorScheme};
    --acp-font: ${fontFamily};
    --acp-font-size-base: ${fontSizeBase};
    --acp-primary: ${primaryColorLight};
    --acp-primary-dark: ${primaryColorDark};
    --acp-secondary: ${secondaryColorLight};
    --acp-secondary-dark: ${secondaryColorDark};
    --acp-primary-bg-soft: color-mix(in srgb, var(--acp-primary) 10%, transparent);

    ${buildScaleCSS("acp-primary")}
    ${buildScaleCSS("acp-secondary")}
    }

    .dark {
    --acp-border: ${borderDark};
    --acp-accent: ${accentDark};
    --acp-primary: ${primaryColorDark};
    --acp-secondary: ${secondaryColorDark};
    ${buildScaleCSS("acp-primary")}
    ${buildScaleCSS("acp-secondary")}
    }

    html, body, #__next {
    font-family: var(--acp-font);
    font-size: var(--acp-font-size-base);
    }

  /* Core utilities expected by schemas */
    .text-primary { color: var(--acp-primary); }
    .text-secondary { color: var(--acp-secondary); }
    .bg-primary-soft { background-color: var(--acp-primary-bg-soft) !important; }
    .bg-primary-hover { background-color: var(--acp-primary-bg-hover) !important; }
    .border-primary { border-color: var(--acp-primary); }
    .border-secondary { border-color: var(--acp-secondary); }

  /* Shade utilities (50..950) + alpha variants */
    ${buildUtilityClasses("primary")}
    ${buildUtilityClasses("secondary")}
/* Adaptive hover background */
    [data-theme="dark"] .hover\\:bg-primary-hover:hover {
        background-color: color-mix(in srgb, var(--acp-primary) 25%, transparent);
    }
    [data-theme="light"] .hover\\:bg-primary-hover:hover {
        background-color: color-mix(in srgb, var(--acp-primary) 12%, white);
    }
    nav .group-hover\:scale-submenu {
        transform: scale(1.02) translateY(-1px);
        transition: transform 0.2s ease;
    }
    ${customCss ?? ""}
`;

    const combinedCss = `${computedCss}\n${customCss ?? ""}`;
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: combinedCss }} />
            {children}
        </>
    );
}
