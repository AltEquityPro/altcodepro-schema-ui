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
