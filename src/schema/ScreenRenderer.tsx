'use client';
import { useEffect } from "react";
import {
    UIProject,
    UIScreenDef,
    AnyObj,
    RedirectSpec,
    ActionRuntime,
    UIElement,
} from "../types";
import { useActionHandler } from "./useActionHandler";
import {
    deepResolveBindings,
    resolveBinding,
    classesFromStyleProps,
    isVisible,
    cn,
} from "../lib/utils";
import { ElementResolver } from "./ElementResolver";
import { useDataSources } from "./useDataSources";
import { GuardProvider, useGuardEvaluator } from "../hooks/useGuardEvaluator";
import { useAnalytics } from "../hooks/AnalyticsContext";
import { StateTreeViewer } from "../components/ui/StateTreeViewer";

export interface ScreenRendererProps {
    project: UIProject;
    state: AnyObj;
    t: (key: string) => string;
    setState: (path: string, value: any) => void;
    currentScreenDef: UIScreenDef;
    runtime: ActionRuntime;
    showDebug?: boolean;
    loadingFallback?: React.ReactNode;
    errorFallback?: (errs: Array<{ id: string; error: any }>) => React.ReactNode;
    CustomElementResolver?: (
        element: UIElement,
        ctx: {
            state: AnyObj;
            t: (k: string) => string;
            runEventHandler?: (ev: any, payload?: AnyObj) => void;
        }
    ) => React.ReactNode;
}
let lastRedirect: string | null = null;

function gotoRedirect(runtime: ActionRuntime, redirect?: RedirectSpec) {
    if (!redirect?.href || redirect.href === lastRedirect) return;
    lastRedirect = redirect.href;
    runtime?.nav?.replace?.(redirect.href) ?? (window.location.href = redirect.href);
}

/** ---------- Layout helpers (lightweight) ---------- */
function layoutClasses(layout: UIScreenDef["layoutType"]) {
    switch (layout) {
        case "contact":
        case "cover":
        case "custom":
            return "";
        case "data_dashboard":
        case "data_table_with_chart":
        case "datagrid":
            return "grid grid-cols-1 lg:grid-cols-12 gap-6";
        case "faq":
            return "";
        case "feature_carousel":
            return "mx-auto max-w-6xl px-4";
        case "four_columns":
            return "grid grid-cols-1 md:grid-cols-4 gap-6";
        case "gallery":
            return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4";
        case "map":
            return "w-full h-full";
        case "single_column":
            return "mx-auto max-w-4xl px-4";
        case "step_wizard":
            return "";
        case "three_columns":
            return "grid grid-cols-1 md:grid-cols-3 gap-6";
        case "timeline":
            return "mx-auto max-w-5xl px-4";
        case "two_columns":
            return "grid grid-cols-1 md:grid-cols-2 gap-6";
        default:
            return "";
    }
}

export function ScreenRenderer({
    project,
    currentScreenDef,
    runtime,
    showDebug = false,
    loadingFallback,
    errorFallback,
    state,
    setState,
    t,
    CustomElementResolver
}: ScreenRendererProps) {
    // Filter out POST methods from dataSources, as they should be action-triggered
    const dataSourcesToFetch = currentScreenDef.dataSources?.filter(ds => ds.method !== "POST") || [];
    const dataMap: Record<string, any> = useDataSources({
        dataSources: dataSourcesToFetch,
        globalConfig: project.globalConfig,
        screen: currentScreenDef,
        state,
        setState
    });
    const action = {
        globalConfig: project.globalConfig,
        dataSources: currentScreenDef.dataSources, // Include all dataSources for actions
        runtime: {
            ...(runtime || {}),
            patchState: (path: string, val: any) => setState(path, val)
        }
    };
    const { runEventHandler } = useActionHandler({ ...action });
    const analytics = useAnalytics()
    useEffect(() => {
        if (!dataMap) return;
        for (const [id, val] of Object.entries(dataMap)) {
            setState(id, val);
        }
    }, [dataMap]);

    useEffect(() => {
        const enter = currentScreenDef.lifecycle?.onEnter;
        if (enter && enter.action !== 'navigation') runEventHandler(enter);
        return () => {
            const leave = currentScreenDef.lifecycle?.onLeave;
            if (leave) runEventHandler(leave);
        };
    }, [currentScreenDef.id, runEventHandler]);
    const guardResult = useGuardEvaluator(currentScreenDef.guard, state, t, project?.globalConfig);

    useEffect(() => {
        if (!guardResult.ok) {
            const timeout = setTimeout(() => {
                try { localStorage.setItem("pendingPath", window.location.pathname + window.location.search); } catch { }
                runtime.toast?.(t("access_denied") || "Access restricted", "warning");
                gotoRedirect(runtime, guardResult.onFail);
            }, 300); // small grace period
            return () => clearTimeout(timeout);
        }
    }, [guardResult.ok]);


    useEffect(() => {
        analytics.trackPage?.(currentScreenDef.route, {
            screenId: currentScreenDef.id,
            name: resolveBinding(currentScreenDef.name, state, t),
            layout: currentScreenDef.layoutType,
            projectId: project.globalConfig?.projectId,
        });
    }, [currentScreenDef.id]);


    const dsList = currentScreenDef.dataSources || [];
    const isLoading = dsList.length > 0 && dsList.some((ds) => typeof dataMap[ds.id] === "undefined");
    const errors: Array<{ id: string; error: any }> = dsList
        .map((ds) => ({ id: ds.id, data: dataMap[ds.id] }))
        .filter((x) => x.data && x.data.ok === false)
        .map((x) => ({ id: x.id, error: x.data }));

    const screenClasses = cn(layoutClasses(currentScreenDef.layoutType), classesFromStyleProps(currentScreenDef.styles));

    if (isLoading && loadingFallback) return <>{loadingFallback}</>;
    if (errors.length && errorFallback) return <>{errorFallback(errors)}</>;


    return (
        <GuardProvider result={guardResult}>
            <div className={screenClasses} data-screen-id={currentScreenDef.id}>
                {showDebug && (
                    <StateTreeViewer
                        state={state}
                        setState={(path, val) => {
                            setState(path, val);
                            runtime.toast?.(`Updated state: ${path}`, "info");
                        }}
                    />
                )}
                {currentScreenDef.elements?.map((el) => {
                    const visible = isVisible(el.visibility, state, t);
                    if (!visible) return null;
                    const resolved = deepResolveBindings(el, state, t);
                    const key = resolved.id;
                    return (
                        <ElementResolver
                            key={key}
                            state={state}
                            setState={setState}
                            t={t}
                            element={resolved}
                            runEventHandler={runEventHandler}
                            globalConfig={project.globalConfig}
                            dataSources={currentScreenDef.dataSources}
                            CustomElementResolver={CustomElementResolver}
                        />
                    );
                })}
            </div>
        </GuardProvider>
    );
}