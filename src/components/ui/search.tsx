"use client";

import * as React from "react";
import { Search, X, Mic, Loader2 } from "lucide-react";
import { cleanDataSourceId, cn, resolveBinding } from "../../lib/utils";
import type { AnyObj, EventHandler, SearchElement } from "../../types";
import { Input } from "./input";
import { Button } from "./button";

interface SearchRendererProps {
    element: SearchElement;
    state: AnyObj;
    t: (key: string) => string;
    runEventHandler?: (
        handler?: EventHandler,
        dataOverride?: AnyObj
    ) => Promise<void>;
}

export function SearchRenderer({
    element,
    state,
    t,
    runEventHandler,
}: SearchRendererProps) {
    // Bindings & config
    const placeholder =
        resolveBinding(element.placeholder, state, t) ||
        t("search_placeholder") ||
        "Search…";
    const initialValue =
        (resolveBinding(element.value, state, t) as string) || "";

    const debounceMs = element.debounceMs ?? 300;
    const minLength = element.minLength ?? 0;
    const showClear = element.showClear ?? true;
    const showIcon = element.showIcon ?? true;
    const allowVoice = element.allowVoice ?? true;
    const voiceLang = element.voiceLang ?? "en-US";
    const maxSuggestions = element.maxSuggestions ?? 5;
    const allowHistory = element.allowHistory ?? true;

    // State
    const [query, setQuery] = React.useState(initialValue);
    const [isListening, setIsListening] = React.useState(false);
    const [loadingAI, setLoadingAI] = React.useState(false);
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [history, setHistory] = React.useState<string[]>([]);

    // Static suggestions
    React.useEffect(() => {
        if (!element.suggestionsDataSourceId) return;
        const v = state[cleanDataSourceId(element.suggestionsDataSourceId)];
        if (Array.isArray(v)) {
            const arr = v?.map((s: any) =>
                typeof s === "string" ? s : s.text || ""
            );
            setSuggestions(arr.slice(0, maxSuggestions));
        }
    }, [state, element.suggestionsDataSourceId, maxSuggestions]);

    // History
    React.useEffect(() => {
        if (!element.historyDataSourceId) return;
        const v = state[cleanDataSourceId(element.historyDataSourceId)];
        if (Array.isArray(v)) {
            const arr = v?.map((s: any) =>
                typeof s === "string" ? s : s.text || ""
            );
            setHistory(arr.slice(0, maxSuggestions));
        }
    }, [state, element.historyDataSourceId, maxSuggestions]);

    // Fetch AI suggestions
    const fetchAISuggestions = React.useCallback(
        async (q: string) => {
            if (!element.aiSuggestionsApi || q.length < minLength) return;
            try {
                setLoadingAI(true);
                let response: Response;

                if (element.aiSuggestionsMethod === "POST") {
                    response = await fetch(element.aiSuggestionsApi, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            ...(element.aiSuggestionsHeaders || {}),
                        },
                        body: JSON.stringify({ [element.aiSuggestionsParam || "query"]: q }),
                    });
                } else {
                    const url = new URL(element.aiSuggestionsApi);
                    url.searchParams.set(element.aiSuggestionsParam || "q", q);
                    response = await fetch(url.toString(), {
                        headers: element.aiSuggestionsHeaders || {},
                    });
                }

                const data = await response.json();
                const arr: string[] = Array.isArray(data)
                    ? data
                    : data.suggestions || [];
                setSuggestions(arr.slice(0, maxSuggestions));
            } catch (err) {
                console.error("AI suggestions error", err);
            } finally {
                setLoadingAI(false);
            }
        },
        [element, minLength, maxSuggestions]
    );

    // Debounced search
    React.useEffect(() => {
        const handle = setTimeout(() => {
            if (query.length >= minLength) {
                runEventHandler?.(element.onSearch, { query });
                fetchAISuggestions(query);

                if (allowHistory && query.trim()) {
                    setHistory((prev) => [query, ...prev.filter((h) => h !== query)]);
                }
            }
        }, debounceMs);
        return () => clearTimeout(handle);
    }, [query, element.onSearch, runEventHandler, debounceMs, minLength, allowHistory, fetchAISuggestions]);

    // Voice input
    const handleVoice = () => {
        if (!allowVoice || !("webkitSpeechRecognition" in window)) {
            console.warn("Speech recognition not supported.");
            return;
        }
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = voiceLang;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            runEventHandler?.(element.onVoiceStart, { id: element.id });
        };
        recognition.onend = () => {
            setIsListening(false);
            runEventHandler?.(element.onVoiceEnd, { id: element.id });
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuery(transcript);
            runEventHandler?.(element.onSearch, { query: transcript });
        };

        recognition.start();
    };

    // Clear search
    const clearQuery = () => {
        setQuery("");
        setSuggestions([]);
        runEventHandler?.(element.onClear, { id: element.id });
        runEventHandler?.(element.onSearch, { query: "" });
    };

    // Select suggestion
    const handleSuggestion = (s: string) => {
        setQuery(s);
        runEventHandler?.(element.onSelectSuggestion, { query: s });
        runEventHandler?.(element.onSearch, { query: s });
    };

    return (
        <div
            className={cn(
                "relative flex flex-col rounded-md border bg-(--acp-background) dark:bg-(--acp-background-dark) text-(--acp-foreground) dark:text-(--acp-foreground-dark) shadow-sm",
                element.styles?.className
            )}
        >
            {/* Input Row */}
            <div className="flex items-center gap-2 px-2 py-1">
                {showIcon && (
                    <Search
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                    />
                )}
                <Input
                    type="search"
                    role="searchbox"
                    aria-label={t("search") || "Search"}
                    placeholder={placeholder}
                    value={query}
                    disabled={element.disabled}
                    autoFocus={element.autoFocus}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 border-0 shadow-none focus-visible:ring-0"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            runEventHandler?.(element.onSearch, { query });
                        }
                    }}
                />
                {loadingAI && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {showClear && query && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={clearQuery}
                        aria-label={t("clear") || "Clear"}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
                {allowVoice && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("h-6 w-6", isListening && "text-red-500")}
                        onClick={handleVoice}
                        aria-label={t("voice_search") || "Voice search"}
                    >
                        <Mic className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="border-t bg-popover text-sm max-h-48 overflow-y-auto">
                    {suggestions?.map((s, i) => (
                        <button
                            key={i}
                            className="block w-full text-left px-3 py-2 hover:bg-accent"
                            onClick={() => handleSuggestion(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* History */}
            {allowHistory && history.length > 0 && (
                <div className="border-t bg-muted/30 text-xs px-3 py-2">
                    <div className="font-medium mb-1">
                        {t("recent_searches") || "Recent"}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {history?.map((h, i) => (
                            <button
                                key={i}
                                className="px-2 py-1 rounded bg-muted hover:bg-accent"
                                onClick={() => handleSuggestion(h)}
                            >
                                {h}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
