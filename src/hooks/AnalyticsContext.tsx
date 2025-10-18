'use client';
import React, {
    createContext,
    useContext,
    useMemo,
    useCallback,
    useEffect,
    useRef,
} from 'react';
import { UIProject } from '@/types';
import { useTelemetry } from './TelemetryContext';

export interface AnalyticsEvent {
    name: string;
    category?: string;
    label?: string;
    value?: number;
    metadata?: Record<string, any>;
    userId?: string;
    orgId?: string;
    sessionId?: string;
    ts?: number;
}

export interface AnalyticsAdapter {
    track: (event: AnalyticsEvent) => void | Promise<void>;
    identify?: (userId: string, traits?: Record<string, any>) => void | Promise<void>;
    page?: (path: string, metadata?: Record<string, any>) => void | Promise<void>;
    error?: (error: Error | string, metadata?: Record<string, any>) => void | Promise<void>;
}

interface AnalyticsContextValue {
    trackEvent: (event: AnalyticsEvent) => void;
    trackPage: (path: string, metadata?: Record<string, any>) => void;
    trackError: (error: Error | string, metadata?: Record<string, any>) => void;
    setAdapter: (adapter: AnalyticsAdapter | null) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({
    trackEvent: () => { },
    trackPage: () => { },
    trackError: () => { },
    setAdapter: () => { },
});

export const useAnalytics = () => useContext(AnalyticsContext);

/**
 * 🔹 AnalyticsProvider
 * Combines Telemetry + optional external adapters (Google, Segment, Mixpanel, etc.)
 */
export function AnalyticsProvider({
    user,
    children,
    customAdapter,
}: {
    project: UIProject;
    user?: { id?: string; email?: string; orgId?: string };
    customAdapter?: AnalyticsAdapter;
    children: React.ReactNode;
}) {
    const telemetry = useTelemetry();
    const adapterRef = useRef<AnalyticsAdapter | null>(customAdapter || null);

    const sessionIdRef = useRef(
        (() => {
            try {
                const existing = sessionStorage.getItem('analyticsSessionId');
                if (existing) return existing;
                const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
                sessionStorage.setItem('analyticsSessionId', id);
                return id;
            } catch {
                return `${Date.now()}-${Math.random()}`;
            }
        })()
    );

    const enrich = useCallback(
        (event: Partial<AnalyticsEvent>): AnalyticsEvent => ({
            ...event,
            userId: user?.id,
            orgId: user?.orgId,
            sessionId: sessionIdRef.current,
            ts: Date.now(),
        } as any),
        [user]
    );

    const trackEvent = useCallback(
        (evt: AnalyticsEvent) => {
            const enriched = enrich(evt);
            telemetry?.send?.('event', enriched); // base telemetry ingestion
            adapterRef.current?.track?.(enriched);
        },
        [enrich, telemetry]
    );

    const trackPage = useCallback(
        (path: string, metadata?: Record<string, any>) => {
            const evt = enrich({ name: 'page_view', category: 'navigation', label: path, metadata });
            telemetry?.send?.('page', evt);
            adapterRef.current?.page?.(path, metadata);
        },
        [enrich, telemetry]
    );

    const trackError = useCallback(
        (error: Error | string, metadata?: Record<string, any>) => {
            const errObj = typeof error === 'string' ? new Error(error) : error;
            const evt = enrich({
                name: 'error',
                category: 'exception',
                label: errObj.message,
                metadata: { stack: errObj.stack, ...metadata },
            });
            telemetry?.send?.('error', evt);
            adapterRef.current?.error?.(errObj, metadata);
        },
        [enrich, telemetry]
    );

    const setAdapter = useCallback((adapter: AnalyticsAdapter | null) => {
        adapterRef.current = adapter;
    }, []);

    // Auto track route changes (Next.js style)
    useEffect(() => {
        const onPopState = () => trackPage(location.pathname);
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, [trackPage]);

    // Auto track global errors
    useEffect(() => {
        const onError = (e: ErrorEvent) => trackError(e.error || e.message, { file: e.filename });
        const onReject = (e: PromiseRejectionEvent) => trackError(String(e.reason));
        window.addEventListener('error', onError);
        window.addEventListener('unhandledrejection', onReject);
        return () => {
            window.removeEventListener('error', onError);
            window.removeEventListener('unhandledrejection', onReject);
        };
    }, [trackError]);

    const ctx: AnalyticsContextValue = useMemo(
        () => ({ trackEvent, trackPage, trackError, setAdapter }),
        [trackEvent, trackPage, trackError, setAdapter]
    );

    return <AnalyticsContext.Provider value={ctx}>{children}</AnalyticsContext.Provider>;
}
