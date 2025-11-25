"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PanelLeftIcon, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";
import { Button } from "./button";
import { cn, classesFromStyleProps, getAccessibilityProps, resolveBinding } from "../../lib/utils";
import { ElementType, type AnyObj, type EventHandler, type SearchElement, type SidebarElement } from "../../types";
import { useIsMobile } from "../../hooks/use-mobile";
import { RenderChildren } from "../../schema/RenderChildren";
import { SearchRenderer } from "./search";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const toggleGroup = (id: string) =>
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  // Auto-expand matching groups when searching (including voice input)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setExpandedGroups({});
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const newExpanded: Record<string, boolean> = {};

    element.groups?.forEach((group) => {
      const groupLabel = resolveBinding(group.label, state, t) || "";
      const hasGroupMatch = groupLabel.toLowerCase().includes(q);

      const hasItemMatch = group.items?.some((item) => {
        const itemLabel = resolveBinding((item as any).label || (item as any).name, state, t) || "";
        return itemLabel.toLowerCase().includes(q);
      });

      if (hasGroupMatch || hasItemMatch) {
        newExpanded[group.id] = true;
      }
    });

    setExpandedGroups((prev) => ({ ...prev, ...newExpanded }));
  }, [searchQuery, element.groups, state, t]);

  // Deep filtering (group + item labels)
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return element.groups || [];

    const q = searchQuery.toLowerCase().trim();

    return (element.groups || []).map((group) => {
      const groupLabel = resolveBinding(group.label, state, t) || "";
      const groupMatch = groupLabel.toLowerCase().includes(q);

      const filteredItems = (group.items || [])
        .filter((item) => {
          const label = resolveBinding((item as any).label || (item as any).name, state, t) || "";
          return label.toLowerCase().includes(q) || groupMatch;
        })
        .filter((item) => !(item as any).requiresAuth || state?.isAuthenticated || state?.auth?.user);

      if (groupMatch || filteredItems.length > 0) {
        return { ...group, items: filteredItems };
      }
      return null;
    }).filter(Boolean) as typeof element.groups;
  }, [element.groups, searchQuery, state, t]);

  const hasResults = filteredGroups.length > 0;

  // Properly wrapped handlers that respect EventHandler system
  const handleSearch = async (data: AnyObj) => {
    const query = (data?.query ?? "").trim();
    setSearchQuery(query);

    if (element.search?.onSearch) {
      await runEventHandler?.(element.search.onSearch, { query, ...data });
    }
  };

  const handleClear = async () => {
    setSearchQuery("");
    if (element.search?.onClear) {
      await runEventHandler?.(element.search.onClear);
    }
  };

  // Forward voice events so user can react (optional)
  const handleVoiceStart = () => {
    if (element.search?.onVoiceStart) {
      runEventHandler?.(element.search.onVoiceStart);
    }
  };

  const handleVoiceEnd = () => {
    if (element.search?.onVoiceEnd) {
      runEventHandler?.(element.search.onVoiceEnd);
    }
  };

  const sidebarContent = (
    <div
      className={cn(
        "flex h-full flex-col bg-(--acp-background) dark:bg-(--acp-background-dark) text-(--acp-foreground) dark:text-(--acp-foreground-dark)",
        classesFromStyleProps(element.styles),
        isMobile ? "w-full" : "w-(--sidebar-width)",
        "border-r border-(--acp-border) dark:border-(--acp-border-dark)"
      )}
      style={{ "--sidebar-width": SIDEBAR_WIDTH } as React.CSSProperties}
    >
      {/* Header */}
      {element.header && (!element.header.requiresAuth || state?.isAuthenticated || state?.auth?.user) && (
        <div className="p-4 border-b border-(--acp-border) dark:border-(--acp-border-dark)">
          <RenderChildren children={[element.header]} state={state} t={t} setState={setState} runEventHandler={runEventHandler} />
        </div>
      )}

      {/* Search with Voice Support */}
      {element.search && (
        <div className="sticky top-0 z-10 border-b border-(--acp-border) dark:border-(--acp-border-dark) bg-(--acp-background) dark:bg-(--acp-background-dark)">
          <SearchRenderer
            element={{
              ...element.search,
              value: searchQuery,
              allowVoice: element.search.allowVoice ?? true, // enable by default
              voiceLang: element.search.voiceLang ?? "en-US",
              onSearch: handleSearch as any,
              onClear: handleClear as any,
              onVoiceStart: handleVoiceStart as any,
              onVoiceEnd: handleVoiceEnd as any,
            }}
            state={state}
            t={t}
            runEventHandler={runEventHandler}
          />
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {!hasResults && searchQuery ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t("no_results_found", "No items found")}
          </div>
        ) : (
          filteredGroups.map((group) => {
            const isExpanded = expandedGroups[group.id] ?? !searchQuery.trim();

            return (
              <div
                key={group.id}
                className={cn(
                  "rounded-lg border border-transparent hover:border-(--acp-border) transition-all duration-200",
                  group.className
                )}
              >
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    "w-full flex justify-between items-center px-4 py-3 text-sm font-medium rounded-t-lg select-none transition-colors",
                    isExpanded
                      ? "bg-primary/5 text-primary"
                      : "hover:bg-muted/50",
                    group.headerClassName
                  )}
                >
                  <span>{resolveBinding(group.label, state, t)}</span>
                  <span className={cn("transition-transform duration-200", isExpanded ? "rotate-90" : "")}>
                    Right Arrow
                  </span>
                </button>

                <div
                  className={cn(
                    "transition-all duration-300",
                    isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                  )}
                >
                  <div className={cn("pt-2 pb-4 px-2 space-y-1", group.collapseContainerClassName)}>
                    <RenderChildren
                      children={group.items || []}
                      state={state}
                      t={t}
                      setState={setState}
                      runEventHandler={runEventHandler}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {element.footer && (
        <div className="p-4 border-t border-(--acp-border) dark:border-(--acp-border-dark)">
          <RenderChildren children={[element.footer]} state={state} t={t} setState={setState} runEventHandler={runEventHandler} />
        </div>
      )}
    </div>
  );

  // Mobile Drawer
  if (isMobile) {
    return (
      <>
        <MobileHeader className={className}>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <SidebarTrigger isOpen={isOpen} toggleSidebar={toggleSidebar} />
            </SheetTrigger>
            <SheetContent direction="left" className="p-0 w-[280px]">
              {sidebarContent}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 z-50"
              >
                <X className="h-5 w-5" />
              </Button>
            </SheetContent>
          </Sheet>
        </MobileHeader>
        <div className="h-14 md:hidden" />
      </>
    );
  }

  return (
    <div className={cn("fixed inset-y-0 left-0 z-40 hidden md:flex", className)}>
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