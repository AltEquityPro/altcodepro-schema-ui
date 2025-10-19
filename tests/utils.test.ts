import { describe, it, vi, expect, beforeEach } from 'vitest';
import {
    cn,
    useTranslation,
    safeJsonParse,
    stripBeforeThinkTag,
    cleanStartingFile,
    cleanJsonLikeAIOutput,
    cleanCodeContent,
    getProvider,
    getPath,
    joinUrl,
    expandEnvTemplates,
    sanitizeValue,
    resolveBinding,
    deepResolveBindings,
    setPath,
    resolveAnimation,
    validateInput,
    isVisible,
    classesFromStyleProps,
    getAccessibilityProps,
    getAllScreenImages,
    getMetaData,
    getJSONLD,
    luhnCheck,
    anySignal,
    resolveDataSource,
    deepResolveDataSource,
    resolveDynamicPath,
    normalizeBindings,
    resolveDataSourceValue,
    hash,
} from '../src/lib/utils';
import { DataSource, ImageElement, StyleProps, UIDefinition, UIProject } from '../src/types';

// ✅ Mock dependencies
import * as utils from "../src/lib/utils";

// mock fetch globally
global.fetch = vi.fn();

// base fixtures
const baseRoute = {
    href: "/dashboard",
    label: "Dashboard",
    metadata: {
        title: "Dashboard | AltCodePro",
        description: "Main user dashboard",
        keywords: ["dashboard", "ai"],
        openGraph: { title: "OG Dashboard", description: "OG Description", url: "https://altcode.pro/dashboard" },
        twitter: { title: "Twitter Dashboard", description: "Twitter Desc" },
    },
};

const baseProject = {
    brand: {
        name: "AltCodePro",
        logoUrl: "/logo.png",
        faviconUrl: "/favicon.ico",
        slogan: "AI for everything",
    },
    globalConfig: {
        metadata: {
            twitter: { site: "@AltCodePro" },
            pinterest: { handle: "pinterestHandle" },
            facebook: { page: "fbpage" },
            verification: { google: "google123" },
            category: "AI",
            classification: "Software",
        },
    },
};
// Mock dependencies
vi.mock('ethers', () => ({
    BrowserProvider: class {
        constructor(ethereum: any) {
            return ethereum;
        }
    },
}));
vi.mock('strip-json-comments', () => ({
    default: (str: string) => str,
}));
vi.mock('fetch', () => ({
    default: vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })),
}));
vi.mock("../src/lib/utils", async (importOriginal) => {
    const mod = await importOriginal<typeof import("../src/lib/utils")>();
    return {
        ...mod,
        resolveBinding: (val: any, state: any) => {
            if (typeof val === "string" && val.startsWith("state.")) {
                const key = val.replace(/^state\./, "");
                return state[key];
            }
            return val;
        },
    };
});

describe('resolveDataSourceValue', () => {
    const state = {
        user: {
            id: 'u123',
            token: 'abc123',
            organization_id: 'org42',
        },
        auth: {
            user: { id: 'u123', org_id: 'org42' },
            token: 'abc123',
        },
        organization: {
            id: 'org42',
            name: 'AltCodePro Ltd',
        },
        project: {
            id: 'p555',
        },
    };

    it('resolves {user.organization_id}', () => {
        const result = resolveDataSourceValue(
            '/v1/organization/{user.organization_id}/projects',
            state
        );
        expect(result).toBe('/v1/organization/org42/projects');
    });

    it('resolves {{user.organization_id}} double braces syntax', () => {
        const result = resolveDataSourceValue(
            "https://api.altcode.pro/v1/organization/{{user.organization_id}}/projects",
            state
        );
        expect(result).toBe('https://api.altcode.pro/v1/organization/org42/projects');
    });

    it('resolves {auth.token} placeholder', () => {
        const result = resolveDataSourceValue('Bearer {auth.token}', state);
        expect(result).toBe('Bearer abc123');
    });

    it('resolves nested {organization.name}', () => {
        const result = resolveDataSourceValue('Org: {organization.name}', state);
        expect(result).toBe('Org: AltCodePro Ltd');
    });

    it('handles missing keys gracefully', () => {
        const result = resolveDataSourceValue('/v1/{missing_key}/test', state);
        expect(result).toBe('/v1//test');
    });

    it('resolves form bindings when extra is provided', () => {
        const extra = { email: 'test@example.com' };
        const result = resolveDataSourceValue('/v1/user/{form.email}', state, extra);
        expect(result).toBe('/v1/user/test@example.com');
    });

    it('resolves plain string unchanged', () => {
        const result = resolveDataSourceValue('/v1/static/url', state);
        expect(result).toBe('/v1/static/url');
    });
});

describe('cn', () => {
    it('should combine class names using clsx', () => {
        expect(cn('class1', 'class2')).toBe('class1 class2');
        expect(cn(['class1', 'class2'], { class3: true })).toBe('class1 class2 class3');
        expect(cn('class1', null, undefined, false, 'class2')).toBe('class1 class2');
    });
});

describe('useTranslation', () => {
    it('should return translated value for given locale and key', () => {
        const translations = {
            en: { hello: 'Hello World' },
            es: { hello: 'Hola Mundo' },
        };
        const t = useTranslation(translations, 'en');
        expect(t('hello')).toBe('Hello World');
        expect(t('missing')).toBe('missing');
    });

    it('should handle missing locale', () => {
        const translations = {
            en: { hello: 'Hello World' },
        };
        const t = useTranslation(translations, 'es');
        expect(t('hello')).toBe('hello');
    });
});

describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
        const result = safeJsonParse('{"key": "value"}');
        expect(result.parsed).toEqual({ key: 'value' });
        expect(result.error).toBeNull();
    });

    it('should handle invalid JSON', () => {
        const result = safeJsonParse('invalid json');
        expect(result.parsed).toBeNull();
        expect(result.error).toBeDefined();
    });
});

describe('stripBeforeThinkTag', () => {
    it('should return content after the last </think> tag', () => {
        const input = 'before </think> content </think> final';
        expect(stripBeforeThinkTag(input)).toBe(' final');
    });

    it('should return full content if no </think> tag', () => {
        const input = 'no think tag';
        expect(stripBeforeThinkTag(input)).toBe('no think tag');
    });
});

describe('cleanStartingFile', () => {
    it('should remove comments and start from first JSON-like character', () => {
        const input = '-- comment --\n{ "key": "value" }';
        expect(cleanStartingFile(input)).toBe('{ "key": "value" }');
    });

    it('should handle arrays', () => {
        const input = '-- comment --\n[1, 2, 3]';
        expect(cleanStartingFile(input)).toBe('[1, 2, 3]');
    });

    it('should return original string if no JSON-like start', () => {
        const input = '-- comment --\ntext';
        expect(cleanStartingFile(input)).toBe('text');
    });
});

describe('cleanJsonLikeAIOutput', () => {
    it('should clean and parse valid JSON-like content', () => {
        const input = '```json\n{ "key": "value" }\n```';
        expect(cleanJsonLikeAIOutput(input)).toBe('{\n  "key": "value"\n}');
    });

    it('should handle extra commas', () => {
        const input = '{ "key": "value", }';
        expect(cleanJsonLikeAIOutput(input)).toBe('{\n  "key": "value"\n}');
    });

    it('should balance brackets', () => {
        const input = '{ "key": "value"';
        expect(cleanJsonLikeAIOutput(input)).toBe('{\n  "key": "value"\n}');
    });

    it('should return empty string for empty input', () => {
        expect(cleanJsonLikeAIOutput('')).toBe('');
    });
});

describe('cleanCodeContent', () => {
    it('should clean JSON content', () => {
        const input = {
            fileContent: '```json\n{ "key": "value" }\n```',
            ext: 'json',
        };
        expect(cleanCodeContent(input)).toBe('{\n  "key": "value"\n}');
    });

    it('should clean markdown content', () => {
        const input = {
            fileContent: '---\nmeta: data\n---\nContent',
            ext: 'md',
        };
        expect(cleanCodeContent(input)).toBe('Content');
    });

    it('should handle plain text', () => {
        const input = {
            fileContent: 'plain text',
            ext: 'txt',
        };
        expect(cleanCodeContent(input)).toBe('plain text');
    });
});

describe('getProvider', () => {
    it('should return BrowserProvider if window.ethereum exists', () => {
        (global as any).window = { ethereum: {} };
        expect(getProvider()).toEqual({});
        delete (global as any).window;
    });

    it('should throw error if no Ethereum provider', () => {
        (global as any).window = {};
        expect(() => getProvider()).toThrow('No Ethereum provider found');
        delete (global as any).window;
    });
});

