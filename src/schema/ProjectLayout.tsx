'use client';
import clsx from "clsx";
import {
    UIProject,
    NavigationAPI
} from "../types";
import { ElementResolver } from "./ElementResolver";
import { Loader2 } from "lucide-react";
import { NavRenderer } from "../components/ui/nav-renderer";
import { useAppState } from "./StateContext";
import { CookieBannerRenderer } from "../components/ui/cookie_render";
import { GlobalThemeProvider } from "../components/ui/global-theme-provider";
import { useIsMobile } from "../hooks/use-mobile";
import { TelemetryProvider } from "../hooks/TelemetryContext";
import { OfflineProvider } from "../hooks/OfflineContext";
import { AnalyticsProvider } from "../hooks/AnalyticsContext";
import { AuthProvider } from "./useAuth";

export interface ProjectLayoutProps {
    project: UIProject;
    loading: boolean;
    nav?: NavigationAPI;
    children?: React.ReactNode;
}

export function ProjectLayout({
    project,
    children,
    nav = {},
    loading,
}: ProjectLayoutProps) {
    const isMobile = useIsMobile();

    if (loading) {
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
    const user = state?.auth?.user || { id: state?.auth?.userId, orgId: state?.organization?.id };
    const requiresAuth = project.routeList.routes.some(r => r.requiresAuth)
    return (
        <GlobalThemeProvider project={project}>
            <OfflineProvider>
                <TelemetryProvider project={project} user={user}>
                    <AnalyticsProvider project={project} user={user}>
                        <AuthProvider requiresAuth={requiresAuth} globalConfig={project.globalConfig} setState={setState} nav={nav}>
                            <div className={clsx("min-h-screen", layoutClass)}>
                                <NavRenderer
                                    project={project}
                                    nav={nav}
                                    state={state}
                                    setState={setState}
                                    t={t}
                                />

                                <main className="flex-1">
                                    {children}
                                </main>

                                <CookieBannerRenderer setState={setState} project={project} state={state} t={t} />

                                {project.footer && <ElementResolver
                                    state={state}
                                    setState={setState}
                                    t={t}
                                    element={project.footer} />}
                            </div>
                        </AuthProvider>
                    </AnalyticsProvider>
                </TelemetryProvider>
            </OfflineProvider>
        </GlobalThemeProvider>
    );
}
