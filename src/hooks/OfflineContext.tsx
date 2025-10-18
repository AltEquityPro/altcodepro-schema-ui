'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import localforage from 'localforage';
import type { AnyObj } from '@/types';

/* -------------------- Types -------------------- */
export type OfflineEvent = {
    id: string;
    kind: 'action' | 'rest' | 'graphql';
    dsId: string;
    operation?: string;
    query?: string;
    method?: string;
    variables?: AnyObj;
    body?: AnyObj | FormData;
    queryParams?: Record<string, any>;
    headers?: Record<string, string>;
    statePath?: string;
    responseType?: 'data' | 'blob' | 'text';
    createdAt: number;
};

export type Executor = (evt: OfflineEvent) => Promise<void>;

export interface OfflineContextValue {
    isOffline: boolean;
    syncing: boolean;
    syncProgress: number; // 0 to 1
    queueEvent: (evt: OfflineEvent) => Promise<void>;
    replayQueue: () => Promise<void>;
    clearQueue: () => Promise<void>;
    getCachedData: (key: string) => Promise<any>;
    setCachedData: (key: string, data: any) => Promise<void>;
    registerExecutor: (fn: Executor) => Promise<void>;
}

/* -------------------- Context -------------------- */
const OfflineContext = createContext<OfflineContextValue>(null as any);
export const useOffline = () => useContext(OfflineContext);

/* -------------------- Provider -------------------- */
export async function registerSWSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
            const registration: any = await navigator.serviceWorker.register('/sw.js');
            console.info('[AltCodePro] Service Worker registered');

            const hasTag = (await registration.sync.getTags()).includes('altcodepro-sync');
            if (!hasTag) {
                await registration.sync.register('altcodepro-sync');
                console.info('[AltCodePro] Background sync registered');
            }
        } catch (err) {
            console.warn('SW registration failed:', err);
        }
    } else {
        console.warn('Background Sync not supported');
    }
}
export function OfflineProvider({
    children,
    throttleMs = 200,
    onReplayStart,
    onReplayProgress,
    onReplayComplete,
}: {
    children: React.ReactNode;
    throttleMs?: number;
    onReplayStart?: (total: number) => void;
    onReplayProgress?: (completed: number, total: number) => void;
    onReplayComplete?: (successCount: number, failedCount: number) => void;
}) {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [syncing, setSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);
    const store = useRef(localforage.createInstance({ name: 'altcodepro_offline' }));
    const executorRef = useRef<Executor | null>(null);
    const replayingRef = useRef(false);

    /* ✅ Async executor registration */
    const registerExecutor = useCallback(async (fn: Executor) => {
        executorRef.current = fn;
    }, []);

    /* ✅ Queue event for replay */
    const queueEvent = useCallback(async (evt: OfflineEvent) => {
        const q = (await store.current.getItem<OfflineEvent[]>('queue')) || [];
        q.push(evt);
        await store.current.setItem('queue', q);
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            const reg: any = await navigator.serviceWorker.ready;
            await reg.sync.register('altcodepro-sync');
        }
    }, []);

    /* ✅ Replay queue with throttling and progress tracking */
    const replayQueue = useCallback(async () => {
        if (replayingRef.current) return;
        replayingRef.current = true;

        const q = (await store.current.getItem<OfflineEvent[]>('queue')) || [];
        if (!q.length || !executorRef.current) {
            replayingRef.current = false;
            return;
        }

        setSyncing(true);
        setSyncProgress(0);
        onReplayStart?.(q.length);

        const pending: OfflineEvent[] = [];
        let completed = 0;
        let success = 0;
        let failed = 0;

        for (const evt of q) {
            try {
                await executorRef.current(evt);
                success++;
            } catch (err) {
                console.error('Offline replay failed:', err);
                failed++;
                pending.push(evt);
            }
            completed++;
            setSyncProgress(completed / q.length);
            onReplayProgress?.(completed, q.length);
            await new Promise((r) => setTimeout(r, throttleMs));
        }

        await store.current.setItem('queue', pending);
        onReplayComplete?.(success, failed);
        setSyncing(false);
        setSyncProgress(1);
        replayingRef.current = false;
    }, [throttleMs, onReplayStart, onReplayProgress, onReplayComplete]);

    /* ✅ Clear queue */
    const clearQueue = useCallback(async () => {
        await store.current.setItem('queue', []);
    }, []);

    /* ✅ Cache helpers */
    const getCachedData = useCallback(async (key: string) => {
        return store.current.getItem(key);
    }, []);

    const setCachedData = useCallback(async (key: string, data: any) => {
        await store.current.setItem(key, data);
    }, []);

    /* ✅ Track online/offline */
    useEffect(() => {
        const onOnline = () => setIsOffline(false);
        const onOffline = () => setIsOffline(true);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    /* ✅ Auto replay on reconnect */
    useEffect(() => {
        if (!isOffline) replayQueue();
    }, [isOffline, replayQueue]);
    useEffect(() => {
        registerSWSync();
    }, []);
    return (
        <OfflineContext.Provider
            value={{
                isOffline,
                syncing,
                syncProgress,
                queueEvent,
                replayQueue,
                clearQueue,
                getCachedData,
                setCachedData,
                registerExecutor,
            }}
        >
            {children}
        </OfflineContext.Provider>
    );
}