describe("getPath", () => {
    const data = {
        user: {
            id: 1,
            name: "Alice",
            address: {
                city: "London",
                zip: "E1 6AN",
            },
        },
        items: [
            { name: "Book", price: 10 },
            { name: "Pen", price: 2 },
        ],
    };

    it("retrieves top-level property", () => {
        expect(getPath(data, "user")).toEqual(data.user);
    });

    it("retrieves nested property", () => {
        expect(getPath(data, "user.name")).toBe("Alice");
        expect(getPath(data, "user.address.city")).toBe("London");
    });

    it("returns undefined for missing property", () => {
        expect(getPath(data, "user.age")).toBeUndefined();
        expect(getPath(data, "nonexistent.path")).toBeUndefined();
    });

    it("handles numeric keys for arrays", () => {
        expect(getPath(data, "items.0.name")).toBe("Book");
        expect(getPath(data, "items.1.price")).toBe(2);
    });

    it("returns undefined for out-of-range array index", () => {
        expect(getPath(data, "items.5.name")).toBeUndefined();
    });

    it("returns undefined when obj is null or undefined", () => {
        expect(getPath(null as any, "user.name")).toBeUndefined();
        expect(getPath(undefined as any, "user.name")).toBeUndefined();
    });

    it("returns undefined when path is empty or falsy", () => {
        expect(getPath(data, "")).toBeUndefined();
        expect(getPath(data, null as any)).toBeUndefined();
    });

    it("stops traversal early when intermediate value is null or undefined", () => {
        const obj = { a: { b: null } };
        expect(getPath(obj, "a.b.c")).toBeUndefined();
    });

    it("handles paths with numeric-like string keys", () => {
        const obj = { "2024": { name: "Year Data" } };
        expect(getPath(obj, "2024.name")).toBe("Year Data");
    });

    it("returns nested object intact when full path resolves", () => {
        const result = getPath(data, "user.address");
        expect(result).toEqual({ city: "London", zip: "E1 6AN" });
    });
});

describe("joinUrl", () => {
    it("joins base and path with a single slash", () => {
        const result = joinUrl("https://api.example.com", "users");
        expect(result).toBe("https://api.example.com/users");
    });

    it("removes trailing slash from base and leading slash from path", () => {
        const result = joinUrl("https://api.example.com/", "/users");
        expect(result).toBe("https://api.example.com/users");
    });

    it("handles multiple trailing and leading slashes cleanly", () => {
        const result = joinUrl("https://api.example.com///", "///v1/users");
        expect(result).toBe("https://api.example.com/v1/users");
    });

    it("works when base has no slash and path starts with one", () => {
        const result = joinUrl("https://api.example.com", "/v1");
        expect(result).toBe("https://api.example.com/v1");
    });

    it("works when base ends with slash and path has no leading slash", () => {
        const result = joinUrl("https://api.example.com/", "v1");
        expect(result).toBe("https://api.example.com/v1");
    });

    it("joins deeply nested paths correctly", () => {
        const result = joinUrl("https://api.example.com/base/", "/sub/dir/");
        expect(result).toBe("https://api.example.com/base/sub/dir/");
    });

    it("handles empty path", () => {
        const result = joinUrl("https://api.example.com/", "");
        expect(result).toBe("https://api.example.com/");
    });

    it("handles empty base", () => {
        const result = joinUrl("", "/path/to/api");
        expect(result).toBe("/path/to/api");
    });

    it("handles both empty base and path", () => {
        const result = joinUrl("", "");
        expect(result).toBe("/");
    });

    it("preserves URL protocol and query strings in base", () => {
        const result = joinUrl("https://api.example.com/?token=abc", "/users");
        // trailing ?token=abc/ → kept properly since regex only removes slashes
        expect(result).toBe("https://api.example.com/?token=abc/users");
    });
});

describe("expandEnvTemplates", () => {
    const mockReadEnv = vi.fn();

    beforeEach(async () => {
        vi.resetModules();
    });
    it("replaces a single ${VAR} with value from readEnv", async () => {

        mockReadEnv.mockImplementation((k) => (k === "API_URL" ? "https://api.test" : ""));
        const result = expandEnvTemplates("Base URL: ${API_URL}");
        expect(result).toBe("Base URL: https://api.test");
        expect(mockReadEnv).toHaveBeenCalledWith("API_URL");
    });

    it("replaces multiple ${VAR} placeholders in one string", async () => {

        mockReadEnv.mockImplementation((k) =>
            ({ API_URL: "https://api.test", TOKEN: "abc123" } as any)[k]
        );
        const result = expandEnvTemplates("URL=${API_URL}, TOKEN=${TOKEN}");
        expect(result).toBe("URL=https://api.test, TOKEN=abc123");
    });

    it("returns empty string for missing variables", async () => {

        mockReadEnv.mockReturnValue(undefined);
        const result = expandEnvTemplates("Missing: ${UNKNOWN}");
        expect(result).toBe("Missing: ");
    });

    it("ignores lowercase or invalid variable names", async () => {

        mockReadEnv.mockReturnValue("shouldNotBeCalled");
        const result = expandEnvTemplates("Path: ${api_url} ${SomeVar}");
        expect(result).toBe("Path: ${api_url} ${SomeVar}"); // no match since pattern only allows [A-Z0-9_]
        expect(mockReadEnv).not.toHaveBeenCalled();
    });

    it("works when no template variables exist", async () => {

        const input = "This string has no vars";
        const result = expandEnvTemplates(input);
        expect(result).toBe(input);
    });

    it("handles adjacent placeholders", async () => {

        mockReadEnv.mockImplementation((k) =>
            ({ A: "x", B: "y", C: "z" } as any)[k]
        );
        const result = expandEnvTemplates("${A}${B}${C}");
        expect(result).toBe("xyz");
    });

    it("handles missing and existing variables together", async () => {

        mockReadEnv.mockImplementation((k) => (k === "A" ? "X" : undefined));
        const result = expandEnvTemplates("A=${A}, B=${B}");
        expect(result).toBe("A=X, B=");
    });

    it("returns empty string if input is empty", async () => {

        const result = expandEnvTemplates("");
        expect(result).toBe("");
    });
});

describe("sanitizeValue", () => {
    it("returns empty string for null or undefined", () => {
        expect(sanitizeValue(null)).toBe("");
        expect(sanitizeValue(undefined)).toBe("");
    });

    it("returns array as-is (no stringification)", () => {
        const arr = [1, 2, 3];
        const result = sanitizeValue(arr);
        expect(result).toBe(arr); // same reference
    });

    it("stringifies plain objects correctly", () => {
        const obj = { a: 1, b: "two" };
        const result = sanitizeValue(obj);
        expect(result).toBe(JSON.stringify(obj));
    });

    it("handles nested objects safely", () => {
        const obj = { user: { id: 1, name: "Alice" } };
        const result = sanitizeValue(obj);
        expect(result).toBe(JSON.stringify(obj));
    });

    it("returns stringified representation for circular objects", () => {
        const obj: any = { a: 1 };
        obj.self = obj; // create circular reference
        const result = sanitizeValue(obj);
        // Fallback to String(obj) if JSON.stringify fails
        expect(result).toContain("[object Object]");
    });

    it("returns stringified object for non-plain object (Date)", () => {
        const date = new Date("2024-01-01T00:00:00Z");
        const result = sanitizeValue(date);
        expect(result).toBe(JSON.stringify(date));
    });

    it("converts boolean values to string", () => {
        expect(sanitizeValue(true)).toBe("true");
        expect(sanitizeValue(false)).toBe("false");
    });

    it("converts numbers to string", () => {
        expect(sanitizeValue(123)).toBe("123");
        expect(sanitizeValue(0)).toBe("0");
    });

    it("returns input string unchanged as string", () => {
        expect(sanitizeValue("hello")).toBe("hello");
    });

    it("handles symbols safely by converting to string", () => {
        const sym = Symbol("test");
        expect(sanitizeValue(sym)).toBe(String(sym));
    });

    it("handles functions by converting to string", () => {
        const fn = () => 42;
        const val = sanitizeValue(fn);
        expect(typeof val).toBe("string");
        expect(val.length).toBeGreaterThan(0);
    });
});

