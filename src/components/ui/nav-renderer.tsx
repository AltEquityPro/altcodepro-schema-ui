"use client";

import { useEffect, useState, useRef } from "react";
import { MenuIcon, XIcon, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { UIProject, IRoute, AnyObj } from "../../types";
import { resolveBinding } from "../../lib/utils";
import { useClickOutside } from "../../hooks/useClickOutside";

function isRouteActive(route: IRoute, pathname: string): boolean {
    if (route.href === pathname) {
        return true;
    }
    if (route.nested) {
        return route.nested.some((child) => isRouteActive(child, pathname));
    }
    return false;
}

/* -----------------------------
 * Shared Link Component
 * ----------------------------- */
function NavLink({
    route,
    pathname,
    state,
    t,
    className = "",
    activeClassName = "",
    inactiveClassName = "",
    onClick,
    active = false
}: {
    route: IRoute;
    pathname: string;
    state: AnyObj;
    t: (key: string) => string;
    className?: string;
    activeClassName?: string;
    inactiveClassName?: string;
    onClick?: () => void;
    active?: boolean;
}) {
    const label = resolveBinding(route.label, state, t) || route.label;

    return (
        <a
            href={route.href}
            className={clsx(
                "inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50",
                active ? activeClassName : inactiveClassName,
                className,
                active && "ring-1 ring-primary/20" // Subtle ring instead of pulse for active
            )}
            onClick={onClick}
            aria-current={active ? "page" : undefined}
        >
            {label}
        </a>
    );
}

/* -----------------------------
 * Collapsible Nav Item (for Sidebar & Mobile)
 * ----------------------------- */
function CollapsibleNavItem({
    route,
    pathname,
    state,
    t,
    openRoutes,
    setOpenRoutes,
    level = 0,
    variant = "sidebar" as "sidebar" | "mobile"
}: {
    route: IRoute;
    pathname: string;
    state: AnyObj;
    t: (key: string) => string;
    openRoutes: Set<string>;
    setOpenRoutes: (routes: any) => void;
    level?: number;
    variant?: "sidebar" | "mobile";
}) {
    const active = isRouteActive(route, pathname);
    const hasChildren = route.nested && route.nested.length > 0;
    const isOpen = openRoutes.has(route.href);
    const label = resolveBinding(route.label, state, t) || route.label;

    const isMobile = variant === "mobile";
    const textSize = isMobile ? "text-base" : "text-sm";
    const py = isMobile ? "py-3" : "py-2";
    const px = isMobile ? "px-4" : "px-3";
    const pl = level > 0 ? (isMobile ? "pl-6" : "pl-8") : (isMobile ? "pl-4" : "pl-2");

    const baseClass = clsx(
        `flex items-center w-full ${px} ${py} ${pl} rounded-md font-medium transition-all duration-200 ${textSize}`,
        active
            ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"  // Bolder active: higher opacity bg, full border color, bold font
            : "text-foreground/70 hover:bg-muted/20 hover:text-foreground"  // Adjusted to foreground for better contrast, lighter hover
    );

    return (
        <div>
            {hasChildren ? (
                <button
                    onClick={() => {
                        setOpenRoutes((prev: any) => {
                            const newSet = new Set(prev);
                            if (newSet.has(route.href)) {
                                newSet.delete(route.href);
                            } else {
                                newSet.add(route.href);
                            }
                            return newSet;
                        });
                    }}
                    className={clsx(baseClass, "justify-between")}
                    aria-expanded={isOpen}
                >
                    <span>{label}</span>
                    <ChevronDown
                        className={clsx(
                            "h-4 w-4 transition-transform duration-200 ml-2",
                            isOpen && "rotate-180"
                        )}
                    />
                </button>
            ) : (
                <NavLink
                    route={route}
                    pathname={pathname}
                    state={state}
                    t={t}
                    active={active}
                    activeClassName="bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                    inactiveClassName="text-foreground/70 hover:bg-muted/20 hover:text-foreground"
                    className={clsx("justify-start")}
                />
            )}
            {hasChildren && isOpen && (
                <div className="space-y-1 ml-4 animate__animated animate__slideDown">
                    {route.nested!.map((child) => (
                        <CollapsibleNavItem
                            key={child.href}
                            route={child}
                            pathname={pathname}
                            state={state}
                            t={t}
                            openRoutes={openRoutes}
                            setOpenRoutes={setOpenRoutes}
                            level={level + 1}
                            variant={variant}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* -----------------------------
 * Desktop Nav Item (with Dropdown)
 * ----------------------------- */
function DesktopNavItem({
    route,
    pathname,
    state,
    t,
    level = 0
}: {
    route: IRoute;
    pathname: string;
    state: AnyObj;
    t: (key: string) => string;
    level?: number;
}) {
    const active = isRouteActive(route, pathname);
    const hasChildren = route.nested && route.nested.length > 0;

    const itemActiveClass = level === 0
        ? "text-primary underline underline-offset-4 decoration-2 decoration-primary bg-primary/10 font-semibold"
        : "block w-full bg-primary/10 text-primary border-l-2 border-primary font-semibold";
    const itemInactiveClass = level === 0
        ? "text-foreground/70 hover:text-primary hover:bg-muted/20"
        : "block w-full px-4 py-2 text-foreground/70 hover:bg-muted/20 hover:text-foreground";

    return (
        <div className="relative group">
            <NavLink
                route={route}
                pathname={pathname}
                state={state}
                t={t}
                active={active}
                activeClassName={itemActiveClass}
                inactiveClassName={itemInactiveClass}
            />
            {hasChildren && (
                <div
                    className={clsx(
                        "absolute left-0 top-full mt-2 w-48 bg-background text-foreground border border-border/50 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50",
                        "animate__animated animate__fadeInDown"
                    )}
                >
                    <div className="py-2">
                        {route.nested!.map((child) => (
                            <DesktopNavItem
                                key={child.href}
                                route={child}
                                pathname={pathname}
                                state={state}
                                t={t}
                                level={level + 1}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* -----------------------------
 * Desktop Nav
 * ----------------------------- */
function DesktopNav({
    routes,
    pathname,
    searchEnabled,
    state,
    t,
    containerStyle
}: {
    routes: IRoute[];
    pathname: string;
    searchEnabled?: boolean;
    state: AnyObj;
    t: (key: string) => string;
    containerStyle?: string;
}) {
    return (
        <nav className={clsx("hidden lg:flex items-center gap-2", containerStyle)} role="navigation" aria-label="Main navigation">
            {routes.filter(r => r.showInNavigation).map(route => (
                <DesktopNavItem
                    key={route.href}
                    route={route}
                    pathname={pathname}
                    state={state}
                    t={t}
                />
            ))}

            {/* Search (if enabled) */}
            {searchEnabled && (
                <div className="ml-6">
                    <input
                        type="text"
                        placeholder={t("search.placeholder") || "Search..."}
                        className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        aria-label="Search"
                    />
                </div>
            )}
        </nav>
    );
}

/* -----------------------------
 * Mobile Burger Drawer
 * ----------------------------- */
function MobileBurger({
    routes,
    pathname,
    isOpen,
    onClose,
    searchEnabled,
    state,
    t,
    overlayStyle,
    sheetStyle = 'bg-primary'
}: {
    routes: IRoute[];
    pathname: string;
    isOpen: boolean;
    onClose: () => void;
    searchEnabled?: boolean;
    state: AnyObj;
    t: (key: string) => string;
    overlayStyle?: string;
    sheetStyle?: string;
}) {
    const drawerRef = useRef<HTMLElement>(undefined);
    const [openRoutes, setOpenRoutes] = useState<Set<string>>(new Set());

    useClickOutside(drawerRef, onClose);

    useEffect(() => {
        const newOpenRoutes = new Set<string>();
        const topRoutes = routes.filter(r => r.showInNavigation);
        function collectParents(route: IRoute) {
            if (route.nested && route.nested.length > 0) {
                if (route.nested.some(child => isRouteActive(child, pathname))) {
                    newOpenRoutes.add(route.href);
                }
                route.nested.forEach(collectParents);
            }
        }
        topRoutes.forEach(collectParents);
        setOpenRoutes(newOpenRoutes);
    }, [pathname, routes]);

    if (!isOpen) return null;

    return (
        <div className={clsx("fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate__animated animate__fadeIn animate__faster", overlayStyle)}>
            <div
                ref={drawerRef as any}
                className={clsx(
                    "absolute left-0 top-0 h-full w-80 shadow-2xl p-6 flex flex-col animate__animated animate__slideInLeft border-r border-border/50",
                    sheetStyle
                )}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                    <span className="font-semibold text-lg">{t("nav.menu") || "Menu"}</span>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                        aria-label="Close menu"
                    >
                        <XIcon className="h-6 w-6 text-muted-foreground" />
                    </button>
                </div>

                {/* Search */}
                {searchEnabled && (
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder={t("search.placeholder") || "Search..."}
                            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                            aria-label="Search"
                        />
                    </div>
                )}

                {/* Routes */}
                <nav className="flex-1 space-y-1 overflow-y-auto" role="navigation">
                    {routes.filter(r => r.showInNavigation).map(route => (
                        <CollapsibleNavItem
                            key={route.href}
                            route={route}
                            pathname={pathname}
                            state={state}
                            t={t}
                            openRoutes={openRoutes}
                            setOpenRoutes={setOpenRoutes}
                            variant="mobile"
                        />
                    ))}
                </nav>
            </div>
        </div>
    );
}

/* -----------------------------
 * Sidebar (Dashboard Style)
 * ----------------------------- */
function Sidebar({ routes, pathname, state, t }: {
    routes: IRoute[]; pathname: string, state: AnyObj;
    t: (key: string) => string
}) {
    const [openRoutes, setOpenRoutes] = useState<Set<string>>(new Set());

    useEffect(() => {
        const newOpenRoutes = new Set<string>();
        const topRoutes = routes.filter(r => r.showInNavigation);
        function collectParents(route: IRoute) {
            if (route.nested && route.nested.length > 0) {
                if (route.nested.some(child => isRouteActive(child, pathname))) {
                    newOpenRoutes.add(route.href);
                }
                route.nested.forEach(collectParents);
            }
        }
        topRoutes.forEach(collectParents);
        setOpenRoutes(newOpenRoutes);
    }, [pathname, routes]);

    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen border-r border-border/50 bg-background text-foreground p-6" role="complementary" aria-label="Sidebar navigation">
            <nav className="flex flex-col space-y-1" role="navigation">
                {routes.filter(r => r.showInNavigation).map(route => (
                    <CollapsibleNavItem
                        key={route.href}
                        route={route}
                        pathname={pathname}
                        state={state}
                        t={t}
                        openRoutes={openRoutes}
                        setOpenRoutes={setOpenRoutes}
                        variant="sidebar"
                    />
                ))}
            </nav>
        </aside>
    );
}

/* -----------------------------
 * Bottom Navigation (Mobile)
 * ----------------------------- */
function BottomNav({ routes, pathname, state, t }: {
    routes: IRoute[]; pathname: string, state: AnyObj;
    t: (key: string) => string
}) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-background text-foreground border-t border-border/50 px-4 py-2 lg:hidden shadow-lg" role="navigation" aria-label="Bottom navigation">
            {routes.filter(r => r.showInBottomBar).map(route => {
                const active = isRouteActive(route, pathname);
                return (
                    <a
                        key={route.href}
                        href={route.href}
                        className={clsx(
                            "flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary",
                            active
                                ? "text-primary bg-primary/10 shadow-sm"
                                : "text-muted-foreground hover:text-primary hover:bg-muted/30"
                        )}
                        aria-current={active ? "page" : undefined}
                    >
                        {route.icon && <span className="text-base">{route.icon}</span>}
                        <span className="text-center">{resolveBinding(route.label, state, t) || route.label}</span>
                    </a>
                );
            })}
        </nav>
    );
}

export function NavRenderer({ project, state, t }: { project: UIProject, state: AnyObj, t: (key: string) => string }) {
    const [pathname, setPathname] = useState("");
    const [burgerOpen, setBurgerOpen] = useState(false);

    useEffect(() => {
        setPathname(window.location.pathname);
        const handlePop = () => setPathname(window.location.pathname);
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setBurgerOpen(false);
        };
        window.addEventListener("popstate", handlePop);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("popstate", handlePop);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const routes = project.routeList.routes;
    const navType = project.routeList.desktopNavType; // "top" | "side"
    const mobileNavType = project.routeList.responsiveNavType; // "bottom" | "burger"
    const searchEnabled = project.search?.enabled;
    const navStyle = project.routeList.navStyle;

    return (
        <>
            {/* Header (Top Nav) */}
            {navType === "top" && (
                <header
                    className={clsx(
                        "w-full flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-background text-foreground border-b border-border/50 shadow-sm",
                        project.globalStyles?.headerStyle?.className
                    )}
                    role="banner"
                >
                    {/* Brand */}
                    <a href={project.brand.href || "/"} className="flex items-center gap-3" aria-label="Home">
                        {project.brand.logoUrl ? (
                            <img src={project.brand.logoUrl} alt={`${project.brand.name} logo`} className="h-10 w-auto" />
                        ) : (
                            <span className="font-bold text-xl">{project.brand.name}</span>
                        )}
                    </a>

                    {/* Desktop nav */}
                    <DesktopNav
                        routes={routes}
                        pathname={pathname}
                        searchEnabled={searchEnabled}
                        state={state}
                        t={t}
                        containerStyle={navStyle.containerStyle?.className}
                    />

                    {/* Mobile burger trigger */}
                    {mobileNavType === "burger" && (
                        <button
                            className="lg:hidden p-2 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                            onClick={() => setBurgerOpen(true)}
                            aria-label="Open menu"
                            aria-expanded={burgerOpen}
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>
                    )}
                </header>
            )}

            {/* Sidebar */}
            {navType === "side" && (
                <div className="flex">
                    <Sidebar routes={routes} pathname={pathname} state={state} t={t} />
                </div>
            )}

            {/* Burger Menu */}
            {mobileNavType === "burger" && (
                <MobileBurger
                    routes={routes}
                    pathname={pathname}
                    state={state}
                    t={t}
                    isOpen={burgerOpen}
                    onClose={() => setBurgerOpen(false)}
                    searchEnabled={searchEnabled}
                    overlayStyle={navStyle.overlayStyle?.className}
                    sheetStyle={navStyle.sheetStyle?.className}
                />
            )}

            {/* Bottom Nav */}
            {mobileNavType === "bottom" && (
                <BottomNav routes={routes} pathname={pathname} state={state} t={t} />
            )}
        </>
    );
}