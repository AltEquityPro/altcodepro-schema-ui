// hooks/useTelemetry.ts
'use client';

import { useEffect } from 'react';
import { UIProject } from '@/types';

export function useTelemetry(project: UIProject) {
    const { telemetry } = project;
    if (!telemetry?.ingestUrl) return;

    // Simple sampling – send only `sampleRate` % of events
    const shouldSend = () => !telemetry.sampleRate || Math.random() * 100 < telemetry.sampleRate;

    const send = (type: 'page' | 'error' | 'event', payload: any) => {
        if (!telemetry.ingestUrl) return;
        if (!shouldSend()) return;
        navigator.sendBeacon?.(
            telemetry.ingestUrl,
            JSON.stringify({ type, payload, ts: Date.now(), url: location.href })
        );
    };

    // Page view
    useEffect(() => {
        send('page', { path: location.pathname });
    }, []);

    // Global error handler
    useEffect(() => {
        const handler = (ev: ErrorEvent) => {
            if (telemetry.errorUrl) {
                send('error', { message: ev.message, stack: ev.error?.stack });
            }
        };
        window.addEventListener('error', handler);
        return () => window.removeEventListener('error', handler);
    }, [telemetry.errorUrl]);

    return { send };
}