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
        }

        html, body, #__next {
            font-family: var(--acp-font);
            font-size: var(--acp-font-size-base);
        }

        .text-primary { color: var(--acp-primary) !important; }
        .text-primary-dark { color: var(--acp-primary-dark) !important; }
        .text-secondary { color: var(--acp-secondary) !important; }
        .text-secondary-dark { color: var(--acp-secondary-dark) !important; }

        .bg-primary { background-color: var(--acp-primary) !important; }
        .bg-primary-dark { background-color: var(--acp-primary-dark) !important; }
        .bg-secondary { background-color: var(--acp-secondary) !important; }
        .bg-secondary-dark { background-color: var(--acp-secondary-dark) !important; }

        .border-primary { border-color: var(--acp-primary) !important; }
        .border-secondary { border-color: var(--acp-secondary) !important; }

        .fill-primary { fill: var(--acp-primary) !important; }
        .stroke-primary { stroke: var(--acp-primary) !important; }
    `;

    const combinedCss = `${computedCss}\n${customCss ?? ""}`;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: combinedCss }} />
            {children}
        </>
    );
}
