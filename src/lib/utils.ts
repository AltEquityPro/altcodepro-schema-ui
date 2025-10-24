'use client';
import {
    AnyObj,
    UIProject,
    DataSource,
    AccessibilityProps,
    StyleProps,
    VisibilityControl
} from "../types";



import { clsx, type ClassValue } from "clsx"
// import { twMerge } from "tailwind-merge"
import { cva } from 'class-variance-authority';
import { deepResolveBindingsDepth, resolveBindingWithDepth } from './resoveBinding';

export function cn(...inputs: ClassValue[]) {
    return (clsx(inputs))
}
export function getPath(obj: AnyObj, path: string) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}
export function resolveAnimation(animation?: any) {
    if (!animation) return {};

    const {
        framework = "css",
        animate,
        initial,
        transition,
        delay,
        duration,
        easing,
        entrance,
        exit,
        whileHover,
        whileTap,
        repeat,
        lottieUrl,
        layout,
    } = animation;

    switch (framework) {
        case "animate.css": {
            // expect entrance/exit names (like "fadeIn", "bounceOut")
            let className = "";
            if (entrance) className += ` animate__animated animate__${entrance}`;
            if (exit) className += ` animate__animated animate__${exit}`;
            return {
                className: className.trim(),
                style: {
                    animationDelay: delay ? `${delay}ms` : undefined,
                    animationDuration: duration ? `${duration}ms` : undefined,
                } as React.CSSProperties,
            };
        }

        case "css": {
            // Map directly to inline styles
            return {
                style: {
                    transition: transition ? Object.entries(transition).map(([k, v]) => `${k} ${v}`).join(", ") : undefined,
                    animationDelay: delay ? `${delay}ms` : undefined,
                    animationDuration: duration ? `${duration}ms` : undefined,
                    animationIterationCount: repeat,
                    ...animate,
                } as React.CSSProperties,
            };
        }

        case "framer-motion": {
            // Return props you can spread into a <motion.div>
            return {
                initial,
                animate,
                exit,
                whileHover,
                whileTap,
                layout,
                transition: {
                    delay,
                    duration,
                    ease: easing,
                    repeat,
                    ...transition,
                },
            };
        }

        case "gsap": {
            // Return a GSAP config you can feed into gsap.to()
            return {
                gsap: {
                    from: initial,
                    to: animate,
                    duration: duration ? duration / 1000 : undefined, // gsap uses seconds
                    delay: delay ? delay / 1000 : undefined,
                    ease: easing,
                    repeat,
                    ...transition,
                },
            };
        }

        default:
            return {};
    }
}

export function isVisible(visibility: VisibilityControl | undefined, state: AnyObj, t: (key: string) => string): boolean {
    try {
        if (!visibility || !visibility.condition) return true;
        const { key, op, value } = visibility.condition;
        if (!key || !op) {
            return true
        }
        const resolvedKey = resolveBinding(key, state, t);
        const resolvedValue = resolveBinding(value, state, t);

        switch (op) {
            case "==": return resolvedKey === resolvedValue;
            case "!=": return resolvedKey !== resolvedValue;
            case ">": return resolvedKey > resolvedValue;
            case "<": return resolvedKey < resolvedValue;
            case ">=": return resolvedKey >= resolvedValue;
            case "<=": return resolvedKey <= resolvedValue;
            case "exists": return resolvedKey !== null && resolvedKey !== undefined;
            case "not_exists": return resolvedKey === null || resolvedKey === undefined;
            case "matches": return new RegExp(resolvedValue).test(resolvedKey);
            case "in": return Array.isArray(resolvedValue) && resolvedValue.includes(resolvedKey);
            case "not_in": return Array.isArray(resolvedValue) && !resolvedValue.includes(resolvedKey);
            default: return true;
        }
    } catch (error) {
        console.error("Error kye:", visibility?.condition);
        return false;
    }
}

export function classesFromStyleProps(styles?: StyleProps): string {
    if (!styles) return "";
    let classes = styles.className?.trim() || "";

    if (styles.responsiveClasses) {
        const responsive = Object.values(styles.responsiveClasses)
            .filter(Boolean)
            .join(" ");
        if (responsive) classes += ` ${responsive}`;
    }

    const bg = styles.background;
    if (bg && bg.type && bg.value) {
        switch (bg.type) {
            case "color":
                classes += ` bg-[${bg.value}]`;
                break;
            case "gradient":
                classes += ` bg-gradient-to-r ${bg.value}`;
                break;
            case "image":
            case "video":
                classes += ` bg-[url('${bg.value}')] bg-cover`;
                break;
        }
    }

    if (bg?.overlayClass) {
        classes += ` ${bg.overlayClass}`;
    }

    return classes.trim().replace(/\s+/g, " ");
}

