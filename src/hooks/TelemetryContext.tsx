'use client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { UIProject } from '@/types';

export interface TelemetryEvent {
    type: 'page' | 'event' | 'error';
    payload: Record<string, any>;
    ts: number;
    url: string;
    sessionId: string;
    userAgent?: string;
    ip?: string;
    userId?: string;
    orgId?: string;
}

interface TelemetryContextValue {
    send: (type: TelemetryEvent['type'], payload: Record<string, any>) => void;
}

const TelemetryContext = createContext<TelemetryContextValue>({ send: () => { } });
export const useTelemetry = () => useContext(TelemetryContext);

export function TelemetryProvider({
    project,
    children,
    user,
}: {
    project: UIProject;
    user?: { id?: string; email?: string; orgId?: string };
    children: React.ReactNode;
}) {
    const { telemetry } = project;
    const sessionIdRef = useRef(
        (() => {
            try {
                const existing = sessionStorage.getItem('telemetrySessionId');
                if (existing) return existing;
                const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
                sessionStorage.setItem('telemetrySessionId', id);
                return id;
            } catch {
                return `${Date.now()}-${Math.random()}`;
            }
        })()
    );

    const browserInfo = useMemo(() => ({
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
    }), []);

    const shouldSend = useCallback(() => {
        if (!telemetry?.sampleRate) return true;
        return Math.random() * 100 < telemetry.sampleRate;
    }, [telemetry?.sampleRate]);

    const send = useCallback(
        async (type: TelemetryEvent['type'], payload: Record<string, any>) => {
            if (!telemetry?.ingestUrl || !shouldSend()) return;

            const event: TelemetryEvent = {
                type,
                payload,
                ts: Date.now(),
                url: location.href,
                sessionId: sessionIdRef.current,
                userAgent: browserInfo.userAgent,
                userId: user?.id,
                orgId: user?.orgId,
            };

            try {
                // Enrich IP (server endpoint or external IP API)
                const ipPromise = fetch('https://api.ipify.org?format=json')
                    .then(r => r.json())
                    .then(d => d.ip)
                    .catch(() => undefined);

                const ip = await Promise.race([ipPromise, new Promise(res => setTimeout(() => res(undefined), 1000))]);
                if (ip) event.ip = ip;

                const body = JSON.stringify(event);
                if (navigator.sendBeacon) {
                    navigator.sendBeacon(telemetry.ingestUrl, body);
                } else {
                    await fetch(telemetry.ingestUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body,
                        keepalive: true,
                    });
                }
            } catch (err) {
                console.warn('Telemetry send failed', err);
            }
        },
        [telemetry?.ingestUrl, shouldSend, browserInfo, user]
    );

    // 📍 Track page view
    useEffect(() => {
        send('page', { path: location.pathname });
    }, [send]);

    // ⚠️ Capture global errors
    useEffect(() => {
        const onError = (ev: ErrorEvent) => {
            send('error', {
                message: ev.message,
                stack: ev.error?.stack,
                filename: ev.filename,
                lineno: ev.lineno,
                colno: ev.colno,
            });
        };
        const onRejection = (ev: PromiseRejectionEvent) => {
            send('error', { message: String(ev.reason) });
        };
        window.addEventListener('error', onError);
        window.addEventListener('unhandledrejection', onRejection);
        return () => {
            window.removeEventListener('error', onError);
            window.removeEventListener('unhandledrejection', onRejection);
        };
    }, [send]);

    return (
        <TelemetryContext.Provider value={{ send }}>
            {children}
        </TelemetryContext.Provider>
    )
}
