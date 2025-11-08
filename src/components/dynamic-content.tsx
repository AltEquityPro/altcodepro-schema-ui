"use client";

import React, {
    memo,
    Suspense,
    useEffect,
    useState,
    useRef,
} from "react";
import { createRoot } from "react-dom/client";
import {
    ElementType,
    UIDefinition,
    UIElement,
    UIProject,
} from "../types";
import { Skeleton } from "../components/ui/skeleton";
import { RenderChildren } from "../schema/RenderChildren";
import { toast } from "./ui/sonner";
import { ProjectLayout } from "@/schema/ProjectLayout";
import { StateProvider } from "@/schema/StateContext";
import ScreenRenderer from "@/schema/ScreenRenderer";
import Loader from "./ui/loader";

const img_ext = ["png", "jpg", "jpeg", "gif", "webp"];
const video_ext = ["mp4", "webm", "mov", "mkv"];

export interface DynamicContentRendererProps {
    url?: string;
    contentType?: string;
    ext?: string;
    content?: string | object | null;
    embedPage?: boolean;
    embedProjectSchema?: UIProject;
    state: Record<string, any>;
    setState: (path: string, value: any) => void;
    t: (key: string, defaultLabel?: string) => string;
    runEventHandler?: (
        handler?: any,
        dataOverride?: any
    ) => Promise<void>;
}

export function convertContentToElements(
    data: any,
    idPrefix = "auto"
) {
    if (data == null) return [];

    if (typeof data === "string") {
        const trimmed = data.trim();
        const isMarkdown =
            trimmed.startsWith("#") ||
            trimmed.includes("**") ||
            trimmed.includes("```") ||
            trimmed.includes("- ");
        const isHtml = /^<\/?[a-z][\s\S]*>/i.test(trimmed);

        if (isMarkdown) {
            return [
                {
                    id: `${idPrefix}_markdown`,
                    type: ElementType.text,
                    tag: "div",
                    content: trimmed,
                    contentFormat: "markdown",
                },
            ];
        }

        if (isHtml) {
            return [
                {
                    id: `${idPrefix}_html`,
                    type: ElementType.text,
                    tag: "div",
                    content: trimmed,
                    contentFormat: "html",
                },
            ];
        }

        return [
            {
                id: `${idPrefix}_text`,
                type: ElementType.text,
                tag: "pre",
                content: trimmed,
            },
        ];
    }

    if (Array.isArray(data)) {
        if (data.length === 0)
            return [
                {
                    id: `${idPrefix}_empty`,
                    type: ElementType.alert,
                    message: "No data available",
                    variant: "info",
                } as any,
            ];

        if (typeof data[0] === "object" && !Array.isArray(data[0])) {
            const keys = Object.keys(data[0]);
            const rowCount = data.length;
            const isNumeric = (val: any) =>
                typeof val === "number" || (!isNaN(val) && val !== "");
            const numericFields = keys.filter((k) => isNumeric(data[0][k]));

            if (numericFields.length >= 2 && rowCount > 2) {
                return [
                    {
                        id: `${idPrefix}_chart`,
                        type: ElementType.chart,
                        chartType: "bar",
                        data,
                        options: {
                            xKey: keys[0],
                            yKey: numericFields[0],
                            tooltip: true,
                            legend: true,
                            grid: true,
                            responsive: true,
                        },
                    },
                ];
            }

            if (keys.length > 2 && rowCount > 1) {
                return [
                    {
                        id: `${idPrefix}_table`,
                        type: ElementType.datagrid,
                        columns: keys.map((k) => ({
                            key: k,
                            header: k,
                            sortable: true,
                            filterable: true,
                        })),
                        rows: data,
                        selectable: true,
                        selectionMode: "multiple",
                    },
                ];
            }

            return data.map((item, i) => ({
                id: `${idPrefix}_card_${i}`,
                type: ElementType.card,
                title: { binding: item.title || `Item ${i + 1}` },
                content: [
                    {
                        id: `${idPrefix}_content_${i}`,
                        type: ElementType.text,
                        tag: "pre",
                        content: JSON.stringify(item, null, 2),
                    },
                ],
            }));
        }

        return [
            {
                id: `${idPrefix}_list`,
                type: ElementType.list,
                ordered: false,
                items: data.map((v: any, i) => ({
                    id: `${idPrefix}_list_item_${i}`,
                    type: ElementType.text,
                    tag: "li",
                    content: String(v),
                })),
            },
        ];
    }

    if (typeof data === "object") {
        const keys = Object.keys(data);

        if (keys.every((k) => typeof data[k] === "number")) {
            return [
                {
                    id: `${idPrefix}_chart_obj`,
                    type: ElementType.chart,
                    chartType: "bar",
                    data: Object.entries(data).map(([k, v]) => ({
                        key: k,
                        value: v,
                    })),
                    options: {
                        xKey: "key",
                        yKey: "value",
                        tooltip: true,
                        legend: false,
                    },
                },
            ];
        }

        if ("elements" in data || "screens" in data)
            return [data as UIElement];

        return Object.entries(data).map(([key, value], i) => ({
            id: `${idPrefix}_kv_${i}`,
            type: ElementType.card,
            title: { binding: key },
            content: [
                {
                    id: `${idPrefix}_kv_txt_${i}`,
                    type: ElementType.text,
                    tag: "pre",
                    content: JSON.stringify(value, null, 2),
                },
            ],
        }));
    }

    return [
        {
            id: `${idPrefix}_fallback`,
            type: ElementType.text,
            tag: "div",
            content: String(data),
        },
    ];
}

