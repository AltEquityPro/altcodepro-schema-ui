"use client";

import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";

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
import { useActionHandler } from "./Actions";

import {
    deepResolveBindings,
    resolveBinding,
    classesFromStyleProps,
    isVisible,
    cn,
    resolveAnimation,
} from "../lib/utils";

import { ElementResolver } from "./ElementResolver";
import { useDataSources } from "./Datasource";

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
            runtime: ActionRuntime;
            state: AnyObj;
            t: (k: string) => string;
            runEventHandler: (ev: any, payload?: AnyObj) => void;
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

    // Resolve DS (fetch, poll, ws/subs) + data mappings
    const dataMap = useDataSources({
        dataSources: currentScreenDef.dataSources || [],
        globalConfig: project.globalConfig,
        screen: currentScreenDef,
    });
    const action = {
        globalConfig: project.globalConfig,
        dataSources: currentScreenDef?.dataSources,
        runtime: {
            ...(runtime || {}),
            patchState: (path: string, val: any) => setState(path, val)
        }
    }
    // Build actions with full runtime
    const { runEventHandler } = useActionHandler({ ...action });


    /** Keep each dataSource result mirrored into state under its id.
     * This matches your "we use dataSourceId to resolve" convention.
     * Mappings still run (and may write to other state keys).
     */
    useEffect(() => {
        if (!dataMap) return;
        for (const [id, val] of Object.entries(dataMap)) {
            setState(id, val);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(dataMap)]);

    /** Lifecycle: onEnter / onLeave */
    useEffect(() => {
        const enter = currentScreenDef.lifecycle?.onEnter;
        if (enter && enter.action !== 'navigation') runEventHandler(enter);
        return () => {
            const leave = currentScreenDef.lifecycle?.onLeave;
            if (leave) runEventHandler(leave);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentScreenDef.id]);

    /** Evaluate guard after DS + state are ready */
    const guardResult = useMemo(() => evalGuard(currentScreenDef.guard, state, t), [currentScreenDef.guard, state, t]);

    useEffect(() => {
        if (!guardResult.ok) gotoRedirect(runtime, guardResult.onFail);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [guardResult.ok]);

    /** Loading / Errors */
    const dsList = currentScreenDef.dataSources || [];
    const isLoading =
        dsList.length > 0 &&
        dsList.some((ds) => typeof dataMap[ds.id] === "undefined");
    const errors: Array<{ id: string; error: any }> = dsList
        .map((ds) => ({ id: ds.id, data: dataMap[ds.id] }))
        .filter((x) => x.data && x.data.ok === false)
        .map((x) => ({ id: x.id, error: x.data }));

    /** Screen container classes + animation */
    const screenClasses = cn(layoutClasses(currentScreenDef.layoutType), classesFromStyleProps(currentScreenDef.styles));

    if (!guardResult.ok) {
        // While redirecting, optionally render nothing or a tiny placeholder.
        return null;
    }

    if (isLoading && loadingFallback) {
        return <>{loadingFallback}</>;
    }

    if (errors.length && errorFallback) {
        return <>{errorFallback(errors)}</>;
    }

    return (
        <div className={screenClasses} data-screen-id={currentScreenDef.id}>
            {/* Optional debug strip */}
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

            {/* Render all elements with ElementResolver so each gets proper runtime + actions */}
            {currentScreenDef.elements?.map((el) => {
                // Global per-element visibility is already checked inside ElementResolver,
                // but we can short-circuit here if you need faster skip:
                const visible = isVisible(el.visibility, state, t);
                if (!visible) return null;

                // If element has dataSourceId, ensure it can read from state[dsId]
                // (the mirroring effect above already synced dataMap into state).
                const resolved = el.dataSourceId ? deepResolveBindings(el, state, t) : el;

                // Give a stable key; prefer element.id
                const key = resolved.id;

                return <ElementResolver key={key}
                    element={resolved}
                    runtime={runtime}
                    globalConfig={project?.globalConfig}
                    dataSources={currentScreenDef?.dataSources}
                    CustomElementResolver={CustomElementResolver} />;
            })}
        </div>
    );
}
