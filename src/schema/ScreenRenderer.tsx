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
const [loaded, setLoaded] = useState(false);
useEffect(() => {
    setTranslations(uiDef.translations || {});
    setTimeout(() => {
        setLoaded(true);
    }, 400)
}, [uiDef.translations]);
const { state, t, setState, setTranslations } = useAppState();

const screenDataSources = useMemo(() => {
    const all: any[] = [];
    for (const s of uiDef.screens) {
        if (s.dataSources) all.push(...s.dataSources);
    }
    if ((uiDef as any).dataSources) {
        all.push(...(uiDef as any).dataSources);
    }
    return all;
}, [uiDef.screens]);
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
    dataSources: screenDataSources,
    runtime: {
        ...(runtime || {}),
        patchState: (path: string, val: any) => setState(path, val)
    }
});

const dataMap = useDataSources({
    dataSources: screenDataSources,
    globalConfig: project.globalConfig,
    state,
    setState,
    routeParams
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

// 🔹 Guard
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