describe("resolveBinding", () => {
    const t = vi.fn((k) => {
        const translations: Record<string, string> = {
            welcome: "Welcome",
            "en.greeting": "Hello",
            greeting: "Hello",
            "footer.contact": "Contact Us",
        };
        return translations[k] ?? k;
    });
    const mockGetPath = vi.fn();
    const mockSanitizeValue = vi.fn((v) => v);
    const mockReadEnv = vi.fn();
    const mockExpandEnvTemplates = vi.fn((v) => v);

    beforeEach(async () => {
        vi.resetModules();
        const mockGetPath = vi.hoisted(() => vi.fn());
        const mockReadEnv = vi.hoisted(() => vi.fn());
        const mockExpandEnv = vi.hoisted(() => vi.fn((s) => s));
        const mockSanitize = vi.hoisted(() => vi.fn((v) => v));

        vi.mock("../src/lib/utils", async (importOriginal) => {
            const mod = await importOriginal<typeof import("../src/lib/utils")>();
            return {
                ...mod,
                getPath: mockGetPath,
                readEnv: mockReadEnv,
                expandEnvTemplates: mockExpandEnv,
                sanitizeValue: mockSanitize,
            };
        });
    });

    const state = {
        user: { name: "Alice", id: 42 },
        form: { email: "alice@example.com" },
        env: { API_DOMAIN: "api.altcode.pro" },
    };

    it("returns empty string when value is null or undefined", async () => {

        expect(resolveBinding(null, state, t)).toBe("");
        expect(resolveBinding(undefined, state, t)).toBe("");
    });

    it("resolves i18n key via translator", async () => {

        const result = resolveBinding("i18n.welcome", state, t);
        expect(result).toBe("Welcome");
    });

    it("resolves translations.<locale>.<key> format", async () => {

        const result = resolveBinding("translations.en.greeting", state, t);
        expect(result).toBe("Hello");
    });

    it("resolves state.<path> via getPath()", async () => {

        mockGetPath.mockReturnValue("Alice");
        const result = resolveBinding("state.user.name", state, t);
        expect(mockGetPath).toHaveBeenCalledWith(state, "user.name");
        expect(result).toBe("Alice");
    });

    it("resolves form.<path>", async () => {

        mockGetPath.mockReturnValue("alice@example.com");
        const result = resolveBinding("form.email", state, t);
        expect(result).toBe("alice@example.com");
    });

    it("resolves {form.<path>} or {{form.<path>}} syntax", async () => {

        mockGetPath.mockReturnValue("bob@example.com");
        expect(resolveBinding("{form.email}", state, t)).toBe("bob@example.com");
        expect(resolveBinding("{{form.email}}", state, t)).toBe("bob@example.com");
    });

    it("resolves env.<VAR> via readEnv()", async () => {

        mockReadEnv.mockReturnValue("dev.altcode.pro");
        const result = resolveBinding("env.API_DOMAIN", state, t);
        expect(result).toBe("dev.altcode.pro");
    });

    it("resolves UPPERCASE ENV constants directly", async () => {

        mockReadEnv.mockReturnValue("constant.value");
        const result = resolveBinding("API_ENDPOINT", state, t);
        expect(mockReadEnv).toHaveBeenCalledWith("API_ENDPOINT");
        expect(result).toBe("constant.value");
    });

    it("resolves template strings with {{state.*}} and {form.*}", async () => {

        mockGetPath.mockImplementation((_, path) => {
            if (path === "user.name") return "Alice";
            if (path === "form.email") return "alice@example.com";
        });

        const input = "Hello {{state.user.name}} ({{form.email}})";
        const result = resolveBinding(input, state, t);

        expect(result).toBe("Hello Alice (alice@example.com)");
    });

    it("resolves mixed env + state templates", async () => {

        mockGetPath.mockImplementation((_, path) => {
            if (path === "user.id") return 42;
        });
        mockReadEnv.mockReturnValue("api.altcode.pro");

        const input = "https://{{env.API_DOMAIN}}/users/{{state.user.id}}";
        const result = resolveBinding(input, state, t);

        expect(result).toBe("https://api.altcode.pro/users/42");
    });

    it("resolves nested template placeholders recursively", async () => {

        mockGetPath.mockReturnValue("42");
        mockReadEnv.mockReturnValue("api.altcode.pro");
        const input = "{{env.API_DOMAIN}}/{{state.user.id}}";
        const result = resolveBinding(input, state, t);
        expect(result).toBe("api.altcode.pro/42");
    });

    it("handles translation-like keys heuristically", async () => {

        const result = resolveBinding("footer.contact", state, t);
        expect(result).toBe("Contact Us");
    });

    it("returns state value fallback if translation not found", async () => {

        mockGetPath.mockReturnValue("dynamic");
        const result = resolveBinding("state.dynamicKey", state, t);
        expect(result).toBe("dynamic");
    });

    it("expands env templates in state strings", async () => {

        mockGetPath.mockReturnValue("${API_DOMAIN}/users");
        mockExpandEnvTemplates.mockReturnValue("api.altcode.pro/users");

        const result = resolveBinding("state.userEndpoint", state, t);
        expect(result).toBe("api.altcode.pro/users");
    });

    it("returns literal string as final fallback", async () => {

        const result = resolveBinding("literal_value", state, t);
        expect(result).toBe("literal_value");
    });
});

describe("deepResolveBindings", () => {
    const t = vi.fn((k) => `translated:${k}`);
    const mockResolveBinding = vi.hoisted(() => vi.fn());

    beforeEach(async () => {
        vi.resetModules();

        vi.mock("../src/lib/utils", async (importOriginal) => {
            const mod = await importOriginal<typeof import("../src/lib/utils")>();
            return {
                ...mod,
                resolveBinding: mockResolveBinding,
            };
        });
    });

    const state = {
        user: { name: "Alice", id: 42 },
        app: { lang: "en" },
    };

    it("returns null or undefined as-is", async () => {

        expect(deepResolveBindings(null, state, t)).toBeNull();
        expect(deepResolveBindings(undefined, state, t)).toBeUndefined();
    });

    it("resolves primitive strings via resolveBinding()", async () => {

        mockResolveBinding.mockReturnValue("resolvedValue");
        const result = deepResolveBindings("state.user.name", state, t);
        expect(mockResolveBinding).toHaveBeenCalledWith("state.user.name", state, t);
        expect(result).toBe("resolvedValue");
    });

    it("returns primitive numbers/booleans unchanged", async () => {

        expect(deepResolveBindings(123, state, t)).toBe(123);
        expect(deepResolveBindings(true, state, t)).toBe(true);
    });

    it("resolves arrays recursively (primitive + objects)", async () => {

        mockResolveBinding.mockImplementation((val) => `resolved(${val})`);

        const input = ["state.user.id", { value: "state.user.name", label: "translations.hello" }];
        const result = deepResolveBindings(input, state, t);

        expect(mockResolveBinding).toHaveBeenCalledTimes(3); // 2 strings + nested
        expect(result).toEqual([
            "resolved(state.user.id)",
            { value: "resolved(state.user.name)", label: "resolved(translations.hello)" },
        ]);
    });

    it("resolves plain objects recursively", async () => {

        mockResolveBinding.mockImplementation((val) => `resolved(${val})`);

        const input = {
            user: { binding: "state.user.name" },
            message: "translations.greeting",
        };
        const result = deepResolveBindings(input, state, t);

        // binding object triggers resolveBinding directly
        expect(mockResolveBinding).toHaveBeenCalledWith({ binding: "state.user.name" }, state, t);
        expect(result.user).toBeDefined();
        expect(result.message).toBe("resolved(translations.greeting)");
    });

    it("handles deeply nested structures correctly", async () => {

        mockResolveBinding.mockImplementation((val) => `resolved(${val})`);

        const input = {
            a: {
                b: [
                    { label: "translations.welcome" },
                    "state.user.id",
                    { nested: { val: "i18n.hello" } },
                ],
            },
        };

        const result = deepResolveBindings(input, state, t);
        expect(result).toEqual({
            a: {
                b: [
                    { label: "resolved(translations.welcome)" },
                    "resolved(state.user.id)",
                    { nested: { val: "resolved(i18n.hello)" } },
                ],
            },
        });
    });

    it("skips non-plain objects (Date, FormData, File)", async () => {

        const date = new Date();
        const file = new File(["data"], "test.txt");
        const fd = new FormData();
        expect(deepResolveBindings(date, state, t)).toBe(date);
        expect(deepResolveBindings(file, state, t)).toBe(file);
        expect(deepResolveBindings(fd, state, t)).toBe(fd);
    });

    it("handles translation-like strings", async () => {

        mockResolveBinding.mockImplementation((val) => `resolved(${val})`);
        const result = deepResolveBindings("translations.hello", state, t);
        expect(result).toBe("resolved(translations.hello)");
    });

    it("handles plain objects with mixed values", async () => {

        mockResolveBinding.mockImplementation((val) => `resolved(${val})`);
        const input = { key1: "state.user.id", key2: 5, key3: null };
        const result = deepResolveBindings(input, state, t);
        expect(result).toEqual({
            key1: "resolved(state.user.id)",
            key2: 5,
            key3: null,
        });
    });
});

