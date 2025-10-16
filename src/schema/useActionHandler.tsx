

'use client';
import { useRef, useEffect } from "react";
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
import { anySignal, deepResolveBindings, resolveDataSource, deepResolveDataSource, resolveDataSourceValue } from "../lib/utils";
import { JSONPath } from "jsonpath-plus";
import { useAppState } from "./StateContext";

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
    const scriptAllowlist = ['customScript1', 'customScript2'];

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
        console.log('handler,h', handler, h);
        const controller = new AbortController();
        const actionId = `${h.action}-${Date.now()}`;
        abortControllers.current[actionId] = controller;

        const executeTransition = async (transition?: TransitionSpec) => {
            if (!transition) return;
            const resolvedTransition = deepResolveBindings(transition, state, t) as TransitionSpec;
            if (resolvedTransition.href) {
                runtime?.nav ? runtime?.nav?.push?.(resolvedTransition.href) : (window.location.href = resolvedTransition.href)
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
            const next = ok ? h.successAction : h.errorAction;
            const transition = ok ? h.successTransition : h.errorTransition;
            await executeTransition(transition);
            if (next) await runEventHandler(next, dataOverride);
            if (!ok && error) {
                if (h.params?.optimisticState) {
                    setState(h.params.optimisticState.path, state[h.params.optimisticState.path] || null);
                }
                runtime.toast?.(error.message, "error");
            }
        };

        const applyResultMapping = (result: any, mapping?: ActionParams['resultMapping']) => {
            if (!mapping) return result;
            let mapped = result;
            if (mapping.jsonPath) {
                try {
                    mapped = JSONPath({ path: mapping.jsonPath, json: result });
                } catch (e) {
                    console.error("JSONPath mapping error", e);
                    return { ok: false, error: `JSONPath mapping error: ${String(e)}` };
                }
            }
            if (mapping.transform) {
                try {
                    const fn = new Function("data", mapping.transform);
                    mapped = fn(mapped);
                } catch (e) {
                    console.error("Transform mapping error", e);
                    return { ok: false, error: `Transform error: ${String(e)}` };
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
            const fetchWithRetry = async () => {
                const res = await fetch(url, {
                    method,
                    headers,
                    body,
                    credentials: resolvedDs.credentials || 'same-origin',
                    signal,
                });
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
                ? await withRetry(fetchWithRetry, h.params.retry.attempts, h.params.retry.delay, h.params.retry.strategy || 'exponential', signal)
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
            if (resolvedDs.graphql_operation === 'subscription') {
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
                                setState(h.params.statePath, result);
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
                ? await withRetry(fetchWithRetry, h.params.retry.attempts, h.params.retry.delay, h.params.retry.strategy || 'exponential', signal)
                : await fetchWithRetry();
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
            if (resolvedDs.auth?.type === 'bearer' && resolvedDs.auth.value) {
                url += url.includes('?') ? '&' : '?';
                url += `access_token=${encodeURIComponent(resolvedDs.auth.value)}`;
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
            let result: any;
            if (h.params?.optimisticState) {
                setState(h.params.optimisticState.path, resolveDataSourceValue(h.params.optimisticState.value, state, undefined));
            }
            switch (h.action) {
                case ActionType.navigation: {
                    const href = String(h.params?.href || h.successTransition?.href || "/");
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
                    if (!scriptAllowlist.includes(name)) throw new Error(`Script ${name} not in allowlist`);
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
                default:
                    throw new Error(`Unsupported action: ${h.action}`);
            }
            await then(true, result);
        } catch (e: any) {
            const errorObj = {
                message: String(e.message || e),
                status: e.message?.includes('HTTP') ? parseInt(e.message.match(/HTTP (\d+)/)?.[1] || '0', 10) : undefined,
            };
            await then(false, undefined, errorObj);
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