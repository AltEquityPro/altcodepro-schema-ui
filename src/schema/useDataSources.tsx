'use client';
import { useEffect, useMemo, useRef, useState } from "react";
import { DataSource, AnyObj, UIProject, DataMapping } from "../types";
import { resolveDataSource, joinUrl } from "../lib/utils";
import { useAuth } from "./useAuth";
import { getStoredAuthToken } from "./authUtils";

type Fetcher = (
    ds: DataSource,
    globalConfig: UIProject['globalConfig'],
    signal?: AbortSignal,
) => Promise<any>;

async function withRetry<T>(
    fn: () => Promise<T>,
    attempts: number,
    delay: number,
    strategy: 'exponential' | 'linear' | 'jitter' = 'exponential',
    signal?: AbortSignal
): Promise<T> {
    let lastError: any;
    for (let i = 0; i < attempts; i++) {
        if (signal?.aborted) throw new Error('Request aborted');
        try {
            return await fn();
        } catch (e: any) {
            lastError = e;
            if (i === attempts - 1) throw e;
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

function applyDataMappings(
    out: any,
    ds: DataSource,
    mappings: DataMapping[] | undefined,
    setState: (path: string, value: any) => void
): any {
    if (!mappings) return out;
    let result = out;
    for (const m of mappings) {
        if (m.sourceIds.includes(ds.id)) {
            if (m.transform) {
                try {
                    const fn = new Function("data", m.transform);
                    result = fn(result);
                } catch (e) {
                    console.error("Mapping transform error", e);
                    result = { ok: false, error: `Transform error: ${String(e)}` };
                }
            }
            if (m.outputKey) {
                setState(m.outputKey, result);
            }
        }
    }
    return result;
}

const defaultFetcher: Fetcher = async (ds, globalConfig, signal) => {
    const baseUrl = ds.baseUrl || '';
    const path = ds.path || '';
    let url = path ? joinUrl(baseUrl, path) : baseUrl;
    const headers: Record<string, string> = ds.headers || {};

    if (ds.auth) {
        switch (ds.auth.type) {
            case 'bearer':
                const auth = getStoredAuthToken(globalConfig)
                headers['Authorization'] = `Bearer ${auth?.token}`;
                break;
            case 'basic':
                headers['Authorization'] = `Basic ${btoa(ds.auth.value)}`;
                break;
            case 'api_key':
                headers['X-Api-Key'] = ds.auth.value;
                break;
        }
    }

    if (ds.method === "GRAPHQL") {
        const isSubscription = ds.graphql_operation === 'subscription';
        const variables = ds.body || {};
        const query = ds.query || '';
        const body = { query, variables };
        if (isSubscription) {
            if (ds.auth?.type === 'bearer' && ds.auth.value) {
                url += url.includes('?') ? '&' : '?';
                url += `access_token=${encodeURIComponent(ds.auth.value)}`;
            }
            return { _sub: true, url, query, variables, headers, protocol: ds.protocol || 'graphql-ws' };
        } else {
            const r = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                credentials: ds.credentials || 'same-origin',
                signal,
            });
            if (!r.ok) {
                throw new Error(`HTTP ${r.status}: ${await r.text()}`);
            }
            return r.json();
        }
    }

    if (ds.method === "WEBSOCKET") {
        if (ds.auth?.type === 'bearer' && ds.auth.value) {
            url += url.includes('?') ? '&' : '?';
            url += `access_token=${encodeURIComponent(ds.auth.value)}`;
        }
        return { _ws: true, url, initialMessage: ds.body, headers };
    }

    const queryParams = ds.queryParams
        ? new URLSearchParams(Object.entries(ds.queryParams)?.map(([k, v]) => [k, String(v)]))
        : null;
    if (queryParams) url += (url.includes('?') ? '&' : '?') + queryParams.toString();

    const r = await fetch(url, {
        method: ds.method || "GET",
        headers,
        body: (ds.body ? (headers['Content-Type'] === 'application/json' ? JSON.stringify(ds.body) : ds.body) : undefined) as any,
        credentials: ds.credentials || 'same-origin',
        signal,
    });

    if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
    const ct = r.headers.get("content-type") || "";
    return ct.includes("application/json") ? await r.json() : await r.text();
};

function setupWebSocket(
    url: string,
    onMessage: (data: any) => void,
    initialMessage?: any,
    heartbeat?: { interval: number; message: any },
    authHeaders?: Record<string, string>,
    protocol: 'graphql-ws' | 'subscriptions-transport-ws' | 'graphql-transport-ws' = 'graphql-ws'
): () => void {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;
    let backoff = 1000;
    const maxBackoff = 30000;

    const connect = () => {
        ws = new WebSocket(url, protocol);
        ws.onopen = () => {
            backoff = 1000;
            const initPayload = authHeaders && authHeaders['Authorization'] ? { Authorization: authHeaders['Authorization'] } : {};
            if (protocol === 'graphql-ws' || protocol === 'graphql-transport-ws') {
                ws?.send(JSON.stringify({ type: 'connection_init', payload: initPayload }));
            } else if (initialMessage) {
                ws?.send(JSON.stringify(initialMessage));
            }
            if (heartbeat) {
                heartbeatInterval = setInterval(() => {
                    if (ws?.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify(heartbeat.message));
                    }
                }, heartbeat.interval);
            }
        };
        ws.onmessage = (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            } catch {
                data = event.data;
            }
            if ((protocol === 'graphql-ws' || protocol === 'graphql-transport-ws') && data.type === 'connection_ack') {
                if (initialMessage) ws?.send(JSON.stringify(initialMessage));
            } else {
                onMessage(data);
            }
        };
        ws.onclose = (event) => {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            if (!event.wasClean) {
                reconnectTimeout = setTimeout(connect, backoff);
                backoff = Math.min(backoff * 2, maxBackoff);
            }
        };
        ws.onerror = (error) => {
            console.error('WebSocket error', error);
            ws?.close();
        };
    };
    connect();

    return () => {
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        ws?.close();
    };
}

