import stripJsonComments from 'strip-json-comments';
import { BrowserProvider } from 'ethers';
import { AnyObj, VisibilityControl, AccessibilityProps, StyleProps, AnimationSpec, IRoute, UIDefinition, ImageElement, UIProject, Brand } from '@/src/types';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
    return twMerge(clsx(inputs))
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

export const scriptRegistry = {
    walletConnect: async () => {
        const provider = getProvider();
        const accounts = (await provider.send("eth_requestAccounts", [])) as string[];
        const [account] = accounts;
        if (!account) throw new Error("No accounts returned");
        return account;
    },
    walletSign: async (message: string, account?: string) => {
        const provider = getProvider();
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();
        if (account && addr.toLowerCase() !== account.toLowerCase()) {
            throw new Error("Signer/account mismatch");
        }
        return signer.signMessage(message);
    },

    validateInput: (value: string, regex: string) => {
        return new RegExp(regex).test(value);
    },
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

function expandEnvTemplates(str: string): string {
    return str.replace(/\$\{([A-Z0-9_]+)\}/g, (_, k) => readEnv(k) || "");
}
export function resolveBinding(val: any, state: AnyObj, t: (k: string) => string): any {
    if (val == null) return val;

    if (typeof val === "object" && "binding" in val) {
        const key = String(val.binding);

        // i18n translations
        if (key.startsWith("i18n.")) {
            const k = key.slice(5);
            const out = t(k);
            return out === k ? "" : out;
        }
        if (key.startsWith("translations.")) {
            const parts = key.split(".");
            if (parts.length >= 3) {
                const path = parts.slice(2).join(".");
                const out = t(path);
                return out === path ? "" : out;
            }
        }

        // State lookup
        if (key.startsWith("state.")) {
            const valFromState = getPath(state, key.slice(6));
            // return [] instead of undefined for options
            if (Array.isArray(valFromState)) return valFromState;
            return valFromState ?? null;
        }

        // env.* lookup
        if (key.startsWith("env.")) return readEnv(key.slice(4));

        // Direct ENV key
        if (/^[A-Z0-9_]+$/.test(key)) return readEnv(key);

        // Any reference mentioning API_ENDPOINT
        if (key.includes("API_ENDPOINT")) return readEnv("API_ENDPOINT");

        // fallback to state full path
        const maybe = getPath(state, key);
        return typeof maybe === "string" ? expandEnvTemplates(maybe) : maybe;
    }

    return val;
}

const isPlainObj = (v: any) =>
    v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && !(v instanceof File) && !(v instanceof FormData);

export function deepResolveBindings(input: any, state: any, t: (k: string) => string): any {
    if (input == null) return input;
    if (Array.isArray(input)) return input.map(v => deepResolveBindings(v, state, t));
    if (isPlainObj(input)) {
        if ('binding' in input) return resolveBinding(input, state, t);
        const out: any = {};
        for (const [k, v] of Object.entries(input)) out[k] = deepResolveBindings(v, state, t);
        return out;
    }
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
 * Generates Framer Motion animation props.
 * @param a - Animation specification.
 * @returns Animation props.
 */
export function motionFromAnimation(a?: AnimationSpec) {
    if (!a) return {} as Record<string, any>;
    return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: {
            duration: a.duration ? a.duration / 1000 : 0.3,
            delay: a.delay || 0,
            repeat: a.repeat === 'infinite' ? Infinity : a.repeat,
            ease: a.easing || 'easeInOut',
        },
    } as Record<string, any>;
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
    if (!visibility) return true;
    const { key, operator, value } = visibility.condition;
    const resolvedKey = resolveBinding(key, state, t);
    const resolvedValue = resolveBinding(value, state, t);

    switch (operator) {
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

export function classesFromStyleProps(styles?: StyleProps): string {
    if (!styles) return "";
    let classes = styles.className || "";
    if (styles.responsiveClasses) {
        classes += " " + Object.values(styles.responsiveClasses).join(" ");
    }
    if (styles.customCss) {
        // Assume customCss is a string of Tailwind classes or raw CSS (handled by a CSS-in-JS solution)
        classes += " " + styles.customCss;
    }
    if (styles.background) {
        switch (styles.background.type) {
            case "color":
                classes += ` bg-[${styles.background.value}]`;
                break;
            case "gradient":
                classes += ` bg-gradient-to-r ${styles.background.value}`;
                break;
            case "image":
                classes += ` bg-[url(${styles.background.value})] bg-cover`;
                break;
            case "video":
                classes += ` bg-[url(${styles.background.value})] bg-cover`;
                break;
        }
        if (styles.background.overlayClass) {
            classes += ` ${styles.background.overlayClass}`;
        }
    }
    return classes.trim();
}

export function getAccessibilityProps(accessibility?: AccessibilityProps): Record<string, any> {
    if (!accessibility) return {};
    return {
        "aria-label": resolveBinding(accessibility.ariaLabel, {}, () => ""),
        role: accessibility.ariaRole,
        "aria-hidden": accessibility.ariaHidden,
        tabIndex: accessibility.tabIndex,
        "aria-description": resolveBinding(accessibility.screenReaderText, {}, () => ""),
        focusable: accessibility.focusable,
    };
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
            pagination: meta.pagination,
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
        // Optional: Add structured search support
        if (project.globalConfig?.metadata?.search?.enabled && globalMeta?.search?.path) {
            jsonLd.potentialAction = {
                "@type": "SearchAction",
                "target": `${metadataBase}${globalMeta.search.path}?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            };
        }
        if (globalMeta.search?.enabled && globalMeta.search.path) {
            jsonLd.potentialAction = {
                "@type": "SearchAction",
                target: `${url}${globalMeta.search.path}?q={search_term_string}`,
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
