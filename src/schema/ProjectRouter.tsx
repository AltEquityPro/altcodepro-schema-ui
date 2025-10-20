'use client';
import clsx from "clsx";
import {
    UIProject,
    ActionRuntime,
    UIDefinition,
    NavigationAPI
} from "../types";
import { ScreenRenderer } from "./ScreenRenderer";
import { ElementResolver } from "./ElementResolver";
import { Loader2 } from "lucide-react";
import { NavRenderer } from "../components/ui/nav-renderer";
import { useAppState } from "./StateContext";
import { CookieBannerRenderer } from "../components/ui/cookie_render";
import { GlobalThemeProvider } from "../components/ui/global-theme-provider";
import { useIsMobile } from "../hooks/use-mobile";
import { toast, Toaster } from "../components/ui/sonner";
import { AuthProvider } from "./useActionHandler";
import { TelemetryProvider } from "../hooks/TelemetryContext";
import { OfflineProvider } from "../hooks/OfflineContext";
import { AnalyticsProvider } from "../hooks/AnalyticsContext";

export interface ProjectRouterProps {
    project: UIProject;
    showDebug?: boolean;
    currentScreenDef: UIDefinition;
    loading: boolean;
    runtime?: ActionRuntime;
    nav?: NavigationAPI;
}
type titleT = (() => React.ReactNode) | React.ReactNode;

export function ProjectRouter({
    project,
    nav = {},
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
    const runtimeWithNav = {
        ...runtime, nav,
        toast: (msg: titleT | React.ReactNode, variant = "info") => {
            switch (variant) {
                case "success":
                    toast.success(msg);
                    break;
                case "error":
                    toast.error(msg);
                    break;
                case "warning":
                    toast.warning(msg);
                    break;
                default:
                    toast.info(msg);
            }
        },
    };
    const user = state?.auth?.user || { id: state?.auth?.userId, orgId: state?.organization?.id };

    return (
        <GlobalThemeProvider project={project}>
            <OfflineProvider>
                <TelemetryProvider project={project} user={user}>
                    <AnalyticsProvider project={project} user={user}>
                        <AuthProvider globalConfig={project.globalConfig}>
                            <div className={clsx("min-h-screen", layoutClass)}>
                                {/* 3. Header */}
                                <NavRenderer
                                    project={project}
                                    state={state}
                                    t={t}
                                />

                                {/* 4. Main */}
                                <main className="flex-1">
                                    <Toaster closeButton expand duration={10 * 60 * 60 * 60} richColors position="top-right" />
                                    {currentScreenDef?.screens?.map((sc) => (
                                        <ScreenRenderer
                                            state={state}
                                            t={t}
                                            setState={setState}
                                            key={sc.id}
                                            project={project}
                                            currentScreenDef={sc}
                                            runtime={runtimeWithNav}
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
                        </AuthProvider>
                    </AnalyticsProvider>
                </TelemetryProvider>
            </OfflineProvider>
        </GlobalThemeProvider>
    );
}
