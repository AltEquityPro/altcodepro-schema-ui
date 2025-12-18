'use client';
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useLayoutEffect,
    ReactNode,
    useCallback,
} from "react";
import { AnyObj, UIProject } from "../types";
import { deepMerge, resolveBinding } from "../lib/utils";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const globalTranslations: Record<string, Record<string, string>> = {};

type Translations = Record<string, Record<string, string>>;

function safeParse<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function getLocale(): string {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("locale") || "en";
}

interface AppStateContextType {
    state: AnyObj;
    setState: (path: string, value: any) => void;
    t: (key: string, defaultLabel?: string) => string;
    form: UseFormReturn<AnyObj>;
    clearState: () => void;
    setTranslations: (
        translations: Record<string, Record<string, string>>
    ) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);


export function StateProvider({
    project,
    children,
    initialState = {},
}: {
    project: UIProject;
    children: ReactNode;
    initialState?: AnyObj;
}) {
    const wsRef = useRef<WebSocket | null>(null);
    const wsCleanupRef = useRef<(() => void) | null>(null);
    const [translations, setTranslationsState] = useState<Translations>(() => {
        if (typeof window === "undefined") return {};
        return safeParse<Translations>(localStorage.getItem("translations"), {});
    });

    const [locale, setLocale] = useState<string>(() => getLocale());
    // merge helper (no global mutation)
    const mergeTranslations = useCallback((next: Translations) => {
        setTranslationsState(prev => {
            const merged = structuredClone(prev);
            deepMerge(merged, next);
            try { localStorage.setItem("translations", JSON.stringify(merged)); } catch { }
            return merged;
        });
    }, []);

    // load project translations once / when project changes
    useEffect(() => {
        if (project?.translations) mergeTranslations(project.translations);
    }, [project, mergeTranslations]);

    // keep locale in sync (your app can change locale)
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === "locale") setLocale(getLocale());
            if (e.key === "translations") {
                // if another tab updated translations, sync
                setTranslationsState(safeParse<Translations>(e.newValue, {}));
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    // stable t that always uses latest locale + translations
    const t = useCallback((key: string, defaultLabel?: string) => {
        if (!key) return "";
        const dict = translations[locale] || translations["en"] || {};
        return dict[key] ?? defaultLabel ?? key;
    }, [translations, locale]);

    // expose setTranslations that merges
    const setTranslations = useCallback((next: Translations) => {
        if (!next || typeof next !== "object") return;
        mergeTranslations(next);
    }, [mergeTranslations]);

    useLayoutEffect(() => {
        try {
            // Load previously saved translations (if any) replaces globalTranslations
            const saved = localStorage.getItem("translations");
            if (saved) Object.assign(globalTranslations, JSON.parse(saved));

            if (project?.translations) {
                deepMerge(globalTranslations, project.translations)
                localStorage.setItem(
                    "translations",
                    JSON.stringify(globalTranslations)
                );
            }
        } catch (e) {
            console.warn("Translation preload failed", e);
        }
    }, [project]);

    const [state, setStateRaw] = useState<AnyObj>(() => {
        const initial = { ...initialState };
        if (project.state?.keys) {
            Object.entries(project.state.keys).forEach(([key, config]) => {
                initial[key] = config.defaultValue ?? null;
            });
        }
        return initial;
    });

    const setState = useCallback((path: string, value: any) => {
        if (!path || typeof path !== "string") return;
        setStateRaw(prev => {
            const updated = structuredClone(prev);
            let cleanPath = path
                .replace(/^\s*\{\{\s*|\s*\}\}\s*$/g, "") // full {{ }} pairs
                .replace(/^\s*\{+\s*|\s*\}+\s*$/g, "") // leftover single braces
                .replace(/^state\.|^this\.state\./, "") // "state." prefix
                .trim()
                .replace(/\.+$/, ""); // trailing dots

            if (!cleanPath) {
                console.warn("⚠️ Ignored invalid state path:", path);
                return prev;
            }

            // --- Support nested paths like 'profile.user.name' ---
            const keys = cleanPath.split(".");
            let target = updated;
            for (let i = 0; i < keys.length - 1; i++) {
                const k = keys[i];
                if (!target[k] || typeof target[k] !== "object") target[k] = {};
                target = target[k];
            }
            const lastKey = keys[keys.length - 1];
            if (value === undefined || !lastKey || lastKey == '{' || lastKey == '}') {
                return updated
            }
            target[lastKey] = value;
            return updated;
        });
    }, []);

    const formSchema: any = z.object(
        Object.entries(project.state?.keys || {})?.reduce((schema, [key, config]) => {
            let validator: z.ZodTypeAny = z.any();
            switch (config.dataType) {
                case "string": {
                    let v = z.string();
                    if (config.validation?.required) v = v.min(1);
                    if (config.validation?.regex)
                        v = v.regex(new RegExp(config.validation.regex));
                    if (config.validation?.minLength)
                        v = v.min(config.validation.minLength);
                    if (config.validation?.maxLength)
                        v = v.max(config.validation.maxLength);
                    return { ...schema, [key]: v };
                }
                case "number": {
                    let v = z.number();
                    if (config.validation?.min !== undefined)
                        v = v.min(config.validation.min);
                    if (config.validation?.max !== undefined)
                        v = v.max(config.validation.max);
                    return { ...schema, [key]: v };
                }
                case "boolean":
                    return { ...schema, [key]: z.boolean() };
                case "object":
                    return { ...schema, [key]: z.object({}) };
                case "array":
                    return { ...schema, [key]: z.array(z.any()) };
                default:
                    return { ...schema, [key]: validator };
            }
        }, {})
    );

    const form = useForm<AnyObj>({
        resolver: zodResolver(formSchema),
        defaultValues: state,
    });

    useEffect(() => {
        form.reset(state);
    }, [form, state]);

    useEffect(() => {
        if (project.state?.persist && project.state.persistStorage) {
            const storage =
                project.state.persistStorage === "localStorage"
                    ? localStorage
                    : sessionStorage;
            const payload = JSON.stringify(state);
            try {
                (window as any)?.requestIdleCallback
                    ? requestIdleCallback(() => storage.setItem("appState", payload))
                    : storage.setItem("appState", payload);
            } catch (e) {
                console.warn("Persist state failed", e);
            }
        }
    }, [state, project.state?.persist, project.state?.persistStorage]);

    useEffect(() => {
        if (project.state?.persist && project.state.persistStorage) {
            const storage =
                project.state.persistStorage === "localStorage"
                    ? localStorage
                    : sessionStorage;
            const savedState = storage.getItem("appState");
            if (savedState) {
                try {
                    setStateRaw((prev) => ({
                        ...prev,
                        ...JSON.parse(savedState),
                    }));
                } catch {
                    /* ignore */
                }
            }
        }
    }, [project.state?.persist, project.state?.persistStorage]);

    useEffect(() => {
        if (project.state?.webSocketEndpoint && project.state.webSocketKeys?.length) {
            const wsUrl = resolveBinding(
                project.state.webSocketEndpoint.url,
                state,
                t
            ) as string;
            const protocol = project.state.webSocketEndpoint.protocol || "graphql-ws";
            const auth = project.state.webSocketEndpoint.auth;
            let authValue: string | null = null;
            if (auth)
                authValue = resolveBinding(auth.value, state, t) as string;

            wsRef.current = new WebSocket(wsUrl, protocol);

            wsRef.current.onopen = () => {
                if (protocol === "graphql-ws" || protocol === "graphql-transport-ws") {
                    const initPayload =
                        authValue && auth?.type === "bearer"
                            ? { Authorization: `Bearer ${authValue}` }
                            : {};
                    wsRef.current?.send(
                        JSON.stringify({ type: "connection_init", payload: initPayload })
                    );
                }
            };

            wsRef.current.onmessage = (event) => {
                let data;
                try {
                    data = JSON.parse(event.data);
                } catch {
                    data = event.data;
                }
                if (
                    (protocol === "graphql-ws" ||
                        protocol === "graphql-transport-ws") &&
                    data.type === "connection_ack"
                ) {
                    project.state?.webSocketKeys?.forEach((key) => {
                        wsRef.current?.send(
                            JSON.stringify({
                                type: protocol === "graphql-ws" ? "subscribe" : "start",
                                id: key,
                                payload: {
                                    query: `subscription { stateUpdate(key: "${key}") }`,
                                },
                            })
                        );
                    });
                } else if (data.type === "data" || data.type === "next") {
                    const key = data.payload?.data?.stateUpdate?.key;
                    const value = data.payload?.data?.stateUpdate?.value;
                    if (key && project.state?.webSocketKeys?.includes(key))
                        setState(key, value);
                }
            };

            wsRef.current.onclose = () => {
                wsRef.current = null;
                wsCleanupRef.current?.();
            };

            wsRef.current.onerror = (error) => {
                console.error("WebSocket error", error);
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
    }, [project.state?.webSocketEndpoint, project.state?.webSocketKeys, state]);

    const clearState = () => {
        setStateRaw({})
        if (project.state?.persist && project.state.persistStorage) {
            const storage =
                project.state.persistStorage === "localStorage"
                    ? localStorage
                    : sessionStorage;
            try {
                storage.removeItem('appState');
            } catch (e) {
                console.warn("Persist state failed", e);
            }
        }
    };
    const contextValue: AppStateContextType = {
        state,
        setState,
        t,
        form,
        setTranslations,
        clearState
    };


    return (
        <AppStateContext.Provider value={contextValue}>
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