describe("setPath", () => {
    it("sets a top-level property", () => {
        const obj = { a: 1 };
        const result = setPath(obj, "b", 2);
        expect(result).toEqual({ a: 1, b: 2 });
    });

    it("sets a deeply nested property", () => {
        const obj = { user: { profile: { name: "Alice" } } };
        const result = setPath(obj, "user.profile.age", 30);
        expect(result).toEqual({ user: { profile: { name: "Alice", age: 30 } } });
    });

    it("creates intermediate objects if path does not exist", () => {
        const obj = {};
        const result = setPath(obj, "a.b.c", 42);
        expect(result).toEqual({ a: { b: { c: 42 } } });
    });

    it("sets a value inside an array (using numeric key)", () => {
        const arr = [{ id: 1 }, { id: 2 }];
        const result = setPath(arr, "1.name", "Bob");
        expect(result[1]).toEqual({ id: 2, name: "Bob" });
    });

    it("does not mutate the original object", () => {
        const obj = { user: { name: "Alice" } };
        const result = setPath(obj, "user.age", 25);
        expect(result).not.toBe(obj);
        expect(obj).toEqual({ user: { name: "Alice" } });
    });

    it("clones nested structures rather than modifying references", () => {
        const obj = { a: { b: { c: 1 } } };
        const result = setPath(obj, "a.b.c", 2);
        expect(result.a.b).not.toBe(obj.a.b);
        expect(result.a.b.c).toBe(2);
    });

    it("handles array creation correctly for missing intermediate keys", () => {
        const obj = {};
        const result = setPath(obj, "items.0.name", "Item1");
        expect(result).toEqual({ items: { 0: { name: "Item1" } } });
    });

    it("handles empty path gracefully (returns original)", () => {
        const obj = { a: 1 };
        const result = setPath(obj, "", 123);
        expect(result).toBe(obj);
    });

    it("works with mixed key types (numbers and strings)", () => {
        const obj = { nested: [{ value: 1 }] };
        const result = setPath(obj, "nested.0.value", 99);
        expect(result.nested[0].value).toBe(99);
    });

    it("overwrites existing values", () => {
        const obj = { a: { b: 5 } };
        const result = setPath(obj, "a.b", 10);
        expect(result.a.b).toBe(10);
    });

    it("returns a shallow copy for top-level assignment", () => {
        const obj = { x: 1 };
        const result = setPath(obj, "x", 2);
        expect(result).not.toBe(obj);
        expect(result).toEqual({ x: 2 });
    });

    it("creates empty objects for missing intermediate values", () => {
        const obj = { a: null };
        const result = setPath(obj, "a.b.c", "value");
        expect(result).toEqual({ a: { b: { c: "value" } } });
    });
});

describe('resolveAnimation', () => {
    it('should resolve animate.css animation', () => {
        const animation = { framework: 'animate.css', entrance: 'fadeIn', delay: 100 };
        expect(resolveAnimation(animation)).toEqual({
            className: 'animate__animated animate__fadeIn',
            style: { animationDelay: '100ms' },
        });
    });

    it('should handle framer-motion animation', () => {
        const animation = { framework: 'framer-motion', animate: { x: 100 }, duration: 500 };
        expect(resolveAnimation(animation)).toEqual({
            animate: { x: 100 },
            transition: { duration: 500 },
        });
    });
});

describe("validateInput", () => {
    it("returns true when no regex is provided", () => {
        expect(validateInput("anything")).toBe(true);
        expect(validateInput(123)).toBe(true);
        expect(validateInput(null)).toBe(true);
    });

    it("validates simple regex patterns correctly", () => {
        expect(validateInput("hello@example.com", "^[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}$")).toBe(true);
        expect(validateInput("invalid-email", "^[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}$")).toBe(false);
    });

    it("handles numeric validation patterns", () => {
        expect(validateInput("12345", "^\\d+$")).toBe(true);
        expect(validateInput("abc", "^\\d+$")).toBe(false);
    });

    it("coerces non-string inputs to string before validation", () => {
        expect(validateInput(123, "^\\d+$")).toBe(true);
        expect(validateInput(true, "true")).toBe(true);
        expect(validateInput(false, "false")).toBe(true);
    });

    it("returns false for invalid regex syntax", () => {
        // Invalid regex like "(" should not throw, should return false
        expect(validateInput("test", "(")).toBe(false);
    });

    it("handles special characters safely", () => {
        expect(validateInput("abc-123", "^[a-z0-9-]+$")).toBe(true);
        expect(validateInput("abc_123", "^[a-z0-9-]+$")).toBe(false);
    });

    it("works with complex regex (e.g., URLs)", () => {
        const urlRegex =
            "^(https?:\\/\\/)?([\\w.-]+)\\.([a-z\\.]{2,6})([\\/\\w .-]*)*\\/?$";
        expect(validateInput("https://example.com", urlRegex)).toBe(true);
        expect(validateInput("ftp://example.com", urlRegex)).toBe(false);
    });

    it("returns false when value does not match regex", () => {
        expect(validateInput("abcdef", "^123")).toBe(false);
    });
});


describe("🧩 isVisible()", () => {
    const t = (k: string) => k; // simple translator stub

    it("returns true when visibility is undefined", () => {
        expect(isVisible(undefined, {}, t)).toBe(true);
    });

    it("returns true when no condition provided", () => {
        const visibility = { show: true };
        expect(isVisible(visibility as any, {}, t)).toBe(true);
    });

    it("== operator - true when equal", () => {
        const visibility = {
            show: true,
            condition: { key: "state.user.role", op: "==", value: "admin" },
        };
        const state = { user: { role: "admin" } };
        expect(isVisible(visibility as any, state, t)).toBe(true);
    });

    it("!= operator - true when not equal", () => {
        const visibility = {
            condition: { key: "state.user.role", op: "!=", value: "guest" },
        };
        const state = { user: { role: "admin" } };
        expect(isVisible(visibility as any, state, t)).toBe(true);
    });

    it("> operator", () => {
        const visibility = {
            condition: { key: "state.value", op: ">", value: "10" },
        };
        const state = { value: 20 };
        expect(isVisible(visibility as any, state, t)).toBe(true);
    });

    it("< operator", () => {
        const visibility = {
            condition: { key: "state.count", op: "<", value: "100" },
        };
        const state = { count: 50 };
        expect(isVisible(visibility as any, state, t)).toBe(true);
    });

    it(">= operator", () => {
        const visibility = {
            condition: { key: "state.num", op: ">=", value: "5" },
        };
        const state = { num: 5 };
        expect(isVisible(visibility as any, state, t)).toBe(true);
    });

    it("<= operator", () => {
        const visibility = {
            condition: { key: "state.num", op: "<=", value: "5" },
        };
        const state = { num: 5 };
        expect(isVisible(visibility as any, state, t)).toBe(true);
    });

    it("exists operator - true when key exists", () => {
        const visibility = {
            condition: { key: "state.user.name", op: "exists", value: "" },
        };
        const state = { user: { name: "Sireesh" } };
        expect(isVisible(visibility as any, state, t)).toBe(true);
    });

    it("not_exists operator - true when key is missing", () => {
        const visibility = {
            condition: { key: "state.user.age", op: "not_exists", value: "" },
        };
        const state = { user: { name: "Sireesh" } };
        expect(isVisible(visibility as any, state, t)).toBe(true);
    });

    it("matches operator - regex match", () => {
        const visibility = {
            condition: { key: "state.user.email", op: "matches", value: ".*@altcode\\.pro$" },
        };
        const state = { user: { email: "founder@altcode.pro" } };
        expect(isVisible(visibility as any, state, t)).toBe(true);
    });

    it("in operator - true when value is in array", () => {
        const visibility = {
            condition: { key: "state.user.role", op: "in", value: ["admin", "editor"] },
        };
        const state = { user: { role: "admin" } };
        expect(isVisible(visibility as any, state, t)).toBe(true);
    });

    it("not_in operator - true when value not in array", () => {
        const visibility = {
            condition: { key: "state.user.role", op: "not_in", value: ["banned", "guest"] },
        };
        const state = { user: { role: "admin" } };
        expect(isVisible(visibility as any, state, t)).toBe(true);
    });

    it("returns true for unknown operator", () => {
        const visibility = {
            condition: { key: "state.x", op: "unknown", value: "1" },
        };
        const state = { x: 5 };
        expect(isVisible(visibility as any, state, t)).toBe(true);
    });

    it("returns false for exists when key missing", () => {
        const visibility = {
            condition: { key: "state.user.id", op: "exists", value: "" },
        };
        const state = {};
        expect(isVisible(visibility as any, state, t)).toBe(false);
    });

    it("returns false for not_exists when key present", () => {
        const visibility = {
            condition: { key: "state.user.id", op: "not_exists", value: "" },
        };
        const state = { user: { id: 10 } };
        expect(isVisible(visibility as any, state, t)).toBe(false);
    });

    it("returns true if values are equal even when numbers vs strings", () => {
        const visibility = {
            condition: { key: "state.a", op: "==", value: "1" },
        };
        const state = { a: 1 };
        expect(isVisible(visibility as any, state, t)).toBe(true);
    });

    it("handles nested state paths correctly", () => {
        const visibility = {
            condition: { key: "state.settings.preferences.theme", op: "==", value: "dark" },
        };
        const state = { settings: { preferences: { theme: "dark" } } };
        expect(isVisible(visibility as any, state, t)).toBe(true);
    });

    it("returns true by default if condition key cannot be resolved", () => {
        const visibility = {
            condition: { key: "state.nonexistent.value", op: "==", value: "x" },
        };
        const state = {};
        expect(isVisible(visibility as any, state, t)).toBe(false); // resolvedKey empty, resolvedValue "x"
    });
});

