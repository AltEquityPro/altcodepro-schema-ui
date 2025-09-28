"use client"

import * as React from "react"
import * as Dropdown from "@radix-ui/react-dropdown-menu"
import * as Context from "@radix-ui/react-context-menu"
import * as Menubar from "@radix-ui/react-menubar"
import * as Navigation from "@radix-ui/react-navigation-menu"
import { MenuIcon, ChevronRightIcon, ChevronDownIcon, XIcon } from "lucide-react"

import { cn, resolveBinding } from "../../lib/utils"
import { RenderChildren } from "../../schema/RenderChildren"
import { AnyObj, MenuElement, EventHandler } from "../../types"
import wrapWithMotion from "./wrapWithMotion"
import { DynamicIcon } from "./dynamic-icon"
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
    DrawerClose,
    DrawerHeader,
    DrawerTitle,
} from "./drawer"

function MenuShortcut({ children }: { children: React.ReactNode }) {
    return <span className="ml-auto text-xs text-muted-foreground">{children}</span>
}

/** ------------------------------------------------
 * Desktop Item Renderer (Dropdown / Context / Menubar)
 * ------------------------------------------------ */
function renderItems(
    items: MenuElement["items"],
    runEventHandler: (h?: EventHandler, d?: AnyObj) => Promise<void>,
    state: AnyObj,
    t: (key: string) => string,
    Primitive: any,
    variant: Exclude<MenuElement["variant"], "navigation">
): React.ReactNode {
    return items.map((item) => {
        switch (item.type) {
            case "item": {
                return (
                    <Primitive.Item
                        key={item.id}
                        className={cn(item.variant === "destructive" && "text-destructive")}
                        onSelect={() => runEventHandler(item.onSelect)}
                    >
                        {item.icon && <DynamicIcon name={item.icon} className="size-4" />}
                        {resolveBinding(item.label, state, t)}
                        {"shortcut" in item && item.shortcut && (
                            <MenuShortcut>{item.shortcut}</MenuShortcut>
                        )}
                    </Primitive.Item>
                )
            }
            case "checkbox":
                return (
                    <Primitive.CheckboxItem
                        key={item.id}
                        checked={resolveBinding(item.checked, state, t)}
                        onCheckedChange={() => runEventHandler(item.onSelect)}
                    >
                        {resolveBinding(item.label, state, t)}
                    </Primitive.CheckboxItem>
                )
            case "radio":
                return (
                    <Primitive.RadioItem
                        key={item.id}
                        value={item.value}
                        onSelect={() => runEventHandler(item.onSelect)}
                    >
                        {resolveBinding(item.label, state, t)}
                    </Primitive.RadioItem>
                )
            case "label":
                return (
                    <Primitive.Label key={item.id}>
                        {resolveBinding(item.label, state, t)}
                    </Primitive.Label>
                )
            case "separator":
                return <Primitive.Separator key={item.id} />
            case "sub":
                return (
                    <Primitive.Sub key={item.id}>
                        <Primitive.SubTrigger aria-haspopup="menu">
                            {item.icon && <DynamicIcon name={item.icon} className="size-4" />}
                            {resolveBinding(item.label, state, t)}
                            <ChevronRightIcon className="ml-auto size-4" />
                        </Primitive.SubTrigger>
                        <Primitive.SubContent className="z-50 rounded-md border bg-popover p-1 shadow-lg">
                            {renderItems(item.items, runEventHandler, state, t, Primitive, variant)}
                        </Primitive.SubContent>
                    </Primitive.Sub>
                )
            default:
                return null
        }
    })
}

/** ------------------------------------------------
 * Desktop Renderer for Navigation (special handling)
 * ------------------------------------------------ */
