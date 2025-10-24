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
                    "customerId": "cus_T7ca4rVoU94PxI",
                    "defaultOrgid": "org:sireeshPangaluri",
                    "displayName": "Sireesh Pangaluri",
                    "email": "sireesh.psvs@gmail.com",
                    "emailVerified": false,
                    "hashedPassword": "$2b$12$j.u.8ZrKsl.R5alBCorgreTWxiusP6aWzdBHaABY8bWL2FUhy1P8q",
                    "name": "Sireesh Pangaluri",
                    "orgId": "org:sireeshPangaluri",
                    "phone": "+447774398018",
                    "phoneVerified": false,
                    "status": "active",
                    "twofaEnabled": false,
                    "updatedAt": "2025-09-27T14:02:26.352586+00:00",
                    "userId": "usr:0eb756a3a9a24ae486c6f961260ae5b4",
                    "id": "usr:0eb756a3a9a24ae486c6f961260ae5b4"
                },
                "org_id": "org:sireeshPangaluri",
                "user_id": "usr:0eb756a3a9a24ae486c6f961260ae5b4",
                "organization": {
                    "brand": {
                        "href": "https://altcode.pro/",
                        "name": "AltCodePro",
                        "logo_url": "https://cdn.altcode.pro/altcodepro/appstore.png",
                        "favicon_url": "https://cdn.altcode.pro/altcodepro/appstore.png",
                        "slogan": "AI-Powered Software Development and Autonomous DevOps Platform",
                        "social_media": {
                            "twitter": "https://twitter.com/altcodepro",
                            "linkedin": "https://linkedin.com/company/altcodepro",
                            "facebook": "https://facebook.com/altcodepro",
                            "instagram": "https://instagram.com/altcodepro",
                            "youtube": "https://youtube.com/altcodepro",
                            "github": "https://github.com/altcodepro",
                            "discord": "https://discord.com/invite/altcodepro",
                            "tiktok": "https://tiktok.com/@altcodepro",
                            "medium": "https://medium.com/altcodepro",
                            "website": "https://altcode.pro/"
                        },
                        "preferred_color": "#38bdf8"
                    },
                    "createdAt": "2025-09-27T14:02:26.790047",
                    "isActive": true,
                    "members": [
                        {
                            "organizationId": "org:sireeshPangaluri",
                            "assignedProjects": [],
                            "assignedWorkspaces": [],
                            "displayName": "Sireesh Pangaluri",
                            "email": "sireesh.psvs@gmail.com",
                            "userId": "usr:0eb756a3a9a24ae486c6f961260ae5b4",
                            "roles": [
                                "owner"
                            ],
                            "joinedAt": "2025-09-27T14:02:26.790103",
                            "status": "active"
                        }
                    ],
                    "name": "Sireesh Pangaluri's Org",
                    "orgId": "org:sireeshPangaluri",
                    "ownerEmail": "sireesh.psvs@gmail.com",
                    "ownerPhone": "+447774398018",
                    "projects": [
                        {
                            "name": "AltCodePro",
                            "workspace_id": "ws: 5c21957bd753",
                            "visibility": "public",
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
                            "settings": {
                                "api_url": "https: //api.altcode.pro/",
                                "ui_url": "https://altcode.pro/",
                                "email_key": null,
                                "sms_key": null,
                                "feature_flags": {
                                    "enable_docs": true
                                }
                            },
                            "extra_env_vars": {
                                "stripe_secret_key": "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"
                            },
                            "integrations": {},
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
                            "user_id": "usr:0eb756a3a9a24ae486c6f961260ae5b4",
                            "org_id": "org:sireeshPangaluri",
                            "subscription_id": 3,
                            "slug": "altcodepro",
                            "prompt_variables": {
                                "user_selected_domain": "SaaS",
                                "user_selected_client_type": "Responsive",
                                "user_selected_technologies": "nextjs",
                                "user_selected_database": "firestore",
                                "user_selected_region": "U.S.A",
                                "user_selected_cloud": "firebase",
                                "user_selected_case": "camelcase",
                                "user_selected_frontend": "nextjs",
                                "user_selected_backend": "firebase_functions",
                                "user_selected_languages": "English",
                                "user_selected_enterprise_services": "auth",
                                "user_deployment_type": "free",
                                "user_file_extension": ".ts"
                            },
                            "description": "## Project Title\nAltCodePro and AltAutonomousCodeAgent: AI-Driven Software Development and Autonomous DevOps Platform\n\n## Executive Summary\nAltCodePro automates generation of 100+ artifacts across 23 categories, covering the full product lifecycle from ideation to documentation. It helps startups, SMEs, and enterprises build compliant (GDPR, WCAG 2.1) software globally, reducing time/costs by 30-50%. AltAutonomousCodeAgent adds autonomous codebase optimization, analysis, refactoring, testing, and deployment, integrating with GitHub, Bitbucket, GitLab, Jira, Jenkins, Confluence. Together, they streamline workflows, boost quality/scalability. As of Aug 12, 2025, production-ready and marketplace-positioned. Integrations: ChatGPT/xAI agents, GCP/Azure/AWS/DigitalOcean SaaS, WhatsApp chat, Word/PDF plugins.\n\n## Product Overview\n### AltCodePro\nCloud-based AI platform automating artifacts for ideation, planning, design, development, testing, deployment, operations, support, documentation. Addresses manual inefficiencies with customizable, compliant artifacts (business plans, specs, code, UI, manuals). Built on FastAPI backend, PostgreSQL (SQLAlchemy ORM), Next.js frontend; integrates Prometheus/Grafana/Sentry/LogRocket for reliability. Subscription model with usage limits.\n\n### AltAutonomousCodeAgent\nAutonomous AI for repo-wide automation: analysis (tree-sitter), refactoring (LLMs like Grok/Azure OpenAI/Claude/Gemini), testing (Dockerized), deployment (branches/PRs/CI/CD across VCS). Integrates DevOps tools and xAI ecosystem. Scalable/secure (asyncio, Celery/Redis, encryption, sanitization). Freemium with VS Code/GitHub/Atlassian/cloud extensions.\n\n### Combined Vision\nHolistic automation from planning to maintenance, aligning with xAI's mission for faster, compliant software delivery.\n\n## Detailed Description\n### AltCodePro\n23 categories: 1. Ideation (vision/market/business case); 2. Investor Data Room (projections/pitch decks); 3. Branding (guidelines/logos); 4. Planning (roadmaps/requirements); 5. Design (journeys/systems/accessibility); 6. Database (models/migrations); 7. Architecture (scalable/modular); 8. Compliance (GDPR/WCAG checklists); 9. Specification (functional/technical); 10. Backend Code (APIs/scripts); 11. UI Code (wireframes/components/tests); 12. Testing (plans/benchmarks); 13. Release (CI/CD/monitoring); 14. Operations (runbooks/SLAs); 15. Support (guides/FAQs); 16. Marketing (strategies/campaigns); 17. Sales (enablement); 18. Analytics (dashboards/reports); 19. Community (portals/guidelines); 20. Change Management (logs/assessments); 21. Website (sitemaps/Next.js); 22. Training (tutorials/webinars); 23. User Documentation (manuals/API docs). Uses Jinja2 templates, FastAPI, PostgreSQL.\n\n### AltAutonomousCodeAgent\nKey features: Code Analysis (parse/identify issues); Refactoring (LLM improvements); Testing (pytest/npm with retries); Deployment (PRs/builds/auto-merge); Integrations (Jira/Jenkins/Confluence/xAI). Scalable (concurrent/async), secure (encryption/sanitization/rate limits). Packaged with README/MIT LICENSE/setup.\n\n## Expected Outcomes and Impact\n- Outcomes: 100+ artifacts, 30-50% time reduction; 95%+ test passes; marketplace-ready (VS Code/GitHub/etc.).\n- Impact: Faster launches for startups/SMEs; compliant solutions for enterprises; developer innovation; accessible software; leverages xAI/X users for reach.\n\n## Conclusion\nRevolutionary ecosystem automating development/DevOps. AltCodePro generates artifacts; AltAutonomousCodeAgent optimizes code. Robust stack/integrations position it to lead 2025 market vs. Copilot/Devin/etc., delivering value globally.\n\n## Subscription Plans\n- Free: 5k tokens, 10 projects, 1 image/video, 15 artifacts, 3 reviews; generate but no download/CI-CD.\n- Student: 10k tokens, 10 projects, 5 images/1 video, 30 artifacts/reviews; generate/download; $19/mo or $228/yr.\n- Founder: 25k tokens, 10 projects, 10 images/5 videos, 50 artifacts/reviews; full access; $49/mo or $499/yr.\n- Professional: 100k tokens, 10 projects, 15 images/5 videos, 300 artifacts/reviews; full; $149/mo or $1299/yr.\n- Enterprise: 1M tokens, 10 projects, 30 images/10 videos, 1000 artifacts/reviews; custom; contact for pricing.\n\n## Add-ons\n- Extra Tokens: 50k ($9/mo), 200k ($29/mo).\n- Extra Generations: 100 ($25/mo, ~200k tokens).\n- Extra Images: 50 ($15/mo).\n- Extra Videos: 5x10s HD ($49/one-time).\n- Team Seat: $15/mo/user.\n- Storage: 50GB ($10/mo).\n- API Booster: $49/mo.\n- CI/CD Premium: $29/mo.\n- Multi-Cloud Deploy: $99/mo/env.\n- Custom Domain+SSL: $19/mo.\n- Priority Support: $49/mo.\n- Account Manager: $499/mo.\n- Consulting: 10h ($1500/one-time).\n- Custom Branding: $299/mo.\n- Compliance Pack: $999/one-time.\n- SAML/SSO: $199/mo/org.\n- Custom SLA: $999/mo.\n- Analytics Pack: $49/mo.\n- Landing Page Credit: $19/mo/page.\n- Pitch Deck Pack: $299/one-time.\n- Social Automation: $29/mo.\n- SendGrid Email: 10k emails ($19/mo).\n- Twilio SMS: 1k SMS ($29/mo).\n- Local Phone: $5/mo/number.\n- Toll-Free Phone: $12/mo/number.\n- Onboarding: 4h ($199/one-time).\n- Sandbox Env: $99/mo.\n- Premium AI Model: $199/mo.\n- Enterprise Migration: $2999/one-time.\n- Branding Kit: $99/one-time.\n- GDPR Pack: $149/yr.\n- Deploy Automation: $49/mo.\n\n## Artifact Generations\nCategories include Ideation (vision, personas, etc.), Branding (guidelines, logos), Investor Data Room (overviews, projections), Planning (features, roadmap), Specification (functional/tech specs), Design (journeys, stories), Architecture (diagrams, microservices), Database (models, ER diagrams), Compliance (checklists, policies), Backend (structure, APIs, tests), UI Code (structure, screens, code), Testing (plans, cases), Release (notes, runbooks), Operations (SOPs, SLAs), Support (guides, KB), Marketing (campaigns, content), Sales (enablement), Community (portals, guides), Change Management (frameworks, logs), Training (plans, outlines), User Documentation (guides, manuals, videos), Corporate Website (sitemap, code, deployment)."
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
                            "name": "Starter",
                            "tier": "Professional",
                            "description": "All-in-one power for fast-scaling startups, teams, or consultants. Full compliance and AI-powered reviews..",
                            "stripe_product_id": "prod_T7HYVY4WdxLVxF",
                            "stripe_price_id": null,
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
                    "userId": "usr:0eb756a3a9a24ae486c6f961260ae5b4",
                    "workspaces": [
                        {
                            "id": "ws:5c21957bd753",
                            "name": "Default",
                            "description": "Personal workspace",
                            "createdAt": "2025-09-27T14:02:26.790080",
                            "updatedAt": "2025-09-27T14:02:26.790089",
                            "isActive": true,
                            "owners": [
                                "usr:0eb756a3a9a24ae486c6f961260ae5b4"
                            ],
                            "members": [
                                "usr:0eb756a3a9a24ae486c6f961260ae5b4"
                            ],
                            "visibility": "private",
                            "settings": {}
                        }
                    ],
                    "id": "usr:0eb756a3a9a24ae486c6f961260ae5b4"
                },
                "workspaces": [
                    {
                        "id": "ws:5c21957bd753",
                        "name": "Default",
                        "description": "Personal workspace",
                        "createdAt": "2025-09-27T14:02:26.790080",
                        "updatedAt": "2025-09-27T14:02:26.790089",
                        "isActive": true,
                        "owners": [
                            "usr:0eb756a3a9a24ae486c6f961260ae5b4"
                        ],
                        "members": [
                            "usr:0eb756a3a9a24ae486c6f961260ae5b4"
                        ],
                        "visibility": "private",
                        "settings": {}
                    }
                ],
                "projects": [
                    {
                        "name": "AltCodePro",
                        "workspaceId": "ws: 5c21957bd753",
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
                        "settings": {
                            "api_url": "https: //api.altcode.pro/",
                            "ui_url": "https://altcode.pro/",
                            "email_key": null,
                            "sms_key": null,
                            "feature_flags": {
                                "enable_docs": true
                            }
                        },
                        "extraEnvVars": {
                            "stripe_secret_key": "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"
                        },
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
                        "id": "prj:a1810ba95fc9",
                        "userId": "usr:0eb756a3a9a24ae486c6f961260ae5b4",
                        "orgId": "org:sireeshPangaluri",
                        "subscriptionId": 3,
                        "slug": "altcodepro",
                        "promptVariables": {
                            "user_selected_domain": "SaaS",
                            "user_selected_client_type": "Responsive",
                            "user_selected_technologies": "nextjs",
                            "user_selected_database": "firestore",
                            "user_selected_region": "U.S.A",
                            "user_selected_cloud": "firebase",
                            "user_selected_case": "camelcase",
                            "user_selected_frontend": "nextjs",
                            "user_selected_backend": "firebase_functions",
                            "user_selected_languages": "English",
                            "user_selected_enterprise_services": "auth",
                            "user_deployment_type": "free",
                            "user_file_extension": ".ts"
                        },
                        "description": "## Project Title\nAltCodePro and AltAutonomousCodeAgent: AI-Driven Software Development and Autonomous DevOps Platform\n\n## Executive Summary\nAltCodePro automates generation of 100+ artifacts across 23 categories, covering the full product lifecycle from ideation to documentation. It helps startups, SMEs, and enterprises build compliant (GDPR, WCAG 2.1) software globally, reducing time/costs by 30-50%. AltAutonomousCodeAgent adds autonomous codebase optimization, analysis, refactoring, testing, and deployment, integrating with GitHub, Bitbucket, GitLab, Jira, Jenkins, Confluence. Together, they streamline workflows, boost quality/scalability. As of Aug 12, 2025, production-ready and marketplace-positioned. Integrations: ChatGPT/xAI agents, GCP/Azure/AWS/DigitalOcean SaaS, WhatsApp chat, Word/PDF plugins.\n\n## Product Overview\n### AltCodePro\nCloud-based AI platform automating artifacts for ideation, planning, design, development, testing, deployment, operations, support, documentation. Addresses manual inefficiencies with customizable, compliant artifacts (business plans, specs, code, UI, manuals). Built on FastAPI backend, PostgreSQL (SQLAlchemy ORM), Next.js frontend; integrates Prometheus/Grafana/Sentry/LogRocket for reliability. Subscription model with usage limits.\n\n### AltAutonomousCodeAgent\nAutonomous AI for repo-wide automation: analysis (tree-sitter), refactoring (LLMs like Grok/Azure OpenAI/Claude/Gemini), testing (Dockerized), deployment (branches/PRs/CI/CD across VCS). Integrates DevOps tools and xAI ecosystem. Scalable/secure (asyncio, Celery/Redis, encryption, sanitization). Freemium with VS Code/GitHub/Atlassian/cloud extensions.\n\n### Combined Vision\nHolistic automation from planning to maintenance, aligning with xAI's mission for faster, compliant software delivery.\n\n## Detailed Description\n### AltCodePro\n23 categories: 1. Ideation (vision/market/business case); 2. Investor Data Room (projections/pitch decks); 3. Branding (guidelines/logos); 4. Planning (roadmaps/requirements); 5. Design (journeys/systems/accessibility); 6. Database (models/migrations); 7. Architecture (scalable/modular); 8. Compliance (GDPR/WCAG checklists); 9. Specification (functional/technical); 10. Backend Code (APIs/scripts); 11. UI Code (wireframes/components/tests); 12. Testing (plans/benchmarks); 13. Release (CI/CD/monitoring); 14. Operations (runbooks/SLAs); 15. Support (guides/FAQs); 16. Marketing (strategies/campaigns); 17. Sales (enablement); 18. Analytics (dashboards/reports); 19. Community (portals/guidelines); 20. Change Management (logs/assessments); 21. Website (sitemaps/Next.js); 22. Training (tutorials/webinars); 23. User Documentation (manuals/API docs). Uses Jinja2 templates, FastAPI, PostgreSQL.\n\n### AltAutonomousCodeAgent\nKey features: Code Analysis (parse/identify issues); Refactoring (LLM improvements); Testing (pytest/npm with retries); Deployment (PRs/builds/auto-merge); Integrations (Jira/Jenkins/Confluence/xAI). Scalable (concurrent/async), secure (encryption/sanitization/rate limits). Packaged with README/MIT LICENSE/setup.\n\n## Expected Outcomes and Impact\n- Outcomes: 100+ artifacts, 30-50% time reduction; 95%+ test passes; marketplace-ready (VS Code/GitHub/etc.).\n- Impact: Faster launches for startups/SMEs; compliant solutions for enterprises; developer innovation; accessible software; leverages xAI/X users for reach.\n\n## Conclusion\nRevolutionary ecosystem automating development/DevOps. AltCodePro generates artifacts; AltAutonomousCodeAgent optimizes code. Robust stack/integrations position it to lead 2025 market vs. Copilot/Devin/etc., delivering value globally.\n\n## Subscription Plans\n- Free: 5k tokens, 10 projects, 1 image/video, 15 artifacts, 3 reviews; generate but no download/CI-CD.\n- Student: 10k tokens, 10 projects, 5 images/1 video, 30 artifacts/reviews; generate/download; $19/mo or $228/yr.\n- Founder: 25k tokens, 10 projects, 10 images/5 videos, 50 artifacts/reviews; full access; $49/mo or $499/yr.\n- Professional: 100k tokens, 10 projects, 15 images/5 videos, 300 artifacts/reviews; full; $149/mo or $1299/yr.\n- Enterprise: 1M tokens, 10 projects, 30 images/10 videos, 1000 artifacts/reviews; custom; contact for pricing.\n\n## Add-ons\n- Extra Tokens: 50k ($9/mo), 200k ($29/mo).\n- Extra Generations: 100 ($25/mo, ~200k tokens).\n- Extra Images: 50 ($15/mo).\n- Extra Videos: 5x10s HD ($49/one-time).\n- Team Seat: $15/mo/user.\n- Storage: 50GB ($10/mo).\n- API Booster: $49/mo.\n- CI/CD Premium: $29/mo.\n- Multi-Cloud Deploy: $99/mo/env.\n- Custom Domain+SSL: $19/mo.\n- Priority Support: $49/mo.\n- Account Manager: $499/mo.\n- Consulting: 10h ($1500/one-time).\n- Custom Branding: $299/mo.\n- Compliance Pack: $999/one-time.\n- SAML/SSO: $199/mo/org.\n- Custom SLA: $999/mo.\n- Analytics Pack: $49/mo.\n- Landing Page Credit: $19/mo/page.\n- Pitch Deck Pack: $299/one-time.\n- Social Automation: $29/mo.\n- SendGrid Email: 10k emails ($19/mo).\n- Twilio SMS: 1k SMS ($29/mo).\n- Local Phone: $5/mo/number.\n- Toll-Free Phone: $12/mo/number.\n- Onboarding: 4h ($199/one-time).\n- Sandbox Env: $99/mo.\n- Premium AI Model: $199/mo.\n- Enterprise Migration: $2999/one-time.\n- Branding Kit: $99/one-time.\n- GDPR Pack: $149/yr.\n- Deploy Automation: $49/mo.\n\n## Artifact Generations\nCategories include Ideation (vision, personas, etc.), Branding (guidelines, logos), Investor Data Room (overviews, projections), Planning (features, roadmap), Specification (functional/tech specs), Design (journeys, stories), Architecture (diagrams, microservices), Database (models, ER diagrams), Compliance (checklists, policies), Backend (structure, APIs, tests), UI Code (structure, screens, code), Testing (plans, cases), Release (notes, runbooks), Operations (SOPs, SLAs), Support (guides, KB), Marketing (campaigns, content), Sales (enablement), Community (portals, guides), Change Management (frameworks, logs), Training (plans, outlines), User Documentation (guides, manuals, videos), Corporate Website (sitemap, code, deployment)."
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
                        "description": "All-in-one power for fast-scaling startups, teams, or consultants. Full compliance and AI-powered reviews..",
                        "stripe_product_id": "prod_T7HYVY4WdxLVxF",
                        "stripe_price_id": null,
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