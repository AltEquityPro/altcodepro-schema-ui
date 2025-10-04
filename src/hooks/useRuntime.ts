// hooks/useRuntime.ts
'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { toast } from 'sonner';
import { ActionRuntime } from '../types';
import { useAppState } from '../schema/StateContext';
import WalletConnectProvider from '@walletconnect/ethereum-provider';
import { scriptRegistry } from '@/lib/scriptRegistry';

// ---- SSR guards -------------------------------------------------------------
const isBrowser = typeof window !== 'undefined';

// ---- Small helpers ----------------------------------------------------------
function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function toCsv(rows: any[]): string {
    if (!Array.isArray(rows) || rows.length === 0) return '';
    const headers = Array.from(
        rows.reduce<Set<string>>((acc, row) => {
            Object.keys(row ?? {}).forEach(k => acc.add(k));
            return acc;
        }, new Set<string>())
    );
    const escapeCell = (v: any) => {
        const s = v == null ? '' : String(v);
        const needsQuotes = /[",\n]/.test(s);
        const escaped = s.replace(/"/g, '""');
        return needsQuotes ? `"${escaped}"` : escaped;
    };
    const headerLine = headers?.map(escapeCell).join(',');
    const lines = rows.map(r => headers?.map(h => escapeCell(r?.[h])).join(','));
    return [headerLine, ...lines].join('\n');
}

// Fallback “add chain” params if wallet doesn’t know target chain
const CHAIN_PRESETS: Record<number, { chainName: string; rpcUrls: string[]; nativeCurrency: { name: string; symbol: string; decimals: number }; blockExplorerUrls?: string[] }> = {
    1: { chainName: 'Ethereum Mainnet', rpcUrls: ['https://rpc.ankr.com/eth'], nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, blockExplorerUrls: ['https://etherscan.io'] },
    137: { chainName: 'Polygon', rpcUrls: ['https://polygon-rpc.com'], nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }, blockExplorerUrls: ['https://polygonscan.com'] },
    8453: { chainName: 'Base', rpcUrls: ['https://mainnet.base.org'], nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, blockExplorerUrls: ['https://basescan.org'] },
};

// ---- useRuntime -------------------------------------------------------------
export function useRuntime(): ActionRuntime {
    const { state, setState } = useAppState();

    // Store wallet objects across renders
    const wcRef = useRef<any | null>(null);
    const providerRef = useRef<BrowserProvider | null>(null);
    const signerRef = useRef<JsonRpcSigner | null>(null);

    // Patch state helper that matches your ActionRuntime.patchState signature
    const patchState = useCallback((path: string, value: any) => {
        // @ts-ignore – setState in your StateContext takes (path, value)
        setState(path, value);
    }, [setState]);

    // ---------- Navigation ----------
    const navigate = useCallback((href: string, replace?: boolean) => {
        if (!isBrowser) return;
        if (replace) {
            window.history.replaceState({}, '', href);
        } else {
            window.history.pushState({}, '', href);
        }
        window.dispatchEvent(new PopStateEvent('popstate'));
    }, []);

    // ---------- UI containers ----------
    const openModal = useCallback((id: string) => patchState(`layout.modals.${id}`, true), [patchState]);
    const closeModal = useCallback((id: string) => patchState(`layout.modals.${id}`, false), [patchState]);
    const openDrawer = useCallback((id: string) => patchState(`layout.drawers.${id}`, true), [patchState]);
    const closeDrawer = useCallback((id: string) => patchState(`layout.drawers.${id}`, false), [patchState]);
    const openSidebar = useCallback((id: string) => patchState(`layout.sidebars.${id}`, true), [patchState]);
    const closeSidebar = useCallback((id: string) => patchState(`layout.sidebars.${id}`, false), [patchState]);

    // ---------- Toast ----------
    const toastApi = useMemo(() => ({
        success: (m: string) => toast.success(m),
        error: (m: string) => toast.error(m),
        info: (m: string) => toast(m),
        warning: (m: string) => toast.warning(m),
    }), []);
    const toastFn: ActionRuntime['toast'] = (msg, variant = 'info') => {
        (toastApi[variant] ?? toastApi.info)(msg);
    };

    // ---------- Scripts ----------
    const runScript = useCallback<NonNullable<ActionRuntime["runScript"]>>(async (name, args) => {
        if (!scriptRegistry?.run) {
            throw new Error('scriptRegistry.run is not available (check your import from "@/lib/scriptRegistry")');
        }
        const controller = new AbortController();
        const TIMEOUT_MS = 10_000;
        const timeoutId = setTimeout(() => controller.abort(new Error("Script timeout")), TIMEOUT_MS);

        try {
            const ctx = Object.freeze({
                getState: () => structuredClone(state),
                patchState,
                toast: toastFn,
                navigate,
                signal: controller.signal,
                fetch: (input: RequestInfo | URL, init?: RequestInit) =>
                    fetch(input, { ...(init || {}), signal: controller.signal }),
            });

            return await scriptRegistry.run(name, args, {
                timeoutMs: TIMEOUT_MS,
                context: ctx,
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeoutId);
        }
    }, [state, patchState, toastFn, navigate]);

    // ---------- Export ----------
    const exportFile = useCallback<NonNullable<ActionRuntime['exportFile']>>(async (type, payload) => {
        if (type === 'json') {
            const blob = new Blob([JSON.stringify(payload ?? {}, null, 2)], { type: 'application/json' });
            downloadBlob(blob, 'export.json');
            return;
        }
        if (type === 'csv') {
            const csv = toCsv(Array.isArray(payload) ? payload : []);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            downloadBlob(blob, 'export.csv');
            return;
        }
        if (type === 'xlsx') {
            const rows = Array.isArray(payload) ? payload : [];
            const { utils, write } = await import('xlsx');
            const wb = utils.book_new();
            const ws = utils.json_to_sheet(rows);
            utils.book_append_sheet(wb, ws, 'Data');
            const out = write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            downloadBlob(blob, 'export.xlsx');
            return;
        }
        throw new Error(`Export type "${type}" not implemented on client`);
    }, []);

    // ---------- Wallets ----------
    const ensureChain = useCallback(async (ethLike: any, chainId: number) => {
        const targetHex = `0x${chainId.toString(16)}`;
        const currentHex = await ethLike.request?.({ method: 'eth_chainId' });
        if (currentHex?.toLowerCase() === targetHex.toLowerCase()) return;

        try {
            await ethLike.request?.({ method: 'wallet_switchEthereumChain', params: [{ chainId: targetHex }] });
        } catch (err: any) {
            if (err?.code === 4902) {
                const preset = CHAIN_PRESETS[chainId];
                if (!preset) throw new Error(`Unknown chain ${chainId}, and no preset available to add.`);
                await ethLike.request?.({
                    method: 'wallet_addEthereumChain',
                    params: [{ chainId: targetHex, ...preset }],
                });
            } else {
                throw err;
            }
        }
    }, []);

    const connectWallet = useCallback<NonNullable<ActionRuntime['connectWallet']>>(async (providerName, chainId, projectId) => {
        if (!isBrowser) throw new Error('Wallets are only available in the browser');

        let ethLike: any;
        if (providerName === 'metamask') {
            ethLike = (window as any).ethereum;
            if (!ethLike) throw new Error('MetaMask not found');
            await ethLike.request?.({ method: 'eth_requestAccounts' });
        } else if (providerName === 'walletconnect') {
            if (!projectId) throw new Error('WalletConnect projectId required');
            const wc = await WalletConnectProvider.init({
                projectId,
                chains: [chainId],
                showQrModal: true,
            });
            await wc.connect();
            wcRef.current = wc;
            ethLike = wc;
        } else {
            throw new Error(`Unsupported provider: ${providerName}`);
        }

        await ensureChain(ethLike, chainId);

        const browserProvider = new BrowserProvider(ethLike);
        providerRef.current = browserProvider;
        const signer = await browserProvider.getSigner();
        signerRef.current = signer;

        const address = await signer.getAddress();
        const network = await browserProvider.getNetwork();

        return { accounts: [address], chainId: Number(network.chainId) };
    }, [ensureChain]);

    const signTransaction = useCallback<NonNullable<ActionRuntime['signTransaction']>>(async (_provider, _chainId, tx) => {
        if (!signerRef.current) throw new Error('Wallet not connected');
        const resp = await signerRef.current.sendTransaction(tx);
        return resp;
    }, []);

    const signMessage = useCallback<NonNullable<ActionRuntime['signMessage']>>(async (_provider, _chainId, message) => {
        if (!signerRef.current) throw new Error('Wallet not connected');
        return await signerRef.current.signMessage(message);
    }, []);

    const disconnectWallet = useCallback<NonNullable<ActionRuntime['disconnectWallet']>>(async () => {
        signerRef.current = null;
        providerRef.current = null;
        if (wcRef.current) {
            try { await wcRef.current.disconnect(); } catch { /* ignore */ }
            wcRef.current = null;
        }
    }, []);

    // ---------- Voice/AI ----------
    const processVoiceCommand = useCallback<NonNullable<ActionRuntime['processVoiceCommand']>>(async (command, language, voiceModel) => {
        return { ok: true, command, language, voiceModel };
    }, []);

    const transcribeAudio = useCallback<NonNullable<ActionRuntime['transcribeAudio']>>(async (_file, _language) => {
        return '';
    }, []);

    const generateAIContent = useCallback<NonNullable<ActionRuntime['generateAIContent']>>(async (prompt, type) => {
        const res = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, type }),
        });
        if (!res.ok) throw new Error(`AI error ${res.status}: ${await res.text()}`);
        return res.json();
    }, []);

    // ---------- Signature pad ----------
    const saveSignature = useCallback<NonNullable<ActionRuntime['saveSignature']>>(async (dataUrl, exportType) => {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        downloadBlob(blob, `signature.${exportType}`);
    }, []);
    const clearSignature = useCallback<NonNullable<ActionRuntime['clearSignature']>>(() => {
        patchState('signature.dataUrl', null);
    }, [patchState]);

    // ---------- Misc selections ----------
    const selectTimelineItem = useCallback<NonNullable<ActionRuntime['selectTimelineItem']>>((id) => {
        patchState('timeline.selected', id);
    }, [patchState]);
    const selectTreeNode = useCallback<NonNullable<ActionRuntime['selectTreeNode']>>((id, selected) => {
        patchState(`tree.selected.${id}`, selected);
    }, [patchState]);

    // ---------- Cleanup ----------
    useEffect(() => {
        return () => {
            disconnectWallet().catch(() => { });
        };
    }, [disconnectWallet]);

    // Final runtime object
    return {
        navigate,
        openModal,
        closeModal,
        openDrawer,
        closeDrawer,
        openSidebar,
        closeSidebar,

        runScript,
        toast: toastFn,
        exportFile,

        connectWallet,
        signTransaction,
        signMessage,
        disconnectWallet,

        initiateCall: async () => { },
        endCall: () => { },
        sendMessage: async () => { },
        joinChatThread: async () => { },
        leaveChatThread: async () => { },
        voteComment: async () => { },

        processVoiceCommand,
        transcribeAudio,
        generateAIContent,

        saveSignature,
        clearSignature,

        selectTimelineItem,
        selectTreeNode,

        patchState,
    };
}
