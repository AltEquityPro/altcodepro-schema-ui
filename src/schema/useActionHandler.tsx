'use client';
import { useRef, useEffect, useCallback, useState, createContext, useContext } from "react";
import {
    ActionType,
    AnyObj,
    EventHandler,
    UIProject,
    DataSource,
    TransitionSpec,
    ActionRuntime,
    ActionParams
} from "../types";
import { anySignal, deepResolveBindings, resolveDataSource, deepResolveDataSource, resolveDataSourceValue, hash } from "../lib/utils";
import { JSONPath } from "jsonpath-plus";
import { useAppState } from "./StateContext";

import { useOffline } from "../hooks/OfflineContext";
import { useAnalytics } from "../hooks/AnalyticsContext";
type StoredAuth = {
    token?: string;
    refreshToken?: string;
    expiresAt?: number; // epoch in ms
};

function getAuthKey(globalConfig?: UIProject["globalConfig"]) {
    return globalConfig?.auth?.cookieName || globalConfig?.auth?.audience || "authToken";
}
function isOfflineEnabled(ds: any, screen?: any, project?: any) {
    // no schema break: read optional flags if present
    return Boolean(
        (ds && (ds as any).offline) ||
        (screen?.metadata?.offline === true) ||
        (project?.globalConfig?.metadata?.offline === true)
    );
}
function cacheKeyFor(dsId: string, url: string, method: string, body?: any) {
    const sig = `${dsId}|${method}|${url}|${body ? hash(body) : ''}`;
    return `offline:${sig}`;
}
function decodeJwtExp(token: string): number | null {
    try {
        if (!token) return Date.now() + 3600 * 1000;
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload?.exp ? payload.exp * 1000 : Date.now() + 3600 * 1000;
    } catch {
        return Date.now() + 3600 * 1000;
    }
}

async function refreshAuthToken(globalConfig: UIProject["globalConfig"], refreshToken: string): Promise<StoredAuth | null> {
    try {
        const tokenUrl = globalConfig?.auth?.oidc?.tokenUrl;
        if (!tokenUrl) return null;
        const clientId =
            typeof globalConfig?.auth?.oidc?.clientId === "string"
                ? globalConfig.auth.oidc.clientId
                : (globalConfig?.auth?.oidc?.clientId as any)?.binding || "";


        const res = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: clientId,
            }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const expiresAt =
            data.expires_in && !isNaN(data.expires_in)
                ? Date.now() + data.expires_in * 1000
                : undefined;

        return {
            token: data.access_token || data.id_token,
            refreshToken: data.refresh_token || refreshToken,
            expiresAt,
        };
    } catch (e) {
        console.error("Token refresh failed:", e);
        return null;
    }
}

function storeAuthToken(globalConfig: UIProject["globalConfig"], auth: StoredAuth) {
    if (!auth) return;
    const authKey = getAuthKey(globalConfig);
    const storageType = globalConfig?.auth?.tokenStorage || "localStorage";
    const data = JSON.stringify(auth);

    switch (storageType) {
        case "cookie":
            document.cookie = `${authKey}=${btoa(data)}; path=/; SameSite=Lax`;
            break;
        case "memory":
            (window as any).__memoryAuth = data;
            break;
        default:
            try {
                localStorage.setItem(authKey, data);
            } catch {
                console.warn("LocalStorage unavailable; falling back to memory store");
                (window as any).__memoryAuth = data;
            }
    }
}

