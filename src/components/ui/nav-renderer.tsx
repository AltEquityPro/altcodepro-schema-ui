"use client";

import { useEffect, useState, useRef } from "react";
import { MenuIcon, XIcon, ChevronDown } from "lucide-react";
import clsx from "clsx";
import {
    UIProject,
    IRoute,
    AnyObj,
    VisibilityControl,
    StyleProps,
    NavigationAPI,
    IRouteList,
} from "../../types";
import { resolveBinding } from "../../lib/utils";
import { useClickOutside } from "../../hooks/useClickOutside";
import { NavLink } from "./navLink";
import { DynamicIcon } from "./dynamic-icon";
import { clearAuthToken } from "../../schema/authUtils";

function isRouteActive(route: IRoute, pathname: string): boolean {
    if (route.href === pathname) return true;
    if (route.nested) return route.nested.some((c) => isRouteActive(c, pathname));
    return false;
}
function shouldHideNavPart(
    routeList: IRouteList,
    currentPath: string,
    part: "sidebar" | "topbar" | "bottombar" | "footer"
): boolean {
    if (!routeList?.autoHideNavigation) return false;
    for (const [prefix, parts] of Object.entries(routeList.autoHideNavigation)) {
        if (currentPath.startsWith(prefix) && parts.includes(part)) return true;
    }
    return false;
}
function handleLogout(globalConfig: UIProject["globalConfig"], clearState: () => void) {
    try {
        clearAuthToken(globalConfig)
        clearState();
        window.location.href = "/login";
    } catch (err) {
        console.error("Logout failed:", err);
    }
}

function evalVisibility(
    state: AnyObj,
    t: (k: string) => string,
    v?: VisibilityControl,
) {
    if (!v) return true;
    if (!v.condition) return true;

    const keyVal = resolveBinding(v.condition?.key, state, t);
    const val = resolveBinding(v.condition?.value, state, t);
    const show = !!v.show;

    switch (v.condition?.op) {
        case "==":
            return show ? keyVal?.toString() == val?.toString() : keyVal?.toString() != val?.toString();
        case "!=":
            return show ? keyVal != val : keyVal == val;
        case ">":
            return show ? keyVal > val : !(keyVal > val);
        case "<":
            return show ? keyVal < val : !(keyVal < val);
        case ">=":
            return show ? keyVal >= val : !(keyVal >= val);
        case "<=":
            return show ? keyVal <= val : !(keyVal <= val);
        case "exists":
            return show ? keyVal != null && keyVal != undefined : keyVal == null || keyVal == undefined;
        case "not_exists":
            return show ? keyVal == null || keyVal == undefined : keyVal != null && keyVal != undefined;
        case "matches":
            try {
                return show ? new RegExp(val).test(String(keyVal ?? "")) : !new RegExp(val).test(String(keyVal ?? ""));
            } catch {
                return false;
            }
        case "in":
            return show ? Array.isArray(val) && val.includes(keyVal) : !(Array.isArray(val) && val.includes(keyVal));
        case "not_in":
            return show ? Array.isArray(val) && !val.includes(keyVal) : !(Array.isArray(val) && !val.includes(keyVal));
        default:
            return show;
    }
}

/** Apply StyleProps.className and safely fall back to themeful elevation */
function applyStyleProps(sp?: StyleProps, fallback?: string) {
    return clsx(sp?.className || "", fallback || "");
}

/** Smart elevation so nav never melts into page bg */
function elevatedSurface(base?: string) {
    return clsx(
        base || "",
        "bg-[color:var(--acp-background)]/85 text-foreground",
        "backdrop-blur-md border border-border/50",
        "shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
    );
}

/** Primary-tinted hover surfaces */
const hoverSoftPrimary = "hover:bg-[color:var(--acp-primary)]/10 hover:text-[color:var(--acp-primary)]";