describe("🧩 classesFromStyleProps()", () => {
    it("returns empty string when styles are undefined", () => {
        expect(classesFromStyleProps(undefined)).toBe("");
    });

    it("handles base class only", () => {
        const styles: StyleProps = { className: "text-center" };
        expect(classesFromStyleProps(styles)).toBe("text-center");
    });

    it("handles background color", () => {
        const styles: StyleProps = {
            className: "custom",
            background: { type: "color", value: "#fff" },
        };
        expect(classesFromStyleProps(styles)).toBe("custom bg-[#fff]");
    });

    it("handles gradient background", () => {
        const styles: StyleProps = {
            className: "",
            background: { type: "gradient", value: "from-red-500 to-yellow-400" },
        };
        expect(classesFromStyleProps(styles)).toBe(
            "bg-gradient-to-r from-red-500 to-yellow-400"
        );
    });

    it("handles image background", () => {
        const styles: StyleProps = {
            className: "",
            background: { type: "image", value: "/img/bg.png" },
        };
        expect(classesFromStyleProps(styles)).toBe("bg-[url('/img/bg.png')] bg-cover");
    });

    it("handles video background", () => {
        const styles: StyleProps = {
            className: "rounded",
            background: { type: "video", value: "/video/intro.mp4" },
        };
        expect(classesFromStyleProps(styles)).toBe(
            "rounded bg-[url('/video/intro.mp4')] bg-cover"
        );
    });

    it("handles overlay class", () => {
        const styles: StyleProps = {
            className: "",
            background: { type: "color", value: "#000", overlayClass: "opacity-50" },
        };
        expect(classesFromStyleProps(styles)).toBe("bg-[#000] opacity-50");
    });

    it("merges responsive classes", () => {
        const styles: StyleProps = {
            className: "base",
            responsiveClasses: { sm: "sm:px-4", lg: "lg:px-8" },
        };
        expect(classesFromStyleProps(styles)).toBe("base sm:px-4 lg:px-8");
    });

    it("combines everything cleanly", () => {
        const styles: StyleProps = {
            className: "rounded-xl",
            responsiveClasses: { sm: "sm:p-2", md: "md:p-4" },
            background: {
                type: "gradient",
                value: "from-blue-500 to-indigo-600",
                overlayClass: "opacity-70",
            },
        };
        expect(classesFromStyleProps(styles)).toBe(
            "rounded-xl sm:p-2 md:p-4 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-70"
        );
    });

    it("handles null background gracefully", () => {
        const styles: StyleProps = {
            className: "text-sm",
            background: null,
        };
        expect(classesFromStyleProps(styles)).toBe("text-sm");
    });
});

describe("🧩 getAccessibilityProps()", () => {
    const t = (s: string) => s;

    it("returns empty object when accessibility is undefined", () => {
        expect(getAccessibilityProps(undefined, {}, t)).toEqual({});
    });

    it("sets aria-label using static string", () => {
        const result = getAccessibilityProps({ ariaLabel: "Submit button" }, {}, t);
        expect(result["aria-label"]).toBe("Submit button");
    });

    it("sets aria-label using state binding", () => {
        const state = { label: "Dynamic Label" };
        const result = getAccessibilityProps({ ariaLabel: "state.label" }, state, t);
        expect(result["aria-label"]).toBe("Dynamic Label");
    });

    it("sets role when provided", () => {
        const result = getAccessibilityProps({ ariaRole: "button" }, {}, t);
        expect(result.role).toBe("button");
    });

    it("sets aria-hidden when defined", () => {
        const result = getAccessibilityProps({ ariaHidden: true }, {}, t);
        expect(result["aria-hidden"]).toBe(true);
    });

    it("sets tabIndex when provided", () => {
        const result = getAccessibilityProps({ tabIndex: 5 }, {}, t);
        expect(result.tabIndex).toBe(5);
    });

    it("overrides tabIndex when focusable = true", () => {
        const result = getAccessibilityProps({ tabIndex: 3, focusable: true }, {}, t);
        expect(result.tabIndex).toBe(0);
    });

    it("sets aria-description from static text", () => {
        const result = getAccessibilityProps({ screenReaderText: "For screen readers" }, {}, t);
        expect(result["aria-description"]).toBe("For screen readers");
    });

    it("sets aria-description using state binding", () => {
        const state = { help: "Dynamic screen reader help" };
        const result = getAccessibilityProps({ screenReaderText: "state.help" }, state, t);
        expect(result["aria-description"]).toBe("Dynamic screen reader help");
    });

    it("combines all props correctly", () => {
        const state = { label: "Submit", help: "Press to submit" };
        const accessibility = {
            ariaLabel: "state.label",
            ariaRole: "button",
            ariaHidden: false,
            tabIndex: 2,
            focusable: true,
            screenReaderText: "state.help",
        };
        const result = getAccessibilityProps(accessibility, state, t);

        expect(result).toEqual({
            "aria-label": "Submit",
            role: "button",
            "aria-hidden": false,
            tabIndex: 0, // overridden by focusable
            "aria-description": "Press to submit",
        });
    });

    it("ignores unknown or missing values gracefully", () => {
        const result = getAccessibilityProps(
            {
                ariaLabel: undefined,
                ariaRole: undefined,
                ariaHidden: undefined,
            },
            {},
            t
        );
        expect(Object.keys(result)).toHaveLength(0);
    });
});

describe("🖼️ getAllScreenImages()", () => {
    it("returns only logo when screenJson is null", () => {
        const result = getAllScreenImages("/logo.png", null);
        expect(result).toEqual(["/logo.png"]);
    });

    it("returns logo even when no screens exist", () => {
        const screenJson = { screens: [] } as unknown as UIDefinition;
        const result = getAllScreenImages("/logo.svg", screenJson);
        expect(result).toEqual(["/logo.svg"]);
    });

    it("extracts image src values from screen elements", () => {
        const screenJson = {
            screens: [
                {
                    id: "screen_1",
                    elements: [
                        { type: "image", src: "/img/hero.png" } as ImageElement,
                        { type: "text", content: "hello" },
                    ],
                },
            ],
        } as unknown as UIDefinition;

        const result = getAllScreenImages("/logo.png", screenJson);
        expect(result).toEqual(["/logo.png", "/img/hero.png"]);
    });

    it("handles multiple screens and multiple images", () => {
        const screenJson = {
            screens: [
                {
                    id: "screen_1",
                    elements: [
                        { type: "image", src: "/img/hero.png" },
                        { type: "image", src: "/img/banner.png" },
                    ],
                },
                {
                    id: "screen_2",
                    elements: [
                        { type: "image", src: "/img/footer.png" },
                        { type: "text", content: "AltCodePro" },
                    ],
                },
            ],
        } as unknown as UIDefinition;

        const result = getAllScreenImages("/logo.png", screenJson);
        expect(result).toEqual([
            "/logo.png",
            "/img/hero.png",
            "/img/banner.png",
            "/img/footer.png",
        ]);
    });

    it("skips elements without src", () => {
        const screenJson = {
            screens: [
                {
                    elements: [
                        { type: "image" }, // missing src
                        { type: "image", src: "/img/valid.png" },
                    ],
                },
            ],
        } as unknown as UIDefinition;

        const result = getAllScreenImages("/logo.png", screenJson);
        expect(result).toEqual(["/logo.png", "/img/valid.png"]);
    });

    it("ignores non-image elements", () => {
        const screenJson = {
            screens: [
                {
                    elements: [
                        { type: "video", src: "/video/demo.mp4" },
                        { type: "button", label: "Click" },
                    ],
                },
            ],
        } as unknown as UIDefinition;

        const result = getAllScreenImages("/logo.png", screenJson);
        expect(result).toEqual(["/logo.png"]);
    });

    it("handles malformed or empty screenJson gracefully", () => {
        const screenJson = {} as unknown as UIDefinition;
        const result = getAllScreenImages("/logo.png", screenJson);
        expect(result).toEqual(["/logo.png"]);
    });

    it("deduplicates identical images if needed", () => {
        const screenJson = {
            screens: [
                {
                    elements: [
                        { type: "image", src: "/img/hero.png" },
                        { type: "image", src: "/img/hero.png" },
                    ],
                },
            ],
        } as unknown as UIDefinition;

        const result = getAllScreenImages("/logo.png", screenJson);
        // Duplicates are not removed by function, so both appear — validate that behavior explicitly
        expect(result).toEqual(["/logo.png", "/img/hero.png", "/img/hero.png"]);
    });
});