function getStoredAuthToken(globalConfig: UIProject["globalConfig"]): StoredAuth | null {
    const authKey = getAuthKey(globalConfig);
    const storageType = globalConfig?.auth?.tokenStorage || "localStorage";
    let data: string | null = null;
    switch (storageType) {
        case "cookie":
            const match = document.cookie.match(new RegExp(`(^| )${authKey}=([^;]+)`));
            data = match ? atob(match[2]) : null;
            break;
        case "memory":
            data = (window as any).__memoryAuth || null;
            break;
        default:
            data = localStorage.getItem(authKey);
    }
    try {
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

function clearAuthToken(globalConfig: UIProject["globalConfig"]) {
    const authKey = getAuthKey(globalConfig);
    const storageType = globalConfig?.auth?.tokenStorage || "localStorage";

    switch (storageType) {
        case "cookie":
            document.cookie = `${authKey}=; Max-Age=0; path=/`;
            break;
        case "memory":
            delete (window as any).__memoryAuth;
            break;
        default:
            localStorage.removeItem(authKey);
    }
}

async function withRetry<T>(
    fn: () => Promise<T>,
    attempts: number,
    delay: number,
    strategy: 'exponential' | 'linear' | 'jitter' = 'exponential',
    runtime: ActionRuntime,
    signal?: AbortSignal
): Promise<T> {
    let lastError: any;
    for (let i = 0; i < attempts; i++) {
        if (signal?.aborted) throw new Error('Request aborted');
        try {
            return await fn();
        } catch (e: any) {
            lastError = e;
            if (i === attempts - 1) {
                runtime?.toast?.(`Failed after ${attempts} attempts`, "error");
                throw e;
            }

            if (e.message?.includes('HTTP') && ![429, 500, 502, 503, 504].includes(parseInt(e.message.match(/HTTP (\d+)/)?.[1] || '0', 10))) {
                throw e;
            }
            let waitTime = delay;
            if (strategy === 'exponential') {
                waitTime = delay * Math.pow(2, i);
            } else if (strategy === 'linear') {
                waitTime = delay * (i + 1);
            } else if (strategy === 'jitter') {
                waitTime = delay * Math.pow(2, i) + Math.random() * delay;
            }
            await Promise.race([
                new Promise(resolve => setTimeout(resolve, waitTime)),
                new Promise((_, reject) => signal?.addEventListener('abort', () => reject(new Error('Request aborted')), { once: true })),
            ]);
        }
    }
    throw lastError;
}

export function useAuth(globalConfig?: UIProject["globalConfig"]) {
    const [token, setToken] = useState<string | null>(null);
    const [refreshTokenV, setRefreshToken] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = getStoredAuthToken(globalConfig);
        if (stored?.token) {
            setToken(stored.token);
            setRefreshToken(stored.refreshToken || null);
            setExpiresAt(stored.expiresAt || null);
        }
        setLoading(false);
        const onStorage = (e: StorageEvent) => {
            if (e.key === getAuthKey(globalConfig)) {
                const updated = getStoredAuthToken(globalConfig);
                setToken(updated?.token || null);
                setRefreshToken(updated?.refreshToken || null);
                setExpiresAt(updated?.expiresAt || null);
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [globalConfig]);

    const isLoggedIn = !!token && (!expiresAt || Date.now() < expiresAt - 5 * 60 * 1000);

    const login = useCallback((tkn: string, rt?: string, expiresIn?: number) => {
        const exp = Date.now() + (expiresIn || 3600) * 1000;
        storeAuthToken(globalConfig, { token: tkn, refreshToken: rt, expiresAt: exp });
        setToken(tkn); setRefreshToken(rt || null); setExpiresAt(exp);
    }, [globalConfig]);

    const logout = useCallback(() => {
        clearAuthToken(globalConfig);
        setToken(null); setRefreshToken(null); setExpiresAt(null);
    }, [globalConfig]);

    const refresh = useCallback(async () => {
        if (!refreshTokenV) return null;
        const refreshed = await refreshAuthToken(globalConfig, refreshTokenV);
        if (refreshed?.token) {
            storeAuthToken(globalConfig, refreshed);
            setToken(refreshed.token);
            setRefreshToken(refreshed.refreshToken || null);
            setExpiresAt(refreshed.expiresAt || null);
            try {
                const pl = JSON.parse(atob(refreshed.token.split('.')[1]));
                window.dispatchEvent(new CustomEvent("authRefreshed", { detail: pl }));
            } catch { }
            return refreshed.token;
        }
        logout();
        return null;
    }, [globalConfig, refreshTokenV, logout]);

    // gentle background refresh
    useEffect(() => {
        if (!refreshTokenV) return;
        const id = setInterval(() => {
            if (expiresAt && expiresAt - Date.now() < 5 * 60 * 1000) refresh();
        }, 120000);
        return () => clearInterval(id);
    }, [refreshTokenV, expiresAt, refresh]);

    return { token, refreshToken: refreshTokenV, expiresAt, isLoggedIn, loading, login, logout, refresh };
}

export function useActionHandler({
    globalConfig, runtime, dataSources,
}: { globalConfig?: UIProject['globalConfig']; runtime: ActionRuntime; dataSources?: DataSource[]; }) {
    const { state, setState, t } = useAppState();
    const abortControllers = useRef<Record<string, AbortController>>({});
    const wsCleanups = useRef<Record<string, () => void>>({});
    const offline = useOffline();
    const analytics = useAnalytics();
    // 👇 useAuth inside the action engine
    const auth = useAuth(globalConfig);

    // Mirror token into app state (so guards/telemetry can read from state)
    // useEffect(() => { if (auth.token) setState("auth.token", auth.token); }, [auth.token]);
    useEffect(() => {
        const handler = (e: any) => setState("auth.user", e.detail);
        window.addEventListener("authRefreshed", handler);
        return () => window.removeEventListener("authRefreshed", handler);
    }, []);
    // Offline replay executor
    useEffect(() => {
        if (!offline?.registerExecutor) return;
        offline.registerExecutor(async (evt) => {
            const ds = dataSources?.find(d => d.id === evt.dsId)
                || (globalConfig?.endpoints?.registry || []).find((d: any) => d.id === evt.dsId);
            if (!ds) throw new Error(`Offline replay: DataSource ${evt.dsId} not found`);
            analytics.trackEvent({
                name: 'offline_replay',
                category: 'offline',
                label: evt.dsId,
                metadata: {
                    kind: evt.kind,
                    method: evt.method,
                    createdAt: evt.createdAt,
                    replayedAt: Date.now(),
                },
            });
            if (evt.kind === 'rest') {
                const resolved = resolveDataSource(ds, globalConfig, state, evt.body);
                const baseUrl = resolved.baseUrl || ''; const path = resolved.path || '';
                let url = baseUrl ? new URL(path, baseUrl).toString() : path;

                const headers: Record<string, string> = { ...(resolved.headers || {}) };
                if (auth.token && !headers['Authorization'])
                    headers['Authorization'] = `Bearer ${auth.token}`;
                if (globalConfig?.security?.csrfHeaderName && state?.csrfToken) headers[globalConfig.security.csrfHeaderName] = state.csrfToken;

                if (evt.queryParams) {
                    const params = new URLSearchParams(
                        Object.entries(evt.queryParams).map(([k, v]) => [k, resolveDataSourceValue(v, state, evt.body)])
                    );
                    url += (url.includes('?') ? '&' : '?') + params.toString();
                }

                const body = evt.body instanceof FormData
                    ? evt.body
                    : evt.body ? JSON.stringify(evt.body)
                        : resolved.body ? JSON.stringify(resolved.body)
                            : undefined;

                if (!(body instanceof FormData) && body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

                const res = await fetch(url, { method: evt.method || resolved.method || 'POST', headers, body, credentials: resolved.credentials || 'same-origin' });
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                return;
            }

            if (evt.kind === 'graphql') {
                const resolved = resolveDataSource(ds, globalConfig, state, evt.variables);
                const baseUrl = resolved.baseUrl || ''; const path = resolved.path || '';
                const url = new URL(path, baseUrl).toString();

                const headers: Record<string, string> = { "Content-Type": "application/json", ...(resolved.headers || {}) };
                if (auth.token && !headers['Authorization']) headers['Authorization'] = `Bearer ${auth.token}`;
                if (globalConfig?.security?.csrfHeaderName && state?.csrfToken) headers[globalConfig.security.csrfHeaderName] = state.csrfToken;

                const body = { query: evt.query || resolved.query, variables: evt.variables || resolved.body || {} };
                const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), credentials: resolved.credentials || 'same-origin' });
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                return;
            }

            throw new Error('Unknown offline event kind');
        });
    }, [offline, dataSources, globalConfig, state, auth.token]);

    const cancel = (actionId: string) => {
        abortControllers.current[actionId]?.abort();
        delete abortControllers.current[actionId];
        wsCleanups.current[actionId]?.();
        delete wsCleanups.current[actionId];
    };

    const runEventHandler = async (handler?: EventHandler, dataOverride?: AnyObj): Promise<void> => {
        if (!handler) return;
        const h = deepResolveBindings(handler, state, t) as EventHandler & { params?: ActionParams };
        const controller = new AbortController();
        const actionId = `${h.action}-${Date.now()}`;
        abortControllers.current[actionId] = controller;

        const runSub = async (acts?: EventHandler[], ctx?: AnyObj) => {
            if (!acts?.length) return;
            for (const sub of acts) {
                const bound = deepResolveBindings(sub, { ...state, result: ctx?.result, error: ctx?.error }, t);
                await runEventHandler(bound, ctx?.result);
            }
        };
        const execTransition = async (tr?: TransitionSpec) => {
            if (!tr) return;
            const rt = deepResolveBindings(tr, state, t) as TransitionSpec;
            if (rt.href) (runtime?.nav ? runtime.nav.push?.(rt.href) : (window.location.href = rt.href));
            if (rt.modal?.openId) runtime.openModal?.(rt.modal.openId);
            if (rt.modal?.closeId) runtime.closeModal?.(rt.modal.closeId);
            rt.statePatches?.forEach(p => setState(p.key, resolveDataSourceValue(p.value, state, undefined)));
        };

        const then = async (ok: boolean, payload?: any, error?: { message: string; status?: number }) => {
            if (ok) {
                if (analytics) {
                    analytics.trackEvent({
                        name: h.action,
                        category: 'user_action',
                        label: h.dataSourceId || h.params?.href || h.params?.command || h.aiPrompt || '',
                        value: 1,
                        metadata: {
                            status: 'success',
                            resultType: h.responseType,
                            path: h.params?.statePath,
                            dsId: h.dataSourceId,
                            actionType: h.action,
                            time: Date.now(),
                        },
                    });
                }
                if (h.params?.successMessage) runtime.toast?.(t(h.params.successMessage), "success");

                // auth routes (login/register) — use auth.login(..)
                if (payload && globalConfig?.auth) {
                    const isAuthRoute = (h.dataSourceId?.toLowerCase()?.includes("login")
                        || h.dataSourceId?.toLowerCase()?.includes("register")
                        || h.params?.isAuthRoute) && typeof payload === "object";
                    if (isAuthRoute) {
                        const token = payload.access_token || payload.token || payload.jwt || payload.data?.token;
                        const refreshToken = payload.refresh_token || payload.data?.refresh_token;
                        const expiresIn = payload.expires_in || decodeJwtExp(token) || 3600;
                        if (token) {
                            auth.login(token, refreshToken, typeof expiresIn === 'number' ? expiresIn : 3600);
                            // mirror decoded user (optional)
                            try {
                                const pl = JSON.parse(atob(token.split('.')[1]));
                                setState("auth.user", { id: pl.sub, email: pl.email, name: pl.name, orgId: pl.org_id || pl.orgId });
                            } catch { setState("auth.user", { id: 'unknown' }); }
                            runtime.toast?.("Login successful", "success");
                            const redirect = globalConfig.auth.postLoginHref || "/dashboard";
                            if (redirect) runtime.nav?.push?.(redirect);
                        }
                    }
                    // logout
                    if (h.dataSourceId?.toLowerCase()?.includes("logout")) {
                        auth.logout();
                        setState("auth.user", null);
                        runtime.toast?.("Logged out", "info");
                        const redirect = globalConfig.auth.logoutHref || "/";
                        if (redirect) runtime.nav?.push?.(redirect);
                    }
                }

                await runSub(h.successActions, { result: payload });
                await execTransition(h.successTransition);
            } else {
                if (analytics) {
                    analytics.trackEvent({
                        name: h.action,
                        category: 'user_action',
                        label: h.dataSourceId || '',
                        value: 0,
                        metadata: {
                            status: 'error',
                            error: error?.message,
                            httpStatus: error?.status,
                            path: h.params?.statePath,
                            dsId: h.dataSourceId,
                            actionType: h.action,
                            time: Date.now(),
                        },
                    });
                }
                await runSub(h.errorActions, { error });
                await execTransition(h.errorTransition);
            }
            //  Prevent finallyActions when error occurs, unless explicitly allowed
            if (h.finallyActions?.length) {
                const hasError = !!error;
                const hasNavInFinally = h.finallyActions.some(a => a.action === "navigation");

                if (hasError) {
                    // 🔔 Show toast (global handler)
                    const message = error?.message || t("Something went wrong. Please try again.");
                    runtime.toast?.(message, "error");

                    // ❌ Skip navigation if any exists in finally
                    if (hasNavInFinally) {
                        console.warn("⏭️ Skipping navigation due to error");
                        // Optionally run other non-navigation finallyActions
                        const safeFinally = h.finallyActions.filter(a => a.action !== "navigation");
                        if (safeFinally.length) await runSub(safeFinally, { result: payload, error });
                    } else {
                        await runSub(h.finallyActions, { result: payload, error });
                    }
                } else {
                    // ✅ Success → run all finally actions (normal behavior)
                    await runSub(h.finallyActions, { result: payload, error });
                }
            }

        };

        const applyMap = (result: any, mapping?: ActionParams['resultMapping']) => {
            if (!mapping) return result;
            let mapped = result;
            if (mapping.jsonPath) { try { mapped = JSONPath({ path: mapping.jsonPath, json: result }); } catch { } }
            if (mapping.transform) { try { mapped = new Function("data", mapping.transform)(mapped); } catch { } }
            return mapped;
        };

        const executeApi = async (ds: DataSource, bodyOverride?: AnyObj | FormData) => {
            const resolved = resolveDataSource(ds, globalConfig, state, bodyOverride);
            const baseUrl = resolved.baseUrl || ''; const path = resolved.path || '';
            let url = baseUrl ? new URL(path, baseUrl).toString() : path;
            const headers: Record<string, string> = { ...(resolved.headers || {}) };
            const storedAuth = getStoredAuthToken(globalConfig);
            const liveToken = auth.token || storedAuth?.token;
            if (auth.token && !headers["Authorization"])
                headers["Authorization"] = `Bearer ${liveToken}`;
            if (globalConfig?.security?.csrfHeaderName && state?.csrfToken) headers[globalConfig.security.csrfHeaderName] = state.csrfToken;

            const queryParams = h.params?.queryParams || resolved.queryParams;
            if (queryParams) {
                const params = new URLSearchParams(
                    Object.entries(queryParams).map(([k, v]) => [k, resolveDataSourceValue(v, state, bodyOverride)])
                );
                url += (url.includes('?') ? '&' : '?') + params.toString();
            }
            let body: string | FormData | undefined;
            if (bodyOverride instanceof FormData) body = bodyOverride;
            else if (bodyOverride) body = JSON.stringify(deepResolveDataSource(bodyOverride, state, bodyOverride));
            else if (resolved.body) body = JSON.stringify(resolved.body);

            if (body instanceof FormData) delete headers['Content-Type'];
            else if (body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

            const method = resolved.method || (
                h.action === ActionType.crud_create ? "POST" :
                    h.action === ActionType.crud_read ? "GET" :
                        h.action === ActionType.crud_update ? "PUT" : "DELETE"
            );

            const ctl = new AbortController();
            const timeoutId = h.params?.timeout ? setTimeout(() => ctl.abort(), h.params.timeout) : null;
            const signal = anySignal([controller.signal, ctl.signal]);

            const offlineEnabled = isOfflineEnabled(ds, undefined, { globalConfig });
            const cacheKey = cacheKeyFor(ds.id, url, method, body instanceof FormData ? '[formdata]' : body);

            if (offlineEnabled && offline?.isOffline) {
                if (method === 'GET') {
                    const cached = await offline.getCachedData?.(cacheKey);
                    if (typeof cached !== 'undefined') return cached;
                    throw new Error('Offline: no cached data available');
                } else {
                    await offline.queueEvent?.({
                        id: `${ds.id}:${Date.now()}`, kind: 'rest', dsId: ds.id, method,
                        body: body instanceof FormData ? Object.fromEntries((body as FormData).entries()) : (body ? JSON.parse(body as string) : undefined),
                        queryParams, createdAt: Date.now(),
                    });
                    runtime.toast?.('Saved offline. Will sync when back online.', 'info');
                    return { queued: true };
                }
            }

            const doFetch = async () => {
                const res = await fetch(url, { method, headers, body, credentials: resolved.credentials || 'same-origin', signal });
                if (res.status === 401 && auth.refreshToken && globalConfig?.auth?.oidc?.tokenUrl) {
                    runtime.toast?.("Session expired. Refreshing token...", "info");
                    const newToken = await auth.refresh();
                    if (newToken) {
                        headers["Authorization"] = `Bearer ${newToken}`;
                        return await fetch(url, { method, headers, body, credentials: resolved.credentials || 'same-origin', signal });
                    }
                    runtime.toast?.("Session expired. Please log in again.", "error");
                    const loginHref = globalConfig?.auth?.loginHref || "/login";
                    runtime.nav?.push?.(loginHref);
                    throw new Error("Token refresh failed");
                }
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                const ct = res.headers.get("content-type") || "";
                const cd = res.headers.get("content-disposition");
                if (cd?.includes("attachment")) {
                    const blob = await res.blob();
                    const filename = cd.match(/filename="([^"]+)"/)?.[1] || "download";
                    return { blob, filename };
                }
                if (ct.includes("application/json")) return await res.json();
                if (ct.includes("text/")) return await res.text();
                return await res.blob();
            };

            const result = h.params?.retry
                ? await withRetry(doFetch, h.params.retry.attempts, h.params.retry.delay, h.params.retry.strategy || 'exponential', runtime, signal)
                : await doFetch();

            if (timeoutId) clearTimeout(timeoutId);
            return result;
        };

        const executeGql = async (ds: DataSource, queryOverride?: string, varsOverride?: AnyObj) => {
            const resolved = resolveDataSource(ds, globalConfig, state, varsOverride || dataOverride);
            const baseUrl = resolved.baseUrl || ''; const path = resolved.path || '';
            const url = new URL(path, baseUrl).toString();
            const headers: any = { "Content-Type": "application/json", ...resolved.headers };

            if (auth.token && !headers["Authorization"]) headers["Authorization"] = `Bearer ${auth.token}`;
            if (globalConfig?.security?.csrfHeaderName && state.csrfToken) headers[globalConfig.security.csrfHeaderName] = state.csrfToken;

            const query = queryOverride || resolved.query || '';
            const variables = varsOverride ? deepResolveDataSource(varsOverride, state, dataOverride) : (resolved.body || {});
            const body = { query, variables };
            const op = resolved.graphql_operation || 'query';
            const offlineEnabled = isOfflineEnabled(ds, undefined, { globalConfig });
            const cacheKey = `offline:gql:${ds.id}|${op}|${hash(query)}|${hash(variables)}`;

            if (op === 'subscription') {
                // (unchanged websocket setup)
                // ...
                return;
            } else if (offlineEnabled && offline?.isOffline) {
                if (op === 'query') {
                    const cached = await offline.getCachedData?.(cacheKey);
                    if (typeof cached !== 'undefined') return cached;
                    throw new Error('Offline: no cached GraphQL data available');
                } else {
                    await offline.queueEvent?.({
                        id: `${ds.id}:${Date.now()}`, kind: 'graphql', dsId: ds.id, operation: 'mutation',
                        query, variables, createdAt: Date.now(),
                    });
                    runtime.toast?.('Saved offline. Will sync when back online.', 'info');
                    return { queued: true };
                }
            }

            const ctl = new AbortController();
            const timeoutId = h.params?.timeout ? setTimeout(() => ctl.abort(), h.params.timeout) : null;
            const signal = anySignal([controller.signal, ctl.signal]);

            const doFetch = async () => {
                const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), credentials: resolved.credentials || 'same-origin', signal });
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                return await res.json();
            };
            const result = h.params?.retry
                ? await withRetry(doFetch, h.params.retry.attempts, h.params.retry.delay, h.params.retry.strategy || 'exponential', runtime, signal)
                : await doFetch();
            if (offlineEnabled && op === 'query') await offline.setCachedData?.(cacheKey, result);
            if (timeoutId) clearTimeout(timeoutId);
            return result;
        };

        try {
            // before
            if (h.beforeActions?.length) for (const b of h.beforeActions) await runEventHandler(b);

            let result: any;
            if (h.params?.optimisticState) {
                setState(h.params.optimisticState.path, resolveDataSourceValue(h.params.optimisticState.value, state, undefined));
            }

            switch (h.action) {
                case ActionType.navigation: {
                    analytics.trackEvent({
                        name: 'navigate',
                        category: 'navigation',
                        label: h.params?.href || '/',
                        metadata: { replace: !!h.params?.replace },
                    });
                    const href = String(h.params?.href || "/"); if (!href) break;
                    const replace = !!h.successTransition?.replace;
                    if (runtime.nav) (replace ? runtime.nav.replace?.(href) : runtime.nav.push?.(href));
                    else (replace ? window.location.replace(href) : (window.location.href = href));
                    break;
                }
                case ActionType.open_modal: {
                    analytics.trackEvent({
                        name: h.action,
                        category: 'ui',
                        label: h.params?.id || h.params?.modalId,
                    });
                    const id = String(h.params?.id || h.params?.modalId); if (!id) throw new Error("Modal ID required");
                    runtime.openModal?.(id); break;
                }
                case ActionType.close_modal: {
                    analytics.trackEvent({
                        name: h.action,
                        category: 'ui',
                        label: h.params?.id || h.params?.modalId,
                    });
                    const id = String(h.params?.id || h.params?.modalId); if (!id) throw new Error("Modal ID required");
                    runtime.closeModal?.(id); break;
                }
                case ActionType.update_state: {
                    const path = String(h.params?.path); if (!path) throw new Error("State path required");
                    setState(path, resolveDataSourceValue(h.params?.value, state, undefined)); break;
                }
                case ActionType.run_script: {
                    const name = String(h.params?.name); if (!name) throw new Error("Script name required");
                    const args = h.params?.args ? (Array.isArray(h.params.args) ? h.params.args : [h.params.args]).map(a => resolveDataSourceValue(a, state, undefined)) : [];
                    result = await runtime.runScript?.(name, args);
                    if (h.responseType === "data" && h.params?.statePath) setState(h.params.statePath, applyMap(result, h.params.resultMapping));
                    break;
                }
                case ActionType.api_call:
                case ActionType.crud_create:
                case ActionType.crud_read:
                case ActionType.crud_update:
                case ActionType.crud_delete:
                case ActionType.audit_log:
                case ActionType.ai_generate: {
                    const dsId = h.dataSourceId || h.params?.dataSourceId; if (!dsId) throw new Error(`dataSourceId required`);
                    const ds = dataSources?.find(d => d.id === dsId) || (globalConfig?.endpoints?.registry || []).find((r: any) => r.id === dsId);
                    if (!ds) throw new Error(`DataSource ${dsId} not found`);
                    let body: AnyObj | FormData | undefined = dataOverride;
                    if (h.action === ActionType.audit_log) {
                        const event = String(h.params?.event || ''); if (!event) throw new Error("Event required");
                        const metadata = resolveDataSourceValue(h.params?.metadata || {}, state, undefined);
                        body = { event, metadata, timestamp: new Date().toISOString() };
                    } else if (h.action === ActionType.ai_generate) {
                        analytics.trackEvent({
                            name: 'ai_generate',
                            category: 'ai',
                            label: h.params?.type || 'text',
                            metadata: {
                                prompt: h.params?.prompt?.slice?.(0, 200),
                                model: h.params?.model,
                                projectId: globalConfig?.projectId,
                            },
                        });
                        const prompt = String(h.aiPrompt || h.params?.prompt || ''); if (!prompt) throw new Error("Prompt required");
                        const type = String(h.params?.type || 'text');
                        body = { prompt, type, ...(h.params || {}) };
                    }
                    if (h.action === ActionType.crud_create || h.action === ActionType.crud_update) {
                        analytics.trackEvent({
                            name: 'form_submit',
                            category: 'form',
                            label: dsId,
                            metadata: { operation: h.action, offline: offline?.isOffline },
                        });
                    }
                    result = await executeApi(ds, body);
                    if ([ActionType.crud_create, ActionType.crud_update, ActionType.crud_delete].includes(h.action))
                        runtime.toast?.(t(h.action === ActionType.crud_create ? "Created successfully" : h.action === ActionType.crud_update ? "Updated successfully" : "Deleted successfully"), "success");
                    if (h.responseType === "data" && h.params?.statePath) setState(h.params.statePath, applyMap(result, h.params.resultMapping));
                    break;
                }
                case ActionType.graphql:
                case ActionType.graphql_mutation:
                case ActionType.graphql_mutation:
                case ActionType.graphql_subscription: {
                    const dsId = h.dataSourceId; if (!dsId) throw new Error(`dataSourceId required`);
                    const ds = dataSources?.find(d => d.id === dsId) || (globalConfig?.endpoints?.registry || []).find((r: any) => r.id === dsId);
                    if (!ds) throw new Error(`DataSource ${dsId} not found`);
                    result = await executeGql(ds, h.params?.query, h.params?.variables || dataOverride);
                    if (h.responseType === "data" && h.params?.statePath) setState(h.params.statePath, applyMap(result, h.params.resultMapping));
                    break;
                }
                case ActionType.export:
                case ActionType.export_pdf:
                case ActionType.export_ppt:
                case ActionType.export_word:
                case ActionType.export_json: {
                    const format = h.action.replace('export_', '') as "pdf" | "ppt" | "word" | "json";
                    const payload = resolveDataSourceValue(h.exportConfig || {}, state, undefined);
                    await runtime.exportFile?.(format, payload);
                    break;
                }
                case ActionType.voice_command: {
                    const command = String(h.params?.command || ''); if (!command) throw new Error("Command required");
                    const language = String(h.params?.language || 'en-US');
                    const voiceModel = String(h.params?.voiceModel || '');
                    result = await runtime.processVoiceCommand?.(command, language, voiceModel);
                    if (h.responseType === "data" && h.params?.statePath) setState(h.params.statePath, applyMap(result, h.params.resultMapping));
                    break;
                }
                case ActionType.initiate_call: {
                    const callType = String(h.params?.callType || 'video') as "video" | "audio";
                    const peerId = String(resolveDataSourceValue(h.params?.peerId, state, undefined)); if (!peerId) throw new Error("Peer ID required");
                    const signalingServer = String(resolveDataSourceValue(h.params?.signalingServer || '', state, undefined));
                    await runtime.initiateCall?.(callType, peerId, signalingServer);
                    break;
                }
                case ActionType.wallet_connect: {
                    const provider = String(h.params?.provider || 'metamask');
                    const chainId = Number(h.params?.chainId || 1);
                    const projectId = String(resolveDataSourceValue(h.params?.projectId || '', state, undefined));
                    result = await runtime.connectWallet?.(provider, chainId, projectId);
                    if (h.responseType === "data" && h.params?.statePath) setState(h.params.statePath, applyMap(result, h.params.resultMapping));
                    break;
                }
                case ActionType.wallet_sign: {
                    const provider = String(h.params?.provider || 'metamask');
                    const chainId = Number(h.params?.chainId || 1);
                    const tx = resolveDataSourceValue(h.params?.transaction, state, undefined); if (!tx) throw new Error("Transaction required");
                    result = await runtime.signTransaction?.(provider, chainId, tx);
                    if (h.responseType === "data" && h.params?.statePath) setState(h.params.statePath, applyMap(result, h.params.resultMapping));
                    break;
                }
                case ActionType.toast: {
                    const msg = String(h.params?.msg || ""); const variant = h.params?.variant || "info";
                    runtime.toast?.(msg, variant); break;
                }
                default: throw new Error(`Unsupported action: ${h.action}`);
            }

            await then(true, result);
            return result;
        } catch (e: any) {
            const err = { message: String(e.message || e), status: e.message?.includes('HTTP') ? parseInt(e.message.match(/HTTP (\d+)/)?.[1] || '0', 10) : undefined };
            await then(false, undefined, err);
            runtime.toast?.(err.message, "error");
        } finally {
            controller.abort();
            delete abortControllers.current[actionId];
        }
    };

    useEffect(() => {
        return () => {
            Object.values(abortControllers.current).forEach(c => c.abort());
            Object.values(wsCleanups.current).forEach(c => c());
            abortControllers.current = {};
            wsCleanups.current = {};
        };
    }, []);

    return { runEventHandler, cancel, auth }; // expose auth if UI needs it
}

const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);
export const useAuthContext = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuthContext must be used within an <AuthProvider>");
    return ctx;
};
export function AuthProvider({ children, globalConfig }: { children: React.ReactNode; globalConfig?: any }) {
    const auth = useAuth(globalConfig);
    useEffect(() => {
        if (typeof window === 'undefined') return; // SSR safety

        // Prevent re-wrapping fetch multiple times (especially in React StrictMode)
        if ((window as any).__fetchPatched) return;
        (window as any).__fetchPatched = true;

        window.fetch = new Proxy(window.fetch, {
            apply(target, thisArg, args) {
                const [url, options = {}] = args;
                const storedAuth = getStoredAuthToken(globalConfig);
                if (storedAuth?.token) {
                    options.headers = {
                        ...(options.headers || {}),
                        Authorization: `Bearer ${storedAuth.token}`,
                    };
                }
                return Reflect.apply(target, thisArg, [url, options]);
            },
        });
    }, [globalConfig]);
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
export const AuthUtils = {
    getAuthKey,
    decodeJwtExp,
    getStoredAuthToken,
    storeAuthToken,
    clearAuthToken,
    refreshAuthToken,
};
