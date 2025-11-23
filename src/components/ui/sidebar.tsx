"use client";

import React, { useState, useEffect } from "react";
import { PanelLeftIcon, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";
import { Button } from "./button";
import { cn, classesFromStyleProps, getAccessibilityProps, resolveBinding } from "../../lib/utils";
import type { AnyObj, EventHandler, SidebarElement } from "../../types";
import { useIsMobile } from "../../hooks/use-mobile";
import { RenderChildren } from "../../schema/RenderChildren";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";

function MobileHeader({ className, children, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "md:hidden fixed top-0 left-0 right-0 z-50 bg-(--acp-background) dark:bg-(--acp-background-dark)  p-2 flex items-center justify-between border-b border-(--acp-border) dark:border-(--acp-border-dark)",
        className
      )}
      {...props}
    >
      {children}
    </header>
  );
}

// Sidebar Trigger Component
function SidebarTrigger({
  isOpen,
  toggleSidebar,
  className,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-9 dark:text-(--acp-foreground-dark) hover:bg-primary-100", className)}
      onClick={toggleSidebar}
      aria-label={isOpen ? "Close Sidebar" : "Open Sidebar"}
    >
      <PanelLeftIcon className="size-5" />
      <span className="sr-only">{isOpen ? "Close Sidebar" : "Open Sidebar"}</span>
    </Button>
  );
}

// Sidebar Component
function Sidebar({
  element,
  t,
  state,
  setState,
  runEventHandler,
  className,
}: {
  element: SidebarElement;
  t: (key: string, defaultLabel?: string) => string;
  state: AnyObj;
  setState: (path: string, value: any) => void;
  runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>;
  className?: string;
}) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const toggleGroup = (id: string) =>
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  // Prevent body scroll on mobile
  useEffect(() => {
    if (isMobile && isOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [isMobile, isOpen]);

  const sidebarContent = (
    <div
      className={cn(
        "flex h-full flex-col bg-(--acp-background) dark:bg-(--acp-background-dark) text-(--acp-foreground) dark:text-(--acp-foreground-dark)",
        classesFromStyleProps(element.styles),
        isMobile ? "w-full" : "w-(--sidebar-width)",
        "border-r border-(--acp-border) dark:border-(--acp-border-dark)"
      )}
      style={{ "--sidebar-width": SIDEBAR_WIDTH } as React.CSSProperties}
      {...getAccessibilityProps(element.accessibility)}
    >
      {element.header &&
        (!element.header.requiresAuth ||
          state?.isAuthenticated ||
          state?.auth?.user) && (
          <div className="p-4 border-b border-(--acp-border) dark:border-(--acp-border-dark)">
            <RenderChildren
              children={[element.header]}
              t={t}
              state={state}
              setState={setState}
              runEventHandler={runEventHandler}
            />
          </div>
        )}

      {/* Search Bar */}
      {element.showSearch && <div className="sticky top-0 bg-(--acp-background) dark:bg-(--acp-background-dark) z-10 pb-2">
        <input
          type="search"
          placeholder={t("search_placeholder", "Search...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-(--acp-border) dark:border-(--acp-border-dark) bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-(--acp-primary)"
        />
      </div>}

      {/* Groups Scrollable Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[var(--acp-border-dark)] scrollbar-thumb-rounded-md p-2 space-y-2">
        {element.groups?.map((group) => {
          const isExpanded = expandedGroups[group.id] ?? true;
          let items = group.items?.filter((item) => {
            const label = resolveBinding(item.name, state, t)?.toLowerCase?.() || "";
            return !searchQuery || label.includes(searchQuery.toLowerCase());
          });
          items = items.filter(item => {
            if (item.requiresAuth && !(state?.isAuthenticated || state?.auth?.user)) {
              return false;
            }
            return true;
          })
          if (!items?.length) return null;

          return (
            <div
              key={group.id}
              className={cn("rounded-lg border border-transparent hover:border-(--acp-border) transition-colors", group?.className)}
            >
              <button
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "w-full flex justify-between items-center px-3 py-2 text-sm font-medium rounded-md select-none transition-colors",
                  isExpanded
                    ? "bg-[color-mix(in_srgb,var(--acp-primary)10%,transparent)] text-(--acp-primary)"
                    : "hover:bg-[color-mix(in_srgb,var(--acp-foreground)6%,transparent)] text-(--acp-foreground) dark:text-(--acp-foreground-dark)",
                  group.headerClassName,
                )}
              >
                <span>{resolveBinding(group.label, state, t)}</span>
                <span
                  className={cn(
                    "transition-transform duration-300",
                    isExpanded ? "rotate-90" : "rotate-0"
                  )}
                >
                  ▸
                </span>
              </button>

              {/* Collapsible Content */}
              <div
                className={cn(
                  "transition-all duration-300 overflow-hidden",
                  group.collapseContainerClassName,
                  isExpanded ? "h-auto opacity-100" : "h-0 opacity-0 overflow-hidden"
                )}
              >
                <RenderChildren
                  children={items}
                  t={t}
                  state={state}
                  setState={setState}
                  runEventHandler={runEventHandler}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {element.footer && (
        <div className="p-4 border-t border-(--acp-border) dark:border-(--acp-border-dark)">
          <RenderChildren
            children={[element.footer]}
            t={t}
            state={state}
            setState={setState}
            runEventHandler={runEventHandler}
          />
        </div>
      )}
    </div>
  );

  // Mobile drawer style (unchanged except adding scrollable content)
  if (isMobile) {
    return (
      <>
        <MobileHeader className={className}>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <SidebarTrigger isOpen={isOpen} toggleSidebar={toggleSidebar} />
            </SheetTrigger>
            <SheetContent
              direction="left"
              className={cn(
                "p-0 w-(--sidebar-width-mobile) animate__animated",
                isOpen ? "animate__slideInLeft" : "animate__slideOutLeft"
              )}
              style={{ "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
            >
              {sidebarContent}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 size-9 dark:text-(--acp-foreground-dark) hover:bg-primary-100"
                onClick={() => setIsOpen(false)}
                aria-label="Close Sidebar"
              >
                <X className="size-5" />
              </Button>
            </SheetContent>
          </Sheet>
        </MobileHeader>
        <div className="mt-14" />
      </>
    );
  }

  return (
    <div className={cn("fixed inset-y-0 left-0 z-10 hidden md:flex", className)}>
      {sidebarContent}
    </div>
  );
}

export function SidebarRenderer({
  element,
  t,
  state,
  setState,
  runEventHandler,
}: {
  element: SidebarElement;
  t: (key: string, defaultLabel?: string) => string;
  state: AnyObj;
  setState: (path: string, value: any) => void;
  runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>;
}) {
  return (
    <div className={cn(classesFromStyleProps(element.styles))}>
      <Sidebar
        element={element}
        t={t}
        state={state}
        setState={setState}
        runEventHandler={runEventHandler}
      />
    </div>
  );
}