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
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // --- Load stored token on mount ---
    useEffect(() => {
        const stored = getStoredAuthToken(globalConfig);
        if (stored?.token) {
            setToken(stored.token);
            setRefreshToken(stored.refreshToken || null);
            setExpiresAt(stored.expiresAt || null);
        }
        setLoading(false);
        const handleStorage = (e: StorageEvent) => {
            if (e.key === getAuthKey(globalConfig)) {
                const updated = getStoredAuthToken(globalConfig);
                setToken(updated?.token || null);
                setRefreshToken(updated?.refreshToken || null);
                setExpiresAt(updated?.expiresAt || null);
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [globalConfig]);

    // --- Derived state ---
    const isLoggedIn =
        !!token && (!expiresAt || Date.now() < expiresAt - 5 * 60 * 1000);

    // --- Manual login/store ---
    const login = useCallback(
        (token: string, refreshToken?: string, expiresIn?: number) => {
            const expiresAt = Date.now() + (expiresIn || 3600) * 1000;
            const authObj = { token, refreshToken, expiresAt };
            storeAuthToken(globalConfig, authObj);
            setToken(token);
            setRefreshToken(refreshToken || null);
            setExpiresAt(expiresAt);
        },
        [globalConfig]
    );

    // --- Manual logout ---
    const logout = useCallback(() => {
        clearAuthToken(globalConfig);
        setToken(null);
        setRefreshToken(null);
        setExpiresAt(null);
    }, [globalConfig]);

    // --- Manual refresh ---
    const refresh = useCallback(async () => {
        if (!refreshToken) return;
        const refreshed = await refreshAuthToken(globalConfig, refreshToken);
        if (refreshed?.token) {
            storeAuthToken(globalConfig, refreshed);
            setToken(refreshed.token);
            setRefreshToken(refreshed.refreshToken || null);
            setExpiresAt(refreshed.expiresAt || null);
            return refreshed.token;
        } else {
            logout();
            return null;
        }
    }, [globalConfig, refreshToken, logout]);

    // --- Background refresh every 2 min ---
    useEffect(() => {
        if (!refreshToken) return;
        const interval = setInterval(() => {
            if (expiresAt && expiresAt - Date.now() < 5 * 60 * 1000) refresh();
        }, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, [refreshToken, expiresAt, refresh]);

    return {
        token,
        refreshToken,
        expiresAt,
        isLoggedIn,
        loading,
        login,
        logout,
        refresh,
    };
}
export function useActionHandler({
    globalConfig,
    runtime,
    dataSources,
}: {
    globalConfig?: UIProject['globalConfig'];
    runtime: ActionRuntime;
    dataSources?: DataSource[];
}) {
    const { state, setState, t } = useAppState();
    const abortControllers = useRef<Record<string, AbortController>>({});
    const wsCleanups = useRef<Record<string, () => void>>({});
    const offline = useOffline();

    useEffect(() => {
        const stored = getStoredAuthToken(globalConfig);
        if (!stored) return;

        const now = Date.now();
        const expiresSoon = stored.expiresAt && stored.expiresAt - now < 5 * 60 * 1000; // 5 min

        if (expiresSoon && stored.refreshToken) {
            refreshAuthToken(globalConfig, stored.refreshToken).then(refreshed => {
                if (refreshed?.token) {
                    storeAuthToken(globalConfig, refreshed);
                    setState("auth.token", refreshed.token);
                    setState("auth.refreshToken", refreshed.refreshToken);
                }
            });
        } else if (stored.token) {
            setState("auth.token", stored.token);
        }
        let refreshing = false;
        const checkAndRefresh = async () => {
            if (refreshing) return;
            const stored = getStoredAuthToken(globalConfig);
            if (!stored?.refreshToken) return;
            const now = Date.now();
            const expiresSoon = stored.expiresAt && stored.expiresAt - now < 5 * 60 * 1000;
            if (expiresSoon) {
                refreshing = true;
                try {
                    const refreshed = await refreshAuthToken(globalConfig, stored.refreshToken);
                    if (refreshed?.token) {
                        storeAuthToken(globalConfig, refreshed);
                        setState("auth.token", refreshed.token);
                        setState("auth.refreshToken", refreshed.refreshToken);
                        runtime.toast?.("Session refreshed", "info");
                    }
                } finally {
                    refreshing = false;
                }
            }
        };
        const interval = setInterval(checkAndRefresh, 2 * 60 * 1000); // every 2 min
        return () => clearInterval(interval);
    }, [globalConfig]);

    useEffect(() => {
        if (!offline?.registerExecutor) return;

        offline.registerExecutor(async (evt) => {
            const ds =
                dataSources?.find(d => d.id === evt.dsId) ||
                (globalConfig?.endpoints?.registry || []).find((d: any) => d.id === evt.dsId);

            if (!ds) throw new Error(`Offline replay: DataSource ${evt.dsId} not found`);

            // Re-run with the SAME DataSource. We rebuild headers/auth here as in execute* methods.
            if (evt.kind === 'rest') {
                // Minimal REST re-exec (same rules you use in executeApiAction)
                const resolvedDs = resolveDataSource(ds, globalConfig, state, evt.body);
                const baseUrl = resolvedDs.baseUrl || '';
                const path = resolvedDs.path || '';
                let url = baseUrl ? new URL(path, baseUrl).toString() : path;

                const headers: Record<string, string> = { ...(resolvedDs.headers || {}) };
                const stored = getStoredAuthToken(globalConfig);
                if (stored?.token && !headers["Authorization"]) headers["Authorization"] = `Bearer ${stored.token}`;
                if (globalConfig?.security?.csrfHeaderName && state?.csrfToken) {
                    headers[globalConfig.security.csrfHeaderName] = state.csrfToken;
                }
                if (evt.queryParams) {
                    const params = new URLSearchParams(
                        Object.entries(evt.queryParams).map(([k, v]) => [k, resolveDataSourceValue(v, state, evt.body)])
                    );
                    url += (url.includes('?') ? '&' : '?') + params.toString();
                }

                const body = evt.body instanceof FormData ? evt.body
                    : evt.body ? JSON.stringify(evt.body)
                        : resolvedDs.body ? JSON.stringify(resolvedDs.body)
                            : undefined;

                if (!(body instanceof FormData) && body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

                const res = await fetch(url, {
                    method: evt.method || resolvedDs.method || 'POST',
                    headers,
                    body,
                    credentials: resolvedDs.credentials || 'same-origin',
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                // no need to set state here — replay is “fire & forget”
                return;
            }

            if (evt.kind === 'graphql') {
                const resolvedDs = resolveDataSource(ds, globalConfig, state, evt.variables);
                const baseUrl = resolvedDs.baseUrl || '';
                const path = resolvedDs.path || '';
                const url = new URL(path, baseUrl).toString();

                const headers: Record<string, string> = { "Content-Type": "application/json", ...(resolvedDs.headers || {}) };
                const stored = getStoredAuthToken(globalConfig);
                if (stored?.token && !headers["Authorization"]) headers["Authorization"] = `Bearer ${stored.token}`;
                if (globalConfig?.security?.csrfHeaderName && state?.csrfToken) {
                    headers[globalConfig.security.csrfHeaderName] = state.csrfToken;
                }

                const body = { query: evt.query || resolvedDs.query, variables: evt.variables || resolvedDs.body || {} };
                const res = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(body),
                    credentials: resolvedDs.credentials || 'same-origin',
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                return;
            }

            throw new Error('Unknown offline event kind');
        });
    }, [offline, dataSources, globalConfig, state]);

    const cancel = (actionId: string) => {
        const controller = abortControllers.current[actionId];
        if (controller) {
            controller.abort();
            delete abortControllers.current[actionId];
        }
        const wsCleanup = wsCleanups.current[actionId];
        if (wsCleanup) {
            wsCleanup();
            delete wsCleanups.current[actionId];
        }
    };

    const runEventHandler = async (handler?: EventHandler, dataOverride?: AnyObj): Promise<void> => {
        if (!handler) return;
        const h = deepResolveBindings(handler, state, t) as EventHandler & { params?: ActionParams };

        const controller = new AbortController();
        const actionId = `${h.action}-${Date.now()}`;
        abortControllers.current[actionId] = controller;

        const runSubActions = async (actions?: EventHandler[], context?: AnyObj) => {
            if (!actions?.length) return;
            for (const sub of actions) {
                const bound = deepResolveBindings(sub, { ...state, result: context?.result, error: context?.error }, t);
                await runEventHandler(bound, context?.result);
            }
        };

        const executeTransition = async (transition?: TransitionSpec) => {
            if (!transition) return;
            const resolvedTransition = deepResolveBindings(transition, state, t) as TransitionSpec;
            if (resolvedTransition.href) {
                runtime?.nav ? runtime?.nav?.push?.(resolvedTransition.href) : (window.location.href = resolvedTransition.href);
            }
            if (resolvedTransition.modal?.openId) runtime.openModal?.(resolvedTransition.modal.openId);
            if (resolvedTransition.modal?.closeId) runtime.closeModal?.(resolvedTransition.modal.closeId);
            if (resolvedTransition.statePatches) {
                resolvedTransition.statePatches.forEach(patch => {
                    const value = resolveDataSourceValue(patch.value, state, undefined);
                    setState(patch.key, value);
                });
            }
        };


        const then = async (ok: boolean, payload?: any, error?: { message: string; status?: number }) => {
            if (ok) {
                if (h.params?.successMessage) {
                    runtime.toast?.(t(h.params?.successMessage), "success");
                }
                if (ok && payload && globalConfig?.auth) {
                    const isAuthRoute =
                        (h.dataSourceId?.toLowerCase()?.includes("login") ||
                            h.dataSourceId?.toLowerCase()?.includes("register") ||
                            h.params?.isAuthRoute) &&
                        typeof payload === "object";

                    if (isAuthRoute) {
                        const token = payload.access_token || payload.token || payload.jwt || payload.data?.token;
                        const refreshToken = payload.refresh_token || payload.data?.refresh_token;
                        const expiresIn = payload.expires_in || decodeJwtExp(token) || 3600;

                        if (token) {
                            const expiresAt = Date.now() + expiresIn * 1000;
                            const authObj: StoredAuth = { token, refreshToken, expiresAt };
                            storeAuthToken(globalConfig, authObj);

                            let decodedUser = null;
                            try {
                                const payload = JSON.parse(atob(token.split('.')[1]));
                                decodedUser = {
                                    id: payload.sub,
                                    email: payload.email,
                                    name: payload.name,
                                    orgId: payload.org_id || payload.orgId,
                                };
                            } catch {
                                decodedUser = { id: 'unknown', email: '', name: '' };
                            }
                            setState("auth.user", decodedUser);
                            setState("auth.token", token);
                            setState("auth.refreshToken", refreshToken);
                            setState("auth.expiresAt", expiresAt);

                            runtime.toast?.("Login successful", "success");

                            const redirect = globalConfig.auth.postLoginHref || "/dashboard";
                            if (redirect) runtime.nav?.push?.(redirect);
                        }
                    }

                    // Handle logout
                    if (h.dataSourceId?.toLowerCase()?.includes("logout")) {
                        clearAuthToken(globalConfig);
                        setState("auth.token", null);
                        setState("auth.refreshToken", null);
                        setState("auth.expiresAt", null);
                        runtime.toast?.("Logged out", "info");

                        const redirect = globalConfig.auth.logoutHref || "/";
                        if (redirect) runtime.nav?.push?.(redirect);
                    }
                }
                await runSubActions(h.successActions, { result: payload });
                await executeTransition(h.successTransition);
            } else {
                await runSubActions(h.errorActions, { error });
                await executeTransition(h.errorTransition);
            }
            if (h.finallyActions?.length) await runSubActions(h.finallyActions, { result: payload, error });
        };


        const applyResultMapping = (result: any, mapping?: ActionParams['resultMapping']) => {
            if (!mapping) return result;
            let mapped = result;
            if (mapping.jsonPath) {
                try {
                    mapped = JSONPath({ path: mapping.jsonPath, json: result });
                } catch (e) {
                    console.error("JSONPath mapping error", e);
                }
            }
            if (mapping.transform) {
                try {
                    mapped = new Function("data", mapping.transform)(mapped);
                } catch (e) {
                    console.error("Transform mapping error", e);
                }
            }
            return mapped;
        };

        const executeApiAction = async (ds: DataSource, bodyOverride?: AnyObj | FormData) => {
            const resolvedDs = resolveDataSource(ds, globalConfig, state, bodyOverride);
            const baseUrl = resolvedDs.baseUrl || '';
            const path = resolvedDs.path || '';
            let url = baseUrl ? new URL(path, baseUrl).toString() : path;
            const headers = resolvedDs.headers || {};
            const stored = getStoredAuthToken(globalConfig);
            if (stored?.token && !headers["Authorization"]) {
                headers["Authorization"] = `Bearer ${stored.token}`;
            }
            if (globalConfig?.security?.csrfHeaderName && state?.csrfToken) {
                headers[globalConfig.security.csrfHeaderName] = state.csrfToken;
            }
            const queryParams = h.params?.queryParams || resolvedDs.queryParams;
            if (queryParams) {
                const params = new URLSearchParams(
                    Object.entries(queryParams).map(([k, v]) => [k, resolveDataSourceValue(v, state, bodyOverride)])
                );
                url += (url.includes('?') ? '&' : '?') + params.toString();
            }
            let body: string | FormData | undefined;
            if (bodyOverride instanceof FormData) {
                body = bodyOverride;
            } else if (bodyOverride) {
                body = JSON.stringify(deepResolveDataSource(bodyOverride, state, bodyOverride));
            } else if (resolvedDs.body) {
                body = JSON.stringify(resolvedDs.body);
            }
            if (body instanceof FormData) {
                delete headers['Content-Type'];
            } else if (body && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }
            const method = resolvedDs.method || (
                h.action === ActionType.crud_create ? "POST" :
                    h.action === ActionType.crud_read ? "GET" :
                        h.action === ActionType.crud_update ? "PUT" : "DELETE"
            );
            const controllerWithTimeout = new AbortController();
            const timeoutId = h.params?.timeout ? setTimeout(() => controllerWithTimeout.abort(), h.params.timeout) : null;
            const signal = anySignal([controller.signal, controllerWithTimeout.signal]);
            // 🔹 resolve query params object (we need the plain object for queueing)
            const resolvedQueryParams = h.params?.queryParams || resolvedDs.queryParams;

            // 🔹 OFFLINE support
            const offlineEnabled = isOfflineEnabled(ds, undefined, { globalConfig });
            const cacheKey = cacheKeyFor(ds.id, url, method, body instanceof FormData ? '[formdata]' : body);

            if (offlineEnabled && offline?.isOffline) {
                if (method === 'GET') {
                    const cached = await offline.getCachedData?.(cacheKey);
                    if (typeof cached !== 'undefined') return cached;
                    throw new Error('Offline: no cached data available');
                } else {
                    // Queue the EXACT same call for replay
                    await offline.queueEvent?.({
                        id: `${ds.id}:${Date.now()}`,
                        kind: 'rest',
                        dsId: ds.id,
                        method,
                        body: body instanceof FormData ? Object.fromEntries((body as FormData).entries()) : (body ? JSON.parse(body as string) : undefined),
                        queryParams: resolvedQueryParams,
                        createdAt: Date.now(),
                    });
                    runtime.toast?.('Saved offline. Will sync when back online.', 'info');
                    return { queued: true };
                }
            }

            const fetchWithRetry = async () => {
                const res = await fetch(url, {
                    method,
                    headers,
                    body,
                    credentials: resolvedDs.credentials || 'same-origin',
                    signal,
                });
                if (res.status === 401 && stored?.refreshToken && globalConfig?.auth?.oidc?.tokenUrl) {
                    runtime.toast?.("Session expired. Refreshing token...", "info");
                    const refreshed = await refreshAuthToken(globalConfig, stored.refreshToken);
                    if (refreshed?.token) {
                        storeAuthToken(globalConfig, refreshed);
                        headers["Authorization"] = `Bearer ${refreshed.token}`;
                        // retry original request once
                        return await fetch(url, { method, headers, body, credentials: resolvedDs.credentials || 'same-origin', signal });
                    } else {
                        clearAuthToken(globalConfig);
                        runtime.toast?.("Session expired. Please log in again.", "error");
                        const loginHref = globalConfig?.auth?.loginHref || "/login";
                        runtime.nav?.push?.(loginHref);
                        throw new Error("Token refresh failed");
                    }
                }
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                const contentType = res.headers.get("content-type") || "";
                const contentDisposition = res.headers.get("content-disposition");
                if (contentDisposition?.includes("attachment")) {
                    const blob = await res.blob();
                    const filename = contentDisposition.match(/filename="([^"]+)"/)?.[1] || "download";
                    return { blob, filename };
                }
                if (contentType.includes("application/json")) return await res.json();
                if (contentType.includes("text/")) return await res.text();
                return await res.blob();
            };
            const result = h.params?.retry
                ? await withRetry(fetchWithRetry, h.params.retry.attempts, h.params.retry.delay, h.params.retry.strategy || 'exponential', runtime, signal)
                : await fetchWithRetry();
            if (timeoutId) clearTimeout(timeoutId);
            return result;
        };

        const executeGraphqlAction = async (ds: DataSource, queryOverride?: string, variablesOverride?: AnyObj) => {
            const resolvedDs = resolveDataSource(ds, globalConfig, state, variablesOverride || dataOverride);
            const baseUrl = resolvedDs.baseUrl || '';
            const path = resolvedDs.path || '';
            let url = new URL(path, baseUrl).toString();
            const headers: any = { "Content-Type": "application/json", ...resolvedDs.headers };
            const stored = getStoredAuthToken(globalConfig);
            if (stored?.token && !headers["Authorization"]) {
                headers["Authorization"] = `Bearer ${stored.token}`;
            }
            if (globalConfig?.security?.csrfHeaderName && state.csrfToken) {
                headers[globalConfig.security.csrfHeaderName] = state.csrfToken;
            }
            const query = queryOverride || resolvedDs.query || '';
            let variables: AnyObj;
            if (variablesOverride) {
                variables = deepResolveDataSource(variablesOverride, state, dataOverride);
            } else {
                variables = resolvedDs.body || {};
            }
            const body = { query, variables };
            const op = resolvedDs.graphql_operation || 'query';
            const offlineEnabled = isOfflineEnabled(ds, undefined, { globalConfig });
            const cacheKey = `offline:gql:${ds.id}|${op}|${hash(query)}|${hash(variables)}`;

            if (op === 'subscription') {
                let wsUrl = url;
                if (resolvedDs.auth?.type === 'bearer' && resolvedDs.auth.value) {
                    wsUrl += wsUrl.includes('?') ? '&' : '?';
                    wsUrl += `access_token=${encodeURIComponent(resolvedDs.auth.value)}`;
                }
                const protocol = resolvedDs.protocol || 'graphql-ws';
                let ws: WebSocket | null = null;
                const connect = () => {
                    ws = new WebSocket(wsUrl, protocol);
                    ws.onopen = () => {
                        const initPayload = resolvedDs.auth?.type === 'bearer' && resolvedDs.auth.value ? { Authorization: `Bearer ${resolvedDs.auth.value}` } : {};
                        ws?.send(JSON.stringify({ type: 'connection_init', payload: initPayload }));
                    };
                    ws.onmessage = (event) => {
                        let data;
                        try {
                            data = JSON.parse(event.data);
                        } catch {
                            data = event.data;
                        }
                        if ((protocol === 'graphql-ws' || protocol === 'graphql-transport-ws') && data.type === 'connection_ack') {
                            ws?.send(JSON.stringify({ type: protocol === 'graphql-ws' ? 'subscribe' : 'start', id: resolvedDs.id, payload: { query, variables } }));
                        } else if (data.type === 'data' || data.type === 'next') {
                            const result = applyResultMapping(data.payload?.data || data.data, h.params?.resultMapping);
                            if (h.responseType === 'data' && h.params?.statePath) {
                                setState(h.params.statePath, applyResultMapping(result, h.params.resultMapping));
                            }
                        }
                    };
                    ws.onclose = () => {
                        ws = null;
                        wsCleanups.current[actionId]?.();
                        delete wsCleanups.current[actionId];
                    };
                    ws.onerror = (error) => {
                        console.error('WebSocket error', error);
                        ws?.close();
                    };
                };
                connect();
                wsCleanups.current[actionId] = () => {
                    ws?.close();
                };
                return;
            } else {
                if (offlineEnabled && offline?.isOffline) {
                    if (op === 'query') {
                        const cached = await offline.getCachedData?.(cacheKey);
                        if (typeof cached !== 'undefined') return cached;
                        throw new Error('Offline: no cached GraphQL data available');
                    } else {
                        // mutation => queue for replay
                        await offline.queueEvent?.({
                            id: `${ds.id}:${Date.now()}`,
                            kind: 'graphql',
                            dsId: ds.id,
                            operation: 'mutation',
                            query,
                            variables,
                            createdAt: Date.now(),
                        });
                        runtime.toast?.('Saved offline. Will sync when back online.', 'info');
                        return { queued: true };
                    }
                }
            }
            const controllerWithTimeout = new AbortController();
            const timeoutId = h.params?.timeout ? setTimeout(() => controllerWithTimeout.abort(), h.params.timeout) : null;
            const signal = anySignal([controller.signal, controllerWithTimeout.signal]);

            const fetchWithRetry = async () => {
                const res = await fetch(url, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(body),
                    credentials: resolvedDs.credentials || 'same-origin',
                    signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                return await res.json();
            };
            const result = h.params?.retry
                ? await withRetry(fetchWithRetry, h.params.retry.attempts, h.params.retry.delay, h.params.retry.strategy || 'exponential', runtime, signal)
                : await fetchWithRetry();
            if (offlineEnabled && op === 'query') {
                await offline.setCachedData?.(cacheKey, result);
            }
            if (timeoutId) clearTimeout(timeoutId);
            return result;
        };

        const executeWebSocketAction = async (ds: DataSource) => {
            const resolvedDs = resolveDataSource(ds, globalConfig, state, dataOverride);
            const baseUrl = resolvedDs.baseUrl || '';
            const path = resolvedDs.path || '';
            let url = new URL(path, baseUrl).toString();
            const headers = resolvedDs.headers || {};
            if (globalConfig?.security?.csrfHeaderName && state.csrfToken) {
                headers[globalConfig.security.csrfHeaderName] = state.csrfToken;
            }
            if (resolvedDs.auth?.type === 'bearer' && resolvedDs.auth.value && !url.includes('access_token')) {
                url += url.includes('?') ? '&' : '?';
                url += `access_token=${encodeURIComponent(resolvedDs.auth.value)}`;
            }
            const stored = getStoredAuthToken(globalConfig);
            if (stored?.token && !url.includes('access_token')) {
                url += url.includes('?') ? '&' : '?';
                url += `access_token=${encodeURIComponent(stored.token)}`;
            }
            let initialMessage: AnyObj | undefined;
            if (h.params?.body) {
                initialMessage = dataOverride instanceof FormData
                    ? Object.fromEntries(dataOverride.entries())
                    : deepResolveDataSource(h.params.body, state, dataOverride);
            } else if (resolvedDs.body) {
                initialMessage = resolvedDs.body;
            }
            let ws: WebSocket | null = null;
            const connect = () => {
                ws = new WebSocket(url);
                ws.onopen = () => {
                    if (initialMessage) ws?.send(JSON.stringify(initialMessage));
                    if (resolvedDs.heartbeat) {
                        const intervalId = setInterval(() => {
                            if (ws?.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify(resolvedDs.heartbeat?.message));
                            }
                        }, resolvedDs.heartbeat.interval);
                        wsCleanups.current[actionId] = () => {
                            clearInterval(intervalId);
                            ws?.close();
                        };
                    }
                };
                ws.onmessage = (event) => {
                    let data;
                    try {
                        data = JSON.parse(event.data);
                    } catch {
                        data = event.data;
                    }
                    if (h.responseType === 'data' && h.params?.statePath) {
                        setState(h.params.statePath, applyResultMapping(data, h.params.resultMapping));
                    }
                };
                ws.onclose = () => {
                    ws = null;
                    wsCleanups.current[actionId]?.();
                    delete wsCleanups.current[actionId];
                };
                ws.onerror = (error) => {
                    console.error('WebSocket error', error);
                    ws?.close();
                };
            };
            connect();
        };

        try {
            await runSubActions(h.beforeActions, {});
            let result: any;
            if (h.params?.optimisticState) {
                setState(h.params.optimisticState.path, resolveDataSourceValue(h.params.optimisticState.value, state, undefined));
            }
            switch (h.action) {
                case ActionType.navigation: {
                    const href = String(h.params?.href || "/");
                    if (!href) return;
                    const isReplace = !!h.successTransition?.replace;
                    if (runtime.nav) {
                        isReplace ? runtime.nav.replace?.(href) : runtime.nav.push?.(href);
                    } else {
                        // Fallback to browser if no nav adapter
                        isReplace ? window.location.replace(href) : (window.location.href = href);
                    }
                    break;
                }
                case ActionType.open_modal: {
                    const id = String(h.params?.id || h.params?.modalId);
                    if (!id) throw new Error("Modal ID required for open_modal");
                    runtime.openModal?.(id);
                    break;
                }
                case ActionType.close_modal: {
                    const id = String(h.params?.id || h.params?.modalId);
                    if (!id) throw new Error("Modal ID required for close_modal");
                    runtime.closeModal?.(id);
                    break;
                }
                case ActionType.update_state: {
                    const path = String(h.params?.path);
                    if (!path) throw new Error("State path required for update_state");
                    const value = resolveDataSourceValue(h.params?.value, state, undefined);
                    setState(path, value);
                    break;
                }
                case ActionType.run_script: {
                    const name = String(h.params?.name);
                    if (!name) throw new Error("Script name required for run_script");
                    const args = h.params?.args ? (Array.isArray(h.params.args) ? h.params.args : [h.params.args]).map(arg => resolveDataSourceValue(arg, state, undefined)) : [];
                    result = await runtime.runScript?.(name, args);
                    if (h.responseType === "data" && h.params?.statePath) {
                        setState(h.params.statePath, applyResultMapping(result, h.params.resultMapping));
                    }
                    break;
                }
                case ActionType.api_call:
                case ActionType.crud_create:
                case ActionType.crud_read:
                case ActionType.crud_update:
                case ActionType.crud_delete:
                case ActionType.audit_log:
                case ActionType.ai_generate: {
                    const dsId = h.dataSourceId || h.params?.dataSourceId;
                    if (!dsId) throw new Error(`dataSourceId required for ${h.action}`);
                    const inlineDs = dataSources?.find(ds => ds.id === dsId);
                    const globalDs = (globalConfig?.endpoints?.registry || []).find(ref => ref.id === dsId);
                    const ds = inlineDs || globalDs;
                    if (!ds) throw new Error(`DataSource ${dsId} not found`);
                    let body: AnyObj | FormData | undefined = dataOverride;
                    if (h.action === ActionType.audit_log) {
                        const event = String(h.params?.event || '');
                        if (!event) throw new Error("Event required for audit_log");
                        const metadata = resolveDataSourceValue(h.params?.metadata || {}, state, undefined);
                        body = { event, metadata, timestamp: new Date().toISOString() };
                    } else if (h.action === ActionType.ai_generate) {
                        const prompt = String(h.aiPrompt || h.params?.prompt || '');
                        if (!prompt) throw new Error("Prompt required for ai_generate");
                        const type = String(h.params?.type || 'text') as "text" | "image" | "video" | "ui";
                        body = { prompt, type, ...(h.params || {}) };
                    }
                    result = await executeApiAction(ds, body);
                    runtime.toast?.(
                        t(
                            h.action === ActionType.crud_create
                                ? "Created successfully"
                                : h.action === ActionType.crud_update
                                    ? "Updated successfully"
                                    : "Deleted successfully"
                        ),
                        "success"
                    );
                    if (h.responseType === "data" && h.params?.statePath) {
                        setState(h.params.statePath, applyResultMapping(result, h.params.resultMapping));
                    }
                    break;
                }
                case ActionType.graphql_query:
                case ActionType.graphql_mutation:
                case ActionType.graphql_subscription: {
                    const dsId = h.dataSourceId;
                    if (!dsId) throw new Error(`dataSourceId required for ${h.action}`);
                    const inlineDs = dataSources?.find(ds => ds.id === dsId);
                    const globalDs = (globalConfig?.endpoints?.registry || []).find(ref => ref.id === dsId);
                    const ds = inlineDs || globalDs;
                    if (!ds) throw new Error(`DataSource ${dsId} not found`);
                    result = await executeGraphqlAction(ds, h.params?.query, h.params?.variables || dataOverride);
                    if (h.responseType === "data" && h.params?.statePath) {
                        setState(h.params.statePath, applyResultMapping(result, h.params.resultMapping));
                    }
                    break;
                }
                case ActionType.websocket_call: {
                    const dsId = h.dataSourceId;
                    if (!dsId) throw new Error(`dataSourceId required for ${h.action}`);
                    const inlineDs = dataSources?.find(ds => ds.id === dsId);
                    const globalDs = (globalConfig?.endpoints?.registry || []).find(ref => ref.id === dsId);
                    const ds = inlineDs || globalDs;
                    if (!ds) throw new Error(`DataSource ${dsId} not found`);
                    await executeWebSocketAction(ds);
                    break;
                }
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
                    const command = String(h.params?.command || '');
                    if (!command) throw new Error("Command required for voice_command");
                    const language = String(h.params?.language || 'en-US');
                    const voiceModel = String(h.params?.voiceModel || '');
                    result = await runtime.processVoiceCommand?.(command, language, voiceModel);
                    if (h.responseType === "data" && h.params?.statePath) {
                        setState(h.params.statePath, applyResultMapping(result, h.params.resultMapping));
                    }
                    break;
                }
                case ActionType.initiate_call: {
                    const callType = String(h.params?.callType || 'video') as "video" | "audio";
                    const peerId = String(resolveDataSourceValue(h.params?.peerId, state, undefined));
                    if (!peerId) throw new Error("Peer ID required for initiate_call");
                    const signalingServer = String(resolveDataSourceValue(h.params?.signalingServer || '', state, undefined));
                    await runtime.initiateCall?.(callType, peerId, signalingServer);
                    break;
                }
                case ActionType.wallet_connect: {
                    const provider = String(h.params?.provider || 'metamask');
                    const chainId = Number(h.params?.chainId || 1);
                    const projectId = String(resolveDataSourceValue(h.params?.projectId || '', state, undefined));
                    result = await runtime.connectWallet?.(provider, chainId, projectId);
                    if (h.responseType === "data" && h.params?.statePath) {
                        setState(h.params.statePath, applyResultMapping(result, h.params.resultMapping));
                    }
                    break;
                }
                case ActionType.wallet_sign: {
                    const provider = String(h.params?.provider || 'metamask');
                    const chainId = Number(h.params?.chainId || 1);
                    const transaction = resolveDataSourceValue(h.params?.transaction, state, undefined);
                    if (!transaction) throw new Error("Transaction required for wallet_sign");
                    result = await runtime.signTransaction?.(provider, chainId, transaction);
                    if (h.responseType === "data" && h.params?.statePath) {
                        setState(h.params.statePath, applyResultMapping(result, h.params.resultMapping));
                    }
                    break;
                }
                case ActionType.toast: {
                    const msg = String(h.params?.msg || "");
                    const variant = h.params?.variant || "info";
                    runtime.toast?.(msg, variant);
                    break;
                }

                default:
                    throw new Error(`Unsupported action: ${h.action}`);
            }
            await then(true, result);
            return result;
        } catch (e: any) {
            const errorObj = {
                message: String(e.message || e),
                status: e.message?.includes('HTTP') ? parseInt(e.message.match(/HTTP (\d+)/)?.[1] || '0', 10) : undefined,
            };
            await then(false, undefined, errorObj);
            runtime.toast?.(errorObj.message, "error");
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

    return { runEventHandler, cancel };
}

const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);
export const useAuthContext = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuthContext must be used within an <AuthProvider>");
    return ctx;
};
export function AuthProvider({ children, globalConfig }: { children: React.ReactNode; globalConfig?: any }) {
    const auth = useAuth(globalConfig);
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
