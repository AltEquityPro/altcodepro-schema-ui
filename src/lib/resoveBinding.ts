import { AnyObj } from '../types';

// Utility functions from your input
function sanitizeValue(value: any): any {
    if (value == null) return "";
    return value;
}

function readEnv(key: string): string | undefined {
    if (typeof process !== "undefined" && process.env?.[key]) return process.env[key];
    if (typeof window !== "undefined" && (window as any)[key]) return (window as any)[key];
    return undefined;
}

function expandEnvTemplates(str: any): any {
    if (typeof str !== "string") return str;
    return str.replace(/\$\{([A-Z0-9_]+)\}/g, (_, k) => readEnv(k) ?? "");
}

function hash(v: any): string {
    const s = typeof v === "string" ? v : JSON.stringify(v);
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = (h << 5) - h + s.charCodeAt(i);
        h |= 0;
    }
    return String(h);
}

function getFromScope(path: string, scope: AnyObj): any {
    if (!path) return undefined;

    const prefixMatch = path.match(/^(\w+)\.(.+)$/);
    if (prefixMatch) {
        const [, prefix, rest] = prefixMatch;
        if (prefix in scope) return getPath(scope[prefix], rest);
        if (prefix.startsWith("ds_") && scope[prefix]) return getPath(scope[prefix], rest);
    }

    const order = [
        "state",
        "form",
        "props",
        "config",
        "data",
        "auth",
        "user",
        "router",
        "params",
        "query",
        "headers",
        "request",
        "url",
        "location",
        "cookies",
        "session",
        "profile", // Added to support profile.* bindings
    ];

    for (const k of order) {
        const v = getPath(scope[k] ?? {}, path);
        if (v !== undefined) return v;
    }

    for (const k of Object.keys(scope)) {
        if (k.startsWith("ds_")) {
            const v = getPath(scope[k], path);
            if (v !== undefined) return v;
        }
    }

    return undefined;
}

function getPath(obj: AnyObj, path: string): any {
    if (!obj || !path) return undefined;
    try {
        return path?.split(".")?.reduce((acc, k) => {
            if (acc == null) return acc;
            if (Array.isArray(acc)) {
                const idx = Number(k);
                return Number.isNaN(idx) ? (acc as any)[k] : acc[idx];
            }
            return (acc as any)[k];
        }, obj);
    } catch {
        return undefined;
    }
}

function buildScope(state: AnyObj): AnyObj {
    const scope: AnyObj = {
        state,
        form: state?.form ?? state?.forms ?? {},
        props: state?.props ?? {},
        config: state?.config ?? {},
        data: state?.data ?? {},
        auth: state?.auth ?? {},
        user: state?.user ?? state?.auth?.user ?? {},
        router: state?.router ?? {},
        params: state?.params ?? state?.router?.params ?? {},
        query: state?.query ?? state?.router?.query ?? {},
        headers: state?.headers ?? {},
        request: state?.request ?? {},
        url: state?.url ?? {},
        location: state?.location ?? safeLocation(),
        cookies: state?.cookies ?? {},
        session: state?.session ?? {},
        profile: state?.profile ?? {}, // Added to support profile.* bindings
    };

    if (state && typeof state === "object") {
        for (const [key, value] of Object.entries(state)) {
            if (!(key in scope)) {
                scope[key] = value;
            }
        }
    }

    return scope;
}

function safeLocation() {
    if (typeof window === "undefined") return {};
    try {
        return window.location ? {
            href: window.location.href,
            origin: window.location.origin,
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
        } : {};
    } catch {
        return {};
    }
}

// Cache for resolved bindings
const bindingCache = new Map<string, string>();

