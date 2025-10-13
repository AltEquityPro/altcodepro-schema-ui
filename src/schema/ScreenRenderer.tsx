'use client';
import { useEffect, useMemo } from "react";
import {
    UIProject,
    UIScreenDef,
    AnyObj,
    RedirectSpec,
    ConditionExpr,
    ActionRuntime,
    UIElement,
} from "../types";
import { useAppState } from "./StateContext";
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

export interface ScreenRendererProps {
    project: UIProject;
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

/** ---------- Guard helpers ---------- */
function evalCondition(expr: ConditionExpr, state: AnyObj, t: (k: string) => string): boolean {
    const key = resolveBinding(expr.key, state, t);
    const val = resolveBinding(expr.value, state, t);
    switch (expr.op) {
        case "==": return key === val;
        case "!=": return key !== val;
        case ">": return key > val;
        case "<": return key < val;
        case ">=": return key >= val;
        case "<=": return key <= val;
        case "exists": return key !== null && key !== undefined;
        case "not_exists": return key === null || key === undefined;
        case "matches": return new RegExp(val).test(String(key ?? ""));
        case "in": return Array.isArray(val) && val.includes(key);
        case "not_in": return Array.isArray(val) && !val.includes(key);
        default: return true;
    }
}

function evalGuard(guard: UIScreenDef["guard"] | undefined, state: AnyObj, t: (k: string) => string) {
    if (!guard) return { ok: true };
    const mode = guard.mode || "all";
    const conds = guard.conditions || [];
    const checks = conds.map(c => evalCondition({ key: c.key, op: c.op as any, value: c.value }, state, t));
    const ok = mode === "all" ? checks.every(Boolean) : checks.some(Boolean);
    return { ok, onFail: guard.onFail };
}

function gotoRedirect(runtime: ActionRuntime, redirect?: RedirectSpec) {
    if (!redirect) return;
    if (redirect.href && runtime.navigate) runtime.navigate(redirect.href, false);
    // If you support screenId-based navigation, add your mapping here
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
    CustomElementResolver
}: ScreenRendererProps) {
    const { state, setState, t } = useAppState();
    // Filter out POST methods from dataSources, as they should be action-triggered
    const dataSourcesToFetch = currentScreenDef.dataSources?.filter(ds => ds.method !== "POST") || [];
    const dataMap: Record<string, any> = useDataSources({
        dataSources: dataSourcesToFetch,
        globalConfig: project.globalConfig,
        screen: currentScreenDef,
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

    useEffect(() => {
        if (!dataMap) return;
        for (const [id, val] of Object.entries(dataMap)) {
            setState(id, val);
        }
    }, [dataMap, setState]);

    useEffect(() => {
        const enter = currentScreenDef.lifecycle?.onEnter;
        if (enter && enter.action !== 'navigation') runEventHandler(enter);
        return () => {
            const leave = currentScreenDef.lifecycle?.onLeave;
            if (leave) runEventHandler(leave);
        };
    }, [currentScreenDef.id, runEventHandler]);

    const guardResult = useMemo(() => evalGuard(currentScreenDef.guard, state, t), [currentScreenDef.guard, state, t]);
    useEffect(() => {
        if (!guardResult.ok) gotoRedirect(runtime, guardResult.onFail);
    }, [guardResult.ok, runtime]);

    const dsList = currentScreenDef.dataSources || [];
    const isLoading = dsList.length > 0 && dsList.some((ds) => typeof dataMap[ds.id] === "undefined");
    const errors: Array<{ id: string; error: any }> = dsList
        .map((ds) => ({ id: ds.id, data: dataMap[ds.id] }))
        .filter((x) => x.data && x.data.ok === false)
        .map((x) => ({ id: x.id, error: x.data }));

    const screenClasses = cn(layoutClasses(currentScreenDef.layoutType), classesFromStyleProps(currentScreenDef.styles));
    if (!guardResult.ok) return null;
    if (isLoading && loadingFallback) return <>{loadingFallback}</>;
    if (errors.length && errorFallback) return <>{errorFallback(errors)}</>;

    return (
        <div className={screenClasses} data-screen-id={currentScreenDef.id}>
            {showDebug && (
                <div className="mb-4 text-xs text-muted-foreground">
                    <span className="inline-block rounded bg-muted px-2 py-1 mr-2">
                        screen: <strong>{resolveBinding(currentScreenDef.name, state, t)}</strong>
                    </span>
                    {dsList.length > 0 && (
                        <span className="inline-block rounded bg-muted px-2 py-1 mr-2">
                            data: {dsList.map((d) => d.id).join(", ")}
                        </span>
                    )}
                </div>
            )}
            {currentScreenDef.elements?.map((el) => {
                const visible = isVisible(el.visibility, state, t);
                if (!visible) return null;
                const resolved = deepResolveBindings(el, state, t);
                const key = resolved.id;
                return (
                    <ElementResolver
                        key={key}
                        element={resolved}
                        runEventHandler={runEventHandler}
                        globalConfig={project.globalConfig}
                        dataSources={currentScreenDef.dataSources}
                        CustomElementResolver={CustomElementResolver}
                    />
                );
            })}
        </div>
    );
}