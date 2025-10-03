"use client";

import React, { useEffect, useState } from "react";
import { MenuIcon, XIcon, SearchIcon } from "lucide-react";
import clsx from "clsx";
import { UIProject, IRoute, AnyObj } from "../../types";
import { resolveBinding } from "@/lib/utils";
import { useAppState } from "@/schema/StateContext";

/* -----------------------------
 * Desktop Nav
 * ----------------------------- */
function DesktopNav({
    routes,
    pathname,
    searchEnabled,
    state,
    t
}: {
    routes: IRoute[];
    pathname: string;
    searchEnabled?: boolean;
    state: AnyObj;
    t: (key: string) => string
}) {
    return (
        <nav className="hidden lg:flex items-center gap-6">
            {routes.filter(r => r.showInNavigation).map(route => (
                <a
                    key={route.href}
                    href={route.href}
                    className={clsx(
                        "px-3 py-2 rounded-md font-medium transition-colors",
                        pathname === route.href
                            ? "text-primary border-b-2 border-primary"
                            : "text-muted-foreground hover:text-primary"
                    )}
                >
                    {resolveBinding(route.label, state, t) || route.label}
                </a>
            ))}

            {/* Search (if enabled) */}
            {searchEnabled && (
                <div className="ml-4">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="px-3 py-1 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
    t
}: {
    routes: IRoute[];
    pathname: string;
    isOpen: boolean;
    onClose: () => void;
    searchEnabled?: boolean;
    state: AnyObj;
    t: (key: string) => string
}) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/50 animate__animated animate__fadeIn">
            <div className="absolute left-0 top-0 h-full w-72 bg-background shadow-lg p-6 animate__animated animate__slideInLeft flex flex-col">
                {/* Close button */}
                <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Menu</span>
                    <button onClick={onClose}>
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Search */}
                {searchEnabled && (
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                )}

                {/* Routes */}
                <nav className="flex flex-col gap-3">
                    {routes.filter(r => r.showInNavigation).map(route => (
                        <a
                            key={route.href}
                            href={route.href}
                            className={clsx(
                                "px-3 py-2 rounded-md font-medium",
                                pathname === route.href
                                    ? "bg-primary text-white"
                                    : "hover:bg-muted-foreground/20"
                            )}
                            onClick={onClose}
                        >
                            {resolveBinding(route.label, state, t) || route.label}
                        </a>
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
    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen border-r bg-background p-4">
            <nav className="flex flex-col gap-3">
                {routes.filter(r => r.showInNavigation).map(route => (
                    <a
                        key={route.href}
                        href={route.href}
                        className={clsx(
                            "px-3 py-2 rounded-md font-medium",
                            pathname === route.href
                                ? "bg-primary text-white"
                                : "hover:bg-muted-foreground/20"
                        )}
                    >
                        {resolveBinding(route.label, state, t) || route.label}
                    </a>
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
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-background border-t p-2 lg:hidden">
            {routes.filter(r => r.showInBottomBar).map(route => (
                <a
                    key={route.href}
                    href={route.href}
                    className={clsx(
                        "flex flex-col items-center text-xs",
                        pathname === route.href ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    {route.icon && <span className="mb-1">{route.icon}</span>}
                    {resolveBinding(route.label, state, t) || route.label}
                </a>
            ))}
        </nav>
    );
}

export function NavRenderer({ project, state, t }: { project: UIProject, state: AnyObj, t: (key: string) => string }) {
    const [pathname, setPathname] = useState("");
    const [burgerOpen, setBurgerOpen] = useState(false);

    useEffect(() => {
        setPathname(window.location.pathname);
        const handlePop = () => setPathname(window.location.pathname);
        window.addEventListener("popstate", handlePop);
        return () => window.removeEventListener("popstate", handlePop);
    }, []);

    const routes = project.routeList.routes;
    const navType = project.routeList.desktopNavType; // "top" | "side"
    const mobileNavType = project.routeList.responsiveNavType; // "bottom" | "burger"
    const searchEnabled = project.search?.enabled;

    return (
        <>
            {/* Header (Top Nav) */}
            {navType === "top" && (
                <header
                    className={clsx(
                        "w-full flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-background border-b",
                        project.globalStyles?.headerStyle?.className
                    )}
                >
                    {/* Brand */}
                    <a href={project.brand.href || "/"} className="flex items-center gap-2">
                        {project.brand.logoUrl ? (
                            <img src={project.brand.logoUrl} alt="Logo" className="h-12 w-auto" />
                        ) : (
                            <span className="font-bold text-lg">{project.brand.name}</span>
                        )}
                    </a>

                    {/* Desktop nav */}
                    <DesktopNav
                        routes={routes}
                        pathname={pathname}
                        searchEnabled={searchEnabled}
                        state={state}
                        t={t}
                    />

                    {/* Mobile burger trigger */}
                    {mobileNavType === "burger" && (
                        <button className="lg:hidden" onClick={() => setBurgerOpen(true)}>
                            <MenuIcon className="h-6 w-6" />
                        </button>
                    )}
                </header>
            )}

            {/* Sidebar */}
            {navType === "side" && <Sidebar
                state={state}
                t={t}
                routes={routes}
                pathname={pathname} />}

            {/* Burger Menu */}
            {mobileNavType === "burger" && (
                <MobileBurger
                    routes={routes}
                    state={state}
                    t={t}
                    pathname={pathname}
                    isOpen={burgerOpen}
                    onClose={() => setBurgerOpen(false)}
                    searchEnabled={searchEnabled}
                />
            )}

            {/* Bottom Nav */}
            {mobileNavType === "bottom" && (
                <BottomNav
                    routes={routes}
                    state={state}
                    t={t}
                    pathname={pathname} />
            )}
        </>
    );
}
