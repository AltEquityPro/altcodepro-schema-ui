import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveBinding, deepResolveBindings } from "../src/lib/utils";

describe("resolveBinding", () => {
    let t: (k: string) => string;
    let state: any;

    beforeEach(() => {
        // Mock translation function
        t = vi.fn((k: string) => {
            const translations: Record<string, string> = {
                "i18n.welcome": "Welcome!",
                "en.greeting": "Hello, {{user.name}}!",
                "dashboard.welcome": "Welcome to dashboard, {{user.name}}",
                "dashboard.copy_referral_link": "Copy your referral link",
                "cyclic.key": "{{cyclic.key}}", // Simulate cyclic translation
                "deep.key": "{{deep.key}}", // Simulate recursive translation
            };
            return translations[k] ?? k;
        });

        // Mock global env
        process.env = {
            API_URL: "https://api.example.com",
            API_DOMAIN: "https://envdomain.io",
            USER_TOKEN: "abc123",
        } as any;

        state = {
            user: {
                id: "u1",
                name: "Sireesh",
                profile: { display_name: "S. Panglauri" },
            },
            form: {
                email: "test@example.com",
                password: "secret",
            },
            ds_user_info: {
                data: {
                    user: {
                        displayName: "AltCodePro User",
                        id: "u1",
                    },
                    projects: [{ id: 1 }, { id: 2 }, { id: 3 }],
                    organization: {
                        members: [
                            { userId: "u1", roles: ["Founder"] },
                            { userId: "u2", roles: ["Contributor"] },
                        ],
                    },
                },
            },
            params: { orgId: "org42" },
            env: process.env,
            translations: {
                en: {
                    "projects.create": "New Project",
                    "actions.support": "Support",
                },
            },
            locale: "en",
            profile: {
                "user": {
                    "createdAt": "2025-09-27T14:02:25.997147",
                    "twofaEnabled": false,
                    "updatedAt": "2025-09-27T14:02:26.352586+00:00",
                },
                "org_id": "org:sireeshPangaluri",
                "user_id": "usr:0eb756a3a9a24ae486c6f961260ae5b4",
                "organization": {
                    "brand": {
                        "href": "https://altcode.pro/",
                        "name": "AltCodePro",
                    },
                    "createdAt": "2025-09-27T14:02:26.790047",
                    "isActive": true,
                    "members": [
                        {
                            "status": "active"
                        }
                    ],
                    "name": "Sireesh Pangaluri's Org",
                    "orgId": "org:sireeshPangaluri",
                    "ownerEmail": "sireesh.psvs@gmail.com",
                    "ownerPhone": "+447774398018",
                    "projects": [
                        {

                            "shared_with": [],
                            "is_active": true,
                            "client_type": "website",
                            "cloud": "firebase",
                            "frontend": "nextjs",
                            "backend": "firebase_functions",
                            "database": "firestore",
                            "notification": false,
                            "analytics": false,
                            "ai": false,
                            "custom_tools": [],
                            "branding_overrides": null,
                            "provision_now": true,
                            "promote_on_portal": true,
                            "allow_discovery": true,
                            "launch_stage": "beta",
                            "domain": "altcode.pro",
                            "map_domain_to": "frontend",
                            "enable_subdomain": true,
                            "verify_domain_status": null,
                            "domain_dns_required_records": null,
                            "ssl_status": null,
                            "id": "prj:a1810ba95fc9",
                            "subscription_id": 3,
                            "slug": "altcodepro",
                        }
                    ],
                    "schemaVersion": 1,
                    "settings": {
                        "permissions": {},
                        "integrations": []
                    },
                    "slug": "sireesh-pangaluris-org",
                    "subscription": {
                        "id": 3,
                        "start_date": "2025-10-07T17:27:03.598462",
                        "end_date": "2026-10-07T17:27:03.598462",
                        "plan": {
                            "id": 4,
                            "token_limit": 500000,
                            "project_limit": 10,
                            "artifact_limit": 300,
                            "video_limit": 15,
                            "image_limit": 100,
                            "review_limit": 300,
                            "audio_limit": 20,
                            "can_generate_artifacts": true,
                            "can_download_artifacts": true,
                            "can_save_artifacts_to_ci_cd": true,
                            "monthly_price": 49,
                            "yearly_price": 499,
                            "display_order": 2,
                            "highlight": true,
                            "archived": false,
                            "is_active": true,
                            "created_at": "2025-09-25T00:03:53.885949",
                            "updated_at": "2025-09-25T00:25:09.902698"
                        }
                    },
                    "updatedAt": "2025-10-14T15:08:20.331115+00:00",
                    "workspaces": [
                        {
                            "id": "ws:5c21957bd753",
                            "name": "Default",
                            "description": "Personal workspace",
                            "createdAt": "2025-09-27T14:02:26.790080",
                            "updatedAt": "2025-09-27T14:02:26.790089",
                            "isActive": true,
                            "visibility": "private",
                            "settings": {}
                        }
                    ],
                },
                "workspaces": [
                    {
                        "id": "ws:5c21957bd753",
                        "name": "Default",
                        "description": "Personal workspace",
                        "createdAt": "2025-09-27T14:02:26.790080",
                        "updatedAt": "2025-09-27T14:02:26.790089",
                        "isActive": true,
                        "visibility": "private",
                        "settings": {}
                    }
                ],
                "projects": [
                    {
                        "name": "AltCodePro",
                        "visibility": "public",
                        "sharedWith": [],
                        "isActive": true,
                        "clientType": "website",
                        "cloud": "firebase",
                        "frontend": "nextjs",
                        "backend": "firebase_functions",
                        "database": "firestore",
                        "notification": false,
                        "analytics": false,
                        "ai": false,
                        "customTools": [],
                        "integrations": {},
                        "brandingOverrides": null,
                        "provisionNow": true,
                        "promoteOnPortal": true,
                        "allowDiscovery": true,
                        "launchStage": "beta",
                        "domain": "altcode.pro",
                        "mapDomainTo": "frontend",
                        "enableSubdomain": true,
                        "verifyDomainStatus": null,
                        "domainDnsRequiredRecords": null,
                        "sslStatus": null,
                        "subscriptionId": 3,
                        "slug": "altcodepro",

                    }
                ],
                "marketplaceItems": [],
                "usage": [],
                "subscription": {
                    "id": 3,
                    "start_date": "2025-10-07T17:27:03.598462",
                    "end_date": "2026-10-07T17:27:03.598462",
                    "plan": {
                        "id": 4,
                        "name": "Starter",
                        "tier": "Professional",
                        "project_limit": 10,
                        "artifact_limit": 300,
                        "video_limit": 15,
                        "image_limit": 100,
                        "review_limit": 300,
                        "audio_limit": 20,
                        "can_generate_artifacts": true,
                        "can_download_artifacts": true,
                        "can_save_artifacts_to_ci_cd": true,
                        "monthly_price": 49,
                        "yearly_price": 499,
                        "display_order": 2,
                        "highlight": true,
                        "archived": false,
                        "is_active": true,
                        "created_at": "2025-09-25T00:03:53.885949",
                        "updated_at": "2025-09-25T00:25:09.902698"
                    }
                },
                "notifications": [],
                "referral_info": null,
                "feedbacks": []
            },
            "isAuthenticated": true,
        };
    });

    it("1) resolves i18n.welcome", () => {
        expect(resolveBinding("i18n.welcome", state, t)).toBe("Welcome!");
    });

    it("2) resolves translations.en.welcome style", () => {
        expect(resolveBinding("translations.en.greeting", state, t)).toContain("Hello,");
    });

    it("3) resolves state.user.name", () => {
        expect(resolveBinding("state.user.name", state, t)).toBe("Sireesh");
    });

    it("4) resolves form.email", () => {
        expect(resolveBinding("form.email", state, t)).toBe("test@example.com");
    });

    it("5) resolves {form.email}", () => {
        expect(resolveBinding("{form.email}", state, t)).toBe("test@example.com");
    });

    it("6) resolves {{form.email}}", () => {
        expect(resolveBinding("{{form.email}}", state, t)).toBe("test@example.com");
    });

    it("7) resolves env.API_URL", () => {
        expect(resolveBinding("env.API_URL", state, t)).toBe("https://api.example.com");
    });

    it("8) resolves UPPERCASE env constant", () => {
        expect(resolveBinding("API_DOMAIN", state, t)).toBe("https://envdomain.io");
    });

    it("9) resolves {{state.user.name}}", () => {
        expect(resolveBinding("{{state.user.name}}", state, t)).toBe("Sireesh");
    });

    it("10) resolves env + state combined", () => {
        const result = resolveBinding("{{env.API_URL}}/v1/{{state.user.id}}", state, t);
        expect(result).toBe("https://api.example.com/v1/u1");
    });

    it("11) resolves nested template placeholders recursively", () => {
        const result = resolveBinding("{{env.API_DOMAIN}}/users/{{user.id}}", state, t);
        expect(result).toBe("https://envdomain.io/users/u1");
    });

    it("12) resolves heuristic translation-like key", () => {
        expect(resolveBinding("dashboard.copy_referral_link", state, t)).toBe("Copy your referral link");
    });

    it("13) expands env templates in state strings", () => {
        const res = resolveBinding("${API_URL}/login", state, t);
        expect(res).toBe("https://api.example.com/login");
    });

    it("14) resolves {{t('dashboard.welcome')}}", () => {
        const res = resolveBinding("{{t('dashboard.welcome')}}", state, t);
        expect(res).toContain("Welcome to dashboard");
    });

    it("15) resolves templates inside translations", () => {
        const res = resolveBinding("en.greeting", state, t);
        expect(res).toBe("Hello, Sireesh!");
    });

    it("16) resolves expression with datasource", () => {
        const expr = "{{ds_user_info.data.organization.members.filter(m => m.userId == user.id)[0].roles[0]}}";
        const res = resolveBinding(expr, state, t);
        expect(res).toBe("Founder");
    });

    it("17) resolves array length", () => {
        const res = resolveBinding("{{ds_user_info.data.projects.length}}", state, t);
        expect(res).toBe(3);
    });

    it("18) resolves {t('dashboard.copy_referral_link')}", () => {
        const res = resolveBinding("{t('dashboard.copy_referral_link')}", state, t);
        expect(res).toBe("Copy your referral link");
    });

    it("19) resolves {user.displayName}", () => {
        const res = resolveBinding("{user.profile.display_name}", state, t);
        expect(res).toBe("S. Panglauri");
    });

    it("20) resolves {{user.displayName}}", () => {
        const res = resolveBinding("{{user.name}}", state, t);
        expect(res).toBe("Sireesh");
    });

    it("21) returns literal fallback when no match", () => {
        expect(resolveBinding("some.random.key", state, t)).toBe("some.random.key");
    });

    it("22) resolves multiple nested templates", () => {
        const res = resolveBinding(
            "API: {{API_URL}} | User: {{user.name}} | Org: {{params.orgId}}",
            state,
            t
        );
        expect(res).toContain("API:");
        expect(res).toContain("Sireesh");
        expect(res).toContain("org42");
    });

    it("23) resolves translation containing nested templates with data", () => {
        (t as any) = (key: string) =>
            key === "translate.en.welcome"
                ? "Welcome, {{user.profile.display_name}}!"
                : key;
        const res = resolveBinding("translate.en.welcome", state, t);
        expect(res).toBe("Welcome, S. Panglauri!");
    });

    it("24) handles undefined state safely", () => {
        expect(resolveBinding("state.unknown.path", {}, t)).toBe("");
    });

    it("25) resolves simple translation from state.translations dictionary", () => {
        expect(resolveBinding("projects.create", state, t)).toBe("New Project");
        expect(resolveBinding("{{t('actions.support')}}", state, t)).toBe("Support");
        expect(resolveBinding("actions.unknown", state, t)).toBe("actions.unknown");
    });
    it("26) load data array", () => {
        const response = resolveBinding("profile.projects", state, t);
        expect(JSON.stringify(response)).equal(JSON.stringify(state.profile.projects));
    });


});