function setupGraphQLSubscription(
    url: string,
    query: string,
    variables: any,
    onData: (data: any) => void,
    headers?: Record<string, string>,
    protocol: 'graphql-ws' | 'subscriptions-transport-ws' | 'graphql-transport-ws' = 'graphql-ws'
): () => void {
    return setupWebSocket(
        url,
        (msg) => {
            let parsed;
            try {
                parsed = typeof msg === 'string' ? JSON.parse(msg) : msg;
            } catch {
                parsed = msg;
            }
            if (parsed.type === 'data' || parsed.type === 'next') onData(parsed.payload?.data || parsed.data);
        },
        { type: protocol === 'graphql-ws' ? 'subscribe' : 'start', id: 'sub1', payload: { query, variables } },
        undefined,
        headers,
        protocol
    );
}

export function useDataSources({
    dataSources = [],
    globalConfig,
    screen,
    state,
    setState,
    routeParams,
}: {
    dataSources?: DataSource[];
    globalConfig?: UIProject['globalConfig'];
    screen?: any;
    state: AnyObj;
    setState: (path: string, value: any) => void;
    routeParams?: Record<string, string>;
}) {

    const [data, setData] = useState<Record<string, any>>({});
    const timers = useRef<Record<string, NodeJS.Timeout>>({});
    const wsCleanups = useRef<Record<string, () => void>>({});
    const abortControllers = useRef<Record<string, AbortController>>({});
    const { token } = useAuth();

    const resolved = useMemo(() => {
        const screenSources = dataSources || [];
        const combined = [...screenSources];
        const unique = combined.filter(
            (ds, idx, arr) => arr.findIndex(x => x.id === ds.id) === idx
        );

        return unique
            .filter(ds => ds.method !== "POST" && ds.trigger !== 'action')
            .map(ds => {
                const rds = resolveDataSource(ds, globalConfig, { ...state, params: routeParams || state.params });
                if (token && rds.auth?.type === 'bearer') rds.auth.value = token;
                return rds;
            });
    }, [dataSources, globalConfig, state, routeParams, token]);


    const mappings = useMemo(() => {
        const globalMappings = globalConfig?.endpoints?.dataMappings || [];
        const screenMappings = screen?.dataMappings || [];
        return [...globalMappings, ...screenMappings];
    }, [globalConfig, screen]);

    const globalSources = useMemo(() => {
        const sources = globalConfig?.endpoints?.registry || [];
        return sources.filter((ds) => ds.trigger === "init");
    }, [globalConfig]);

    const loadedGlobals = useRef(false);

    useEffect(() => {
        if (loadedGlobals.current) return; // skip if already done
        loadedGlobals.current = true;

        (async () => {
            for (const ds of globalSources) {
                try {
                    if (!ds.auth) {
                        ds.auth = globalConfig?.endpoints?.auth
                    }
                    const rds = resolveDataSource(ds, globalConfig, state);
                    const out = await defaultFetcher(rds, globalConfig);
                    const mapped = applyDataMappings(out, rds, mappings, setState);
                    setData((prev) => ({ ...prev, [rds.id]: mapped }));
                } catch (error) {
                    console.error(error);
                }
            }
        })();
    }, []);

    useEffect(() => {
        if (!resolved.length) return;
        let mounted = true;
        const stops: Array<() => void> = [];

        (async () => {
            for (const ds of resolved) {
                const controller = new AbortController();
                abortControllers.current[ds.id] = controller;

                const run = async () => {
                    try {
                        if (ds.trigger === 'action') return;
                        const out = ds.retry
                            ? await withRetry(
                                () => defaultFetcher(ds, globalConfig, controller.signal),
                                ds.retry.attempts,
                                ds.retry.delay,
                                ds.retry.strategy,
                                controller.signal
                            )
                            : await defaultFetcher(ds, globalConfig, controller.signal);
                        const mapped = applyDataMappings(out, ds, mappings, setState);
                        if (mounted) {
                            setData(prev => ({ ...prev, [ds.id]: mapped }));
                        }
                    } catch (e: any) {
                        if (e.name === "AbortError") return;
                        console.warn("DataSource error:", ds.id, e);
                    }
                };
                if (ds.method !== "WEBSOCKET" && !(ds.method === "GRAPHQL" && ds.graphql_operation === "subscription")) {
                    await run();
                } else {
                    let out;
                    try {
                        out = await defaultFetcher(ds, globalConfig, undefined);
                    } catch (e: any) {
                        if (e.name === "AbortError") continue;
                        const errorObj = {
                            ok: false,
                            error: String(e.message || e),
                            status: e.message?.includes("HTTP")
                                ? parseInt(e.message.match(/HTTP (\d+)/)?.[1] || "0", 10)
                                : undefined,
                        };
                        if (mounted) setData((prev) => ({ ...prev, [ds.id]: errorObj }));
                        if (ds.errorKey) {
                            setState(ds.errorKey, errorObj);
                        }
                        continue;
                    }

                    if (out._ws || out._sub) {
                        const cleanup = out._sub
                            ? setupGraphQLSubscription(
                                out.url,
                                out.query,
                                out.variables,
                                (newData) => {
                                    if (mounted) {
                                        const mapped = applyDataMappings(newData, ds, mappings, setState);
                                        setData((prev) => ({ ...prev, [ds.id]: mapped }));
                                    }
                                },
                                out.headers,
                                out.protocol
                            )
                            : setupWebSocket(
                                out.url,
                                (msg) => {
                                    if (mounted) {
                                        const mapped = applyDataMappings({ _ws: true, last: msg }, ds, mappings, setState);
                                        setData((prev) => ({ ...prev, [ds.id]: mapped }));
                                    }
                                },
                                out.initialMessage,
                                ds.heartbeat,
                                out.headers,
                                out.protocol
                            );
                        wsCleanups.current[ds.id] = cleanup;
                        stops.push(cleanup);
                    }
                }
            }
        })();

        return () => {
            mounted = false;
            stops.forEach(s => s());
            Object.values(timers.current).forEach(clearInterval);
            Object.values(abortControllers.current).forEach(c => c.abort());
            timers.current = {};
            abortControllers.current = {};
            Object.values(wsCleanups.current).forEach((c) => c());
            wsCleanups.current = {};
        };
    }, []);

    useEffect(() => {
        if (!data) return;
        for (const [id, val] of Object.entries(data)) {
            setState(id, val);
        }
    }, [data]);

    return data;
}