/* =======================================================
📦 Collapsible (Sidebar/Mobile)
======================================================= */
function CollapsibleNavItem({
    route,
    pathname,
    state,
    t,
    openRoutes,
    nav,
    setOpenRoutes,
    level = 0,
    variant = "sidebar" as "sidebar" | "mobile",
}: {
    route: IRoute;
    pathname: string;
    state: AnyObj;
    nav?: NavigationAPI;
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
    const pad = isMobile ? "px-4 py-3 text-base" : "px-3 py-2 text-sm";
    const indent = level > 0 ? (isMobile ? "pl-6" : "pl-7") : "";

    const base = clsx(
        "flex w-full items-center justify-between rounded-md transition-all duration-200",
        pad,
        indent,
        active
            ? "text-[color:var(--acp-primary)] bg-[color:var(--acp-primary)]/10 font-semibold border-l-2 border-[color:var(--acp-primary)]"
            : "text-foreground/75 " + hoverSoftPrimary
    );

    return (
        <div>
            {hasChildren ? (
                <button
                    onClick={() =>
                        setOpenRoutes((prev: Set<string>) => {
                            const ns = new Set(prev);
                            ns.has(route.href) ? ns.delete(route.href) : ns.add(route.href);
                            return ns;
                        })
                    }
                    className={base}
                    aria-expanded={isOpen}
                >
                    <span>{label}</span>
                    <ChevronDown
                        className={clsx(
                            "h-4 w-4 transition-transform duration-200",
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
                    nav={nav}
                    active={active}
                    className={clsx(
                        "flex w-full items-center rounded-md transition-all duration-200",
                        pad,
                        indent
                    )}
                    activeClassName="text-[color:var(--acp-primary)] bg-[color:var(--acp-primary)]/10 font-semibold border-l-2 border-[color:var(--acp-primary)]"
                    inactiveClassName={"text-foreground/75 " + hoverSoftPrimary}
                />
            )}

            {hasChildren && isOpen && (
                <div className="space-y-1 ml-2 animate__animated animate__fadeInDown animate__faster">
                    {route.nested?.map((child) => (
                        <CollapsibleNavItem
                            key={child.href}
                            route={child}
                            pathname={pathname}
                            state={state}
                            nav={nav}
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

/* =======================================================
🖥️ Desktop Topbar Items (Dropdown)
======================================================= */
function DesktopNavItem({
    route,
    pathname,
    state,
    nav,
    t,
}: {
    route: IRoute;
    pathname: string;
    nav?: NavigationAPI;
    state: AnyObj;
    t: (k: string) => string;
}) {
    const active = isRouteActive(route, pathname);
    const hasChildren = route.nested && route.nested.length > 0;
    const [open, setOpen] = useState(false);
    const itemRef: any = useRef<HTMLDivElement>(null);
    useClickOutside(itemRef, () => setOpen(false));

    const linkBase =
        "inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[color:var(--acp-primary)]/30";

    return (
        <div
            ref={itemRef}
            className="relative"
            onMouseEnter={() => hasChildren && setOpen(true)}
            onMouseLeave={() => hasChildren && setOpen(false)}
            onClick={() => hasChildren && setOpen((o) => !o)}
        >
            <NavLink
                route={route}
                pathname={pathname}
                state={state}
                nav={nav}
                t={t}
                active={active}
                activeClassName={clsx(
                    linkBase,
                    "text-[color:var(--acp-primary)] underline underline-offset-4"
                )}
                className={clsx(
                    "flex w-full items-center rounded-md transition-all duration-200"
                )}
                inactiveClassName={"text-foreground/75 " + hoverSoftPrimary}
            />
            {!active && !hasChildren && (
                <a
                    href={route.href}
                    className={clsx(linkBase, "text-foreground/80", hoverSoftPrimary)}
                >
                    {resolveBinding(route.label, state, t)}
                </a>
            )}

            {hasChildren && open && (
                <div
                    className={clsx(
                        "absolute left-0 top-full mt-2 w-56 rounded-lg z-50",
                        elevatedSurface()
                    )}
                    role="menu"
                >
                    <div className="py-2">
                        {route.nested?.map((child) => (
                            <a
                                key={child.href}
                                href={child.href}
                                className={clsx(
                                    "block w-full text-left px-4 py-2 text-sm rounded-none",
                                    "text-foreground/80",
                                    hoverSoftPrimary
                                )}
                                role="menuitem"
                            >
                                {resolveBinding(child.label, state, t)}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function DesktopNav({
    routes,
    pathname,
    project,
    setState,
    clearState,
    state,
    nav,
    requiresAuth,
    t,
    containerStyle,
}: {
    routes: IRoute[];
    project: UIProject;
    pathname: string;
    clearState: () => void;
    setState: (path: string, value: any) => void;
    state: AnyObj;
    requiresAuth?: boolean;
    nav?: NavigationAPI;
    t: (k: string) => string;
    containerStyle?: StyleProps;
}) {
    return (
        <nav
            className={clsx(
                "hidden lg:flex items-center gap-3",
                applyStyleProps(containerStyle)
            )}
            role="navigation"
            aria-label="Main navigation"
        >
            {routes.filter((r) => r.showInNavigation)?.map((r) => (
                <DesktopNavItem
                    key={r.href}
                    route={r}
                    nav={nav}
                    pathname={pathname}
                    state={state}
                    t={t}
                />
            ))}
            {requiresAuth && (state?.isAuthenticated || state?.auth?.user) ? (
                <button
                    onClick={() => handleLogout(project?.globalConfig, clearState)}
                    className="lg:inline-flex px-4 py-2 rounded-md text-sm font-medium bg-[var(--acp-primary)]
                            text-white
                            hover:bg-[var(--acp-primary-700)]
                            focus:ring-2 focus:ring-[var(--acp-primary-400)] transition">
                    Logout
                </button>
            ) : (
                <a
                    href="/login"
                    className="lg:inline-flex px-4 py-2 rounded-md text-sm font-medium text-[color:var(--acp-primary)] hover:bg-[color:var(--acp-primary)]/10 transition"
                >
                    Login
                </a>
            )}
        </nav>
    );
}

function MobileBurger({
    routes,
    pathname,
    isOpen,
    requiresAuth,
    setState,
    clearState,
    onClose,
    state,
    nav,
    t,
    project,
    overlayStyle,
    sheetStyle,
}: {
    routes: IRoute[];
    pathname: string;
    isOpen: boolean;
    project: UIProject;
    onClose: () => void;
    nav?: NavigationAPI;
    clearState: () => void;
    setState: (path: string, value: any) => void
    requiresAuth?: boolean;
    state: AnyObj;
    t: (k: string, defaultLabel?: string) => string;
    overlayStyle?: StyleProps;
    sheetStyle?: StyleProps;
}) {
    const drawerRef: any = useRef<HTMLElement>(null);
    const [openRoutes, setOpenRoutes] = useState<Set<string>>(new Set());
    useClickOutside(drawerRef, onClose);

    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [onClose]);

    useEffect(() => {
        const init = new Set<string>();
        const collect = (r: IRoute) => {
            if (r.nested?.some((c) => isRouteActive(c, pathname))) init.add(r.href);
            r.nested?.forEach(collect);
        };
        routes.filter((r) => r.showInNavigation).forEach(collect);
        setOpenRoutes(init);
    }, [pathname, routes]);

    if (!isOpen) return null;

    return (
        <div
            className={clsx(
                "fixed inset-0 z-50 animate__animated animate__fadeIn animate__faster",
                applyStyleProps(
                    overlayStyle,
                    "bg-black/40 backdrop-blur-sm"
                )
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
        >
            <aside
                ref={drawerRef as any}
                className={clsx(
                    "absolute left-0 top-0 h-full w-80 p-6 flex flex-col animate__animated animate__slideInLeft",
                    elevatedSurface(applyStyleProps(sheetStyle))
                )}
            >
                <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
                    <span className="font-semibold">Menu</span>
                    <button
                        onClick={onClose}
                        className={clsx(
                            "p-2 rounded-md text-foreground/70",
                            hoverSoftPrimary
                        )}
                        aria-label="Close menu"
                    >
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto" role="navigation">
                    {routes.filter((r) => r.showInNavigation)?.map((route) => (
                        <CollapsibleNavItem
                            key={route.href}
                            route={route}
                            nav={nav}
                            pathname={pathname}
                            state={state}
                            t={t}
                            openRoutes={openRoutes}
                            setOpenRoutes={setOpenRoutes}
                            variant="mobile"
                        />
                    ))}
                    {requiresAuth && (state?.isAuthenticated || state?.auth?.user) ? (
                        <button
                            onClick={() => handleLogout(project?.globalConfig, clearState)}
                            className="lg:inline-flex px-4 py-2 rounded-md text-sm font-medium text-[color:var(--acp-primary)] hover:bg-[color:var(--acp-primary)]/10 transition"
                        >
                            {t('Logout', 'Logout')}
                        </button>
                    ) : (
                        <a
                            href="/login"
                            className="lg:inline-flex px-4 py-2 rounded-md text-sm font-medium text-[color:var(--acp-primary)] hover:bg-[color:var(--acp-primary)]/10 transition"
                        >
                            {t('Login', 'Login')}
                        </a>
                    )}
                </nav>
            </aside>
        </div>
    );
}

function Sidebar({
    routes,
    pathname,
    state,
    setState,
    requiresAuth,
    clearState,
    t,
    nav,
    project,
}: {
    routes: IRoute[];
    pathname: string;
    state: AnyObj;
    clearState: () => void;
    setState: (path: string, value: any) => void
    nav?: NavigationAPI;
    requiresAuth?: boolean;
    t: (k: string, defaultLabel?: string) => string;
    project: UIProject;
}) {
    const visible = evalVisibility(state, t, project.routeList.visibility?.sidebar);
    if (!visible) return null;

    const [openRoutes, setOpenRoutes] = useState<Set<string>>(new Set());

    useEffect(() => {
        const init = new Set<string>();
        const collect = (r: IRoute) => {
            if (r.nested?.some((c) => isRouteActive(c, pathname))) init.add(r.href);
            r.nested?.forEach(collect);
        };
        routes.filter((r) => r.showInNavigation).forEach(collect);
        setOpenRoutes(init);
    }, [pathname, routes]);

    const cfg = project.routeList.sidebarConfig ?? {};

    return (
        <aside
            className={clsx(
                elevatedSurface(),
                "hidden lg:flex flex-col w-64 h-screen p-6 animate__animated animate__fadeInLeft"
            )}
            role="complementary"
            aria-label="Sidebar navigation"
        >
            {cfg.showSearch && (
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search…"
                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-[color:var(--acp-primary)]/40"
                    />
                </div>
            )}

            <nav className="flex-1 space-y-1" role="navigation">
                {routes.filter((r) => r.showInNavigation)?.map((route) => (
                    <CollapsibleNavItem
                        key={route.href}
                        route={route}
                        pathname={pathname}
                        state={state}
                        t={t}
                        nav={nav}
                        openRoutes={openRoutes}
                        setOpenRoutes={setOpenRoutes}
                        variant="sidebar"
                    />
                ))}
            </nav>

            {cfg.customActions?.length ? (
                <div className="mt-6 border-t border-border/40 pt-3 space-y-2">
                    {cfg.customActions?.map((a) => (
                        <button
                            key={a.id}
                            onClick={() => {
                                if (a.onClick?.startsWith("http")) {
                                    window.location.href = a.onClick;
                                } else {
                                    if (nav && nav.push) {
                                        nav.push(a.onClick || "/");
                                    } else {
                                        window.location.href = a.onClick || "/";
                                    }
                                }
                            }}
                            className={clsx(
                                "w-full text-left px-3  flex flex-row py-2 rounded-md text-sm",
                                "text-foreground/80",
                                hoverSoftPrimary
                            )}
                        >
                            {a.icon && <DynamicIcon name={a.icon} />}
                            {resolveBinding(a.label, state, t)}
                        </button>
                    ))}
                </div>
            ) : null}
            {requiresAuth && (state?.isAuthenticated || state?.auth?.user) ? (
                <button
                    onClick={() => handleLogout(project?.globalConfig, clearState)}
                    className="lg:inline-flex px-4 py-2 rounded-md text-sm font-medium text-[color:var(--acp-primary)] hover:bg-[color:var(--acp-primary)]/10 transition">
                    {t('Logout', 'Logout')}
                </button>
            ) : (
                <a
                    href="/login"
                    className="lg:inline-flex px-4 py-2 rounded-md text-sm font-medium text-[color:var(--acp-primary)] hover:bg-[color:var(--acp-primary)]/10 transition"
                >
                    {t('Login', 'Login')}
                </a>
            )}
        </aside>
    );
}

function BottomNav({
    routes,
    pathname,
    state,
    nav,
    t,
    routeListVisibility,
}: {
    routes: IRoute[];
    pathname: string;
    state: AnyObj;
    nav?: NavigationAPI;
    t: (k: string) => string;
    routeListVisibility?: {
        bottombar?: VisibilityControl;
    };
}) {
    const visible = evalVisibility(state, t, routeListVisibility?.bottombar);
    if (!visible) return null;

    return (
        <nav
            className={clsx(
                "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
                "border-t border-border/50",
                "bg-[color:var(--acp-background)]/92 backdrop-blur-lg",
                "shadow-[0_-4px_12px_rgba(0,0,0,0.08)]"
            )}
            role="navigation"
            aria-label="Bottom navigation"
        >
            <div className="flex justify-around px-2 py-2">
                {routes.filter((r) => r.showInBottomBar)?.map((route) => {
                    const active = isRouteActive(route, pathname);
                    return (
                        <NavLink
                            key={route.href}
                            className={clsx(
                                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-all",
                                active
                                    ? "text-[color:var(--acp-primary)]"
                                    : "text-foreground/60 hover:text-[color:var(--acp-primary)]"
                            )}
                            aria-current={active ? "page" : undefined}
                            route={route}
                            nav={nav}
                            state={state}
                            t={t}
                            active={active}
                            pathname={pathname}
                            activeClassName="text-[color:var(--acp-primary)] bg-[color:var(--acp-primary)]/10 font-semibold border-l-2 border-[color:var(--acp-primary)]"
                            inactiveClassName={"text-foreground/75 " + hoverSoftPrimary}
                        />)
                })}
            </div>
        </nav>
    );
}


export function NavRenderer({
    project,
    state,
    setState,
    clearState,
    t,
    nav
}: {
    project: UIProject;
    clearState: () => void;
    setState: (path: string, value: any) => void;
    state: AnyObj;
    nav?: NavigationAPI;
    t: (key: string, defaultLabel?: string) => string;
}) {
    const [pathname, setPathname] = useState("");
    const [burgerOpen, setBurgerOpen] = useState(false);

    useEffect(() => {
        setPathname(window.location.pathname);
        const onPop = () => setPathname(window.location.pathname);
        const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setBurgerOpen(false);
        window.addEventListener("popstate", onPop);
        window.addEventListener("keydown", onEsc);
        return () => {
            window.removeEventListener("popstate", onPop);
            window.removeEventListener("keydown", onEsc);
        };
    }, []);

    const navList = project.routeList;
    const fullVisible = evalVisibility(state, t, navList.visibility?.fullNav);
    if (!fullVisible) return null;

    const routes = navList.routes.filter(
        (r) => r.screenConfigUrl || project.screens?.some((s) => s.id === r.screenId)
    );

    const navType = navList.desktopNavType; // "top" | "side"
    const mobileNavType = navList.responsiveNavType; // "burger" | "bottom"
    const containerStyle = navList.navStyle?.containerStyle;
    const overlayStyle = navList.navStyle?.overlayStyle;
    const sheetStyle = navList.navStyle?.sheetStyle;
    const requiresAuth = navList.routes.some((r) => r.requiresAuth);
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

    return (
        <>
            {navType === "top" &&
                !shouldHideNavPart(navList, currentPath, "topbar") &&
                evalVisibility(state, t, navList.visibility?.topbar) && (
                    <header
                        className={clsx(
                            elevatedSurface(applyStyleProps(containerStyle)),
                            "w-full sticky top-0 z-50",
                            "flex items-center justify-between px-6 py-4",
                            "animate__animated animate__fadeInDown"
                        )}
                        role="banner"
                    >
                        <a
                            href={project.brand.href || "/"}
                            className="flex items-center gap-2"
                            aria-label="Home"
                        >
                            {project.brand.logoUrl ? (
                                <img
                                    src={project.brand.logoUrl}
                                    alt={`${project.brand.name} logo`}
                                    className="h-8 w-auto"
                                />
                            ) : (
                                <span className="font-bold text-lg">{project.brand.name}</span>
                            )}
                        </a>


                        <DesktopNav
                            routes={routes}
                            nav={nav}
                            pathname={pathname}
                            project={project}
                            state={state}
                            setState={setState}
                            clearState={clearState}
                            t={t}
                            requiresAuth={requiresAuth}
                            containerStyle={containerStyle}
                        />

                        {/* Burger trigger (mobile) */}
                        {mobileNavType === "burger" && (
                            <button
                                className={clsx(
                                    "lg:hidden p-2 rounded-md text-foreground/80",
                                    hoverSoftPrimary
                                )}
                                onClick={() => setBurgerOpen(true)}
                                aria-label="Open menu"
                                aria-expanded={burgerOpen}
                            >
                                <MenuIcon className="h-6 w-6" />
                            </button>
                        )}
                    </header>
                )}


            {navType === "side" &&
                !shouldHideNavPart(navList, currentPath, "sidebar") &&
                evalVisibility(state, t, navList.visibility?.sidebar) && (
                    <div className="flex">
                        <Sidebar
                            project={project}
                            nav={nav}
                            routes={routes}
                            pathname={pathname}
                            state={state}
                            setState={setState}
                            clearState={clearState}
                            requiresAuth={requiresAuth}
                            t={t}
                        />
                    </div>
                )}


            {mobileNavType === "burger" && (
                <MobileBurger
                    routes={routes}
                    nav={nav}
                    pathname={pathname}
                    project={project}
                    isOpen={burgerOpen}
                    onClose={() => setBurgerOpen(false)}
                    state={state}
                    setState={setState}
                    clearState={clearState}
                    requiresAuth={requiresAuth}
                    t={t}
                    overlayStyle={overlayStyle}
                    sheetStyle={sheetStyle}
                />
            )}


            {mobileNavType === "bottom" &&
                !shouldHideNavPart(navList, currentPath, "bottombar") &&
                (
                    <BottomNav
                        routes={routes}
                        nav={nav}
                        pathname={pathname}
                        state={state}
                        t={t}
                        routeListVisibility={navList.visibility}
                    />
                )}
        </>
    );
}
