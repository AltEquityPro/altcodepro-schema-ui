'use client';

import { useEffect, useState } from "react";
import clsx from "clsx";
import {
    UIProject,
    ActionType,
    ActionRuntime,
    UIDefinition,
    AnyObj
} from "../types";
import { ScreenRenderer } from "./ScreenRenderer";
import { ElementResolver } from "./ElementResolver";
import { Loader2 } from "lucide-react";
import { NavRenderer } from "@/components/ui/nav-renderer";
import { resolveBinding } from "@/lib/utils";
import { useAppState } from "./StateContext";
import { Button } from "@/components/ui/button";
import { CookieBannerRenderer } from "@/components/ui/cookie_render";
/* -----------------------------
 * THEME: CSS Vars + utility classes
 * ----------------------------- */
function ThemeStyles({ project }: { project: UIProject }) {
    const theme = project.globalStyles?.theme ?? {};
    const { fontFamily = "Inter, ui-sans-serif, system-ui",
        primaryColorLight = "#4f46e5",
        primaryColorDark = "#3730a3",
    } = theme;

    const css = `
:root {
  --acp-font: ${fontFamily};
  --acp-primary: ${primaryColorLight};
  --acp-primary-dark: ${primaryColorDark};
}
html, body, #__next { font-family: var(--acp-font); }
.text-primary { color: var(--acp-primary) !important; }
.text-primary-dark { color: var(--acp-primary-dark) !important; }
.bg-primary { background-color: var(--acp-primary) !important; }
.bg-primary-dark { background-color: var(--acp-primary-dark) !important; }
.border-primary { border-color: var(--acp-primary) !important; }
.fill-primary { fill: var(--acp-primary) !important; }
.stroke-primary { stroke: var(--acp-primary) !important; }
`;

    return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

/* -----------------------------
 * Custom CSS injector
 * ----------------------------- */
function CustomCss({ css }: { css?: string }) {
    if (!css) return null;
    return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

/* -----------------------------
 * Mobile Detection
 * ----------------------------- */
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mql = window.matchMedia("(max-width: 768px)");
        setIsMobile(mql.matches);
        const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener("change", listener);
        return () => mql.removeEventListener("change", listener);
    }, []);
    return isMobile;
}

interface ProjectRouterProps {
    project: UIProject;
    showDebug?: boolean;
    currentScreenDef: UIDefinition;
    loading: boolean;
    runtime?: ActionRuntime;
}

export function ProjectRouter({
    project,
    showDebug,
    runtime = {},
    currentScreenDef,
    loading,
}: ProjectRouterProps) {
    const isMobile = useIsMobile();

    if (loading || !currentScreenDef) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }
    const { state, t } = useAppState();

    const navType = isMobile
        ? project.routeList.responsiveNavType
        : project.routeList.desktopNavType;
    const layoutClass = navType === "side" ? "flex" : "flex flex-col";

    return (
        <div className={clsx("min-h-screen", layoutClass)}>
            {/* 1. Theme */}
            <ThemeStyles project={project} />

            {/* 2. Custom CSS */}
            <CustomCss css={project.globalStyles?.projectStyle} />

            {/* 3. Header */}
            <NavRenderer
                project={project}
                state={state}
                t={t}
            />

            {/* 4. Main */}
            <main className="flex-1">
                {currentScreenDef?.screens?.map((sc) => (
                    <ScreenRenderer
                        key={sc.id}
                        project={project}
                        currentScreenDef={sc}
                        runtime={runtime}
                        showDebug={showDebug}
                    />
                ))}
            </main>

            {/* 5. Footer */}
            {project.footer && <ElementResolver element={project.footer} runtime={runtime} />}

            {/* 6. Cookie banner */}
            <CookieBannerRenderer project={project} state={state} t={t} />
        </div>
    );
}