function PreviewApp({
    project,
    screen,
}: {
    project: UIProject;
    screen: any;
}) {
    const scr = screen?.elements
        ? {
            screens: [screen],
            guard: screen.guard,
            translations: screen.translations,
            id: screen.id,
            href: screen.route.href,
            route: screen.route,
            version: screen.version,
            state: screen.state,
            initialData: screen.initialData,
        }
        : screen;
    return (
        <Suspense fallback={<Loader text="Loading preview..." />}>
            <StateProvider project={project}>
                <ProjectLayout project={project} loading={false}>
                    <ScreenRenderer uiDef={scr} project={project} />
                </ProjectLayout>
            </StateProvider>
        </Suspense>
    );
}

export const DynamicContentRenderer: React.FC<
    DynamicContentRendererProps
> = memo(
    ({
        url,
        content,
        embedPage,
        embedProjectSchema,
        contentType,
        ext,
        state,
        setState,
        t,
        runEventHandler,
    }) => {
        const [loading, setLoading] = useState(false);
        const [data, setData] = useState<any>(null);
        const [fetchedUrl, setFetchedUrl] = useState<string | null>(null);
        const iframeRef = useRef<HTMLIFrameElement | null>(null);

        useEffect(() => {
            setData(content);
        }, [content]);

        useEffect(() => {
            if (!url || url === fetchedUrl) return;
            async function load() {
                if (!url)
                    return;
                if (ext && (img_ext.includes(ext) || video_ext.includes(ext))) {
                    setData(url);
                    setFetchedUrl(url);
                    return;
                }
                setLoading(true);
                try {
                    const res = await fetch(url);
                    const mime = res.headers.get("Content-Type") || contentType || "";
                    const text = await res.text();
                    if (mime.includes("application/json") || ext === "json") {
                        try {
                            setData(JSON.parse(text));
                        } catch {
                            setData(text);
                        }
                    } else if (
                        mime.includes("text/markdown") ||
                        ext === "md" ||
                        text.trim().startsWith("#")
                    ) {
                        setData(text);
                    } else {
                        setData(text);
                    }
                } catch (err) {
                    console.error("Failed to load dynamic content:", err);
                    toast.error("Error loading content");
                } finally {
                    setLoading(false);
                    setFetchedUrl(url);
                }
            }
            load();
        }, [url]);

        useEffect(() => {
            if (!embedPage || !iframeRef.current || !data || !embedProjectSchema)
                return;

            const iframeDoc = iframeRef.current.contentDocument;
            if (!iframeDoc) return;

            iframeDoc.open();
            iframeDoc.write(`
                        <!DOCTYPE html>
                        <html><head>
                        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
                        <style>
                            html,body{margin:0;padding:0;height:100%;
                            background:#000;color:#fff;
                            font-family:Inter,system-ui,sans-serif;}
                            #root{height:100%;}
                        </style>
                        </head>
                        <body><div id="root"></div></body></html>
                    `);
            iframeDoc.close();

            const mountNode = iframeDoc.getElementById("root");
            let root: any;
            if (mountNode) {
                root = createRoot(mountNode);
                root.render(
                    <PreviewApp project={embedProjectSchema} screen={data} />
                );
            }

            return () => {
                root?.unmount();
            };
        }, [embedPage, iframeRef, data, embedProjectSchema]);

        if (loading) return <Skeleton className="w-full h-48" />;
        if (data == null) return null;

        if (embedPage && data && embedProjectSchema) {
            return (
                <div className="flex flex-col w-full h-full" style={{
                    minHeight: "calc(100vh - 200px)",
                    maxHeight: "calc(100vh - 200px)",
                }}>
                    <div className="flex justify-end items-center p-2 border-b border-border/20">
                        <button
                            onClick={() => {
                                const w = window.open("", "_blank", "width=1280,height=800");
                                if (w) {
                                    w.document.write(
                                        iframeRef.current?.contentDocument?.documentElement
                                            .outerHTML || ""
                                    );
                                }
                            }}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            Preview Full Page ↗
                        </button>
                    </div>

                    <iframe
                        ref={iframeRef}
                        title="Client Site Preview"
                        sandbox="allow-scripts allow-same-origin allow-modals allow-popups"
                        referrerPolicy="no-referrer"
                        width={'100%'}
                        height={'80vh'}
                        className="flex-1 w-full h-[80vh] border-none bg-(--acp-background) rounded-md shadow-inner"
                    />
                </div>
            );
        }

        if (typeof data === "object") {
            if ("elements" in data) {
                return (
                    <RenderChildren
                        children={data.elements}
                        state={state}
                        setState={setState}
                        t={t}
                        runEventHandler={runEventHandler}
                    />
                );
            } else if ("screens" in data) {
                const elements: UIElement[] = [];
                (data.screens || []).forEach((s: any) => {
                    elements.push(...(s.elements || []));
                });
                return (
                    <RenderChildren
                        children={elements}
                        state={state}
                        setState={setState}
                        t={t}
                        runEventHandler={runEventHandler}
                    />
                );
            }
        }

        if (typeof data === "string") {
            const trimmed = data.trim();
            const effectiveExt =
                ext || url?.split("?")[0]?.split(".").pop()?.toLowerCase() || "";
            const isMarkdown =
                contentType?.includes("markdown") ||
                trimmed.startsWith("#") ||
                trimmed.includes("**") ||
                trimmed.includes("```");

            let element;

            if (isMarkdown) {
                element = {
                    id: "markdown_block",
                    type: ElementType.text,
                    tag: "div",
                    content: trimmed,
                    contentFormat: "markdown",
                };
            } else if (img_ext.includes(effectiveExt)) {
                element = {
                    id: "img_block",
                    type: ElementType.image,
                    src: url!,
                    alt: "Image",
                    styles: {
                        className:
                            "max-w-full max-h-[70vh] w-auto h-auto object-contain mx-auto my-6 rounded-md shadow-md border border-[var(--acp-border)] dark:border-[var(--acp-border-dark)]",
                    },
                };
            } else if (video_ext.includes(effectiveExt)) {
                element = {
                    id: "vid_block",
                    type: ElementType.video,
                    src: url!,
                    styles: {
                        className:
                            "w-full max-w-4xl max-h-[75vh] mx-auto my-6 rounded-md shadow-md object-contain border border-[var(--acp-border)] dark:border-[var(--acp-border-dark)]",
                    },
                };
            } else {
                element = {
                    id: "text_block",
                    type: ElementType.text,
                    tag: "pre",
                    content: trimmed,
                };
            }

            return (
                <RenderChildren
                    children={[element as any]}
                    state={state}
                    setState={setState}
                    t={t}
                    runEventHandler={runEventHandler}
                />
            );
        }

        const elements = convertContentToElements(data, "dynamic");
        return (
            <RenderChildren
                children={elements}
                state={state}
                setState={setState}
                t={t}
                runEventHandler={runEventHandler}
            />
        );
    }
);

export default DynamicContentRenderer;
