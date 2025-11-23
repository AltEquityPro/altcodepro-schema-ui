import { UIDefinition, ImageElement, Brand, IRoute, UIProject, AnyObj } from "@/types";

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
            // If no screenConfigUrl is provided, construct default URL from route.screenId
            if (!screenConfigUrl && route.screenId) {
                const label = route.screenId.replace(/\s+/g, '_');
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
export function applyPageMetadata(meta: any) {
    if (!meta) return;

    /* -----------------------------
       🧭 Basic document title + desc
    ----------------------------- */
    if (meta.title) document.title = meta.title;
    else if (!document.title) document.title = "AltCodePro";

    const setMeta = (name: string, content?: string) => {
        if (!content) return;
        let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
        if (!el) {
            el = document.createElement("meta");
            el.setAttribute("name", name);
            document.head.appendChild(el);
        }
        el.setAttribute("content", content);
    };

    setMeta("description", meta.description || "");
    setMeta("keywords", Array.isArray(meta.keywords) ? meta.keywords.join(", ") : meta.keywords || "");

    /* -----------------------------
       🏷️ Open Graph tags
    ----------------------------- */
    const og = meta.openGraph || {};
    const ogTags: Record<string, string | string[] | undefined> = {
        "og:title": og.title || meta.title,
        "og:description": og.description || meta.description,
        "og:url": og.url || meta.alternates?.canonical,
        "og:site_name": og.siteName || meta.applicationName,
    };

    // Handle multiple OG images (use first as fallback)
    const ogImages: string[] = Array.isArray(og.images) ? og.images : (og.images ? [og.images] : []);
    if (ogImages.length > 0) {
        ogTags["og:image"] = ogImages[0];
        // Optional multiple images
        document.querySelectorAll('meta[property^="og:image"]').forEach(el => el.remove());
        ogImages.forEach((imgUrl: string) => {
            const el = document.createElement("meta");
            el.setAttribute("property", "og:image");
            el.setAttribute("content", imgUrl);
            document.head.appendChild(el);
        });
    }

    Object.entries(ogTags).forEach(([property, content]) => {
        if (!content) return;
        let el = document.querySelector(`meta[property="${property}"]`);
        if (!el) {
            el = document.createElement("meta");
            el.setAttribute("property", property);
            document.head.appendChild(el);
        }
        el.setAttribute("content", String(content));
    });

    /* -----------------------------
       🐦 Twitter card tags
    ----------------------------- */
    const twitter = meta.twitter || {};
    const twitterTags: Record<string, string | undefined> = {
        "twitter:card": "summary_large_image",
        "twitter:site": twitter.site || "@AltCodePro",
        "twitter:title": twitter.title || meta.title,
        "twitter:description": twitter.description || meta.description,
        "twitter:image": twitter.images || (Array.isArray(twitter.image) ? twitter.image[0] : twitter.image),
    };
    Object.entries(twitterTags).forEach(([name, content]) => setMeta(name, content));

    /* -----------------------------
       🔗 Canonical link
    ----------------------------- */
    const canonicalUrl = meta.alternates?.canonical || og.url || "";
    if (canonicalUrl) {
        let linkEl = document.querySelector("link[rel='canonical']");
        if (!linkEl) {
            linkEl = document.createElement("link");
            linkEl.setAttribute("rel", "canonical");
            document.head.appendChild(linkEl);
        }
        linkEl.setAttribute("href", canonicalUrl);
    }

    /* -----------------------------
       🧩 Icons & favicon
    ----------------------------- */
    const iconUrl =
        meta.icons?.icon ||
        meta.icons?.apple ||
        meta.icons?.shortcut ||
        "/favicon.ico";

    if (iconUrl) {
        // Clean up existing favicons
        document.querySelectorAll("link[rel~='icon'], link[rel='apple-touch-icon']").forEach(el => el.remove());

        const iconRelSet = [
            { rel: "icon", href: iconUrl },
            { rel: "apple-touch-icon", href: iconUrl },
            { rel: "shortcut icon", href: iconUrl },
        ];
        iconRelSet.forEach(({ rel, href }) => {
            const el = document.createElement("link");
            el.setAttribute("rel", rel);
            el.setAttribute("href", href);
            document.head.appendChild(el);
        });
    }

    /* -----------------------------
       🍎 Apple web app metadata
    ----------------------------- */
    const apple = meta.appleWebApp || {};
    if (apple.capable) {
        setMeta("apple-mobile-web-app-capable", "yes");
        setMeta("apple-mobile-web-app-title", apple.title || meta.title);
        setMeta("apple-mobile-web-app-status-bar-style", apple.statusBarStyle || "default");
    }

    /* -----------------------------
       💬 JSON-LD Structured Data
    ----------------------------- */
    if (meta.jsonLd || meta.jsonld || meta.jsonLD) {
        const jsonLd = meta.jsonLd || meta.jsonld || meta.jsonLD;
        let jsonLdTag: any = document.getElementById("jsonld");
        if (!jsonLdTag) {
            jsonLdTag = document.createElement("script");
            jsonLdTag.type = "application/ld+json";
            jsonLdTag.id = "jsonld";
            document.head.appendChild(jsonLdTag);
        }
        jsonLdTag.textContent = JSON.stringify(jsonLd, null, 2);
    }

    /* -----------------------------
       🕓 Misc Metadata (publisher, author, etc.)
    ----------------------------- */
    if (meta.publisher) setMeta("publisher", meta.publisher);
    if (meta.creator) setMeta("creator", meta.creator);
    if (meta.applicationName) setMeta("application-name", meta.applicationName);

    // Optional viewport / theme-color
    if (meta.viewport) setMeta("viewport", meta.viewport);
    if (meta.themeColor) {
        let themeTag = document.querySelector("meta[name='theme-color']");
        if (!themeTag) {
            themeTag = document.createElement("meta");
            themeTag.setAttribute("name", "theme-color");
            document.head.appendChild(themeTag);
        }
        themeTag.setAttribute("content", meta.themeColor);
    }
}
