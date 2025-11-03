"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn, classesFromStyleProps } from "../../lib/utils";
import { RenderChildren } from "../../schema/RenderChildren";
import { TabsElement, AnyObj, EventHandler } from "../../types";
import { DynamicIcon } from "./dynamic-icon";

/* ---------- Base Tab Primitives ---------- */

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "flex flex-wrap items-center justify-start gap-2 border-b border-[var(--acp-border)] dark:border-[var(--acp-border-dark)] overflow-x-auto",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative px-4 py-2 text-sm font-medium text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)] transition-colors duration-200",
        "data-[state=active]:text-[var(--acp-primary)] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[var(--acp-border)] data-[state=active]:after:bg-[var(--acp-primary)]",
        "hover:text-[var(--acp-primary-600)] focus-visible:outline-none",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "transition-opacity duration-300 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100",
        className
      )}
      {...props}
    />
  );
}

/* ---------- Dynamic Tab Renderer ---------- */

function TabRender({
  tabs,
  state,
  setState,
  t,
  runEventHandler,
}: {
  tabs: TabsElement;
  state: AnyObj;
  t: (key: string) => string;
  setState: (path: string, value: any) => void;
  runEventHandler?: (
    handler?: EventHandler,
    dataOverride?: AnyObj
  ) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = React.useState(
    tabs.activeTab ?? tabs.tabs?.[0]?.id ?? ""
  );

  const handleTabChange = React.useCallback(
    async (value: string) => {
      setActiveTab(value);
      if (tabs.onChange) await runEventHandler?.(tabs.onChange, { value });
    },
    [tabs, runEventHandler]
  );

  const tabListClass = classesFromStyleProps(tabs.tabListStyle);
  const tabTriggerClass = classesFromStyleProps(tabs.tabTriggerStyle);
  const activeTabClass = classesFromStyleProps(tabs.activeTabStyle);
  const contentClass = classesFromStyleProps(tabs.tabContentStyle);

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className={cn(classesFromStyleProps(tabs.styles))}
    >
      <TabsList className={cn(tabListClass)}>
        {tabs.tabs?.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(tabTriggerClass, isActive && activeTabClass)}
            >
              {tab.icon && (
                <DynamicIcon
                  name={tab.icon}
                  className="mr-1 text-(--acp-primary)"
                />
              )}
              {typeof tab.label === "string" ? t(tab.label) : tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {tabs.tabs?.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className={cn(contentClass)}>
          <RenderChildren
            children={tab.content}
            state={state}
            setState={setState}
            t={t}
            runEventHandler={runEventHandler}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

export { TabRender, Tabs, TabsList, TabsTrigger, TabsContent };
