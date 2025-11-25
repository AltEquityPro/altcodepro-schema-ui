'use client';
import React, { useEffect, useMemo } from "react";
import {
    UIProject, AnyObj,
    UIElement,
    EventHandler,
    IScreen
} from "../types";
import {
    resolveBinding, classesFromStyleProps, isVisible, cn
} from "../lib/utils";
import { ElementResolver } from "./ElementResolver";
import { Toaster } from "../components/ui/sonner";
import { useAppState } from "./StateContext";


function layoutClasses(layout: any) {
    const base = "w-full px-4 py-6";
    const map: Record<string, string> = {
        cover: "relative w-full min-h-screen flex flex-col justify-center items-center overflow-hidden",
        contact: "relative w-full min-h-screen flex flex-col justify-center items-center overflow-hidden",
        custom: "relative w-full min-h-screen flex flex-col justify-center items-center overflow-hidden",
        data_dashboard: "w-full min-h-screen px-6 py-8 space-y-6 bg-background overflow-y-auto scroll-smooth lg:container lg:mx-auto",
        datagrid: "grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 py-8 overflow-x-auto bg-background",
        four_columns: "grid grid-cols-1 md:grid-cols-4 gap-6 px-6 py-8",
        three_columns: "grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-8",
        two_columns: "grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-8",
        single_column: "max-w-4xl mx-auto px-4 py-8 space-y-6",
        feature_carousel: "mx-auto max-w-6xl px-4 py-8",
        gallery: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4",
        map: "relative w-full h-full overflow-hidden",
        timeline: "mx-auto max-w-5xl px-4 py-8",
        step_wizard: "flex flex-col items-center justify-center w-full h-full px-6 py-8 space-y-6"
    };
    return map[layout] || base;
}

export function ScreenView({
    screen,
    project,
    route,
    state,
    analytics,
    runEventHandler,
    setState,
    t,
    CustomElementResolver
}: {
    screen: IScreen;
    project: UIProject;
    analytics: any;
    route: string;
    state: AnyObj;
    runEventHandler: (handler?: EventHandler | undefined, dataOverride?: AnyObj) => Promise<void>;
    setState: (path: string, val: any) => void;
    t: (key: string) => string;
    CustomElementResolver?: (
        element: UIElement,
        ctx: { state: AnyObj; t: (k: string) => string; runEventHandler?: (ev: any, payload?: AnyObj) => void }
    ) => React.ReactNode;
}) {

    useEffect(() => {
        analytics.trackPage?.(route, {
            screenId: screen.id,
            name: resolveBinding(screen.name, state, t),
            layout: screen.layoutType,
            projectId: project.globalConfig?.projectId
        });
    }, [analytics, screen.id]);


    // 🔹 Lifecycle
    useEffect(() => {
        const enter = screen.lifecycle?.onEnter;
        if (enter && enter.action !== "navigation") {
            const canRun = isVisible(enter.canRun, state, t);
            if (canRun) {
                runEventHandler(enter);
            }
        }
        return () => {
            const leave = screen.lifecycle?.onLeave;
            if (leave) {
                const canRun = isVisible(leave.canRun, state, t);
                if (canRun) {
                    runEventHandler(leave);
                }
            }
        };
    }, [screen.id, runEventHandler]);


    const screenClasses = useMemo(
        () => cn(layoutClasses(screen.layoutType), classesFromStyleProps(screen.styles)),
        [screen.layoutType, screen.styles]
    );
    return (
        <div className={screenClasses} data-screen-id={screen.id}>

            <Toaster closeButton expand duration={36000000} richColors position="top-right" />
            {screen.elements?.map((el: any) =>
                isVisible(el.visibility, state, t) ? (
                    <ElementResolver
                        key={el.id}
                        state={state}
                        setState={setState}
                        t={t}
                        element={el}
                        runEventHandler={runEventHandler}
                        globalConfig={project.globalConfig}
                        dataSources={screen.dataSources}
                        CustomElementResolver={CustomElementResolver}
                    />
                ) : null
            )}
        </div>
    );
}

export default React.memo(ScreenView);
