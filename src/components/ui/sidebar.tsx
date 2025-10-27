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
        "md:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--acp-background)] p-2 flex items-center justify-between border-b border-[var(--acp-border)]",
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
      className={cn("size-9 text-[var(--acp-foreground)] hover:bg-primary-100", className)}
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

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  // Handle menu item clicks
  const handleMenuItemClick = async (handler?: EventHandler, data?: AnyObj) => {
    if (isMobile) {
      setIsOpen(false); // Close sidebar on mobile
    }
    if (runEventHandler && handler) {
      await runEventHandler(handler, data);
    }
  };

  // Apply Animate.css classes dynamically
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isMobile, isOpen]);

  const sidebarContent = (
    <div
      className={cn(
        "flex h-full flex-col bg-[var(--acp-background)] text-[var(--acp-foreground)]",
        classesFromStyleProps(element.styles),
        isMobile ? "w-full" : "w-(--sidebar-width)",
        "border-r border-[var(--acp-border)]"
      )}
      style={{ "--sidebar-width": SIDEBAR_WIDTH } as React.CSSProperties}
      {...getAccessibilityProps(element.accessibility)}
    >
      {/* Header */}
      {element.header && (
        <div className="p-4 border-b border-[var(--acp-border)]">
          <RenderChildren
            children={[element.header]}
            t={t}
            state={state}
            setState={setState}
            runEventHandler={runEventHandler}
          />
        </div>
      )}

      {/* Groups */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {element.groups?.map((group) => (
          <div key={group.id} className="space-y-2">
            <div className="text-sm font-medium text-[var(--acp-foreground)]/70">
              {resolveBinding(group.label, state, t)}
            </div>
            <ul className="space-y-1">
              {group.items?.map((item) => (
                <li key={item.id}>
                  <div
                    className="flex items-center rounded-md hover:bg-primary-100/50 p-2 transition-colors duration-200"
                    onClick={() => handleMenuItemClick(item.onEvent?.click, item)}
                  >
                    <RenderChildren
                      children={[item]}
                      t={t}
                      state={state}
                      setState={setState}
                      runEventHandler={runEventHandler}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer */}
      {element.footer && (
        <div className="p-4 border-t border-[var(--acp-border)]">
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

  if (isMobile) {
    return (
      <>
        <MobileHeader>
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
                className="absolute top-2 right-2 size-9 text-[var(--acp-foreground)] hover:bg-primary-100"
                onClick={() => setIsOpen(false)}
                aria-label="Close Sidebar"
              >
                <X className="size-5" />
                <span className="sr-only">Close Sidebar</span>
              </Button>
            </SheetContent>
          </Sheet>
        </MobileHeader>
        <div className="mt-14" /> {/* Spacer for fixed header */}
      </>
    );
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-10 hidden md:flex",
        className
      )}
    >
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