'use client';
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    UIProject, UIDefinition,
    ActionRuntime, NavigationAPI,
    RedirectSpec
} from "../types";
import { useAuth } from "./useAuth";
import { useAppState } from "./StateContext";
import ScreenView from "./ScreenView";
import { StateTreeViewer } from "../components/ui/StateTreeViewer";
import { toast } from "../components/ui/sonner";
import { useActionHandler } from "./useActionHandler";
import { useDataSources } from "./useDataSources";
import { GuardProvider, useGuardEvaluator } from "../hooks/useGuardEvaluator";
import { useAnalytics } from "../hooks/AnalyticsContext";
import { resolveBinding } from "@/lib/utils";

let lastRedirect: string | null = null;
function gotoRedirect(runtime: ActionRuntime, redirect?: RedirectSpec) {
    if (!redirect?.href || redirect.href === lastRedirect) return;
    lastRedirect = redirect.href;
    runtime?.nav?.replace?.(redirect.href) ?? (window.location.href = redirect.href);
}
export function ScreenRenderer({
    uiDef,
    project,
    runtime,
    nav = {},
    requiresAuth,
    routeParams,
    showDebug = false,
    CustomElementResolver,
}: {
    uiDef: UIDefinition;
    project: UIProject;
    runtime?: ActionRuntime;
    nav?: NavigationAPI;
    requiresAuth?: boolean;
    routeParams?: Record<string, string>;
    showDebug?: boolean;
    CustomElementResolver?: any;
}) {

    useAuth({ requiresAuth, nav });
    const analytics = useAnalytics();
    const [loaded, setLoaded] = useState(true);
    const { state, t, setState, setTranslations } = useAppState();
    useEffect(() => {
        setTranslations(uiDef.translations || {});
        setTimeout(() => {
            setLoaded(true);
        }, 400)
    }, [uiDef.translations]);
    const patchState = useCallback((path: string, val: any) => setState(path, val), [setState]);

    const runtimeWithNav = useMemo(() => ({
        ...runtime,
        nav,
        toast: (msg: React.ReactNode, variant = "info") => {
            const fn = (toast as any)[variant] || toast.info;
            fn(msg);
        },
        patchState
    }), [runtime, nav, patchState]);
    const { runEventHandler } = useActionHandler({
        globalConfig: project.globalConfig,
        dataSources: uiDef.dataSources,
        runtime: {
            ...(runtime || {}),
            patchState: (path: string, val: any) => setState(path, val)
        }
    });

    const dataMap = useDataSources({
        dataSources: uiDef.dataSources,
        dataMappings: uiDef.dataMappings,
        globalConfig: project.globalConfig,
        state,
        setState,
        routeParams,
        screen
    });

    useEffect(() => {
        if (!dataMap) return;
        for (const [id, val] of Object.entries(dataMap)) setState(id, val);
    }, [dataMap, setState]);

    useEffect(() => {
        if (routeParams && Object.keys(routeParams).length > 0) {
            setState("params", routeParams);
        }
    }, [routeParams, setState]);

    useEffect(() => {
        const def = uiDef?.state;
        if (!def) return;
        if (Array.isArray(def.data)) {
            for (const item of def.data) {
                try {
                    const path = resolveBinding(item.path, state, t);
                    let val = resolveBinding(item.value ?? item.defaultValue, state, t);

                    switch (item.dataType) {
                        case "number":
                            val = val === "" ? null : Number(val);
                            break;
                        case "boolean":
                            val = (val === "true" || val === true);
                            break;
                        case "object":
                            if (typeof val === "string") {
                                try { val = JSON.parse(val); } catch { }
                            }
                            break;
                        case "array":
                            if (typeof val === "string") {
                                try { val = JSON.parse(val); } catch { val = [] }
                            }
                            if (!Array.isArray(val)) val = [];
                            break;
                        default: // string
                            val = val ?? "";
                    }

                    const v = item.validation;
                    if (v) {
                        if (v.required && (val === null || val === "")) {
                            console.warn(`Validation failed (required) for`, path);
                            continue;
                        }
                        if (v.min !== undefined && Number(val) < v.min) continue;
                        if (v.max !== undefined && Number(val) > v.max) continue;
                        if (v.minLength !== undefined && String(val).length < v.minLength) continue;
                        if (v.maxLength !== undefined && String(val).length > v.maxLength) continue;
                        if (v.regex) {
                            try {
                                const re = new RegExp(v.regex);
                                if (!re.test(String(val))) continue;
                            } catch { }
                        }
                    }

                    if (path) setState(path, val);

                } catch (err) {
                    console.error("uiDef.state.data apply error:", err, item);
                }
            }
        }
        if (def.persist) {
            const storageKey = `ui_state_${uiDef.id || "screen"}`;
            const save = () => {
                const data = JSON.stringify(state);
                try {
                    if (def.persistStorage === "sessionStorage") {
                        sessionStorage.setItem(storageKey, data);
                    } else if (def.persistStorage === "cookie") {
                        document.cookie = `${storageKey}=${encodeURIComponent(data)}; path=/`;
                    } else {
                        localStorage.setItem(storageKey, data);
                    }
                } catch (e) {
                    console.warn("Persist failed:", e);
                }
            };
            save();
        }
        if (def.webSocketEndpoint) {
            try {
                let url = resolveBinding(def.webSocketEndpoint.url, state, t);
                let authHeaders: Record<string, string> = {};

                if (def.webSocketEndpoint.auth) {
                    const auth = def.webSocketEndpoint.auth;
                    const value = resolveBinding(auth.value, state, t);
                    if (auth.type === "bearer") {
                        authHeaders["Authorization"] = `Bearer ${value}`;
                    } else if (auth.type === "basic") {
                        authHeaders["Authorization"] = `Basic ${btoa(value)}`;
                    } else if (auth.type === "api_key") {
                        authHeaders["X-Api-Key"] = value;
                    }
                }
            } catch (e) {
                console.error("WebSocket setup error:", e);
            }
        }

    }, [uiDef.state]);

    const guardResult = useGuardEvaluator(uiDef.guard, state, t, project?.globalConfig);
    useEffect(() => {
        if (guardResult.ok) return;
        const timeout = setTimeout(() => {
            try { localStorage.setItem("pendingPath", window.location.pathname + window.location.search); } catch { }
            runtimeWithNav.toast?.(t("access_denied") || "Access restricted", "warning");
            gotoRedirect(runtimeWithNav, guardResult.onFail);
        }, 300);
        return () => clearTimeout(timeout);
    }, [guardResult.ok, runtimeWithNav, t]);

    return (
        <GuardProvider result={guardResult}>
            {showDebug && (
                <StateTreeViewer
                    screenDef={uiDef}
                    state={state}
                    setState={(path, val) => {
                        setState(path, val);
                        runtimeWithNav.toast?.(`Updated state: ${path}`, "info");
                    }}
                />
            )}
            {loaded && uiDef.screens?.map((screen) => (
                <ScreenView
                    key={screen.id}
                    screen={screen}
                    project={project}
                    route={uiDef.route}
                    analytics={analytics}
                    runEventHandler={runEventHandler}
                    state={state}
                    setState={setState}
                    t={t}
                    CustomElementResolver={CustomElementResolver}
                />
            ))}
        </GuardProvider>
    );
}

export default React.memo(ScreenRenderer);
