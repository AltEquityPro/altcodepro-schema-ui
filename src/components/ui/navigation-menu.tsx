"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { Sheet, SheetContent } from "./sheet";
import { Button } from "./button";
import { X, Menu, Search } from "lucide-react";
import { NavigationMenu, AnyObj, EventHandler, NavigationItem, Binding } from "../../types";
import { RenderChildren } from "../../schema/RenderChildren";
import { useIsMobile } from "../../hooks/use-mobile";
import { resolveBinding } from "../../lib/utils";
import { DynamicIcon } from "./dynamic-icon";

interface NavigationMenuRendererProps {
    menu: NavigationMenu;
    state: AnyObj;
    t: (key: string, defaultLabel?: string) => string;
    runEventHandler: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>;
    setState: (path: string, value: any) => void;
}

export function NavigationMenuRenderer({
    menu,
    state,
    t,
    runEventHandler,
    setState,
}: NavigationMenuRendererProps) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const isDrawer = isMobile && menu.mobile?.trigger === "burger";

    // Resolve search config
    const searchConfig = typeof menu.showSearch === "object" ? menu.showSearch : {};
    const searchPlaceholder = searchConfig.placeholder
        ? resolveBinding(searchConfig.placeholder as Binding, state, t)
        : "Search...";

    const placement = menu.placement;

    const baseClasses = {
        top: "fixed top-0 left-0 right-0 z-50 border-b",
        side: "fixed inset-y-0 left-0 z-50 w-64 border-r",
        bottom: "fixed bottom-0 left-0 right-0 z-50 border-t",
        drawer: "w-80 h-full",
    };

    const content = (
        <div
            className={clsx(
                "flex flex-col h-full bg-background text-foreground",
                menu.styles?.className || "w-72"
            )}
        >
            {/* Header */}
            {menu.header && (
                <div className="p-4 border-b border-border/50">
                    <RenderChildren
                        children={menu.header}
                        state={state}
                        t={t}
                        runEventHandler={runEventHandler}
                        setState={setState}
                    />
                </div>
            )}

            {menu.showSearch && (
                <div className="px-4 pt-3 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className={clsx(
                                "w-full pl-10 pr-4 py-2.5 text-sm rounded-lg",
                                "bg-muted/50 border border-border/50",
                                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                                "placeholder:text-muted-foreground/70"
                            )}
                        />
                    </div>
                </div>
            )}

            {/* Items - Compact Grok Style */}
            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
                {menu.items
                    .filter((item) => {
                        if (!searchValue) return true;
                        const label = resolveBinding((item as any).label, state, t) || "";
                        return label.toLowerCase().includes(searchValue.toLowerCase());
                    })
                    .map((item, i) => (
                        <NavigationItemRenderer
                            key={i}
                            item={item}
                            state={state}
                            t={t}
                            runEventHandler={runEventHandler}
                            setState={setState}
                            depth={0}
                        />
                    ))}
            </nav>

            {/* Footer */}
            {menu.footer && (
                <div className="p-3 border-t border-border/50 mt-auto">
                    <RenderChildren
                        children={menu.footer}
                        state={state}
                        t={t}
                        runEventHandler={runEventHandler}
                        setState={setState}
                    />
                </div>
            )}
        </div>
    );

    if (isDrawer) {
        return (
            <>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(true)}
                    className="fixed top-4 left-4 z-50 lg:hidden h-10 w-10"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetContent
                        side={menu.mobile?.sheetDirection || "left"}
                        className="p-0 w-80"
                    >
                        {content}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-4 h-9 w-9"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </SheetContent>
                </Sheet>
            </>
        );
    }

    return <div className={clsx("bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60", baseClasses[placement])}>{content}</div>;
}

// Compact, Grok-style item renderer
function NavigationItemRenderer({
    item,
    state,
    t,
    runEventHandler,
    setState,
    depth = 0,
}: {
    item: NavigationItem;
    state: AnyObj;
    t: (k: string) => string;
    runEventHandler: (h?: EventHandler, d?: AnyObj) => Promise<void>;
    setState: (p: string, v: any) => void;
    depth: number;
}) {
    const indent = depth * 12;

    if (item.type === "link") {
        const label = resolveBinding(item.label, state, t);
        const hasIcon = !!item.icon;

        return (
            <a
                href={item.href}
                onClick={(e) => {
                    if (item.onClick) {
                        e.preventDefault();
                        runEventHandler(item.onClick);
                    }
                }}
                className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    "hover:bg-accent/70 active:bg-accent",
                    "text-foreground/90 hover:text-foreground",
                    depth > 0 && "ml-2"
                )}
                style={{ paddingLeft: `${indent + 12}px` }}
            >
                {hasIcon && (
                    <DynamicIcon
                        {...item.icon!}
                        className="h-4.5 w-4.5 text-muted-foreground"
                    />
                )}
                <span className="flex-1 truncate">{label}</span>
                {item.badge && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {resolveBinding(item.badge, state, t)}
                    </span>
                )}
            </a>
        );
    }

    if (item.type === "group") {
        const [open, setOpen] = useState(!item.defaultCollapsed);
        const label = resolveBinding(item.label, state, t);

        return (
            <div>
                <button
                    onClick={() => setOpen(!open)}
                    className={clsx(
                        "flex items-center gap-2 w-full  rounded-lg text-sm font-medium transition-colors",
                        "hover:bg-accent/50 text-foreground/80",
                        "focus:outline-none"
                    )}
                    style={{ paddingLeft: `${indent + 12}px` }}
                >
                    {item.icon && <DynamicIcon {...item.icon} className="h-4 w-4" />}
                    <span className="flex-1 text-left">{label}</span>
                    <span className={clsx("transition-transform", open && "rotate-90")}>
                        ▸
                    </span>
                </button>

                {open && (
                    <div className="mt-1">
                        {item.items.map((child, i) => (
                            <NavigationItemRenderer
                                key={i}
                                item={child}
                                state={state}
                                t={t}
                                runEventHandler={runEventHandler}
                                setState={setState}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (item.type === "divider") {
        return <hr className="my-2 border-border/30 mx-3" />;
    }

    if (item.type === "custom") {
        return (
            <div style={{ paddingLeft: `${indent + 12}px` }}>
                <RenderChildren
                    children={[item.element]}
                    state={state}
                    t={t}
                    runEventHandler={runEventHandler}
                    setState={setState}
                />
            </div>
        );
    }

    return null;
}