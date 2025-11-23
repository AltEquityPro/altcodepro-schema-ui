'use client';
import React, { useMemo } from 'react';
import clsx from 'clsx';
import { UIProject, NavigationAPI } from '../types';
import { useIsMobile } from '../hooks/use-mobile';
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

export interface ProjectLayoutProps {
    project: UIProject;
    loading: boolean;
    nav?: NavigationAPI;
    children?: React.ReactNode;
}
function RenderWithContexts({ project, nav, state, t, setState, clearState, children }: any) {
    const { runEventHandler } = useActionHandler({
        globalConfig: project.globalConfig,
        runtime: {
            ...({ nav }),
            patchState: (path: string, val: any) => setState(path, val)
        }
    });
    const isMobile = useIsMobile();

    const navType = isMobile
        ? project.routeList?.responsiveNavType
        : project.routeList?.desktopNavType;

    const layoutClass = project.routeList
        ? navType === 'side'
            ? 'flex'
            : 'flex flex-col'
        : 'flex';

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
                <ElementResolver
                    state={state}
                    setState={setState}
                    t={t}
                    element={project.footer}
                />
            )}
        </div>
    );
};


export const ProjectLayout = React.memo(function ProjectLayout({
    project,
    loading,
    nav,
    children,
}: ProjectLayoutProps) {
    const { state, t, setState, clearState, setTranslations } = useAppState();

    if (project?.translations) {
        setTranslations(project.translations);
    }

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
