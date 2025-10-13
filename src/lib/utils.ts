// src/lib/utils.ts
import stripJsonComments from 'strip-json-comments';
import { BrowserProvider } from 'ethers';
import { AnyObj, VisibilityControl, AccessibilityProps, StyleProps, AnimationSpec, IRoute, UIDefinition, ImageElement, UIProject, Brand, DataSource } from '../types';
import { clsx, type ClassValue } from "clsx"
// import { twMerge } from "tailwind-merge"
import { cva } from 'class-variance-authority';

const injectedCache = new Set<string>();
export const languageMap: Record<string, string> = {
    md: 'markdown',
    markdown: 'markdown',
    json: 'json',
    js: 'javascript',
    py: 'python',
    ts: 'typescript',
    tsx: 'tsx',
    jsx: 'jsx',
    css: 'css',
    html: 'html',
    yaml: 'yaml',
    yml: 'yaml',
    sql: 'sql',
};

export function cn(...inputs: ClassValue[]) {
    return (clsx(inputs))
}

export function useTranslation(translations: Record<string, Record<string, string>>, locale: string) {
    return (key: string) => translations[locale]?.[key] ?? key;
}
export function safeJsonParse(str: string) {
    try {
        return { parsed: JSON.parse(str), error: null };
    } catch (e: any) {
        return { parsed: null, error: e.message };
    }
}

export function stripBeforeThinkTag(raw: string): string {
    const split = raw.split('</think>');
    return split[split.length - 1];
}
// ui/styles/variants.ts
export const buttonVariants: Record<string, string> = {
    primary:
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500",
    secondary:
        "bg-gray-300 hover:bg-gray-400 focus:ring-2 focus:ring-gray-400",
    success:
        "bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500",
    danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500",
    warning:
        "bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400",
    outline:
        "border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-gray-400",

};

export function cleanStartingFile(raw: string): string {
    const cleaned = raw.replace(/--[^-]*--\s*/g, '');
    const startIdx = Math.min(
        ...['{', '['].map(char => cleaned.indexOf(char)).filter(idx => idx !== -1)
    );
    return startIdx !== -1 ? cleaned.slice(startIdx) : cleaned;
}

/**
 * Remove extra commas before closing brackets or braces.
 */
function removeExtraCommas(jsonStr: string): string {
    // Remove commas before closing brackets or braces, e.g., [1,2,3,] -> [1,2,3]
    return jsonStr.replace(/,\s*([\]}])/g, '$1');
}

/**
 * Attempt to balance brackets and braces if there are mismatches.
 */
function balanceBrackets(jsonStr: string): string {
    let openBraces = 0;
    let openBrackets = 0;
    for (const char of jsonStr) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (char === '[') openBrackets++;
        if (char === ']') openBrackets--;
    }
    let fixedStr = jsonStr;
    while (openBraces > 0) {
        fixedStr += '}';
        openBraces--;
    }
    while (openBrackets > 0) {
        fixedStr += ']';
        openBrackets--;
    }
    // Note: Handling extra closing brackets/braces is harder without context, so we focus on missing ones.
    return fixedStr;
}

/**
 * Enhanced cleaning and repair of JSON-like AI output.
 */
export function cleanJsonLikeAIOutput(raw: string): string {
    if (!raw) return '';
    let jsonLike = cleanStartingFile(raw);
    jsonLike = jsonLike.replace(/`{3,}[a-zA-Z]*\s*\n?/g, '');
    jsonLike = jsonLike.replace(/`{3,}\s*$/g, '');
    jsonLike = jsonLike.replace(/<\/think>/gi, '').trim();
    jsonLike = jsonLike.replace(/^[`\s\r\n]+|[`\s\r\n]+$/g, '');
    let clean = stripJsonComments(jsonLike);
    // Step 1: Remove extra commas
    clean = removeExtraCommas(clean);
    // Step 2: Attempt to balance brackets/braces
    clean = balanceBrackets(clean);
    // Step 3: Try parsing and return pretty-printed if valid
    const { parsed, error } = safeJsonParse(clean);
    if (error) {
        return clean;
    }
    return JSON.stringify(parsed, null, 2);
}

