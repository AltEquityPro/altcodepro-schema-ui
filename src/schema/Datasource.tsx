import { useEffect, useMemo, useRef, useState } from "react";
import { DataSource, AnyObj, UIProject, DataMapping, UIScreenDef } from "../types";
import { useAppState } from "./StateContext";
import { deepResolveBindings, joinUrl, resolveBinding } from "../lib/utils";

type Fetcher = (ds: DataSource, state: AnyObj, t: (k: string) => string, signal?: AbortSignal) => Promise<any>;

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

function applyDataMappings(out: any, ds: DataSource, mappings: DataMapping[] | undefined, setState: (path: string, value: any) => void): any {
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

const defaultFetcher: Fetcher = async (ds, state, t, signal) => {
    if (!ds.baseUrl) {
        throw new Error('baseUrl is required for DataSource');
    }

    const baseUrl = String(resolveBinding(ds.baseUrl, state, t));
    const path = String(resolveBinding(ds.path || '', state, t));
    let url = joinUrl(baseUrl, path);

    const headers: Record<string, string> = Object.entries(ds.headers || {}).reduce(
        (acc, [k, v]) => ({ ...acc, [k]: String(resolveBinding(v, state, t)) }),
        {}
    );
    if (ds.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const authValue = ds.auth ? String(resolveBinding(ds.auth.value, state, t)) : '';
    if (ds.auth && authValue) {
        switch (ds.auth.type) {
            case 'bearer':
                headers['Authorization'] = `Bearer ${authValue}`;
                break;
            case 'basic':
                headers['Authorization'] = `Basic ${btoa(authValue)}`;
                break;
            case 'api_key':
                headers['X-Api-Key'] = authValue;
                break;
        }
    }

    if (ds.method === "GRAPHQL") {
        const isSubscription = ds.graphql_operation === 'subscription';
        const variables = resolveBinding(ds.body || {}, state, t);
        const query = String(resolveBinding(ds.query || '', state, t));
        const body = { query, variables };

        if (isSubscription) {
            if (ds.auth?.type === 'bearer' && authValue) {
                url += url.includes('?') ? '&' : '?';
                url += `access_token=${encodeURIComponent(authValue)}`;
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
            if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
            return r.json();
        }
    }

    if (ds.method === "WEBSOCKET") {
        if (ds.auth?.type === 'bearer' && authValue) {
            url += url.includes('?') ? '&' : '?';
            url += `access_token=${encodeURIComponent(authValue)}`;
        }
        return { _ws: true, url, initialMessage: resolveBinding(ds.body, state, t), headers };
    }

    const queryParams = ds.queryParams
        ? new URLSearchParams(Object.entries(ds.queryParams).map(([k, v]) => [k, String(resolveBinding(v, state, t))]))
        : null;
    if (queryParams) url += (url.includes('?') ? '&' : '?') + queryParams.toString();

    const r = await fetch(url, {
        method: ds.method || "GET",
        headers,
        body: ds.body ? (headers['Content-Type'] === 'application/json' ? JSON.stringify(resolveBinding(ds.body, state, t)) : resolveBinding(ds.body, state, t)) : undefined,
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
            console.log('WebSocket connected');
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
            console.log('WebSocket closed', event.code, event.reason);
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
    fetcher = defaultFetcher,
}: {
    dataSources?: DataSource[];
    globalConfig?: UIProject['globalConfig'];
    screen?: UIScreenDef;
    fetcher?: Fetcher;
}) {
    const { state, setState, t } = useAppState();
    const [data, setData] = useState<Record<string, any>>({});
    const timers = useRef<Record<string, NodeJS.Timeout>>({});
    const wsCleanups = useRef<Record<string, () => void>>({});
    const abortControllers = useRef<Record<string, AbortController>>({});

    const resolved = useMemo(() => {
        const env = globalConfig?.endpoints?.environments?.default || 'prod';
        const envConfig = globalConfig?.endpoints?.environments?.values[env] || {};
        const defaultHeaders = globalConfig?.endpoints?.defaultHeaders || {};
        const globalAuth = globalConfig?.endpoints?.auth;
        const globalEndpoints = globalConfig?.endpoints?.registry || [];

        return dataSources.map((ds) => {
            let resolvedDs: DataSource = { ...ds };

            if (ds.refId) {
                const globalRef = globalEndpoints.find(ref => ref.id === ds.refId);
                if (globalRef) {
                    resolvedDs = { ...globalRef, ...resolvedDs };
                }
            }

            if (envConfig.baseUrl) resolvedDs.baseUrl = envConfig.baseUrl;
            if (envConfig.headers) resolvedDs.headers = { ...resolvedDs.headers, ...envConfig.headers };
            resolvedDs.headers = { ...defaultHeaders, ...resolvedDs.headers };
            if (!resolvedDs.auth && globalAuth) resolvedDs.auth = globalAuth;

            return deepResolveBindings(resolvedDs, state, t) as DataSource;
        });
    }, [dataSources, state, t, globalConfig]);

    const mappings = useMemo(() => {
        const globalMappings = globalConfig?.endpoints?.dataMappings || [];
        const screenMappings = screen?.dataMappings || [];
        return [...globalMappings, ...screenMappings];
    }, [globalConfig, screen]);

    useEffect(() => {
        let mounted = true;
        const stops: Array<() => void> = [];

        (async () => {
            for (const ds of resolved) {
                const controller = new AbortController();
                abortControllers.current[ds.id] = controller;

                const run = async () => {
                    try {
                        const out = ds.retry
                            ? await withRetry(() => fetcher(ds, state, t, controller.signal), ds.retry.attempts, ds.retry.delay, ds.retry.strategy, controller.signal)
                            : await fetcher(ds, state, t, controller.signal);
                        const mapped = applyDataMappings(out, ds, mappings, setState);
                        if (mounted) setData(prev => ({ ...prev, [ds.id]: mapped }));
                    } catch (e: any) {
                        if (e.name === 'AbortError') return;
                        const errorObj = {
                            ok: false,
                            error: String(e.message || e),
                            status: e.message?.includes('HTTP') ? parseInt(e.message.match(/HTTP (\d+)/)?.[1] || '0', 10) : undefined,
                        };
                        if (mounted) setData(prev => ({ ...prev, [ds.id]: errorObj }));
                        if (ds.errorKey) {
                            setState(ds.errorKey, errorObj);
                        }
                    }
                };

                if (ds.method !== "WEBSOCKET" && !(ds.method === "GRAPHQL" && ds.graphql_operation === 'subscription')) {
                    await run();
                } else {
                    let out;
                    try {
                        out = await fetcher(ds, state, t);
                    } catch (e: any) {
                        if (e.name === 'AbortError') continue;
                        const errorObj = {
                            ok: false,
                            error: String(e.message || e),
                            status: e.message?.includes('HTTP') ? parseInt(e.message.match(/HTTP (\d+)/)?.[1] || '0', 10) : undefined,
                        };
                        if (mounted) setData(prev => ({ ...prev, [ds.id]: errorObj }));
                        if (ds.errorKey) {
                            setState(ds.errorKey, errorObj);
                        }
                        continue;
                    }

                    if (out._ws || out._sub) {
                        const cleanup = out._sub
                            ? setupGraphQLSubscription(out.url, out.query, out.variables, (newData) => {
                                if (mounted) {
                                    const mapped = applyDataMappings(newData, ds, mappings, setState);
                                    setData(prev => ({ ...prev, [ds.id]: mapped }));
                                }
                            }, out.headers, out.protocol)
                            : setupWebSocket(out.url, (msg) => {
                                if (mounted) {
                                    const mapped = applyDataMappings({ _ws: true, last: msg }, ds, mappings, setState);
                                    setData(prev => ({ ...prev, [ds.id]: mapped }));
                                }
                            }, out.initialMessage, ds.heartbeat, out.headers, out.protocol);

                        wsCleanups.current[ds.id] = cleanup;
                        stops.push(cleanup);
                    }
                }

                if (ds.pollingInterval && ds.method !== "WEBSOCKET" && !(ds.method === "GRAPHQL" && ds.graphql_operation === 'subscription')) {
                    const id = setInterval(async () => {
                        const newController = new AbortController();
                        abortControllers.current[ds.id] = newController;
                        await run();
                    }, ds.pollingInterval);
                    timers.current[ds.id] = id;
                    stops.push(() => {
                        clearInterval(id);
                        abortControllers.current[ds.id]?.abort();
                        delete abortControllers.current[ds.id];
                    });
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
            Object.values(wsCleanups.current).forEach(c => c());
            wsCleanups.current = {};
        };
    }, [resolved, fetcher, state, t, setState, mappings]);

    return data;
}