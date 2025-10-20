'use client';
import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from "react";
import { AnyObj, UIProject, Binding, UIScreenDef, UIDefinition } from "../types";
import { resolveBinding, setPath } from "../lib/utils";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface AppStateContextType {
    state: AnyObj;
    setState: (path: string, value: any) => void;
    t: (key: string) => string;
    form: UseFormReturn<AnyObj>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function StateProvider({
    project,
    children,
    initialState = {},
    defaultLocale = "en",
    screenDef
}: {
    project: UIProject;
    children: ReactNode;
    initialState?: AnyObj;
    defaultLocale?: string;
    screenDef?: UIDefinition;

}) {
    const [state, setStateRaw] = useState<AnyObj>(() => {
        const initial = { ...initialState };
        if (project.state?.keys) {
            Object.entries(project.state.keys).forEach(([key, config]) => {
                initial[key] = config.defaultValue ?? null;
            });
        }
        return initial;
    });

    const wsRef = useRef<WebSocket | null>(null);
    const wsCleanupRef = useRef<(() => void) | null>(null);
    const setState = useCallback((path: string, value: any) => {
        setStateRaw((prev) => {
            const updated = structuredClone(prev);
            path = path.replace(/^\{\{\s*|\s*\}\}$/g, '').trim();
            path = path.replace(/^\{\s*|\s*\}$/g, '').trim();

            if (path.includes('state')) {
                path = path.replace(/^state\./, '');
            }
            updated[path] = value;
            return updated;
        });
    }, [project]);


    const t = (key: string, defaultLabel?: string) => {
        const locale = state.locale || defaultLocale;

        const screenTranslations =
            screenDef?.translations?.[locale] || {};

        const projectTranslations =
            project.translations?.[locale] || {};

        return screenTranslations[key] || projectTranslations[key] || defaultLabel || '';
    };

    const formSchema: any = z.object(
        Object.entries(project.state?.keys || {}).reduce((schema, [key, config]) => {
            let validator: z.ZodTypeAny = z.any();
            switch (config.dataType) {
                case "string": {
                    let validator = z.string();
                    if (config.validation?.required) validator = validator.min(1);
                    if (config.validation?.regex) validator = validator.regex(new RegExp(config.validation.regex));
                    if (config.validation?.minLength) validator = validator.min(config.validation.minLength);
                    if (config.validation?.maxLength) validator = validator.max(config.validation.maxLength);
                    return { ...schema, [key]: validator };
                }
                case "number": {
                    let validator = z.number();
                    if (config.validation?.min !== undefined) validator = validator.min(config.validation.min);
                    if (config.validation?.max !== undefined) validator = validator.max(config.validation.max);
                    return { ...schema, [key]: validator };
                }
                case "boolean": {
                    return { ...schema, [key]: z.boolean() };
                }
                case "object": {
                    return { ...schema, [key]: z.object({}) };
                }
                case "array": {
                    return { ...schema, [key]: z.array(z.any()) };
                }
            }
            return { ...schema, [key]: validator };
        }, {})
    );

    const form = useForm<AnyObj>({
        resolver: zodResolver(formSchema),
        defaultValues: state,
    });

    useEffect(() => {
        form.reset(state);
    }, [form]);

    useEffect(() => {
        if (project.state?.persist && project.state.persistStorage) {
            const storage = project.state.persistStorage === 'localStorage' ? localStorage : sessionStorage;
            storage.setItem('appState', JSON.stringify(state));
        }
    }, [project.state?.persist, project.state?.persistStorage]);

    useEffect(() => {
        if (project.state?.persist && project.state.persistStorage) {
            const storage = project.state.persistStorage === 'localStorage' ? localStorage : sessionStorage;
            const savedState = storage.getItem('appState');
            if (savedState) {
                setStateRaw((prev) => ({ ...prev, ...JSON.parse(savedState) }));
            }
        }
    }, [project.state?.persist, project.state?.persistStorage]);

    useEffect(() => {
        if (project.state?.webSocketEndpoint && project.state.webSocketKeys?.length) {
            const wsUrl = resolveBinding(project.state.webSocketEndpoint.url, state, t) as string;
            const protocol = project.state.webSocketEndpoint.protocol || 'graphql-ws';
            const auth = project.state.webSocketEndpoint.auth;
            let authValue: string | null = null;
            if (auth) {
                authValue = resolveBinding(auth.value, state, t) as string;
            }

            wsRef.current = new WebSocket(wsUrl, protocol);

            wsRef.current.onopen = () => {
                if (protocol === 'graphql-ws' || protocol === 'graphql-transport-ws') {
                    const initPayload = authValue && auth?.type === 'bearer' ? { Authorization: `Bearer ${authValue}` } : {};
                    wsRef.current?.send(JSON.stringify({ type: 'connection_init', payload: initPayload }));
                }
            };

            wsRef.current.onmessage = (event) => {
                let data;
                try {
                    data = JSON.parse(event.data);
                } catch {
                    data = event.data;
                }
                if ((protocol === 'graphql-ws' || protocol === 'graphql-transport-ws') && data.type === 'connection_ack') {
                    project.state?.webSocketKeys?.forEach(key => {
                        wsRef.current?.send(JSON.stringify({
                            type: protocol === 'graphql-ws' ? 'subscribe' : 'start',
                            id: key,
                            payload: { query: `subscription { stateUpdate(key: "${key}") }` },
                        }));
                    });
                } else if (data.type === 'data' || data.type === 'next') {
                    const key = data.payload?.data?.stateUpdate?.key;
                    const value = data.payload?.data?.stateUpdate?.value;
                    if (key && project.state?.webSocketKeys?.includes(key)) {
                        setState(key, value);
                    }
                }
            };

            wsRef.current.onclose = () => {
                wsRef.current = null;
                wsCleanupRef.current?.();
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error', error);
                wsRef.current?.close();
            };

            wsCleanupRef.current = () => {
                wsRef.current?.close();
            };
        }

        return () => {
            wsCleanupRef.current?.();
            wsRef.current = null;
        };
    }, [project.state?.webSocketEndpoint, project.state?.webSocketKeys, state, t]);

    return (
        <AppStateContext.Provider value={{ state, setState, t, form }}>
            {children}
        </AppStateContext.Provider>
    );
}

export function useAppState() {
    const context = useContext(AppStateContext);
    if (!context) {
        throw new Error("useAppState must be used within a StateProvider");
    }
    return context;
}

