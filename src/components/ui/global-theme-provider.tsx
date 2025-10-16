import React from "react";
import { UIProject } from "@/types";

export function GlobalThemeProvider({ project, children }: { project: UIProject, children: React.ReactNode; }) {
    const customCss = project?.globalStyles?.projectStyle ?? "";
    const theme = project?.globalStyles?.theme ?? {};

    const {
        fontFamily = "Inter, ui-sans-serif, system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif",
        fontSizeBase = "16px",
        colorScheme = "light dark",
        primaryColorLight = "#4f46e5",
        primaryColorDark = "#3730a3",
        secondaryColorLight = "#F1C40F",
        secondaryColorDark = "#C49A00",
    } = theme;

    // ————————————————————————
    // 1️⃣ Runtime <html> variable binding
    // ————————————————————————
    React.useEffect(() => {
        if (!project?.globalStyles?.theme) return;

        const root = document.documentElement;
        const vars: Record<string, string> = {
            "--acp-font": fontFamily,
            "--acp-font-size-base": fontSizeBase,
            "--acp-primary": primaryColorLight,
            "--acp-primary-dark": primaryColorDark,
            "--acp-secondary": secondaryColorLight,
            "--acp-secondary-dark": secondaryColorDark,
            "color-scheme": colorScheme,
        };

        for (const [key, value] of Object.entries(vars)) {
            if (value) root.style.setProperty(key, value);
        }

        // Cleanup when project changes
        return () => {
            for (const key of Object.keys(vars)) {
                root.style.removeProperty(key);
            }
        };
    }, [
        fontFamily,
        fontSizeBase,
        colorScheme,
        primaryColorLight,
        primaryColorDark,
        secondaryColorLight,
        secondaryColorDark,
        project,
    ]);

    // ————————————————————————
    // 2️⃣ CSS Injection (computed + custom)
    // ————————————————————————
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
      --acp-primary-bg-hover: color-mix(in srgb, var(--acp-primary) 15%, transparent);
      --acp-primary-border: color-mix(in srgb, var(--acp-primary) 50%, transparent);
  }

  html, body, #__next {
      font-family: var(--acp-font);
      font-size: var(--acp-font-size-base);
  }

  /* Theming utility classes */
  .text-primary { color: var(--acp-primary) !important; }
  .bg-primary-soft { background-color: var(--acp-primary-bg-soft) !important; }
  .bg-primary-hover { background-color: var(--acp-primary-bg-hover) !important; }
  .border-primary { border-color: var(--acp-primary-border) !important; }

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