export function cleanCodeContent({
    fileContent,
    ext,
}: {
    fileContent: string;
    ext: string;
}): string {
    if (!fileContent) return '';
    let displayContent = stripBeforeThinkTag(fileContent.trim());
    const language = languageMap[ext] || 'text';
    if (ext === 'md' || ext === 'markdown') {
        displayContent = displayContent.replace(/^---\s*[\s\S]*?\n---\s*\n?/, '');
    }
    if (language === 'json') {
        const blockRegex = /`{3,}(?:json|)\s*([\s\S]*?)`{3,}/gi;
        const matches = [...displayContent.matchAll(blockRegex)];
        if (matches.length > 1) {
            const parsedArray: any[] = [];
            for (const match of matches) {
                const raw = stripJsonComments(match[1].trim());
                const cleaned = cleanJsonLikeAIOutput(raw);
                const { parsed } = safeJsonParse(cleaned);
                if (parsed) {
                    parsedArray.push(parsed);
                }
            }
            return JSON.stringify(parsedArray, null, 2);
        } else if (matches.length === 1) {
            const raw = stripJsonComments(matches[0][1].trim());
            const cleaned = cleanJsonLikeAIOutput(raw);
            return cleaned;
        } else {
            const cleaned = cleanJsonLikeAIOutput(displayContent);
            return cleaned;
        }
    }
    displayContent = displayContent.replace(/`{3,}[a-zA-Z]*\s*\n?/g, '');
    displayContent = displayContent.replace(/`{3,}\s*$/g, '');
    if (language !== 'text') {
        const regex = new RegExp(language, 'gi');
        displayContent = displayContent.replace(regex, '');
    }
    displayContent = displayContent.trim();
    return displayContent;
}

export const getProvider = (): BrowserProvider => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("No Ethereum provider found");
    }
    return new BrowserProvider((window as any).ethereum);
};

export function throttle<T extends (...args: any[]) => void>(fn: T, ms = 2000): T {
    let last = 0;
    let timer: any;
    return ((...args: any[]) => {
        const now = Date.now();
        if (now - last > ms) { last = now; fn(...args); }
        else {
            clearTimeout(timer);
            timer = setTimeout(() => { last = Date.now(); fn(...args); }, ms - (now - last));
        }
    }) as T;
}

export const makeLogger = (ingestUrl?: string) => {
    const send = throttle((level: 'info' | 'warn' | 'error', message: string, meta?: any) => {
        try {
            if (!ingestUrl) return;
            fetch(ingestUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level, message, meta, ts: new Date().toISOString() }),
            }).catch(() => { });
        } catch { }
    }, 2500);

    return {
        info: (m: string, meta?: any) => { console.info(m, meta); send('info', m, meta); },
        warn: (m: string, meta?: any) => { console.warn(m, meta); send('warn', m, meta); },
        error: (m: string, meta?: any) => { console.error(m, meta); send('error', m, meta); },
    };
};

const RTL_LANGS = ['ar', 'dv', 'fa', 'he', 'ku', 'ps', 'ur', 'yi'];
export function localeToDir(locale?: string) {
    const code = (locale || '').split('-')[0].toLowerCase();
    return RTL_LANGS.includes(code) ? 'rtl' : 'ltr';
}

/** Intl helpers */
export function formatNumber(n: number, locale = 'en-US') {
    return new Intl.NumberFormat(locale).format(n);
}
export function formatDateTime(d: number | Date, locale = 'en-US') {
    try {
        return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(typeof d === 'number' ? new Date(d) : d);
    } catch {
        return new Date(typeof d === 'number' ? d : d.valueOf()).toLocaleString();
    }
}


export function getPath(obj: AnyObj, path: string) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}


