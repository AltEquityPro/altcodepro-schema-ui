// src/lib/utils.ts
import stripJsonComments from 'strip-json-comments';
import { BrowserProvider } from 'ethers';
import { AnyObj, VisibilityControl, AccessibilityProps, StyleProps, IRoute, UIDefinition, ImageElement, UIProject, Brand, DataSource } from '../types';
import { clsx, type ClassValue } from "clsx"
// import { twMerge } from "tailwind-merge"
import { cva } from 'class-variance-authority';

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

    // 🔹 Normalize value to string
    const key =
        typeof val === "object" && "binding" in val
            ? String(val.binding)
            : String(val);

    // --- Direct translation calls like {{t('key')}} ---
    const tCallPattern = /\{\{\s*t\(['"`]([^'"`]+)['"`]\)\s*\}\}/g;
    if (tCallPattern.test(key)) {
        return key.replace(tCallPattern, (_, k) => t(k) || "");
    }

    // --- i18n.<key> ---
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

    // --- form.<path> ---
    if (key.startsWith("form.")) {
        const valFromState = getPath(state, key.slice(5));
        return sanitizeValue(valFromState);
    }
    if (key.startsWith("{form.") || key.startsWith("{{form.")) {
        const cleaned = key.replace(/^\{+\s*|\s*\}+$/g, "");
        const valFromState = getPath(state, cleaned.slice(5));
        return sanitizeValue(valFromState);
    }

    // --- env/config ---
    if (key.startsWith("env.")) return sanitizeValue(readEnv(key.slice(4)));
    if (/^[A-Z0-9_]+$/.test(key)) return sanitizeValue(readEnv(key));
    if (key.includes("API_ENDPOINT")) return sanitizeValue(readEnv("API_ENDPOINT"));

    // --- generic template placeholders ---
    const templatePattern =
        /\{\{\s*([\w\.\[\]_]+)\s*\}\}|\{([\w\.\[\]_]+)\}/g;
    if (templatePattern.test(key)) {
        templatePattern.lastIndex = 0;
        return key.replace(templatePattern, (_, p1, p2) => {
            const expr = p1 || p2;
            const inner = resolveBinding(expr, state, t);
            return inner == null ? "" : String(inner);
        });
    }

    // --- heuristic translation-like fallback ---
    if (
        key.includes(".") &&
        !key.startsWith("state.") &&
        !key.startsWith("env.") &&
        !key.startsWith("data.") &&
        !key.startsWith("config.") &&
        !key.startsWith("props.") &&
        !key.match(/^[A-Z0-9_]+$/)
    ) {
        const out = t(key);
        if (out && out !== key) return out;
        const parts = key.split(".");
        if (parts.length > 1) {
            const sub = parts.slice(1).join(".");
            const subOut = t(sub);
            if (subOut && subOut !== sub) return subOut;
        }
    }

    // --- fallback: state lookup or literal ---
    const maybe = getPath(state, key);
    if (maybe !== undefined && maybe !== null)
        return sanitizeValue(
            typeof maybe === "string" ? expandEnvTemplates(maybe) : maybe
        );

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
 * Supports animate.css.
 */
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

export function luhnCheck(cardNumber: string): boolean {
    const sanitized = cardNumber.replace(/\D/g, "");
    if (!sanitized.length) return false;
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

/**
 * Resolve a path or string containing runtime bindings.
 * Supports both {state.path} and {{state.path}} formats.
 */
export function resolveDynamicPath(path: string, state: Record<string, any>): string {
    if (!path) return path;

    path = path.replace(/\{\{\s*([\w\.\[\]_]+)\s*\}\}/g, (_, key) => {
        const value = key.split('.').reduce((acc: any, k: any) => acc?.[k], state);
        return value ?? '';
    });

    path = path.replace(/\{([\w\.\[\]_]+)\}/g, (_, key) => {
        const value = key.split('.').reduce((acc: any, k: any) => acc?.[k], state);
        return value ?? '';
    });

    return path;
}

export function normalizeBindings(json: any) {
    const str = JSON.stringify(json)
        .replace(/\{\{\s*([\w\.\[\]_]+)\s*\}\}/g, '{$1}');
    return JSON.parse(str);
}

/**
 * Resolve dynamic values in DataSource definitions.
 * Supports both {key} and {{key}} formats.
 */
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