export function getAccessibilityProps(
    accessibility?: AccessibilityProps,
    state: Record<string, any> = {},
    t: (s: string) => string = (s) => s
): Record<string, any> {
    if (!accessibility) return {};

    const props: Record<string, any> = {};

    if (accessibility.ariaLabel) {
        props["aria-label"] = resolveBinding(accessibility.ariaLabel, state, t);
    }
    if (accessibility.ariaRole) {
        props.role = accessibility.ariaRole;
    }
    if (accessibility.ariaHidden !== undefined) {
        props["aria-hidden"] = accessibility.ariaHidden;
    }
    if (accessibility.tabIndex !== undefined) {
        props.tabIndex = accessibility.tabIndex;
    }
    if (accessibility.focusable) {
        props.tabIndex = 0;
    }
    if (accessibility.screenReaderText) {
        props["aria-description"] = resolveBinding(accessibility.screenReaderText, state, t);
    }

    return props;
}

export const variants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 outline-none focus-visible:ring-2 focus-visible:ring-[var(--acp-primary)]",
    {
        variants: {
            variant: {
                default:
                    "bg-[var(--acp-primary)] text-white hover:bg-[var(--acp-primary-700)]",
                primary:
                    "bg-[var(--acp-primary)] text-white hover:bg-[var(--acp-primary-700)]",
                secondary:
                    "bg-[var(--acp-secondary)] text-white hover:bg-[var(--acp-secondary-700)]",
                outline:
                    "border border-[var(--acp-border)] text-[var(--acp-foreground)] bg-transparent hover:bg-[color-mix(in_srgb,var(--acp-foreground)10%,transparent)]",
                ghost:
                    "text-[var(--acp-foreground)] bg-transparent hover:bg-[color-mix(in_srgb,var(--acp-foreground)8%,transparent)]",
                link:
                    "text-[var(--acp-primary)] underline-offset-4 hover:underline hover:text-[var(--acp-primary-700)]",
                success:
                    "bg-green-600 text-white hover:bg-green-700",
                danger:
                    "bg-red-600 text-white hover:bg-red-700",
                warning:
                    "bg-yellow-500 text-black hover:bg-yellow-600",
                info:
                    "bg-blue-500 text-white hover:bg-blue-600",
            },
            size: {
                sm: "h-8 px-3 text-xs",
                default: "h-9 px-4 text-sm",
                lg: "h-10 px-6 text-base",
                icon: "size-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export const joinUrl = (base: string, path: string) =>
    `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;


export function sanitizeValue(value: any): any {
    if (value == null) return "";
    if (Array.isArray(value)) return value; // arrays render fine with map
    if (typeof value === "object") {
        // Avoid React crash on raw objects
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }
    return String(value);
}

const isPlainObj = (v: any) =>
    v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && !(v instanceof File) && !(v instanceof FormData);


export function resolveDataSource(
    dsOrRef: DataSource | string,
    globalConfig: UIProject['globalConfig'] | undefined,
    state: AnyObj,
    extra?: AnyObj
): DataSource {
    let ds: DataSource;

    // Handle string input (assumed to be a refId)
    if (typeof dsOrRef === 'string') {
        const globalEndpoints = globalConfig?.endpoints?.registry || [];
        const globalRef = globalEndpoints.find(ref => ref.id === dsOrRef);
        if (!globalRef) {
            throw new Error(`DataSource with refId ${dsOrRef} not found in global endpoints`);
        }
        ds = { ...globalRef };
    } else {
        ds = { ...dsOrRef };
    }

    // Handle refId lookup for DataSource objects
    if (ds.refId) {
        const globalEndpoints = globalConfig?.endpoints?.registry || [];
        const globalRef = globalEndpoints.find(ref => ref.id === ds.refId);
        if (globalRef) {
            ds = { ...globalRef, ...ds };
        }
    }

    // Apply environment-specific configuration
    const env = globalConfig?.endpoints?.environments?.default || 'default';
    const envConfig = globalConfig?.endpoints?.environments?.values?.[env] || {};
    if (envConfig.baseUrl && !ds.baseUrl) {
        ds.baseUrl = envConfig.baseUrl;
    }

    // Merge headers
    ds.headers = {
        ...(globalConfig?.endpoints?.defaultHeaders || {}),
        ...(envConfig.headers || {}),
        ...(ds.headers || {})
    };

    // Apply global auth if no auth is specified
    if (!ds.auth && globalConfig?.endpoints?.auth) {
        ds.auth = { ...globalConfig.endpoints.auth };
    }

    // Resolve DataSource properties
    const resolvedDs: DataSource = {
        ...ds,
        baseUrl: ds.baseUrl ? resolveDataSourceValue(ds.baseUrl, state, extra) : undefined,
        path: ds.path ? resolveDataSourceValue(ds.path, state, extra) : undefined,
        query: ds.query ? resolveDataSourceValue(ds.query, state, extra) : undefined,
        headers: ds.headers
            ? Object.fromEntries(
                Object.entries(ds.headers).map(([k, v]) => [k, resolveDataSourceValue(v, state, extra)])
            )
            : undefined,
        queryParams: ds.queryParams
            ? Object.fromEntries(
                Object.entries(ds.queryParams).map(([k, v]) => [k, resolveDataSourceValue(v, state, extra)])
            )
            : undefined,
        body: ds.body && Object.values(ds.body).some(v => typeof v === 'string' && v.includes('{form.')) ? ds.body : deepResolveDataSource(ds.body, state, extra),
        auth: ds.auth
            ? {
                ...ds.auth,
                value: resolveDataSourceValue(ds.auth.value, state, extra)
            }
            : undefined,
        heartbeat: ds.heartbeat
            ? {
                ...ds.heartbeat,
                message: resolveDataSourceValue(ds.heartbeat.message, state, extra)
            }
            : undefined
    };

    return resolvedDs;
}

export function deepResolveDataSource(input: any, state: AnyObj, extra?: AnyObj): any {
    if (input == null) return input;

    // Handle arrays
    if (Array.isArray(input)) {
        return input.map(v => deepResolveDataSource(v, state, extra));
    }

    // Handle plain objects
    if (isPlainObj(input)) {
        const out: AnyObj = {};
        for (const [k, v] of Object.entries(input)) {
            out[k] = deepResolveDataSource(v, state, extra);
        }
        return out;
    }

    // Handle strings (support state.* and form.*)
    if (typeof input === 'string') {
        return resolveDataSourceValue(input, state, extra);
    }

    // Return literal value for non-strings
    return input;
}

export function resolveDataSourceValue(val: any, state: AnyObj, extra?: AnyObj): any {
    if (val == null) return "";

    let str = String(val);

    // 🔹 Unified context for binding resolution
    const context: AnyObj = {
        ...state,
        user: state.user || state.auth?.user || {},
        auth: state.auth || {},
        organization: state.organization || state.org || {},
        org: state.organization || state.org || {},
        form: extra || {},
        state, // allow {state.user.id} style
    };

    /**
     * 🔄 Internal function to resolve a binding expression like "user.org_id" or "state.project.id"
     */
    const resolveExpr = (expr: string): string => {
        const trimmed = expr.trim().replace(/^state\./, "");
        const value = getPath(context, trimmed);
        return value == null ? "" : sanitizeValue(value);
    };

    // ✅ Handle {{key}} template syntax
    str = str.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_m, expr) => resolveExpr(expr));

    // ✅ Handle {key} syntax
    str = str.replace(/\{([^}]+?)\}/g, (_m, expr) => resolveExpr(expr));

    // ✅ Handle legacy direct "state.xxx"
    if (str.startsWith("state.")) {
        return sanitizeValue(getPath(state, str.slice(6)));
    }
    if (str.startsWith("form.") && extra) {
        const field = str.slice(5);
        return extra[field] !== undefined ? sanitizeValue(extra[field]) : str;
    }
    if (str.startsWith("{form.") && extra) {
        const field = str.slice(6);
        return extra[field] !== undefined ? sanitizeValue(extra[field]) : str;
    }
    return sanitizeValue(str);
}

function stableStringify(v: any): string {
    const seen = new WeakSet();
    const stringify = (obj: any): any => {
        if (obj && typeof obj === "object") {
            if (seen.has(obj)) return null;
            seen.add(obj);
            if (Array.isArray(obj)) return obj.map(stringify);
            return Object.keys(obj).sort().reduce((acc: any, k) => {
                acc[k] = stringify(obj[k]);
                return acc;
            }, {});
        }
        return obj;
    };
    return JSON.stringify(stringify(v));
}

export function hash(v: any): string {
    const s = typeof v === "string" ? v : stableStringify(v);
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = (h << 5) - h + s.charCodeAt(i);
        h |= 0;
    }
    return String(h);
}

export function getAuthKey(globalConfig?: UIProject["globalConfig"]) {
    return globalConfig?.auth?.cookieName || globalConfig?.auth?.audience || "authToken";
}

// Ensure resolveBinding delegates to resolveBindingWithDepth
export function resolveBinding(
    val: any,
    state: AnyObj,
    t: (k: string) => string
): any {
    return resolveBindingWithDepth(val, state, t);
}

export function deepResolveBindings(val: any,
    state: AnyObj,
    t: (k: string) => string): any {
    return deepResolveBindingsDepth(val, state, t);
}