function renderNavigationDesktop(
    items: MenuElement["items"],
    runEventHandler: (h?: EventHandler, d?: AnyObj) => Promise<void>,
    state: AnyObj,
    t: (key: string) => string
): React.ReactNode {
    return items.map((item) => {
        if (item.type === "sub") {
            // Nested navigation submenu
            return (
                <Navigation.Item key={item.id}>
                    <Navigation.Trigger className="px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-sm">
                        {item.icon && <DynamicIcon name={item.icon} className="size-4 mr-2" />}
                        {resolveBinding(item.label, state, t)}
                    </Navigation.Trigger>
                    <Navigation.Content className="absolute top-full left-0 mt-2 rounded-md border bg-popover shadow-lg p-2">
                        <div className="grid gap-1 min-w-[12rem]">
                            {renderNavigationDesktop(item.items, runEventHandler, state, t)}
                        </div>
                    </Navigation.Content>
                </Navigation.Item>
            )
        }

        if (item.type === "item") {
            const content = (
                <>
                    {item.icon && <DynamicIcon name={item.icon} className="size-4 mr-2" />}
                    {resolveBinding(item.label, state, t)}
                    {"shortcut" in item && item.shortcut && (
                        <MenuShortcut>{item.shortcut}</MenuShortcut>
                    )}
                </>
            )
            return item.href ? (
                <Navigation.Item key={item.id}>
                    <Navigation.Link
                        href={item.href}
                        className="px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm inline-flex items-center"
                        onClick={(e) => {
                            if (item.onSelect) {
                                e.preventDefault()
                                runEventHandler(item.onSelect)
                            }
                        }}
                    >
                        {content}
                    </Navigation.Link>
                </Navigation.Item>
            ) : (
                <Navigation.Item key={item.id}>
                    <button
                        className={cn(
                            "px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm inline-flex items-center",
                            item.variant === "destructive" && "text-destructive"
                        )}
                        onClick={() => runEventHandler(item.onSelect)}
                    >
                        {content}
                    </button>
                </Navigation.Item>
            )
        }

        if (item.type === "separator") {
            return (
                <div
                    key={item.id}
                    className="my-1 h-px bg-border w-full"
                    aria-hidden
                />
            )
        }

        if (item.type === "label") {
            return (
                <div
                    key={item.id}
                    className="px-2 py-1 text-xs font-medium text-muted-foreground"
                >
                    {resolveBinding(item.label, state, t)}
                </div>
            )
        }

        // Navigation doesn’t support checkbox/radio natively; treat them as items.
        if (item.type === "checkbox" || item.type === "radio") {
            return (
                <Navigation.Item key={item.id}>
                    <button
                        className="px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm inline-flex items-center"
                        onClick={() => runEventHandler(item.onSelect)}
                    >
                        {resolveBinding(item.label, state, t)}
                    </button>
                </Navigation.Item>
            )
        }

        return null
    })
}

/** ------------------------
 * Mobile Drawer Submenu
 * ------------------------*/
function MobileSubMenu({
    item,
    runEventHandler,
    state,
    t,
}: {
    item: any
    runEventHandler: (h?: EventHandler, d?: AnyObj) => Promise<void>
    state: AnyObj
    t: (key: string) => string
}) {
    const [open, setOpen] = React.useState(false)
    return (
        <div className="flex flex-col">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground"
                aria-expanded={open}
                aria-haspopup="menu"
            >
                {item.icon && <DynamicIcon name={item.icon} className="size-4" />}
                {resolveBinding(item.label, state, t)}
                <ChevronDownIcon
                    className={cn("ml-auto size-4 transition-transform", open && "rotate-180")}
                />
            </button>
            {open && (
                <div className="ml-4 border-l pl-2 space-y-1">
                    {renderMobileItems(item.items, runEventHandler, state, t)}
                </div>
            )}
        </div>
    )
}

/** ------------------------
 * Mobile Drawer Renderer
 * ------------------------*/
