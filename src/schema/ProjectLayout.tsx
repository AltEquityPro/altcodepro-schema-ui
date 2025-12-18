'use client';
import React, { useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { UIProject, NavigationAPI, AnyObj } from '../types';
import { NavRenderer } from '../components/ui/nav-renderer';
import { CookieBannerRenderer } from '../components/ui/cookie_render';
import { GlobalThemeProvider } from '../components/ui/global-theme-provider';
import { TelemetryProvider } from '../hooks/TelemetryContext';
import { OfflineProvider } from '../hooks/OfflineContext';
import { AnalyticsProvider } from '../hooks/AnalyticsContext';
import { AuthProvider } from './useAuth';
import { useAppState } from './StateContext';
import Loader from '../components/ui/loader';
import { ElementResolver } from './ElementResolver';
import { useActionHandler } from './useActionHandler';
import { RenderChildren } from './RenderChildren';

export interface ProjectLayoutProps {
    project: UIProject;
    loading: boolean;
    nav?: NavigationAPI;
    authToken?: string;
    children?: React.ReactNode;
}
function RenderWithContexts({ project, nav, state, t, setState, clearState, children }: {
    project: UIProject;
    nav?: NavigationAPI;
    state: AnyObj;
    t: (key: string, defaultLabel?: string | undefined) => string;
    setState: (path: string, value: any) => void;
    clearState: () => void;
    children?: React.ReactNode;
}) {
    const { runEventHandler } = useActionHandler({
        globalConfig: project.globalConfig,
        runtime: {
            ...({ nav }),
            patchState: (path: string, val: any) => setState(path, val)
        }
    });
    const layoutClass = project.navigation?.primary?.placement == 'side'
        ? 'flex'
        : 'flex flex-col'

    return (
        <div className={clsx('min-h-screen', layoutClass)}>
            <NavRenderer project={project} state={state} t={t} setState={setState} runEventHandler={runEventHandler} />
            <main className="flex-1">{children}</main>
            <CookieBannerRenderer
                setState={setState}
                project={project}
                state={state}
                t={t}
            />
            {project.footer && (
                <footer className={project.footer.styles?.className || "bg-background text-foreground border-t border-border"}>
                    <div className="mx-auto max-w-7xl px-6 py-12">
                        <div
                            className="flex gap-4"
                        >
                            {project.footer.children ? <RenderChildren
                                state={state}
                                setState={setState}
                                children={project.footer.children}
                                t={t}
                            /> : <ElementResolver
                                state={state}
                                setState={setState}
                                t={t}
                                element={project.footer}
                            />}
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};


export const ProjectLayout = React.memo(function ProjectLayout({
    project,
    loading,
    nav,
    children,
    authToken,
}: ProjectLayoutProps) {
    const { state, t, setState, clearState, setTranslations } = useAppState();
    const user = useMemo(
        () =>
            state?.auth?.user ?? {
                id: state?.auth?.userId,
                orgId: state?.organization?.id,
            },
        [state?.auth?.user, state?.auth?.userId, state?.organization?.id]
    );

    if (loading) {
        return <Loader />;
    }

    const requiresAuth = project.routeList?.routes?.some(r => r.requiresAuth);

    return (
        <GlobalThemeProvider project={project}>
            <OfflineProvider>
                <TelemetryProvider project={project} user={user}>
                    <AnalyticsProvider project={project} user={user}>
                        <AuthProvider
                            requiresAuth={requiresAuth}
                            globalConfig={project.globalConfig}
                            setState={setState}
                            nav={nav}
                            authToken={authToken} // nextjs auth,  firebase auth
                        >
                            <RenderWithContexts
                                project={project}
                                nav={nav}
                                state={state}
                                t={t}
                                setState={setState}
                                clearState={clearState}
                            >
                                {children}
                            </RenderWithContexts>
                        </AuthProvider>
                    </AnalyticsProvider>
                </TelemetryProvider>
            </OfflineProvider>
        </GlobalThemeProvider>
    );
});