export const joinUrl = (base: string, path: string) =>
    `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

function readEnv(key: string): string | undefined {
    if (typeof process !== "undefined" && process.env) {
        return process.env[key];
    }
    if (typeof window !== "undefined") {
        return (window as any)[key];
    }
    return undefined;
}

export function expandEnvTemplates(str: string): string {
    return str.replace(/\$\{([A-Z0-9_]+)\}/g, (_, k) => readEnv(k) || "");
}
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

export function resolveBinding(
    val: any,
    state: AnyObj,
    t: (k: string) => string
): any {
    if (val == null) return "";

    // 🔹 Normalize to a simple key string
    const key =
        typeof val === "object" && "binding" in val
            ? String(val.binding)
            : String(val);

    // --- i18n.key ---
    if (key.startsWith("i18n.")) {
        const k = key.slice(5);
        const out = t(k);
        return out === k ? "" : out;
    }

    // --- translations.<locale>.<path> ---
    if (key.startsWith("translations.")) {
        const parts = key.split(".");
        if (parts.length >= 3) {
            const locale = parts[1];
            const path = parts.slice(2).join(".");
            let out = t(`${locale}.${path}`);
            if (out !== `${locale}.${path}`) return out;
            out = t(path);
            return out === path ? "" : out;
        }
    }

    // --- state.<path> ---
    if (key.startsWith("state.")) {
        const valFromState = getPath(state, key.slice(6));
        return sanitizeValue(valFromState);
    }
    // Handle strings (support state.* and form.*)
    if (key.startsWith("form.")) {
        const valFromState = getPath(state, key.slice(5));
        return sanitizeValue(valFromState);
    }
    if (key.startsWith("{form.")) {
        const valFromState = getPath(state, key.slice(6));
        return sanitizeValue(valFromState);
    }

    // --- env / config lookups ---
    if (key.startsWith("env.")) return sanitizeValue(readEnv(key.slice(4)));
    if (/^[A-Z0-9_]+$/.test(key)) return sanitizeValue(readEnv(key));
    if (key.includes("API_ENDPOINT")) return sanitizeValue(readEnv("API_ENDPOINT"));

    // --- auto-detect translation-like keys (fallback heuristic) ---
    // e.g. "hero.title", "footer.contact", "features.cards.0.text"
    if (
        key.includes(".") &&                             // has dot notation
        !key.startsWith("state.") &&
        !key.startsWith("env.") &&
        !key.startsWith("data.") &&
        !key.startsWith("config.") &&
        !key.startsWith("props.") &&
        !key.match(/^[A-Z0-9_]+$/)                       // not constant/ENV
    ) {
        const out = t(key);
        if (out && out !== key) return out;

        // Try resolving without prefix if t() has language namespace internally
        const parts = key.split(".");
        if (parts.length > 1) {
            const sub = parts.slice(1).join(".");
            const subOut = t(sub);
            if (subOut && subOut !== sub) return subOut;
        }
    }

    // --- fallback: try state lookup or return literal ---
    const maybe = getPath(state, key);
    if (maybe !== undefined && maybe !== null)
        return sanitizeValue(typeof maybe === "string" ? expandEnvTemplates(maybe) : maybe);

    // --- final fallback: return as literal ---
    return sanitizeValue(key);
}

const isPlainObj = (v: any) =>
    v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && !(v instanceof File) && !(v instanceof FormData);

export function deepResolveBindings(
    input: any,
    state: any,
    t: (k: string) => string
): any {
    if (input == null) return input;

    if (Array.isArray(input)) {
        return input.map(v => {
            if (isPlainObj(v)) {
                // option object like { value, label }
                const out: any = {};
                for (const [k, val] of Object.entries(v)) {
                    out[k] = deepResolveBindings(val, state, t);
                }
                return out;
            }
            // primitive string/number/boolean
            return deepResolveBindings(v, state, t);
        });
    }

    // only treat *plain* objects specially
    if (isPlainObj(input)) {
        // direct binding object
        if ('binding' in input) return resolveBinding(input, state, t);

        const out: any = {};
        for (const [k, v] of Object.entries(input)) {
            out[k] = deepResolveBindings(v, state, t);
        }
        return out;
    }

    // strings can be binding-like (translations.*, i18n.*, ENV)
    if (typeof input === 'string') return resolveBinding(input, state, t);

    return input;
}

export function setPath<T extends AnyObj>(obj: T, path: string, value: any): T {
    if (!path) return obj;
    const parts = path.split('.');
    const clone: any = Array.isArray(obj) ? [...(obj as any)] : { ...obj };
    let cur: any = clone;
    for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i];
        const next = cur[k];
        cur[k] =
            next && typeof next === 'object'
                ? (Array.isArray(next) ? [...next] : { ...next })
                : {};
        cur = cur[k];
    }
    cur[parts[parts.length - 1]] = value;
    return clone;
}


/**
 * Resolve animation props/styles/classes from AnimationSpec.
 * Supports animate.css, CSS (inline), framer-motion, and GSAP.
 */
export function resolveAnimation(animation?: AnimationSpec) {
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


/**
 * Validates input data against a regex or schema.
 * @param value - Input value to validate.
 * @param regex - Optional regex pattern.
 * @returns Boolean indicating validity.
 */
export function validateInput(value: any, regex?: string): boolean {
    if (regex) {
        try {
            return new RegExp(regex).test(String(value));
        } catch {
            return false;
        }
    }
    return true;
}


export const sortRows = (rows: any[], sortKey: string | null, dir: 'asc' | 'desc' | null) => {
    if (!sortKey || !dir) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
        const av = a?.[sortKey]; const bv = b?.[sortKey];
        if (av == null && bv == null) return 0;
        if (av == null) return dir === 'asc' ? -1 : 1;
        if (bv == null) return dir === 'asc' ? 1 : -1;
        if (av < bv) return dir === 'asc' ? -1 : 1;
        if (av > bv) return dir === 'asc' ? 1 : -1;
        return 0;
    });
    return copy;
};

export const filterRows = (rows: any[], filters: Record<string, string>) => {
    const active = Object.entries(filters).filter(([, v]) => v?.trim());
    if (!active.length) return rows;
    return rows.filter(r =>
        active.every(([k, v]) => String(r?.[k] ?? '').toLowerCase().includes(String(v).toLowerCase()))
    );
};

export function isVisible(visibility: VisibilityControl | undefined, state: AnyObj, t: (key: string) => string): boolean {
    if (!visibility || !visibility.condition) return true;
    const { key, op, value } = visibility.condition;
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
}
/**
 * Convert schema style props into Tailwind class names.
 * Fallback to inline-safe values for unsupported cases.
 */
export function classesFromStyleProps(styles?: StyleProps): string {
    if (!styles) return "";
    let classes = styles.className || "";

    if (styles.responsiveClasses) {
        classes += " " + Object.values(styles.responsiveClasses).join(" ");
    }

    if (styles.background) {
        switch (styles.background.type) {
            case "color":
                // prefer Tailwind color tokens; fallback inline handled elsewhere
                classes += ` bg-[${styles.background.value}]`;
                break;
            case "gradient":
                // expect "from-xxx to-yyy" format
                classes += ` bg-gradient-to-r ${styles.background.value}`;
                break;
            case "image":
            case "video":
                classes += ` bg-[url('${styles.background.value}')] bg-cover`;
                break;
        }
        if (styles.background.overlayClass) {
            classes += ` ${styles.background.overlayClass}`;
        }
    }

    return classes.trim();
}

/**
 * Convert schema accessibility props to React-friendly attributes.
 */
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
export function getAllScreenImages(logo: string, screenJson: UIDefinition | null) {
    const images: Array<string> = [logo];
    if (screenJson) {
        screenJson.screens = screenJson.screens || [];
        screenJson.screens.forEach((screen: any) => {
            if (!screen || !screen.elements) return;
            screen.elements.forEach((el: any) => {
                if (el.type === 'image') {
                    const imgEl = el as ImageElement;
                    if (imgEl.src) {
                        images.push(imgEl.src);
                    }
                }
            });
        });
    }
    return images;
}
function getSocialLinks(brand: Brand | undefined): string[] {
    if (!brand?.socialMedia) return [];

    return Object.values(brand.socialMedia).filter(
        (url): url is string => typeof url === 'string' && url.trim().startsWith('http')
    );
}
export async function getMetaData(route: IRoute, project: UIProject, base_url: string, screenDefinition?: UIDefinition | null,): Promise<AnyObj> {
    try {
        const meta = route.metadata ?? {};
        const logo = project.brand?.logoUrl || '';
        const favIcon = project.brand?.faviconUrl || '';
        const slogan = project.brand?.slogan || '';
        let screenConfigUrl = route.screenConfigUrl;
        let screenJson: UIDefinition | null = screenDefinition || null;
        if (!screenJson) {
            // If no screenConfigUrl is provided, construct default URL from route.label
            if (!screenConfigUrl && route.label) {
                const label = route.label.replace(/\s+/g, '_');
                screenConfigUrl = `${base_url}/data/${label}_v1.json`; // e.g., /data/Home_v1.json
            }
            if (screenConfigUrl) {
                try {
                    const res = await fetch(screenConfigUrl);
                    if (res.ok) {
                        screenJson = await res.json();
                    }
                } catch (e) {
                    // Ignore fetch errors for metadata
                }
            }
        }
        const images: Array<string> = getAllScreenImages(logo, screenJson);
        const title = typeof meta.title === 'string' ? meta.title : meta.openGraph?.title || meta.twitter?.title || project.brand?.name || 'AltCodePro';
        const description = typeof meta.description === 'string' ? meta.description : meta.openGraph?.description || meta.twitter?.description || project.brand?.slogan || '';
        const uniqueImages = [...new Set(images.filter(Boolean))];
        const og = meta.openGraph ?? {};
        const twitter = meta.twitter ?? {};
        const obj: any = {
            title: title,
            description: description,
            keywords: meta.keywords,
            applicationName: project.brand?.name,
            manifest: '/manifest.webmanifest',
            icons: {
                icon: favIcon || uniqueImages?.[0] || '/favicon.ico',
                shortcut: favIcon || uniqueImages?.[0] || '/favicon.ico',
                apple: favIcon || uniqueImages?.[0] || '/favicon.ico',
                other: [
                    { rel: 'apple-touch-icon', url: favIcon || uniqueImages?.[0] || '/favicon.ico' },
                    { rel: 'apple-touch-icon-precomposed', url: favIcon || uniqueImages?.[0] || '/favicon.ico' },
                ],
            },
            authors: [{ 'name': 'AltCodePro', 'url': 'https://altcode.pro' }],
            creator: 'AltCodePro',
            publisher: 'AltCodePro',
            formatDetection: meta.formatDetection,
            openGraph: {
                title: og.title || title,
                description: og.description || description,
                url: og.url,
                siteName: og.siteName,
                images: uniqueImages
            },
            twitter: {
                site: project?.globalConfig?.metadata?.twitter?.site || '@AltCodePro',
                title: twitter.title || title,
                creator: 'AltCodePro',
                description: twitter.description || description || '',
                images: uniqueImages.length > 0 ? uniqueImages[0] : undefined,
            },
            pinterest: project?.globalConfig?.metadata?.pinterest ?? undefined,
            facebook: project?.globalConfig?.metadata?.facebook,
            verification: project?.globalConfig?.metadata?.verification || {},
            appleWebApp: {
                title: project.brand?.name || 'AltCodePro',
                capable: true,
                statusBarStyle: 'default',
                startupImage: logo
                    ? [{ url: logo }]
                    : uniqueImages.length > 0
                        ? [{ url: uniqueImages[0] }]
                        : undefined,
            },
            itunes: project?.globalConfig?.metadata?.itunes ?? undefined,
            bookmarks: project?.globalConfig?.metadata?.bookmarks ?? undefined,
            abstract: slogan,
            category: project?.globalConfig?.metadata?.category || undefined,
            classification: project?.globalConfig?.metadata?.classification || undefined,
        };
        if (base_url) {
            obj.metadataBase = new URL(base_url);
        }
        obj.alternates = {
            canonical: obj.openGraph?.url || `${base_url}${route.href}`
        };
        return obj;
    } catch (error) {
        return {
            title: project.brand?.name || 'AltCodePro'
        }
    }
}

export async function getJSONLD(
    route: IRoute,
    project: UIProject,
    base_url: string = '',
    screenDefinition?: UIDefinition | null
): Promise<AnyObj> {
    try {
        const metadata = await getMetaData(route, project, base_url, screenDefinition);
        const globalMeta = project.globalConfig?.metadata ?? {};
        const openGraph = metadata?.openGraph ?? {};
        const title = metadata?.title || project.brand?.name || 'Untitled App';
        const description = metadata?.description || project.brand?.slogan || '';
        const schemaType = globalMeta?.schemaType || 'WebPage';
        const schemaLang = globalMeta?.language || 'en';
        const metadataBase = metadata?.metadataBase?.href || '';
        const pageUrl = openGraph?.url || `${metadataBase}${route.href}` || undefined;
        const images = (metadata?.openGraph?.images as string[]) || [];
        const url = metadata.openGraph?.url || metadata.metadataBase?.href + route.href || '';
        const jsonLd: AnyObj = {
            "@context": "https://schema.org",
            "@type": schemaType,
            "name": title,
            "headline": title,
            "description": description,
            "url": pageUrl,
            "inLanguage": schemaLang,
            "isAccessibleForFree": true,
            "publisher": {
                "@type": "Organization",
                "name": project.brand?.name || 'AltCodePro',
                "url": "https://altcode.pro",
                "logo": {
                    "@type": "ImageObject",
                    "url": project.brand?.logoUrl || '',
                }
            },
            "author": {
                "@type": "Organization",
                "name": project.brand?.name || 'AltCodePro',
                "url": "https://altcode.pro"
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": url
            },
            "sameAs": getSocialLinks(project?.brand) || [],
            "datePublished": route?.metadata?.datePublished || new Date().toISOString(),
            "dateModified": route?.metadata?.dateModified || new Date().toISOString()
        };

        if (images.length > 0) {
            jsonLd.image = images;
        }
        if (metadata.keywords) {
            jsonLd.keywords = Array.isArray(metadata.keywords)
                ? metadata.keywords.join(', ')
                : metadata.keywords;
        }
        if (project?.search?.enabled && project?.search?.path) {
            jsonLd.potentialAction = {
                "@type": "SearchAction",
                "target": `${metadataBase}${project.search.path}?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            };
        }

        if (globalMeta.license) {
            jsonLd.license = globalMeta.license;
        }
        if (globalMeta.category) {
            jsonLd.about = {
                "@type": "Thing",
                name: globalMeta.category,
            };
            jsonLd.genre = globalMeta.category;
        }
        return jsonLd;
    } catch (error) {
        // Graceful fallback for any error
        return {};
    }
}

