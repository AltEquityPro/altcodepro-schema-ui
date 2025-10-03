import { UIProject } from "@/types";
import React from "react";

export function GlobalThemeProvider({ project }: { project: UIProject }) {
    React.useEffect(() => {
        if (!project?.globalStyles?.theme) return;

        const root = document.documentElement;
        const { fontFamily, primaryColorLight, primaryColorDark, colorScheme } =
            project.globalStyles.theme;

        // Set CSS variables on <html>
        if (fontFamily) root.style.setProperty("--acp-font", fontFamily);
        if (primaryColorLight)
            root.style.setProperty("--acp-primary", primaryColorLight);
        if (primaryColorDark)
            root.style.setProperty("--acp-primary-dark", primaryColorDark);

        // Apply color scheme (light/dark)
        if (colorScheme) root.style.setProperty("color-scheme", colorScheme);

        // Also ensure font-family applies globally
        if (fontFamily) root.style.setProperty("font-family", `var(--acp-font)`);

        return () => {
            // Optional cleanup if project changes dynamically
            root.style.removeProperty("--acp-font");
            root.style.removeProperty("--acp-primary");
            root.style.removeProperty("--acp-primary-dark");
            root.style.removeProperty("color-scheme");
            root.style.removeProperty("font-family");
        };
    }, [project]);

    return null; // nothing to render, purely side-effects
}