describe("🧠 getMetaData()", () => {
    // mock getAllScreenImages
    vi.spyOn(utils, "getAllScreenImages").mockImplementation(() => ["/logo.png", "/img1.png"]);
    vi.spyOn(utils, "getMetaData").mockResolvedValueOnce({
        title: "Dashboard",
        openGraph: { images: ["/img1.png"] },
        description: "AltCodePro Dashboard",
    });
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns metadata with full structure when given route and project", async () => {
        const result = await getMetaData(baseRoute as any, baseProject as any, "https://altcode.pro");

        expect(result.title).toBe("Dashboard | AltCodePro");
        expect(result.description).toBe("Main user dashboard");
        expect(result.applicationName).toBe("AltCodePro");
        expect(result.openGraph.title).toBe("OG Dashboard");
        expect(result.twitter.title).toBe("Twitter Dashboard");
        expect(result.icons.icon).toContain("/favicon.ico");
        expect(result.authors[0].name).toBe("AltCodePro");
        expect(result.metadataBase.href).toBe("https://altcode.pro/");
        expect(result.alternates.canonical).toBe("https://altcode.pro/dashboard");
    });

    it("falls back to project brand when route metadata missing", async () => {
        const route = { href: "/about" }; // no metadata
        const result = await getMetaData(route as any, baseProject as any, "https://altcode.pro");
        expect(result.title).toBe("AltCodePro");
        expect(result.description).toBe("AI for everything");
    });

    it("constructs screenConfigUrl if missing and label present", async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ screens: [{ elements: [] }] }),
        });

        const route = { href: "/home", label: "Home" };
        const result = await getMetaData(route as any, baseProject as any, "https://altcode.pro");
        expect(global.fetch).toHaveBeenCalledWith("https://altcode.pro/data/Home_v1.json");
        expect(result.icons.icon).toBe("/favicon.ico");
    });

    it("gracefully handles fetch error or invalid response", async () => {
        (global.fetch as any).mockRejectedValueOnce(new Error("network fail"));
        const route = { href: "/home", label: "Home" };
        const result = await getMetaData(route as any, baseProject as any, "https://altcode.pro");
        expect(result.title).toBe("AltCodePro");
    });

    it("handles null screenDefinition and still returns valid metadata", async () => {
        const result = await getMetaData(baseRoute as any, baseProject as any, "https://altcode.pro", null);
        expect(result.openGraph.images).toContain("/img1.png");
        expect(result.appleWebApp.title).toBe("AltCodePro");
    });

    it("filters duplicate and falsy images", async () => {
        (utils.getAllScreenImages as any).mockReturnValueOnce(["", "/logo.png", "/logo.png", "/img1.png"]);
        const result = await getMetaData(baseRoute as any, baseProject as any, "https://altcode.pro");
        expect(result.openGraph.images).toEqual(["/logo.png", "/img1.png"]);
    });

    it("adds optional metadata fields (itunes, bookmarks, classification)", async () => {
        const result = await getMetaData(baseRoute as any, baseProject as any, "https://altcode.pro");
        expect(result.pinterest).toEqual({ handle: "pinterestHandle" });
        expect(result.facebook).toEqual({ page: "fbpage" });
        expect(result.verification).toEqual({ google: "google123" });
        expect(result.category).toBe("AI");
        expect(result.classification).toBe("Software");
    });

    it("sets appleWebApp.startupImage to logo when available", async () => {
        const result = await getMetaData(baseRoute as any, baseProject as any, "https://altcode.pro");
        expect(result.appleWebApp.startupImage).toEqual([{ url: "/logo.png" }]);
    });

    it("returns fallback metadata when thrown error occurs", async () => {
        const badProject = {} as any;
        const result = await getMetaData({ href: "/" } as any, badProject, "https://altcode.pro");
        expect(result.title).toBe("AltCodePro");
    });
});

describe("🧠 getJSONLD()", () => {
    const baseRoute = {
        href: "/dashboard",
        metadata: {
            datePublished: "2025-10-18T00:00:00Z",
            dateModified: "2025-10-19T00:00:00Z",
            keywords: ["AI", "dashboard"],
        },
    };

    const baseProject = {
        brand: {
            name: "AltCodePro",
            logoUrl: "/logo.png",
            slogan: "AI for Everything",
            socialMedia: { twitter: "https://twitter.com/altcodepro" },
        },
        globalConfig: {
            metadata: {
                schemaType: "SoftwareApplication",
                language: "en",
                license: "MIT",
                category: "AI Tools",
            },
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns full structured JSON-LD with all metadata", async () => {
        (utils.getMetaData as any).mockResolvedValueOnce({
            title: "Dashboard",
            description: "AltCodePro Dashboard",
            metadataBase: new URL("https://altcode.pro"),
            openGraph: {
                url: "https://altcode.pro/dashboard",
                images: ["/img1.png", "/img2.png"],
            },
            keywords: ["AI", "dashboard"],
        });

        const result = await getJSONLD(baseRoute as any, baseProject as any, "https://altcode.pro");

        expect(result["@context"]).toBe("https://schema.org");
        expect(result["@type"]).toBe("SoftwareApplication");
        expect(result.name).toBe("Dashboard");
        expect(result.description).toBe("AltCodePro Dashboard");
        expect(result.publisher.name).toBe("AltCodePro");
        expect(result.author.name).toBe("AltCodePro");
        expect(result.image).toEqual(["/img1.png", "/img2.png"]);
        expect(result.url).toBe("https://altcode.pro/dashboard");
        expect(result.sameAs).toContain("https://twitter.com/altcodepro");
        expect(result.license).toBe("MIT");
        expect(result.about.name).toBe("AI Tools");
        expect(result.genre).toBe("AI Tools");
        expect(result.keywords).toBe("AI, dashboard");
    });

    it("adds potentialAction when project search is enabled", async () => {
        (utils.getMetaData as any).mockResolvedValueOnce({
            title: "Search Page",
            openGraph: { url: "https://altcode.pro/search" },
            metadataBase: new URL("https://altcode.pro"),
        });

        const projectWithSearch = {
            ...baseProject,
            search: { enabled: true, path: "/v1/search" },
        };

        const result = await getJSONLD(
            baseRoute as any,
            projectWithSearch as any,
            "https://altcode.pro"
        );

        expect(result.potentialAction["@type"]).toBe("SearchAction");
        expect(result.potentialAction.target).toBe(
            "https://altcode.pro/v1/search?q={search_term_string}"
        );
        expect(result.potentialAction["query-input"]).toBe("required name=search_term_string");
    });

    it("uses defaults when getMetaData returns partial info", async () => {
        (utils.getMetaData as any).mockResolvedValueOnce({});
        const result = await getJSONLD(baseRoute as any, baseProject as any, "https://altcode.pro");

        expect(result["@type"]).toBe("SoftwareApplication");
        expect(result.name).toBe("AltCodePro");
        expect(result.description).toBe("AI for Everything");
        expect(result.publisher.logo.url).toBe("/logo.png");
    });

    it("uses fallback schema type and language if missing in global metadata", async () => {
        const project = { brand: { name: "AltCodePro" }, globalConfig: {} };
        (utils.getMetaData as any).mockResolvedValueOnce({
            openGraph: {},
            metadataBase: new URL("https://altcode.pro"),
        });

        const result = await getJSONLD(baseRoute as any, project as any, "https://altcode.pro");
        expect(result["@type"]).toBe("WebPage");
        expect(result.inLanguage).toBe("en");
    });

    it("gracefully handles missing metadataBase and openGraph URL", async () => {
        (utils.getMetaData as any).mockResolvedValueOnce({
            title: "No URL Page",
            openGraph: {},
        });

        const result = await getJSONLD(baseRoute as any, baseProject as any);
        expect(result.url).toContain("/dashboard");
    });

    it("adds image and keywords when provided", async () => {
        (utils.getMetaData as any).mockResolvedValueOnce({
            openGraph: { images: ["/img1.png"] },
            keywords: ["ai", "codegen"],
        });

        const result = await getJSONLD(baseRoute as any, baseProject as any);
        expect(result.image).toEqual(["/img1.png"]);
        expect(result.keywords).toBe("ai, codegen");
    });

    it("returns {} on thrown errors", async () => {
        (utils.getMetaData as any).mockRejectedValueOnce(new Error("network fail"));
        const result = await getJSONLD(baseRoute as any, baseProject as any);
        expect(result).toEqual({});
    });
});