// utils/validation.ts
export function luhnCheck(cardNumber: string): boolean {
    const sanitized = cardNumber.replace(/\D/g, ""); // remove spaces, dashes
    let sum = 0;
    let shouldDouble = false;

    for (let i = sanitized.length - 1; i >= 0; i--) {
        let digit = parseInt(sanitized.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}

export function anySignal(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    const onAbort = (event: Event) => {
        controller.abort((event.target as AbortSignal).reason);
        signals.forEach(sig => sig.removeEventListener("abort", onAbort));
    };

    for (const sig of signals) {
        if (sig.aborted) {
            controller.abort(sig.reason);
            break;
        }
        sig.addEventListener("abort", onAbort);
    }

    return controller.signal;
}

export const variants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                pirmary: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive:
                    "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
                outline:
                    "border bg-background text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost:
                    "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
                link: "text-primary underline-offset-4 hover:underline",
                success:
                    "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500/40 dark:bg-green-700 dark:hover:bg-green-800",
                danger:
                    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40 dark:bg-red-700 dark:hover:bg-red-800",
                warning:
                    "bg-yellow-500 text-black hover:bg-yellow-600 focus-visible:ring-yellow-500/40 dark:bg-yellow-600 dark:hover:bg-yellow-700",
                info:
                    "bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-500/40 dark:bg-blue-600 dark:hover:bg-blue-700",

            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
                lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
                icon: "size-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

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

    // Normalize to a string
    const key = String(val);

    // Handle state.* (support nested paths like user.state.state.state)
    if (key.startsWith("state.")) {
        const path = key.slice(6);
        const value = getPath(state, path);
        return value !== undefined ? sanitizeValue(value) : key;
    }

    // Handle form.* (for form data in extra)
    if (key.startsWith("form.") && extra) {
        const field = key.slice(5);
        return extra[field] !== undefined ? sanitizeValue(extra[field]) : key;
    }
    if (key.startsWith("{form.") && extra) {
        const field = key.slice(6);
        return extra[field] !== undefined ? sanitizeValue(extra[field]) : key;
    }
    // Return literal value
    return sanitizeValue(key);
}