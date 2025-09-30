/* eslint-disable @typescript-eslint/no-explicit-any */

import { BrowserProvider } from "ethers";

export type ScriptFn = (context: Record<string, any>, ...args: any[]) => any | Promise<any>;

export type ScriptModuleLoader = () => Promise<
    | { default?: ScriptFn } & Record<string, any>
>;

type AllowRule = string | RegExp;

export interface RunOptions {
    timeoutMs?: number;       // default 10s
    signal?: AbortSignal;     // optional abort
    exportName?: string;      // when using dynamic modules (named export)
    context?: Record<string, any>;
}

export interface RegisterOptions {
    allow?: boolean;          // force allow specific name even if not in allowlist patterns
    version?: string;         // optional metadata
    description?: string;     // optional metadata
}

type Entry =
    | { kind: "fn"; fn: ScriptFn; meta?: RegisterOptions }
    | { kind: "loader"; loader: ScriptModuleLoader; exportName?: string; cache?: ScriptFn; meta?: RegisterOptions };

class ScriptRegistry {
    private entries = new Map<string, Entry>();
    private allowlist: AllowRule[] = [];
    private defaultTimeout = 10_000; // 10s

    setDefaultTimeout(ms: number) {
        this.defaultTimeout = ms;
    }

    setAllowlist(rules: AllowRule[]) {
        this.allowlist = rules;
    }

    /** Optional: inspectable, e.g. for dev tools */
    list(): Array<{ name: string; kind: Entry["kind"]; meta?: RegisterOptions }> {
        return Array.from(this.entries.entries()).map(([name, e]) => ({ name, kind: e.kind, meta: e.meta }));
    }

    has(name: string) {
        return this.entries.has(name);
    }

    register(name: string, fn: ScriptFn, opts?: RegisterOptions) {
        if (!name || typeof fn !== "function") throw new Error("register(name, fn) requires a non-empty name and a function");
        this.entries.set(name, { kind: "fn", fn, meta: opts });
    }

    registerModule(name: string, loader: ScriptModuleLoader, exportName?: string, opts?: RegisterOptions) {
        if (!name || typeof loader !== "function") throw new Error("registerModule(name, loader) requires a non-empty name and a loader");
        this.entries.set(name, { kind: "loader", loader, exportName, meta: opts });
    }

    unregister(name: string) {
        this.entries.delete(name);
    }

    private isAllowed(name: string): boolean {
        const entry = this.entries.get(name);
        if (entry?.meta?.allow) return true; // explicit allow
        if (this.allowlist.length === 0) return true; // no restrictions set
        return this.allowlist.some(rule => {
            if (typeof rule === "string") {
                // glob-like: support "ns.*"
                if (rule.endsWith(".*")) {
                    const prefix = rule.slice(0, -2);
                    return name.startsWith(prefix + ".");
                }
                return name === rule;
            }
            return rule.test(name);
        });
    }

    private async resolve(name: string): Promise<ScriptFn> {
        const entry = this.entries.get(name);
        if (!entry) throw new Error(`Script "${name}" is not registered`);
        if (entry.kind === "fn") return entry.fn;

        // loader kind — cache after first import
        if (entry.cache) return entry.cache;
        const mod = await entry.loader();
        const picked: any =
            (entry.exportName ? mod[entry.exportName] : (mod.default ?? mod[name])) as ScriptFn | undefined;
        if (typeof picked !== "function") {
            throw new Error(
                `Script "${name}" module doesn't export a function${entry.exportName ? ` named "${entry.exportName}"` : ""}`
            );
        }
        entry.cache = picked;
        return picked;
    }

    async run(name: string, args: any[] = [], opts: RunOptions = {}): Promise<any> {
        if (!this.isAllowed(name)) {
            throw new Error(`Script "${name}" is not allowed by the current allowlist`);
        }

        const fn = await this.resolve(name);

        const timeoutMs = opts.timeoutMs ?? this.defaultTimeout;
        const outerAbort = opts.signal;

        const controller = new AbortController();
        const onOuterAbort = () => controller.abort(outerAbort?.reason);
        if (outerAbort) {
            if (outerAbort.aborted) controller.abort(outerAbort.reason);
            outerAbort.addEventListener("abort", onOuterAbort, { once: true });
        }

        const timeoutId = timeoutMs > 0 ? setTimeout(() => controller.abort(new Error("Script timeout")), timeoutMs) : null;

        try {
            // Important: pass a minimal, explicit context shape.
            const ctx = Object.freeze({
                ...(opts.context ?? {}),
                signal: controller.signal,
            });

            const res = fn(ctx, ...(Array.isArray(args) ? args : [args]));

            // Await regardless of sync/async
            return await Promise.race([
                Promise.resolve(res),
                new Promise((_, reject) => {
                    controller.signal.addEventListener(
                        "abort",
                        () => reject(controller.signal.reason ?? new Error("Script aborted")),
                        { once: true }
                    );
                }),
            ]);
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
            if (outerAbort) outerAbort.removeEventListener("abort", onOuterAbort);
        }
    }
}

export const scriptRegistry = new ScriptRegistry();

/* -------------------------------------------------------------------------- */
/*                         Built-in script registrations                       */
/* -------------------------------------------------------------------------- */

const isBrowser = typeof window !== 'undefined';
let cachedProvider: BrowserProvider | null = null;

function getProvider(): BrowserProvider {
    if (!isBrowser) throw new Error('Wallet is only available in the browser');
    const eth = (window as any).ethereum;
    if (!eth) throw new Error('No EIP-1193 provider found (is MetaMask installed?)');
    if (!cachedProvider) cachedProvider = new BrowserProvider(eth);
    return cachedProvider;
}

/** Connect wallet and return the first account (checks for empty result). */
scriptRegistry.register(
    'walletConnect',
    async () => {
        const provider = getProvider();
        const accounts = (await provider.send('eth_requestAccounts', [])) as string[];
        const [account] = accounts ?? [];
        if (!account) throw new Error('No accounts returned');
        return account;
    },
    { description: 'Requests accounts via EIP-1102 and returns the first address', allow: true }
);

/** Sign an arbitrary message; optional account enforces signer address. */
scriptRegistry.register(
    'walletSign',
    async (_ctx, message: string, account?: string) => {
        if (!message) throw new Error('Message is required');
        const provider = getProvider();
        const signer = await provider.getSigner();
        const addr = (await signer.getAddress())?.toLowerCase();
        if (account && addr !== account.toLowerCase()) {
            throw new Error('Signer/account mismatch');
        }
        return signer.signMessage(message);
    },
    { description: 'Signs a message with the connected wallet', allow: true }
);

/** Validate a string against a regex pattern (with safe error reporting). */
scriptRegistry.register(
    'validateInput',
    (_ctx, value: string, regex: string) => {
        try {
            const re = new RegExp(regex);
            return re.test(value ?? '');
        } catch (e: any) {
            throw new Error(`Invalid regex: ${e?.message ?? String(e)}`);
        }
    },
    { description: 'Validates a value using a regular expression', allow: true }
);