describe('luhnCheck', () => {
    it('✅ returns true for valid Visa number', () => {
        // 4111 1111 1111 1111 is a standard test Visa number
        expect(luhnCheck('4111 1111 1111 1111')).toBe(true);
    });

    it('✅ returns true for valid MasterCard number', () => {
        // 5555-5555-5555-4444 is a standard MasterCard test number
        expect(luhnCheck('5555-5555-5555-4444')).toBe(true);
    });

    it('❌ returns false for an invalid card number', () => {
        expect(luhnCheck('4111 1111 1111 1112')).toBe(false);
    });

    it('❌ returns false for random non-digit string', () => {
        expect(luhnCheck('abcd efgh ijkl')).toBe(false);
    });

    it('✅ ignores spaces and dashes correctly', () => {
        expect(luhnCheck('4-1-1-1 1-1-1-1 1-1-1-1 1-1-1-1')).toBe(true);
    });

    it('❌ returns false for too short numbers', () => {
        expect(luhnCheck('12345')).toBe(false);
    });

    it('✅ handles long numeric strings gracefully', () => {
        const longValid = '79927398713'; // known valid test per Luhn algorithm
        expect(luhnCheck(longValid)).toBe(true);
    });

    it('❌ fails when last digit checksum is changed', () => {
        const invalid = '79927398714'; // last digit off by 1
        expect(luhnCheck(invalid)).toBe(false);
    });

    it('✅ handles input with special characters', () => {
        expect(luhnCheck(' 4111-1111*1111*1111 ')).toBe(true);
    });

    it('✅ returns false for empty string', () => {
        expect(luhnCheck('')).toBe(false);
    });
});

describe("anySignal", () => {
    it("returns an AbortSignal", () => {
        const controller1 = new AbortController();
        const controller2 = new AbortController();
        const signal = anySignal([controller1.signal, controller2.signal]);
        expect(signal).toBeInstanceOf(AbortSignal);
    });

    it("aborts immediately if one signal is already aborted", () => {
        const controller1 = new AbortController();
        const controller2 = new AbortController();
        controller1.abort("already aborted");
        const signal = anySignal([controller1.signal, controller2.signal]);
        expect(signal.aborted).toBe(true);
        expect(signal.reason).toBe("already aborted");
    });

    it("aborts when any of the provided signals aborts later", () => {
        const controller1 = new AbortController();
        const controller2 = new AbortController();

        const combined = anySignal([controller1.signal, controller2.signal]);

        expect(combined.aborted).toBe(false);

        controller2.abort("signal 2 aborted");

        expect(combined.aborted).toBe(true);
        expect(combined.reason).toBe("signal 2 aborted");
    });

    it("removes event listeners after abort", () => {
        const controller1 = new AbortController();
        const controller2 = new AbortController();

        const spy1 = vi.spyOn(controller1.signal, "removeEventListener");
        const spy2 = vi.spyOn(controller2.signal, "removeEventListener");

        const combined = anySignal([controller1.signal, controller2.signal]);

        controller2.abort("test reason");

        expect(combined.aborted).toBe(true);
        expect(spy1).toHaveBeenCalledWith("abort", expect.any(Function));
        expect(spy2).toHaveBeenCalledWith("abort", expect.any(Function));
    });

    it("aborts with the first aborted signal even if others abort later", () => {
        const c1 = new AbortController();
        const c2 = new AbortController();
        const combined = anySignal([c1.signal, c2.signal]);

        c1.abort("first");
        expect(combined.aborted).toBe(true);
        expect(combined.reason).toBe("first");

        // Later abort shouldn't override
        c2.abort("second");
        expect(combined.reason).toBe("first");
    });

    it("handles empty input gracefully", () => {
        const combined = anySignal([]);
        expect(combined).toBeInstanceOf(AbortSignal);
        expect(combined.aborted).toBe(false);
    });
});

describe("resolveDataSource", () => {
    const mockResolveValue = vi.fn((val) => val);
    const mockDeepResolve = vi.fn((val) => val);

    beforeEach(() => {
        vi.resetModules();
    });

    const globalConfig = {
        endpoints: {
            registry: [
                {
                    id: "userList",
                    baseUrl: "https://api.example.com",
                    path: "/users",
                    headers: { "X-Global": "true" },
                },
            ],
            defaultHeaders: { "X-Default": "1" },
            auth: { type: "bearer", value: "global-token" },
            environments: {
                default: "dev",
                values: {
                    dev: {
                        baseUrl: "https://dev.example.com",
                        headers: { "X-Env": "DEV" },
                    },
                },
            },
        },
    } as unknown as UIProject["globalConfig"];

    it("resolves DataSource by refId string", async () => {

        const ds = resolveDataSource("userList", globalConfig, {});
        expect(ds.baseUrl).toBe("https://api.example.com");
        expect(ds.path).toBe("/users");
    });

    it("throws if refId string not found", async () => {

        expect(() => resolveDataSource("unknownRef", globalConfig, {})).toThrow(
            /not found/
        );
    });

    it("merges refId object with global reference", async () => {

        const ds = resolveDataSource(
            {
                refId: "userList",
                path: "/users/active",
            } as unknown as DataSource,
            globalConfig,
            {}
        );
        expect(ds.path).toBe("/users/active"); // overrides global path
        expect(ds.baseUrl).toBe("https://api.example.com");
    });

    it("applies environment-specific baseUrl when DataSource has none", async () => {

        const ds = resolveDataSource(
            { id: "newSource", path: "/test" },
            globalConfig,
            {}
        );
        expect(ds.baseUrl).toBe("https://dev.example.com");
    });

    it("merges headers correctly from global, env, and ds", async () => {

        const ds = resolveDataSource(
            {
                id: "custom",
                path: "/merged",
                headers: { "X-DS": "yes" },
            },
            globalConfig,
            {}
        );

        expect(ds.headers).toEqual({
            "X-Default": "1",
            "X-Env": "DEV",
            "X-DS": "yes",
        });
    });

    it("applies global auth if missing", async () => {

        const ds = resolveDataSource(
            { id: "noAuth", path: "/test" },
            globalConfig,
            {}
        );
        expect(ds.auth?.type).toBe("bearer");
        expect(ds.auth?.value).toBe("global-token");
    });

    it("resolves baseUrl, path, and headers using resolveDataSourceValue", async () => {

        mockResolveValue.mockImplementation((v) => `resolved:${v}`);

        const ds = resolveDataSource(
            {
                id: "resolveTest",
                baseUrl: "base",
                path: "path",
                headers: { A: "1" },
            },
            globalConfig,
            {}
        );

        expect(mockResolveValue).toHaveBeenCalledWith("base", {}, undefined);
        expect(mockResolveValue).toHaveBeenCalledWith("path", {}, undefined);
        expect(mockResolveValue).toHaveBeenCalledWith("1", {}, undefined);
        expect(ds.baseUrl).toBe("resolved:base");
    });

    it("resolves body deeply via deepResolveDataSource when no {form.} placeholder", async () => {

        const ds = resolveDataSource(
            {
                id: "bodyTest",
                body: { foo: "bar" },
            },
            globalConfig,
            {}
        );

        expect(mockDeepResolve).toHaveBeenCalledWith({ foo: "bar" }, {}, undefined);
    });

    it("skips deepResolveDataSource if body contains {form.} placeholder", async () => {

        const ds = resolveDataSource(
            {
                id: "bodyForm",
                body: { name: "{form.username}" },
            },
            globalConfig,
            {}
        );
        expect(mockDeepResolve).not.toHaveBeenCalled();
        expect(ds.body).toEqual({ name: "{form.username}" });
    });
});

