"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { UIProject, UIScreenDef, IRoute, ElementType, MenuElement, SidebarElement, ContainerElement, ButtonElement, ActionType, DrawerElement, IconElement, UIElement } from "../types";
import { ScreenRenderer, ScreenRuntime } from "./ScreenRenderer";
import { ElementResolver } from "./ElementResolver";
import { Loader2 } from "lucide-react";

interface ProjectRouterProps {
    project: UIProject;
    runtime: ScreenRuntime;
    showDebug?: boolean;
    preloadedScreens?: Record<string, UIScreenDef>;
}

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mql = window.matchMedia('(max-width: 768px)');
        setIsMobile(mql.matches);
        const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener('change', listener);
        return () => mql.removeEventListener('change', listener);
    }, []);
    return isMobile;
}

function flattenRoutes(routes: IRoute[], parentHref = ''): IRoute[] {
    return routes.reduce((acc: IRoute[], route) => {
        const fullHref = `${parentHref}${route.href}`.replace('//', '/');
        const updatedRoute = { ...route, href: fullHref };
        acc.push(updatedRoute);
        if (route.nested) {
            acc.push(...flattenRoutes(route.nested, fullHref));
        }
        return acc;
    }, []);
}

function generateMenuItems(routes: IRoute[]): MenuElement['items'] {
    return routes.filter(r => r.showInNavigation).map(route => ({
        id: route.href,
        type: 'item' as const,
        label: route.label,
        icon: route.icon,
        href: route.href,
        onSelect: { action: ActionType.navigation, params: { href: route.href } },
        ...(route.nested ? { type: 'sub' as const, items: generateMenuItems(route.nested) } : {}),
    })) as any;
}

function generateSidebarFromRoutes(routes: IRoute[]): SidebarElement {
    return {
        type: ElementType.sidebar,
        id: 'nav-sidebar',
        groups: routes.filter(r => r.showInNavigation).map(route => ({
            id: route.href,
            label: route.label,
            items: route.nested
                ? generateMenuItems(route.nested).map((item: any) => ({
                    type: ElementType.button,
                    id: item.id,
                    text: item.label,
                    iconLeft: item.icon ? { type: ElementType.icon, name: item.icon, size: 20 } as IconElement : undefined,
                    onClick: item.onSelect,
                }))
                : [{
                    type: ElementType.button,
                    id: route.href,
                    text: route.label,
                    iconLeft: route.icon ? { type: ElementType.icon, name: route.icon, size: 20 } as IconElement : undefined,
                    onClick: { action: ActionType.navigation, params: { href: route.href } },
                }],
        })) as any,
    } as any;
}

function generateBottomNav(routes: IRoute[]): ContainerElement {
    return {
        type: ElementType.container,
        id: 'bottom-nav',
        layout: 'flex',
        justify: 'around',
        className: 'fixed bottom-0 left-0 right-0 bg-background border-t p-2',
        children: routes.filter(r => r.showInBottomBar).map(route => ({
            type: ElementType.button,
            id: route.href,
            text: route.label,
            iconLeft: route.icon ? { type: ElementType.icon, name: route.icon, size: 24 } as IconElement : undefined,
            variant: 'ghost',
            size: 'icon',
            onClick: { action: ActionType.navigation, params: { href: route.href } },
        } as any)),
    } as any;
}

function generateBurgerMenu(routes: IRoute[]): DrawerElement {
    return {
        type: ElementType.drawer,
        id: 'burger-drawer',
        direction: 'left',
        size: 'md',
        trigger: {
            type: ElementType.button,
            id: 'burger-trigger',
            iconLeft: { type: ElementType.icon, name: 'menu', size: 24 } as IconElement,
            variant: 'ghost',
            size: 'icon',
        } as ButtonElement,
        title: 'Menu',
        content: generateMenuItems(routes).map((item: any) => ({
            type: ElementType.button,
            id: item.id,
            text: item.label,
            onClick: item.onSelect,
        } as any)),
    } as any;
}