function renderMobileItems(
    items: MenuElement["items"],
    runEventHandler: (h?: EventHandler, d?: AnyObj) => Promise<void>,
    state: AnyObj,
    t: (key: string) => string
): React.ReactNode {
    return items.map((item: any) => {
        if (item.type === "sub") {
            return (
                <MobileSubMenu
                    key={item.id}
                    item={item}
                    runEventHandler={runEventHandler}
                    state={state}
                    t={t}
                />
            )
        }
        if (item.type === "separator") {
            return <div key={item.id} className="my-1 h-px bg-border" />
        }
        if (item.type === "label") {
            return (
                <div key={item.id} className="px-3 py-1 text-xs font-medium text-muted-foreground">
                    {resolveBinding(item.label, state, t)}
                </div>
            )
        }
        // Treat item / checkbox / radio similarly on mobile.
        return (
            <button
                key={item.id}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground",
                    item.variant === "destructive" && "text-destructive"
                )}
                onClick={() => runEventHandler(item.onSelect)}
            >
                {item.icon && <DynamicIcon name={item.icon} className="size-4" />}
                {resolveBinding(item.label, state, t)}
                {"shortcut" in item && item.shortcut && <MenuShortcut>{item.shortcut}</MenuShortcut>}
            </button>
        )
    })
}

/** ------------------------
 * Main MenuRenderer
 * ------------------------*/
export function MenuRenderer({
    element,
    runEventHandler,
    state,
    t,
}: {
    element: MenuElement
    runEventHandler: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
    state: AnyObj
    t: (key: string) => string
}) {
    switch (element.variant) {
        case "dropdown":
            return wrapWithMotion(
                element,
                <Dropdown.Root>
                    <Dropdown.Trigger asChild>
                        {element.trigger && <RenderChildren children={[element.trigger]} />}
                    </Dropdown.Trigger>
                    <Dropdown.Content className="z-50 rounded-md border bg-popover p-1 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out">
                        {renderItems(element.items, runEventHandler, state, t, Dropdown, "dropdown")}
                    </Dropdown.Content>
                </Dropdown.Root>
            )

        case "context":
            return wrapWithMotion(
                element,
                <Context.Root>
                    <Context.Trigger asChild>
                        {element.trigger && <RenderChildren children={[element.trigger]} />}
                    </Context.Trigger>
                    <Context.Content className="z-50 rounded-md border bg-popover p-1 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out">
                        {renderItems(element.items, runEventHandler, state, t, Context, "context")}
                    </Context.Content>
                </Context.Root>
            )

        case "menubar":
            return wrapWithMotion(
                element,
                <Menubar.Root className="bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs">
                    {element.menus?.map((menu) => (
                        <Menubar.Menu key={menu.id}>
                            <Menubar.Trigger className="px-2 py-1 text-sm">
                                {resolveBinding(menu.label, state, t)}
                            </Menubar.Trigger>
                            <Menubar.Content className="z-50 rounded-md border bg-popover p-1 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out">
                                {renderItems(menu.items, runEventHandler, state, t, Menubar, "menubar")}
                            </Menubar.Content>
                        </Menubar.Menu>
                    ))}
                </Menubar.Root>
            )

        case "navigation":
            return wrapWithMotion(
                element,
                <div>
                    {/* Desktop */}
                    <div className="hidden md:block">
                        <Navigation.Root className="relative z-10 flex w-full justify-center border-b bg-background">
                            <Navigation.List className="flex space-x-4">
                                {renderNavigationDesktop(element.items, runEventHandler, state, t)}
                            </Navigation.List>
                            <Navigation.Indicator className="absolute bottom-0 h-1 w-full bg-primary" />
                        </Navigation.Root>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden">
                        <Drawer>
                            <DrawerTrigger className="p-2">
                                <MenuIcon className="size-6" />
                            </DrawerTrigger>
                            <DrawerContent className="p-4">
                                <DrawerHeader>
                                    <DrawerTitle>{resolveBinding(element.label, state, t)}</DrawerTitle>
                                    <DrawerClose className="absolute right-4 top-4">
                                        <XIcon className="size-5" />
                                    </DrawerClose>
                                </DrawerHeader>
                                <div className="flex flex-col space-y-2">
                                    {renderMobileItems(element.items, runEventHandler, state, t)}
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </div>
                </div>
            )

        default:
            return null
    }
}