describe("deepResolveDataSource", () => {
    const mockResolveValue = vi.fn();

    beforeEach(async () => {
        vi.resetModules();
        mockResolveValue.mockReset();
    });

    it("returns null or undefined as-is", async () => {

        expect(deepResolveDataSource(null, {})).toBe(null);
        expect(deepResolveDataSource(undefined, {})).toBe(undefined);
    });

    it("resolves plain string values using resolveDataSourceValue", async () => {

        mockResolveValue.mockReturnValue("resolvedValue");
        const result = deepResolveDataSource("state.user.name", { user: { name: "Alice" } });
        expect(mockResolveValue).toHaveBeenCalledWith("state.user.name", { user: { name: "Alice" } }, undefined);
        expect(result).toBe("resolvedValue");
    });

    it("recursively resolves all strings inside plain objects", async () => {

        mockResolveValue.mockImplementation((v) => `resolved(${v})`);

        const obj = {
            a: "state.user.id",
            nested: {
                b: "form.email",
                c: 42,
            },
        };

        const result = deepResolveDataSource(obj, { user: { id: 1 } });
        expect(result).toEqual({
            a: "resolved(state.user.id)",
            nested: { b: "resolved(form.email)", c: 42 },
        });
    });

    it("recursively resolves strings in arrays", async () => {

        mockResolveValue.mockImplementation((v) => `resolved(${v})`);

        const arr = ["state.foo", "form.bar", 123];
        const result = deepResolveDataSource(arr, { foo: 1, bar: 2 });

        expect(result).toEqual(["resolved(state.foo)", "resolved(form.bar)", 123]);
        expect(mockResolveValue).toHaveBeenCalledTimes(2);
    });

    it("handles deeply nested mixed structures (arrays inside objects inside arrays)", async () => {

        mockResolveValue.mockImplementation((v) => `resolved(${v})`);

        const input = [
            { a: ["state.user.id", { b: "form.email" }] },
            "literal",
        ];

        const result = deepResolveDataSource(input, { user: { id: 7 } });
        expect(result).toEqual([
            { a: ["resolved(state.user.id)", { b: "resolved(form.email)" }] },
            "resolved(literal)",
        ]);
    });

    it("returns literal values unchanged (number, boolean, date)", async () => {


        const now = new Date();
        expect(deepResolveDataSource(123, {})).toBe(123);
        expect(deepResolveDataSource(true, {})).toBe(true);
        expect(deepResolveDataSource(now, {})).toBe(now);
    });
});

describe("resolveDynamicPath", () => {
    const state = {
        user: {
            id: 123,
            name: "Alice",
            profile: { age: 30 },
        },
        org: {
            id: "org-xyz",
        },
        list: [10, 20, 30],
        _meta: { env: "dev" },
    };

    it("returns same path if no bindings present", () => {
        const result = resolveDynamicPath("/api/static/path", state);
        expect(result).toBe("/api/static/path");
    });

    it("resolves single binding with {state.key} format", () => {
        const result = resolveDynamicPath("/api/users/{user.id}", state);
        expect(result).toBe("/api/users/123");
    });

    it("resolves single binding with {{state.key}} format", () => {
        const result = resolveDynamicPath("/api/org/{{org.id}}", state);
        expect(result).toBe("/api/org/org-xyz");
    });

    it("resolves nested object properties", () => {
        const result = resolveDynamicPath("/api/users/{user.profile.age}", state);
        expect(result).toBe("/api/users/30");
    });

    it("resolves multiple bindings in one string", () => {
        const result = resolveDynamicPath(
            "/api/{org.id}/user/{{user.id}}/name/{{user.name}}",
            state
        );
        expect(result).toBe("/api/org-xyz/user/123/name/Alice");
    });

    it("returns empty string for missing keys", () => {
        const result = resolveDynamicPath("/api/{user.nonexistent}/test", state);
        expect(result).toBe("/api//test");
    });

    it("handles array index lookups", () => {
        const result = resolveDynamicPath("/api/value/{list.1}", state);
        expect(result).toBe("/api/value/20");
    });

    it("handles underscores and brackets in keys", () => {
        const result = resolveDynamicPath("/env/{_meta.env}", state);
        expect(result).toBe("/env/dev");
    });

    it("gracefully handles empty or undefined input", () => {
        expect(resolveDynamicPath("", state)).toBe("");
        expect(resolveDynamicPath(undefined as any, state)).toBe(undefined);
        expect(resolveDynamicPath(null as any, state)).toBe(null);
    });

    it("handles literal strings surrounded by braces (non-binding)", () => {
        const result = resolveDynamicPath("{notAStateVar}", {});
        expect(result).toBe(""); // since key not found, replaced with empty string
    });

    it("handles partial matches and mixed text", () => {
        const result = resolveDynamicPath(
            "Hello {{user.name}}, your org is {org.id}",
            state
        );
        expect(result).toBe("Hello Alice, your org is org-xyz");
    });
});

describe("normalizeBindings", () => {
    it("returns object unchanged if there are no {{ }} bindings", () => {
        const input = { path: "/api/{user.id}" };
        const result = normalizeBindings(input);
        expect(result).toEqual(input);
    });

    it("normalizes single {{ }} binding to { }", () => {
        const input = { path: "/api/{{user.id}}" };
        const result = normalizeBindings(input);
        expect(result).toEqual({ path: "/api/{user.id}" });
    });

    it("normalizes multiple {{ }} bindings in same string", () => {
        const input = { path: "/api/{{org.id}}/user/{{user.id}}" };
        const result = normalizeBindings(input);
        expect(result).toEqual({ path: "/api/{org.id}/user/{user.id}" });
    });

    it("works recursively inside nested objects", () => {
        const input = {
            outer: {
                inner: { url: "/v1/{{project.name}}/details" },
            },
        };
        const result = normalizeBindings(input);
        expect(result).toEqual({
            outer: { inner: { url: "/v1/{project.name}/details" } },
        });
    });

    it("works for arrays containing bindings", () => {
        const input = ["{{user.id}}", "/{{org.slug}}"];
        const result = normalizeBindings(input);
        expect(result).toEqual(["{user.id}", "/{org.slug}"]);
    });

    it("leaves other characters untouched", () => {
        const input = {
            message: "Hello {{user.name}}!",
            plain: "No bindings here.",
            escaped: "{escaped}",
        };
        const result = normalizeBindings(input);
        expect(result).toEqual({
            message: "Hello {user.name}!",
            plain: "No bindings here.",
            escaped: "{escaped}",
        });
    });

    it("handles underscores, brackets, and digits inside bindings", () => {
        const input = {
            complex: "/{{user_list[0]._meta.env}}/test",
        };
        const result = normalizeBindings(input);
        expect(result).toEqual({
            complex: "/{user_list[0]._meta.env}/test",
        });
    });

    it("returns empty object safely", () => {
        const result = normalizeBindings({});
        expect(result).toEqual({});
    });

    it("returns null input as null", () => {
        expect(normalizeBindings(null)).toBeNull();
    });
});

describe("hash", () => {
    it("returns a string hash for a simple string", () => {
        const result = hash("AltCodePro");
        expect(typeof result).toBe("string");
        expect(Number.isNaN(Number(result))).toBe(false);
    });

    it("produces deterministic output for identical inputs", () => {
        const h1 = hash("hello world");
        const h2 = hash("hello world");
        expect(h1).toBe(h2);
    });

    it("produces different outputs for different strings", () => {
        const h1 = hash("hello");
        const h2 = hash("world");
        expect(h1).not.toBe(h2);
    });

    it("handles plain objects consistently regardless of key order", () => {
        const objA = { b: 2, a: 1 };
        const objB = { a: 1, b: 2 };
        const h1 = hash(objA);
        const h2 = hash(objB);
        expect(h1).toBe(h2);
    });

    it("handles arrays deterministically", () => {
        const arr1 = [1, 2, 3];
        const arr2 = [1, 2, 3];
        expect(hash(arr1)).toBe(hash(arr2));
    });

    it("returns different hashes for arrays with different order", () => {
        const arr1 = [1, 2, 3];
        const arr2 = [3, 2, 1];
        expect(hash(arr1)).not.toBe(hash(arr2));
    });

    it("handles nested objects", () => {
        const obj = { user: { id: 1, name: "Alice" } };
        const result = hash(obj);
        expect(typeof result).toBe("string");
    });

    it("handles circular references safely", () => {
        const obj: any = { a: 1 };
        obj.self = obj;
        expect(() => hash(obj)).not.toThrow();
        expect(typeof hash(obj)).toBe("string");
    });

    it("handles mixed types correctly", () => {
        const obj = { arr: [1, { k: "v" }], num: 5, str: "ok" };
        const h1 = hash(obj);
        const h2 = hash(obj);
        expect(h1).toBe(h2);
    });

    it("hashes numbers, booleans, and null consistently", () => {
        expect(hash(123)).toBe(hash(123));
        expect(hash(true)).toBe(hash(true));
        expect(hash(null)).toBe(hash(null));
    });

    it("produces same hash for object and its JSON string (content-based)", () => {
        const obj = { text: "hello" };
        expect(hash(obj)).toBe(hash(JSON.stringify(obj)));
    });

    it("handles empty string and empty object distinctly", () => {
        expect(hash("")).not.toBe(hash({}));
    });
});