describe("deepResolveBindings", () => {
    let t: (k: string) => string;
    let state: any;

    beforeEach(() => {
        t = vi.fn((k: string) => {
            const translations: Record<string, string> = {
                "i18n.welcome": "Welcome!",
                "cyclic.key": "{{cyclic.key}}",
                "deep.key": "{{deep.key}}",
            };
            return translations[k] ?? k;
        });

        state = {
            user: { name: "Sireesh" },
            form: { email: "sireesh@example.com" },
            env: process.env,
            translations: {
                en: {
                    "projects.create": "New Project",
                },
            },
            locale: "en",
        };
    });

    it("recursively resolves all nested bindings in objects and arrays", () => {
        const input = {
            message: "{{t('i18n.welcome')}} {{user.name}}",
            meta: ["{form.email}", "env.API_URL"],
            nested: {
                url: "{{env.API_URL}}/v1/{{user.name}}",
            },
        };
        const out = deepResolveBindings(input, state, t);

        expect(out.message).toBe("Welcome! Sireesh");
        expect(out.meta[0]).toBe("sireesh@example.com");
        expect(out.meta[1]).toBe("https://api.example.com");
        expect(out.nested.url).toBe("https://api.example.com/v1/Sireesh");
    });

    it("handles deeply nested objects with multiple bindings", () => {
        const input = {
            level1: {
                level2: {
                    level3: "{{user.name}}",
                    level3b: "{{env.API_URL}}",
                },
                level2b: ["{{form.email}}", "{{t('i18n.welcome')}}"],
            },
        };
        const out = deepResolveBindings(input, state, t);
        expect(out.level1.level2.level3).toBe("Sireesh");
        expect(out.level1.level2.level3b).toBe("https://api.example.com");
        expect(out.level1.level2b[0]).toBe("sireesh@example.com");
        expect(out.level1.level2b[1]).toBe("Welcome!");
    });
});