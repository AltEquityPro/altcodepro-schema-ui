// components/ProjectRouter.tsx
'use client';

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    UIProject, UIScreenDef, IRoute, ElementType, MenuElement, SidebarElement,
    ContainerElement, ButtonElement, ActionType, DrawerElement, IconElement, UIElement
} from "../types";
import { ScreenRenderer } from "./ScreenRenderer";
import { ElementResolver } from "./ElementResolver";
import { Loader2 } from "lucide-react";
import { useRuntime } from "../hooks/useRuntime";

interface ProjectRouterProps {
    project: UIProject;
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
function norm(path: string): string {
    if (!path) return "/";
    // ensure leading slash, remove duplicate slashes, strip trailing slash (except root)
    let p = path.replace(/\/{2,}/g, "/");
    if (!p.startsWith("/")) p = `/${p}`;
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return p;
}
function flattenRoutes(routes: IRoute[], parentHref = ""): IRoute[] {
    return routes.reduce((acc: IRoute[], route) => {
        const fullHref = norm(`${parentHref}${route.href || ""}`);
        const updatedRoute = { ...route, href: fullHref };
        acc.push(updatedRoute);
        if (route.nested?.length) {
            acc.push(...flattenRoutes(route.nested, fullHref));
        }
        return acc;
    }, []);
}

function generateMenuItems(routes: IRoute[]): MenuElement['items'] {
    return routes
        .filter(r => r.showInNavigation)
        .map(route => {
            const base = {
                id: route.href,
                label: route.label,
                icon: route.icon,
            };
            if (route.nested && route.nested.length) {
                return {
                    ...base,
                    type: 'sub' as const,
                    items: generateMenuItems(route.nested),
                };
            }
            return {
                ...base,
                type: 'item' as const,
                href: route.href,
                onSelect: { action: ActionType.navigation, params: { href: route.href } },
            };
        }) as any;
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
                    onClick: item.onSelect ?? { action: ActionType.navigation, params: { href: item.id } },
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
        // if your renderer expects styles.className instead of className, change accordingly
        // styles: { className: 'fixed bottom-0 left-0 right-0 bg-background border-t p-2' },
        // keeping your original:
        // @ts-ignore – your resolver supports className on element
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
            onClick: item.onSelect ?? { action: ActionType.navigation, params: { href: item.id } },
        } as any)),
    } as any;
}

export function ProjectRouter({ project, showDebug, preloadedScreens = {} }: ProjectRouterProps) {
    const runtime = useRuntime();
    const isMobile = useIsMobile();
    const [currentScreen, setCurrentScreen] = useState<UIScreenDef | null>(null);
    const [loading, setLoading] = useState(true);
    const base = useMemo(() => {
        // normalize routeBase (no trailing slash except root)
        return project.routeBase ? norm(project.routeBase) : "";
    }, [project.routeBase]);

    // Build flattened routes and attach __fullHref for reliable matching
    const flatRoutes = useMemo(() => {
        const flat = flattenRoutes(project.routeList.routes, "");
        return flat.map(r => {
            // r.href currently is a full path without routeBase (e.g., "/settings/profile")
            const path = norm(r.href);
            const full = norm(`${base}${path}`);
            // store short path in href (for UI), and full path in __fullHref (for matching)
            return { ...r, href: path, __fullHref: full } as IRoute & { __fullHref: string };
        });
    }, [project.routeList.routes, base]);

    const findRouteByHref = useCallback((href: string) => {
        const n = norm(href);
        // match by full href (with base) OR by short href (without base)
        return (
            (flatRoutes as Array<IRoute & { __fullHref?: string }>).find(
                r => r.__fullHref === n || r.href === n
            ) || (flatRoutes[0] as IRoute)
        );
    }, [flatRoutes]);

    const loadScreen = useCallback(async (route: IRoute) => {
        setLoading(true);
        try {
            let screen: UIScreenDef | undefined;
            if (route.screenId && preloadedScreens[route.screenId]) {
                screen = preloadedScreens[route.screenId];
            } else if ((route as any).screenConfigUrl) {
                const res = await fetch((route as any).screenConfigUrl as string);
                if (!res.ok) throw new Error(`Failed to fetch screen: ${res.status}`);
                screen = await res.json();
            } else {
                screen = project?.screens?.find(f => f.id === route.screenId);
            }
            if (screen) setCurrentScreen(screen);
        } catch (err) {
            console.error("Error loading screen:", err);
        } finally {
            setLoading(false);
        }
    }, [preloadedScreens, project?.screens]);

    // Initial load + back/forward
    useEffect(() => {
        if (typeof window === "undefined") return;
        const initialHref = window.location.pathname || "/";
        const initialRoute = findRouteByHref(initialHref);
        loadScreen(initialRoute);

        const handlePopstate = () => {
            const href = window.location.pathname;
            const route = findRouteByHref(href);
            loadScreen(route);
        };
        window.addEventListener("popstate", handlePopstate);
        return () => window.removeEventListener("popstate", handlePopstate);
    }, [findRouteByHref, loadScreen]);

    // Wrap runtime.navigate so action handlers cause router + screen changes
    const navigateWithRouter = useCallback(
        (href: string, replace?: boolean) => {
            if (typeof window === "undefined") return;
            const short = norm(href);
            const fullHref = norm(`${base}${short}`);
            if (replace) {
                window.history.replaceState({}, "", fullHref);
            } else {
                window.history.pushState({}, "", fullHref);
            }
            const route = findRouteByHref(fullHref);
            loadScreen(route);

            // Important: don't call runtime.navigate() again here — it already pushes/popstates.
            // This avoids double popstate events and weird refresh-like behavior.
        },
        [base, findRouteByHref, loadScreen]
    );

    // Pass a derived runtime with the wrapped navigate
    const routedRuntime = useMemo(
        () => ({ ...runtime, navigate: navigateWithRouter }),
        [runtime, navigateWithRouter]
    );


    // Pick nav flavor
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
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }

    const layoutClass = navType === "side" ? "flex" : "flex flex-col";

    return (
        <div className={layoutClass} style={{ minHeight: "100vh" }}>
            {project.header && <ElementResolver element={project.header} runtime={routedRuntime} />}
            {navElement && navType === "top" && <ElementResolver element={navElement} runtime={routedRuntime} />}
            {navType === "side" && navElement && <ElementResolver element={navElement} runtime={routedRuntime} />}

            <main className="flex-1">
                <ScreenRenderer project={project} screen={currentScreen} runtime={routedRuntime} showDebug={showDebug} />
            </main>

            {project.footer && <ElementResolver element={project.footer} runtime={routedRuntime} />}
            {navElement && (navType === "bottom" || navType === "burger") && isMobile && (
                <ElementResolver element={navElement} runtime={routedRuntime} />
            )}
        </div>
    );
}