export function resolveBindingWithDepth(
    val: any,
    state: AnyObj,
    t: (k: string) => string,
    seen: Set<string> = new Set(),
    depth: number = 0,
    maxDepth: number = 10
): any {
    try {
        if (val == null) return "";

        const key =
            typeof val === "object" && "binding" in val ? String(val.binding) : String(val);

        // Prevent infinite recursion
        if (depth > maxDepth) {
            if (process.env.NODE_ENV === 'development') {
                console.warn(`Max recursion depth (${maxDepth}) reached for binding: ${key}`);
            }
            return key;
        }

        // Prevent cycles by tracking serialized keys
        const keyHash = hash(key);
        if (seen.has(keyHash)) {
            if (process.env.NODE_ENV === 'development') {
                console.warn(`Cycle detected for binding: ${key}`);
            }
            return key;
        }
        seen.add(keyHash);

        const scope = buildScope(state);

        // Check cache for non-state/form/profile bindings
        const isDynamic = key.includes("state.") || key.includes("form.") || key.includes("profile.");
        if (!isDynamic && bindingCache.has(keyHash)) {
            return bindingCache.get(keyHash);
        }

        if (!key) {
            return "";
        }

        // Handle state/form/profile.* explicit paths early
        if (key.startsWith("state.") || key.startsWith("form.") || key.startsWith("profile.")) {
            const valFromScope = getFromScope(key, scope);
            return valFromScope === undefined ? (state ? "" : key) : sanitizeValue(valFromScope);
        }

        // Handle translation calls like {{t('key')}} or {t('key')}
        const tCallPattern = /\{\{\s*t\(['"`]([^'"`]+)['"`]\)\s*\}\}|\{t\(['"`]([^'"`]+)['"`]\)\}/g;
        if (tCallPattern.test(key)) {
            const result = key.replace(tCallPattern, (_, k1, k2) => {
                const transKey = k1 || k2;
                if (state?.translations) {
                    const locale = state?.locale || state?.language || "en";
                    const dict = state.translations?.[locale];
                    if (dict && transKey in dict) {
                        const translated = dict[transKey];
                        return resolveBindingWithDepth(translated, state, t, new Set(seen), depth + 1, maxDepth);
                    }
                }
                const out = t(transKey);
                return out && out !== transKey
                    ? resolveBindingWithDepth(out, state, t, new Set(seen), depth + 1, maxDepth)
                    : transKey;
            });
            if (!isDynamic) {
                bindingCache.set(keyHash, result);
            }
            return result;
        }

        // i18n.<key>
        if (key.startsWith("i18n.")) {
            const k = key.slice(5);
            let out = t(k);
            if (!out || out === k) out = t(key);
            const result = out ? resolveBindingWithDepth(out, state, t, new Set(seen), depth + 1, maxDepth) : key;
            if (!isDynamic) {
                bindingCache.set(keyHash, result);
            }
            return result;
        }

        // translations.<locale>.<path>
        if (key.startsWith("translations.")) {
            const parts = key.split(".");
            if (parts.length >= 3) {
                const locale = parts[1];
                const path = parts.slice(2).join(".");
                let out = t(`${locale}.${path}`);
                if (out && out !== `${locale}.${path}`) {
                    const result = resolveBindingWithDepth(out, state, t, new Set(seen), depth + 1, maxDepth);
                    bindingCache.set(keyHash, result);
                    return result;
                }
                out = t(path);
                if (out && out !== path) {
                    const result = resolveBindingWithDepth(out, state, t, new Set(seen), depth + 1, maxDepth);
                    bindingCache.set(keyHash, result);
                    return result;
                }
            }
            return key;
        }

        // Direct {user.displayName} / {{form.email}} / {env.API_URL}
        const direct = key.match(/^\{+\s*([^{}]+)\s*\}+$/);
        if (direct) {
            const expr = direct[1].trim();
            if (expr.startsWith("env.")) {
                const result = sanitizeValue(readEnv(expr.slice(4)));
                bindingCache.set(keyHash, result);
                return result;
            }
            if (/^[A-Z0-9_]+$/.test(expr)) {
                const result = sanitizeValue(readEnv(expr));
                bindingCache.set(keyHash, result);
                return result;
            }

            const valFromScope = getFromScope(expr, scope);
            if (valFromScope !== undefined) return sanitizeValue(valFromScope);

            try {
                const fn = new Function("scope", "Math", "Date", "with(scope){return " + expr + ";}");
                const result = (fn(scope, Math, Date));
                return result;
            } catch {
                return expr; // Return the inner expression
            }
        }

        // Expand ${ENV} inside strings
        const maybeEnv = expandEnvTemplates(key);
        if (maybeEnv !== key) {
            bindingCache.set(keyHash, maybeEnv);
            return maybeEnv;
        }

        // env.<VAR> or direct UPPERCASE env
        if (key.startsWith("env.")) {
            const result = sanitizeValue(readEnv(key.slice(4)));
            bindingCache.set(keyHash, result);
            return result;
        }
        if (/^[A-Z0-9_]+$/.test(key)) {
            const result = sanitizeValue(readEnv(key));
            bindingCache.set(keyHash, result);
            return result;
        }

        // Template placeholders {{...}} or {...}
        const templatePattern = /\{\{\s*([^{}]+?)\s*\}\}|\{([^{}]+?)\}/g;
        if (templatePattern.test(key)) {
            const replaced = key.replace(templatePattern, (_, p1, p2) => {
                const expr = (p1 || p2 || "").trim();
                if (expr.startsWith("env.")) {
                    const result = readEnv(expr.slice(4)) ?? expr;
                    bindingCache.set(hash(expr), result);
                    return result;
                }
                if (/^[A-Z0-9_]+$/.test(expr)) {
                    const result = readEnv(expr) ?? expr;
                    bindingCache.set(hash(expr), result);
                    return result;
                }

                const scoped = getFromScope(expr, scope);
                if (scoped !== undefined) return sanitizeValue(scoped);

                try {
                    const fn = new Function("scope", "Math", "Date", "with(scope){return " + expr + ";}");
                    const result = fn(scope, Math, Date);
                    return result;
                } catch {
                    const fb = getFromScope(expr, scope);
                    return fb
                }
            });
            const result = resolveBindingWithDepth(replaced, state, t, new Set(seen), depth + 1, maxDepth);
            if (!isDynamic) {
                bindingCache.set(keyHash, result);
            }
            return result;
        }

        // Translation-like heuristic
        if (
            key.includes(".") &&
            !key.startsWith("env.") &&
            !/^[A-Z0-9_]+$/.test(key)
        ) {
            let out = t(key);
            if (out && out !== key) {
                if (/\{\{[^}]+\}\}/.test(out)) {
                    const inner = out.replace(/\{\{\s*([^{}]+)\s*\}\}/g, (_, expr) =>
                        String(resolveBindingWithDepth(expr.trim(), state, t, new Set(seen), depth + 1, maxDepth))
                    );
                    if (!isDynamic) {
                        bindingCache.set(keyHash, inner);
                    }
                    return inner;
                }
                bindingCache.set(keyHash, out);
                return out;
            }
            const parts = key.split(".");
            if (parts.length > 1) {
                const sub = parts.slice(1).join(".");
                const subOut = t(sub);
                if (subOut && subOut !== sub) {
                    if (/\{\{[^}]+\}\}/.test(subOut)) {
                        const inner = subOut.replace(/\{\{\s*([^{}]+)\s*\}\}/g, (_, expr) =>
                            String(resolveBindingWithDepth(expr.trim(), state, t, new Set(seen), depth + 1, maxDepth))
                        );
                        if (!isDynamic) {
                            bindingCache.set(keyHash, inner);
                        }
                        return inner;
                    }
                    bindingCache.set(keyHash, subOut);
                    return subOut;
                }
            }
        }

        // Try as direct scope path
        const maybe = getFromScope(key, scope);
        if (maybe !== undefined && maybe !== null)
            return sanitizeValue(typeof maybe === "string" ? expandEnvTemplates(maybe) : maybe);

        // Simple translation dictionary fallback
        if (key && state?.translations) {
            const locale = state?.locale || state?.language || "en";
            const dict = state.translations?.[locale];
            if (dict && key in dict) {
                const val = dict[key];
                const result = typeof val === "string" ? resolveBindingWithDepth(val, state, t, new Set(seen), depth + 1, maxDepth) : sanitizeValue(val);
                if (!isDynamic) {
                    bindingCache.set(keyHash, result);
                }
                return result;
            }
        }

        // Fallback literal
        const result = sanitizeValue(key);
        if (!isDynamic) {
            bindingCache.set(keyHash, result);
        }
        return result;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.log("Error resolving binding:", val, error);
        }
        return String(val);
    }
}

export function deepResolveBindingsDepth(value: any, state: AnyObj, t: (k: string) => string): any {
    try {
        if (value == null) return value;

        // Primitive (string/number/etc.)
        if (typeof value === "string") {
            const isDynamic = value.includes("state.") || value.includes("form.") || value.includes("profile.");
            const keyHash = hash(value);
            if (!isDynamic && bindingCache.has(keyHash)) {
                return bindingCache.get(keyHash);
            }

            let resolved = resolveBindingWithDepth(value, state, t);
            // Keep resolving until no {{ }} placeholders remain or max iterations reached
            let prev: string;
            let iterations = 0;
            const maxIterations = 10;
            do {
                prev = resolved;
                resolved = resolveBindingWithDepth(resolved, state, t, new Set(), iterations + 1);
                iterations++;
            } while (resolved !== prev && /\{\{.*?\}\}/.test(resolved) && iterations < maxIterations);

            if (iterations >= maxIterations && resolved !== value) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn(`Max iterations (${maxIterations}) reached for binding: ${value}`);
                }
                return value;
            }

            if (!isDynamic) {
                bindingCache.set(keyHash, resolved);
            }
            return resolved;
        }

        // Array
        if (Array.isArray(value)) {
            return value?.map((v) => deepResolveBindingsDepth(v, state, t));
        }

        // Object
        if (typeof value === "object") {
            const result: AnyObj = {};
            for (const [k, v] of Object.entries(value)) {
                result[k] = deepResolveBindingsDepth(v, state, t);
            }
            return result;
        }

        return value;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.log("Error resolving binding:", value, error);
        }
        return value;
    }
}

export function clearBindingCache(): void {
    bindingCache.clear();
}