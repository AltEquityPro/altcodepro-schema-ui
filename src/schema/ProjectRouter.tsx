'use client';
import clsx from "clsx";
import {
    UIProject,
    ActionRuntime,
    UIDefinition
} from "../types";
import { ScreenRenderer } from "./ScreenRenderer";
import { ElementResolver } from "./ElementResolver";
import { Loader2 } from "lucide-react";
import { NavRenderer } from "@/components/ui/nav-renderer";
import { useAppState } from "./StateContext";
import { CookieBannerRenderer } from "@/components/ui/cookie_render";
import { GlobalThemeProvider } from "@/components/ui/global-theme-provider";
import { useIsMobile } from "@/hooks/use-mobile";

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
    const { state, t, setState } = useAppState();

    const navType = isMobile
        ? project.routeList.responsiveNavType
        : project.routeList.desktopNavType;
    const layoutClass = navType === "side" ? "flex" : "flex flex-col";

    return (
        <GlobalThemeProvider project={project}>
            <div className={clsx("min-h-screen", layoutClass)}>
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
                            state={state}
                            t={t}
                            setState={setState}
                            key={sc.id}
                            project={project}
                            currentScreenDef={sc}
                            runtime={runtime}
                            showDebug={showDebug}
                        />
                    ))}
                </main>

                {/* 5. Footer */}
                {project.footer && <ElementResolver
                    state={state}
                    setState={setState}
                    t={t}
                    element={project.footer} />}

                {/* 6. Cookie banner */}
                <CookieBannerRenderer setState={setState} project={project} state={state} t={t} />
            </div>
        </GlobalThemeProvider>
    );
}