export function ProjectRouter({ project, runtime, showDebug, preloadedScreens = {} }: ProjectRouterProps) {
    const [currentScreen, setCurrentScreen] = useState<UIScreenDef | null>(null);
    const [loading, setLoading] = useState(true);
    const isMobile = useIsMobile();
    const flatRoutes = useMemo(() => flattenRoutes(project.routeList.routes), [project.routeList.routes]);

    const findRouteByHref = useCallback((href: string) => flatRoutes.find(r => r.href === href) || project.routeList.routes[0], [flatRoutes, project.routeList.routes]);

    const loadScreen = useCallback(async (route: IRoute) => {
        setLoading(true);
        let screen: UIScreenDef | undefined;
        if (route.screenId && preloadedScreens[route.screenId]) {
            screen = preloadedScreens[route.screenId];
        } else if (route.screenConfigUrl) {
            try {
                const res = await fetch(route.screenConfigUrl);
                if (!res.ok) throw new Error(`Failed to fetch screen: ${res.status}`);
                screen = await res.json();
            } catch (error) {
                console.error('Error loading screen:', error);
                // Optionally handle error, e.g., redirect or show fallback
            }
        }
        if (screen) setCurrentScreen(screen);
        setLoading(false);
    }, [preloadedScreens]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Initial load
        const initialHref = window.location.pathname || '/';
        const initialRoute = findRouteByHref(initialHref);
        loadScreen(initialRoute);

        // Navigation listener
        const handlePopstate = () => {
            const href = window.location.pathname;
            const route = findRouteByHref(href);
            loadScreen(route);
        };
        window.addEventListener('popstate', handlePopstate);

        return () => window.removeEventListener('popstate', handlePopstate);
    }, [findRouteByHref, loadScreen]);

    // Override runtime.navigate for history management
    const originalNavigate = runtime.navigate;
    runtime.navigate = (href: string, replace?: boolean) => {
        if (typeof window === 'undefined') return;
        const fullHref = `${project.routeBase || ''}${href}`.replace('//', '/');
        if (replace) {
            window.history.replaceState({}, '', fullHref);
        } else {
            window.history.pushState({}, '', fullHref);
        }
        const route = findRouteByHref(fullHref);
        loadScreen(route);
        originalNavigate?.(href, replace);
    };

    const navType = isMobile ? project.routeList.responsiveNavType : project.routeList.desktopNavType;

    let navElement: UIElement | null = null;
    const navRoutes = project.routeList.routes.filter(r => r.showInNavigation);

    if (navType === 'top') {
        navElement = {
            type: ElementType.menu,
            variant: 'menubar',
            items: generateMenuItems(navRoutes),
        } as MenuElement;
    } else if (navType === 'side') {
        navElement = generateSidebarFromRoutes(navRoutes);
    } else if (navType === 'bottom' && isMobile) {
        navElement = generateBottomNav(navRoutes);
    } else if (navType === 'burger' && isMobile) {
        navElement = generateBurgerMenu(navRoutes);
    }

    if (loading || !currentScreen) {
        return <Loader2 className="h-4 w-4 animate-spin" />
    }

    const layoutClass = navType === 'side' ? 'flex' : 'flex flex-col';

    return (
        <div className={layoutClass} style={{ minHeight: '100vh' }}>
            {project.header && <ElementResolver element={project.header} runtime={runtime} />}
            {navElement && navType === 'top' && <ElementResolver element={navElement} runtime={runtime} />}
            {navType === 'side' && navElement && <ElementResolver element={navElement} runtime={runtime} />}
            <main className="flex-1">
                <ScreenRenderer project={project} screen={currentScreen} runtime={runtime} showDebug={showDebug} />
            </main>
            {project.footer && <ElementResolver element={project.footer} runtime={runtime} />}
            {navElement && (navType === 'bottom' || navType === 'burger') && isMobile && <ElementResolver element={navElement} runtime={runtime} />}
        </div>
    );
}