"use client";

import React, { useMemo, useState } from "react";
import clsx from "clsx";
import { Sheet, SheetContent } from "./sheet";
import { Button } from "./button";
import { X, Menu, Search } from "lucide-react";
import { NavigationMenu, AnyObj, EventHandler, NavigationItem, Binding, ActionType, Brand } from "../../types";
import { RenderChildren } from "../../schema/RenderChildren";
import { useIsMobile } from "../../hooks/use-mobile";
import { resolveBinding } from "../../lib/utils";
import { DynamicIcon } from "./dynamic-icon";
import { BrandBlock } from "./brand-block";
import { createPortal } from "react-dom";
interface NavigationMenuRendererProps {
    menu: NavigationMenu;
    state: AnyObj;
    brand: Brand;
    t: (key: string, defaultLabel?: string) => string;
    runEventHandler: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<any>;
    setState: (path: string, value: any) => void;
}

export function NavigationMenuRenderer({
    menu,
    state,
    brand,
    t,
    runEventHandler,
    setState,
}: NavigationMenuRendererProps) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [searchResults, setSearchResults] = useState<AnyObj[]>([]);

    const isDrawer = isMobile && menu.mobile?.trigger !== "none";

    // Search config
    const searchConfig = typeof menu.showSearch === "object" ? menu.showSearch : {};
    const searchPlaceholder = searchConfig.placeholder
        ? resolveBinding(searchConfig.placeholder as Binding, state, t)
        : "Search...";
    const placement = menu.placement;

    const baseClasses = {
        top: "left-0 right-0 z-50 border-b",
        side: "fixed inset-y-0 left-0 z-50 w-64 border-r",
        bottom: "fixed bottom-0 left-0 right-0 z-50 border-t",
        drawer: "w-80 h-full",
    };
    // Backend search
    const searchDsId = typeof searchConfig === "object" ? searchConfig.dataSourceId : null;

    // Deep search through all items (including tree/custom)
    const filteredItems = useMemo(() => {
        if (!searchValue.trim()) return menu.items;

        const q = searchValue.toLowerCase().trim();

        const searchInItem = (item: NavigationItem): boolean => {
            // Text match
            const label = resolveBinding((item as any).label, state, t) || "";
            if (label.toLowerCase().includes(q)) return true;

            // Badge
            if ((item as any).badge) {
                const badge = resolveBinding((item as any).badge, state, t) || "";
                if (badge.toLowerCase().includes(q)) return true;
            }

            // Custom element text content
            if (item.type === "custom" && item.element) {
                const text = extractTextFromElement(item.element);
                if (text.toLowerCase().includes(q)) return true;
            }

            // Tree node deep search
            if (item.type === "custom" && (item.element as any).type === "tree") {
                const treeData = resolveBinding((item.element as any).dataSourceId, state, t) || [];
                if (Array.isArray(treeData)) {
                    return treeData.some((node: any) =>
                        String(node.name || node.label || "").toLowerCase().includes(q)
                    );
                }
            }

            // Recurse into group/custom children
            if ((item as any).items) {
                return (item as any).items.some(searchInItem);
            }
            if ((item as any).children) {
                return (item as any).children.some(searchInItem);
            }

            return false;
        };

        return menu.items.filter(searchInItem);
    }, [menu.items, searchValue, state, t]);

    // Optional backend search
    React.useEffect(() => {
        if (!searchDsId || !searchValue.trim()) {
            setSearchResults([]);
            return;
        }

        let cancelled = false;

        const doSearch = async () => {
            try {
                const result = await runEventHandler?.({
                    action: ActionType.api_call,
                    dataSourceId: searchDsId,
                    params: { queryParams: { q: searchValue } }
                }, { q: searchValue });

                if (!cancelled) setSearchResults(result || []);
            } catch (e) {
                console.warn("Search failed:", e);
            }
        };

        const timeout = setTimeout(doSearch, 300);
        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [searchValue, searchDsId, runEventHandler]);

    const content = (
        <div className={clsx("flex flex-col h-full bg-background text-foreground", menu.styles?.className)}>
            {menu.header && (
                <div className={clsx("border-b border-border/50", menu.headerClassName)}>
                    <RenderChildren children={menu.header} state={state} t={t} runEventHandler={runEventHandler} setState={setState} />
                </div>
            )}
            <div className="relative w-full overflow-visible">
                <nav
                    className={clsx(
                        "flex items-center gap-2 whitespace-nowrap overflow-x-auto overflow-y-hidden",
                        menu.navClassName || "px-3 py-2"
                    )}
                >
                    {!menu.header && <BrandBlock brand={brand} placement="top" />}
                    {filteredItems.map((item, i) => (
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
                    {menu.showSearch && (
                        <div className={clsx("px-4 pt-3 pb-2", menu.searchClassName)}>
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
                                        "placeholder:text-muted-foreground/70",
                                        menu.searchInputClassName
                                    )}
                                />
                            </div>

                            {/* Backend search results */}
                            {searchResults.length > 0 && (
                                <div className="mt-2 max-h-64 overflow-y-auto rounded-lg bg-muted/50 border border-border/50">
                                    {searchResults.map((result, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setSearchValue("");
                                                runEventHandler?.(result.onClick);
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent/70 transition-colors"
                                        >
                                            {result.title || result.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </nav>
            </div>

            {/* Footer */}
            {menu.footer && (
                <div className={clsx("border-t border-border/50 mt-auto", menu.footerClassName)}>
                    <RenderChildren children={menu.footer} state={state} t={t} runEventHandler={runEventHandler} setState={setState} />
                </div>
            )}
        </div>
    );

    if (isDrawer) {
        return (
            <>
                <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className={clsx("fixed top-4 left-4 z-50 lg:hidden", menu.triggerClassName)}>
                    <Menu className="h-5 w-5" />
                </Button>

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetContent side={menu.mobile?.sheetDirection || "left"} className={clsx("p-0", menu.sheetClassName)}>
                        <BrandBlock brand={brand} placement="drawer" />
                        {content}
                        <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className={clsx("absolute top-4 right-4", menu.closeButtonClassName)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </SheetContent>
                </Sheet>
            </>
        );
    }

    return <div
        className={clsx(
            "backdrop-blur supports-backdrop-filter:bg-background/60 overflow-visible z-100 relative",
            baseClasses[placement]
        )}>

        {content}
    </div>;
}

// Helper: extract visible text from any element (for search)
function extractTextFromElement(el: any): string {
    if (!el) return "";
    if (typeof el === "string") return el;
    if (el.content) return String(resolveBinding(el.content, {}, () => "") || "");
    if (el.children) return el.children.map(extractTextFromElement).join(" ");
    if (el.label) return String(resolveBinding(el.label, {}, () => "") || "");
    return "";
}

// Fully schema-driven item renderer
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
    const [open, setOpen] = useState(false);
    if (item.type === "link") {
        const label = resolveBinding(item.label, state, t);

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
                    "flex items-center gap-3 rounded-lg text-sm transition-colors",
                    "hover:bg-accent/70 active:bg-accent",
                    "text-foreground/90 hover:text-foreground",
                    item?.className || "px-3 py-2.5"
                )}
                style={{ paddingLeft: `${indent + 12}px` }}
            >
                {item.icon && <DynamicIcon {...item.icon} className="h-4.5 w-4.5 text-muted-foreground" />}
                <span className="flex-1 truncate">{label}</span>
                {item.badge && (
                    <span className={clsx("text-xs px-2 py-0.5 rounded-full", item.badge?.styles?.className || "bg-primary/10 text-primary")}>
                        {resolveBinding(item.badge, state, t)}
                    </span>
                )}
            </a>
        );
    }
    if (item.type === "submenu") {
        const trigger = item.trigger ?? "hover";
        const submenuPosition =
            item.placement === "right"
                ? "top-full left-0 mt-2"
                : item.placement === "left"
                    ? "top-full right-0 mt-2"
                    : item.placement === "bottom"
                        ? "top-full left-0 mt-2"
                        : "top-full left-0 mt-2"; // default for top navbar

        return (
            <div
                className={clsx("relative group inline-block", item.className)}
                onMouseEnter={() => trigger === "hover" && setOpen(true)}
                onMouseLeave={() => trigger === "hover" && setOpen(false)}
            >
                <button
                    onClick={() => trigger === "click" && setOpen(!open)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-accent/30 transition"
                    style={{ paddingLeft: `${indent + 12}px` }}
                >
                    <span>{resolveBinding(item.label, state, t)}</span>
                    <span className="text-xs opacity-60">▸</span>
                </button>

                {/* SUBMENU PANEL */}
                {open && (
                    <div
                        className={clsx(
                            "absolute bg-background border border-border shadow-card rounded-lg p-2 w-56 z-9999",
                            submenuPosition
                        )}
                    >
                        {item.items.map((child, idx) => (
                            <NavigationItemRenderer
                                key={idx}
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

    if (item.type === "group") {
        const [open, setOpen] = useState(!item.defaultCollapsed);
        const label = resolveBinding(item.label, state, t);

        return (
            <div>
                <button
                    onClick={() => setOpen(!open)}
                    className={clsx(
                        "flex items-center gap-2 w-full rounded-lg text-sm font-medium transition-colors",
                        "hover:bg-accent/50 text-foreground/80",
                        item?.className || "px-3 py-2.5"
                    )}
                    style={{ paddingLeft: `${indent + 12}px` }}
                >
                    {item.icon && <DynamicIcon {...item.icon} className="h-4 w-4" />}
                    <span className="flex-1 text-left">{label}</span>
                    <span className={clsx("transition-transform text-xs", open && "rotate-90")}>
                        ▸
                    </span>
                </button>

                {open && (
                    <div className={clsx("mt-1", item.childrenClassName)}>
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
        return <hr className={clsx("my-2 border-border/30", item.className)} />;
    }

    if (item.type === "custom") {
        return (
            <RenderChildren
                children={[item.element]}
                state={state}
                t={t}
                runEventHandler={runEventHandler}
                setState={setState}
            />
        );
    }

    return null;
}