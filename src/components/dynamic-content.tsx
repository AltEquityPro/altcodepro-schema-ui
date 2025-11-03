"use client";

import React, { memo, useEffect, useState } from "react";
import { ElementType, UIElement, UIDefinition } from "../types";
import { Skeleton } from "../components/ui/skeleton";
import { RenderChildren } from "../schema/RenderChildren";

export interface DynamicContentRendererProps {
    url?: string;
    contentType?: string; // MIME type hint (e.g. text/markdown, application/json)
    ext?: string;         // File extension hint (e.g. md, png, json)
    content?: string | object | null;
    state: Record<string, any>;
    setState: (path: string, value: any) => void;
    t: (key: string, defaultLabel?: string) => string;
    runEventHandler?: (handler?: any, dataOverride?: any) => Promise<void>;
}

export function convertContentToElements(data: any, idPrefix = "auto") {
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
                    data: Object.entries(data).map(([k, v]) => ({ key: k, value: v })),
                    options: { xKey: "key", yKey: "value", tooltip: true, legend: false },
                },
            ];
        }

        if ("elements" in data || "screens" in data) return [data as UIElement];

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

export const DynamicContentRenderer: React.FC<DynamicContentRendererProps> = memo(
    ({ url, contentType, ext, content, state, setState, t, runEventHandler }) => {
        const [loading, setLoading] = useState(false);
        const [data, setData] = useState<any>(null);
        const [fetchedUrl, setFetchedUrl] = useState<string | null>(null);

        useEffect(() => {
            if (!url || url === fetchedUrl) return;
            async function load() {
                if (!url) {
                    setData(content);
                    return;
                }

                setLoading(true);
                try {
                    const res = await fetch(url);
                    const mime = res.headers.get("Content-Type") || contentType || "";
                    const text = await res.text();

                    // Parse based on MIME or ext
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
                    } else if (mime.startsWith("text/")) {
                        setData(text);
                    } else {
                        setData(text);
                    }
                } catch (err) {
                    console.error("Failed to load dynamic content:", err);
                    setData("Error loading content");
                } finally {
                    setLoading(false);
                }
            }
            setFetchedUrl(url);
            setLoading(true);
            load();
        }, [url, content, contentType, ext]);

        if (loading) return <Skeleton className="w-full h-48" />;
        if (data == null) return null;

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
            } else if (
                ["png", "jpg", "jpeg", "gif", "webp"].includes(effectiveExt)
            ) {
                element = {
                    id: "img_block",
                    type: ElementType.image,
                    src: url!,
                    alt: "Image",
                    styles: {
                        className:
                            "max-w-full rounded-md shadow-md m-4 border border-[var(--acp-border)] dark:border-[var(--acp-border-dark)]",
                    },
                };
            } else if (["mp4", "webm", "mov", "mkv"].includes(effectiveExt)) {
                element = {
                    id: "vid_block",
                    type: ElementType.video,
                    src: url!,
                    styles: {
                        className:
                            "rounded-md shadow-md max-h-[75vh] w-full border border-[var(--acp-border)] dark:border-[var(--acp-border-dark)]",
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
