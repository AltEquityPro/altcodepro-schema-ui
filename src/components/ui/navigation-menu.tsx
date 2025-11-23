"use client";

import React from "react";
import clsx from "clsx";
import { Sheet, SheetContent } from "./sheet";
import { Button } from "./button";
import { X, Menu } from "lucide-react";
import { NavigationMenu, AnyObj, EventHandler, NavigationItem } from "../../types";
import { RenderChildren } from "../../schema/RenderChildren";
import { useIsMobile } from "../../hooks/use-mobile";
import { resolveBinding } from "../../lib/utils";
import { DynamicIcon } from "./dynamic-icon";

interface NavigationMenuRendererProps {
    menu: NavigationMenu;
    state: AnyObj;
    t: (key: string, defaultLabel?: string | undefined) => string
    runEventHandler: ((handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>);
    setState: (path: string, value: any) => void;
}

export function NavigationMenuRenderer({ menu, state, t, runEventHandler, setState }: NavigationMenuRendererProps) {
    const isMobile = useIsMobile();
    const [open, setOpen] = React.useState(false);

    const isDrawer = isMobile && menu.mobile?.trigger === "burger";
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
                menu.styles?.className
            )}
        >
            {/* Header */}
            {menu.header && (
                <div className="p-4 border-b">
                    <RenderChildren children={menu.header} state={state} t={t} runEventHandler={runEventHandler} setState={setState} />
                </div>
            )}

            {/* Search */}
            {menu.showSearch && (
                <div className="p-4">
                    <input
                        type="search"
                        placeholder={typeof menu.showSearch === "object" ? resolveBinding(menu.showSearch.placeholder, state, t) : "Search..."}
                        className="w-full px-3 py-2 rounded-md border bg-muted text-sm"
                    />
                </div>
            )}

            {/* Items */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {menu.items.map((item, i) => (
                    <NavigationItemRenderer key={i} item={item} state={state} t={t} runEventHandler={runEventHandler} setState={setState} />
                ))}
            </nav>

            {/* Footer */}
            {menu.footer && (
                <div className="p-4 border-t">
                    <RenderChildren children={menu.footer} state={state} t={t} runEventHandler={runEventHandler} setState={setState} />
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
                    className="fixed top-4 left-4 z-50 lg:hidden"
                >
                    <Menu className="h-6 w-6" />
                </Button>

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetContent direction={menu.mobile?.sheetDirection || "left"} className="p-0">
                        {content}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-4"
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

function NavigationItemRenderer({ item, state, t, runEventHandler, setState }: {
    item: NavigationItem; state: AnyObj; t: (k: string) => string,
    runEventHandler: ((handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>);
    setState: (path: string, value: any) => void;
}) {
    if (item.type === "link") {
        return (
            <a href={item.href} className="block px-3 py-2 rounded-md hover:bg-accent">
                {item.icon && <span className="inline-block w-5 mr-2"><DynamicIcon {...item.icon} /></span>}
                {resolveBinding(item.label, state, t) || item.label}
                {item.badge && <span className="ml-auto text-xs">{resolveBinding(item.badge, state, t)}</span>}
            </a>
        );
    }

    if (item.type === "group") {
        const [open, setOpen] = React.useState(!item.defaultCollapsed);
        return (
            <div>
                <button onClick={() => setOpen(!open)} className="w-full px-3 py-2 text-left font-medium hover:bg-accent rounded-md">
                    {resolveBinding(item.label, state, t) || item.label}
                </button>
                {open && <div className="ml-4 space-y-1">{item.items.map((i, idx: number) => <NavigationItemRenderer key={idx} item={i} state={state} t={t} runEventHandler={runEventHandler} setState={setState} />)}</div>}
            </div>
        );
    }

    if (item.type === "divider") return <hr className="my-2 border-t" />;
    if (item.type === "custom") return <RenderChildren children={[item.element]} state={state} t={t} runEventHandler={runEventHandler} setState={setState} />;

    return null;
}