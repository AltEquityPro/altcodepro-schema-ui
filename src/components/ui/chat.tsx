"use client";

import { ChangeEvent, DragEvent, memo, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { openDB } from "idb";
import { v4 as uuidv4 } from "uuid";
import { List } from "react-window";
import { DynamicIcon } from "./dynamic-icon";
import { Button } from "./button";
import { Input } from "./input";
import { RichTextEditor } from "./richtext-input";
import { MarkdownInput, MarkdownRender } from "./markdown-input";
import { RenderChildren } from "../../schema/RenderChildren";
import { cn, codeExt, resolveBinding } from "../../lib/utils";
import { ElementType, TextElement, type AnyObj, type ChatElement, type EventHandler, type UIElement } from "../../types";
import { useAuth } from "../../schema/useAuth";
import { toast } from "./sonner";

interface VirtualRowProps {
    messages: Msg[];
    chatMode: "ai" | "direct" | "group";
    roleClasses: Partial<Record<Msg["role"], string>>;
    messageClassName?: string;
    showAvatars: boolean;
    showTimestamps: boolean;
    onReply: (text: string, msg: Msg) => void;
    onReact: (emoji: string, msg: Msg) => void;
    onCopy: (msg: Msg) => void;
    onDelete: (msg: Msg) => void;
    onAction: (msg: Msg, action: MsgAction) => void;
    onSpeak: (msg: Msg) => void;
    t: (key: string) => string;
    state: AnyObj;
    setState: (path: string, value: any) => void;
    runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>;
    threadMap: Map<string, Msg[]>;
    collapsedThreads: Set<string>;
    toggleThread: (id: string) => void;
}

type MessageRowProps = import("react-window").RowComponentProps<{ data: VirtualRowProps }>;

interface ChatParticipant {
    id: string;
    name?: string;
    avatarUrl?: string;
    role?: "owner" | "member" | "guest" | "bot";
    status?: "online" | "offline" | "away" | "typing";
}

type MsgAction = {
    id: string;
    label: string;
    icon?: string;
    variant?: "default" | "destructive" | "ghost" | "outline" | "secondary";
    payload?: AnyObj;
};

type Msg = {
    id: string;
    role: "user" | "assistant" | "system" | "other";
    text?: string;
    type?: string;
    ext?: string;
    createdAt?: number | string;
    jsonBuffer?: string;
    isFinal?: boolean;
    status?: "sending" | "sent" | "delivered" | "read" | "error" | "streaming";
    replyTo?: string;
    threadId?: string;
    reactions?: { [emoji: string]: string[] };
    attachments?: { id: string; name: string; url?: string; type?: string; size?: number; file?: File }[];
    actions?: MsgAction[];
    className?: string;
    children?: UIElement[];
    author?: { name?: string; avatarUrl?: string; role?: string };
    tools?: { id: string; label: string; icon?: string; params?: AnyObj }[];
};

type ChatState = {
    messages: Msg[];
    participants: ChatParticipant[];
    typing: { [userId: string]: boolean };
    activeThreadId: string | null;
    voice: "idle" | "recording" | "dictating";
    collapsedThreads: Set<string>;
    commandBar: { visible: boolean; suggestions: { id: string; label: string }[] };
};

type ChatAction =
    | { type: "init_from_history"; payload: Msg[] }
    | { type: "append_msg"; payload: Msg }
    | { type: "update_msg"; id: string; patch: Partial<Msg> }
    | { type: "append_token"; id: string; delta: string }
    | { type: "set_typing"; userId: string; value: boolean }
    | { type: "set_thread"; id: string | null }
    | { type: "set_participants"; payload: ChatParticipant[] }
    | { type: "reset_input" }
    | { type: "append_stream_chunk"; id: string; delta: string }
    | { type: "finalize_last_stream" }
    | { type: "set_voice"; value: ChatState["voice"] }
    | { type: "toggle_thread"; id: string }
    | { type: "set_command_bar"; visible: boolean; suggestions?: { id: string; label: string }[] };


function chatReducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
        case "init_from_history":
            const firstThread = action.payload.find((m) => !!m.threadId)?.threadId ?? null;
            return { ...state, messages: action.payload, activeThreadId: firstThread, collapsedThreads: new Set() };
        case "append_msg":
            return { ...state, messages: [...state.messages, action.payload] };
        case "update_msg":
            return {
                ...state,
                messages: state.messages?.map((m) => (m.id === action.id ? { ...m, ...action.patch } : m)),
            };
        case "append_token":
            return {
                ...state,
                messages: state.messages?.map((m) =>
                    m.id === action.id && m.status === "streaming"
                        ? { ...m, text: (m.text || "") + action.delta }
                        : m
                ),
            };
        case "append_stream_chunk": {
            const prev = state.messages.find((m) => m.id === action.id);
            if (!prev) return state;

            const buffer = (prev.jsonBuffer ?? "") + action.delta;
            let parsed: any = null;

            // Use safe incremental parser
            try {
                parsed = JSON.parse(buffer);
            } catch {
                // Try to detect trailing commas or partial structures
                if (buffer.trim().endsWith("}")) {
                    try { parsed = JSON.parse(buffer.slice(0, buffer.lastIndexOf("}") + 1)); } catch { }
                }
            }

            const children = parsed?.elements || (parsed?.element ? [parsed.element] : undefined);
            const text = children ? "" : buffer;

            return {
                ...state,
                messages: state.messages?.map((m) =>
                    m.id === action.id
                        ? { ...m, jsonBuffer: buffer, children, text, status: "streaming" }
                        : m
                ),
            };
        }
        case "finalize_last_stream": {
            const idx = [...state.messages].reverse().findIndex((m) => m.status === "streaming");
            if (idx === -1) return state;
            const actualIndex = state.messages.length - 1 - idx;
            const msg = state.messages[actualIndex];
            let children = msg.children;

            // final parse attempt if JSON buffered
            if (!children && msg.jsonBuffer) {
                try {
                    const parsed = JSON.parse(msg.jsonBuffer);
                    if (Array.isArray(parsed?.elements)) children = parsed.elements;
                } catch { }
            }

            const updated: Msg = { ...msg, status: "delivered", isFinal: true, children, jsonBuffer: undefined };
            const newMsgs = [...state.messages];
            newMsgs[actualIndex] = updated;
            return { ...state, messages: newMsgs };
        }
        case "set_typing":
            return {
                ...state,
                typing: { ...state.typing, [action.userId]: action.value },
            };
        case "set_thread":
            return { ...state, activeThreadId: action.id };
        case "set_participants":
            return { ...state, participants: action.payload };
        case "reset_input":
            return state;
        case "set_voice":
            return { ...state, voice: action.value };
        case "toggle_thread":
            const collapsed = new Set(state.collapsedThreads);
            if (collapsed.has(action.id)) collapsed.delete(action.id);
            else collapsed.add(action.id);
            return { ...state, collapsedThreads: collapsed };
        case "set_command_bar":
            return {
                ...state,
                commandBar: { visible: action.visible, suggestions: action.suggestions || state.commandBar.suggestions },
            };
        default:
            return state;
    }
}

function cryptoRandomId() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : uuidv4();
}

function formatTime(ts?: number | string) {
    const d = ts ? new Date(ts) : new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}


async function initPersistence(element: ChatElement) {
    if (!element.persistence) return null;
    if (element.persistence.type === "local") {
        const db = await openDB(element.persistence.dbName || "chat-app", 1, {
            upgrade(db) {
                db.createObjectStore("messages", { keyPath: "id" });
            },
        });
        return {
            save: async (messages: Msg[]) => {
                const tx = db.transaction("messages", "readwrite");
                const store = tx.objectStore("messages");
                await Promise.all(messages?.map((m) => store.put(m)));
                await tx.done;
            },
            load: async () => {
                const tx = db.transaction("messages", "readonly");
                const store = tx.objectStore("messages");
                return (await store.getAll()) as Msg[];
            },
        };
    } else if (element.persistence.type === "remote" && element.persistence.endpoint) {
        return {
            save: async (messages: Msg[]) => {
                await fetch(element.persistence!.endpoint!, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(messages),
                });
            },
            load: async () => {
                const res = await fetch(element.persistence!.endpoint!);
                return (await res.json()) as Msg[];
            },
        };
    }
    return null;
}

function applyModeration(text: string, rules: ChatElement["moderationRules"]) {
    if (!rules) return { allowed: true, reason: "" };
    for (const rule of rules) {
        const regex = new RegExp(rule.regex, "i");
        if (regex.test(text)) {
            return { allowed: false, reason: rule.action };
        }
    }
    return { allowed: true, reason: "" };
}

function useSpeechDictation(enabled: boolean, lang: string | undefined, onText: (t: string) => void) {
    const recRef = useRef<SpeechRecognition | null>(null);
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        const w = typeof window !== "undefined" ? window : undefined;
        const SR = w?.webkitSpeechRecognition || w?.SpeechRecognition;
        setSupported(!!SR);
        if (!SR) return;
        recRef.current = new SR();
        recRef.current.continuous = true;
        recRef.current.interimResults = true;
        if (lang) recRef.current.lang = lang;
        recRef.current.onresult = (e: SpeechRecognitionEvent) => {
            let text = "";
            for (let i = e.resultIndex; i < e.results.length; ++i) {
                text += e.results[i][0].transcript;
            }
            onText(text);
        };
        return () => recRef.current?.stop();
    }, [lang, onText]);

    const start = useCallback(() => {
        if (!enabled || !recRef.current) return false;
        try {
            recRef.current.start();
            return true;
        } catch {
            return false;
        }
    }, [enabled]);

    const stop = useCallback(() => {
        try {
            recRef.current?.stop();
        } catch { }
    }, []);

    return { supported, start, stop };
}

function useAudioCapture() {
    const mediaRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        setSupported(typeof window !== "undefined" && !!window.MediaRecorder);
    }, []);

    const start = useCallback(async () => {
        if (!supported) return false;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const rec = new MediaRecorder(stream);
            chunksRef.current = [];
            rec.ondataavailable = (e) => chunksRef.current.push(e.data);
            rec.start(100);
            mediaRef.current = rec;
            return true;
        } catch {
            return false;
        }
    }, [supported]);

    const stop = useCallback(async () => {
        const rec = mediaRef.current;
        if (!rec) return null;
        const stopped = new Promise<void>((resolve) => {
            rec.onstop = () => resolve();
        });
        rec.stop();
        await stopped;
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        mediaRef.current?.stream.getTracks().forEach((t) => t.stop());
        mediaRef.current = null;
        return blob;
    }, []);

    return { supported, start, stop };
}

function useCustomTTS(
    ttsUrl: string | undefined,
    token?: string,
    onError?: (err: any) => void
) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const speak = useCallback(
        async (text: string) => {
            if (!text || !ttsUrl) return;
            try {
                const headers: any = {
                    "Content-Type": "application/json",
                };
                headers['Authorization'] = `Bearer ${token}`;
                const res = await fetch(ttsUrl, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({ text }),
                });

                if (!res.ok) throw new Error(`TTS request failed: ${res.status}`);

                // Handle different backend response formats
                const contentType = res.headers.get("content-type") || "";

                if (contentType.includes("audio/")) {
                    // Direct audio stream (e.g., audio/mpeg)
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    playAudio(url);
                } else {
                    // JSON response with base64 or URL
                    const data = await res.json();
                    if (data.url) {
                        playAudio(data.url);
                    } else if (data.audioBase64) {
                        const blob = b64ToBlob(data.audioBase64, "audio/mpeg");
                        const url = URL.createObjectURL(blob);
                        playAudio(url);
                    } else {
                        throw new Error("Invalid TTS response");
                    }
                }
            } catch (err) {
                console.error("TTS Error:", err);
                onError?.(err);
            }
        },
        [ttsUrl, onError]
    );

    const playAudio = useCallback((url: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
            URL.revokeObjectURL(audioRef.current.src);
        }
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => URL.revokeObjectURL(url);
    }, []);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    return { speak, stop };
}

function b64ToBlob(b64Data: string, contentType = "", sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
}

function setupWebSocket(
    url: string,
    {
        protocol,
        heartbeat,
        headers,
        onOpen,
        onMessage,
        onError,
        onClose,
    }: {
        protocol?: "graphql-ws" | "graphql-transport-ws" | "subscriptions-transport-ws";
        heartbeat?: { interval: number; message: string | AnyObj };
        headers?: Record<string, string>;
        onOpen?: () => void;
        onMessage?: (data: any) => void;
        onError?: (err: any) => void;
        onClose?: () => void;
    }
) {
    let ws: WebSocket | null = null;
    let hb: NodeJS.Timeout | null = null;
    let backoff = 1000;
    const maxBackoff = 30000;
    let closed = false;

    const connect = () => {
        if (closed) return;
        ws = new WebSocket(url,);
        ws.onopen = () => {
            backoff = 1000;
            onOpen?.();
            const initPayload = headers && headers["Authorization"] ? { Authorization: headers["Authorization"] } : {};
            if (protocol === "graphql-ws" || protocol === "graphql-transport-ws") {
                ws?.send(JSON.stringify({ type: "connection_init", payload: initPayload }));
            }
            if (heartbeat) {
                hb = setInterval(() => {
                    if (ws?.readyState === WebSocket.OPEN) {
                        ws.send(typeof heartbeat.message === "string" ? heartbeat.message : JSON.stringify(heartbeat.message));
                    }
                }, heartbeat.interval);
            }
        };
        ws.onmessage = (evt) => {
            let data: any = evt.data;
            try {
                data = JSON.parse(evt.data);
            } catch { }
            if ((protocol === "graphql-ws" || protocol === "graphql-transport-ws") && data.type === "connection_ack") {
                // ready
            } else {
                onMessage?.(data);
            }
        };
        ws.onerror = (err) => {
            onError?.(err);
            ws?.close();
        };
        ws.onclose = () => {
            if (hb) clearInterval(hb);
            onClose?.();
            if (!closed) {
                setTimeout(connect, backoff);
                backoff = Math.min(backoff * 2, maxBackoff);
            }
        };
    };
    connect();

    const close = () => {
        closed = true;
        if (hb) clearInterval(hb);
        ws?.close();
    };

    const send = (obj: any) => {
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(typeof obj === "string" ? obj : JSON.stringify(obj));
        }
    };

    return { close, send };
}

function setupSSE(
    url: string,
    {
        headers,
        onMessage,
        onError,
        onOpen,
    }: {
        headers?: Record<string, string>;
        onMessage?: (data: any) => void;
        onError?: (err: any) => void;
        onOpen?: () => void;
    }
) {
    const controller = new AbortController();
    (async () => {
        try {
            const res = await fetch(url, { headers, signal: controller.signal });
            if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
            onOpen?.();
            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buf = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });
                let idx: number;
                while ((idx = buf.indexOf("\n\n")) >= 0) {
                    const chunk = buf.slice(0, idx).trim();
                    buf = buf.slice(idx + 2);
                    if (chunk.startsWith("data:")) {
                        const raw = chunk.replace(/^data:\s?/, "");
                        try {
                            const parsed = JSON.parse(raw);
                            onMessage?.(parsed);
                        } catch {
                            onMessage?.(raw);
                        }
                    }
                }
            }
        } catch (e) {
            if ((e as any).name !== "AbortError") onError?.(e);
        }
    })();

    return {
        close: () => controller.abort(),
    };
}

function CommandBar({
    suggestions,
    onSelect,
    visible,
    onClose,
}: {
    suggestions: { id: string; label: string }[];
    onSelect: (id: string) => void;
    visible: boolean;
    onClose: () => void;
}) {
    const [filter, setFilter] = useState("");
    const filtered = useMemo(
        () => suggestions.filter((s) => s.label.toLowerCase().includes(filter.toLowerCase())),
        [filter, suggestions]
    );

    if (!visible) return null;

    return (
        <div
            className="absolute bottom-full mb-2 w-full bg-(--acp-background) dark:bg-(--acp-background-dark) border border-(--acp-border) dark:border-(--acp-border-dark) rounded-md shadow-lg max-h-60 overflow-y-auto z-10"
            role="dialog"
            aria-label="Command palette"
        >
            <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Type / for commands..."
                className="border-0 bg-transparent"
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === "Escape") onClose();
                }}
                aria-label="Filter commands"
            />
            {filtered?.length === 0 ? (
                <div className="px-4 py-2 text-sm text-(--acp-foreground-50)">No commands found</div>
            ) : (
                filtered?.map((s) => (
                    <Button
                        key={s.id}
                        variant="ghost"
                        className="w-full text-left justify-start gap-2"
                        onClick={() => {
                            onSelect(s.id);
                            onClose();
                        }}
                        role="option"
                    >
                        <DynamicIcon name="sparkles" className="h-4 w-4" />
                        {s.label}
                    </Button>
                ))
            )}
        </div>
    );
}

function mapMessageData(raw: any, map?: ChatElement['dataMap'], richResponses?: boolean): Msg {
    if (!map) map = {};

    const get = (path?: string, fallback?: any) => {
        if (!path) return fallback;
        return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : fallback), raw);
    };
    const createdAtRaw = get(map.createdAt, Date.now());
    const createdAt = typeof createdAtRaw === "string" || typeof createdAtRaw === "number"
        ? createdAtRaw
        : Date.now();
    return {
        id: get(map.id, cryptoRandomId()),
        role: get(map.role, "assistant"),
        text: richResponses ? '' : get(map.text, get("message", "")),
        createdAt: createdAt,
        status: get(map.status, "delivered"),
        replyTo: get(map.replyTo),
        threadId: get(map.threadId),
        reactions: get(map.reactions, {}),
        attachments: Array.isArray(get(map.attachments)) ? get(map.attachments) : [],
        actions: Array.isArray(get(map.actions)) ? get(map.actions) : [],
        children: get(map.children, richResponses ? [
            {
                content: map.text,
                contentFormat: 'markdown',
                type: 'text',
            }
        ] : []),
        author: {
            name: get(map.author?.name),
            avatarUrl: get(map.author?.avatarUrl),
            role: get(map.author?.role),
        },
        tools: get(map.tools, []),
    };
}

const MessageBubble = memo(function MessageBubble({
    msg,
    chatMode = "ai",
    roleClasses = {},
    globalMessageClassName,
    showAvatars,
    showTimestamps,
    onReply,
    onReact,
    onCopy,
    onDelete,
    onAction,
    onSpeak,
    t,
    state,
    setState,
    runEventHandler,
    threadMessages = [],
    isThreadCollapsed,
    toggleThread,
}: {
    msg: Msg;
    chatMode?: "ai" | "direct" | "group";
    roleClasses?: Partial<Record<Msg["role"], string>>;
    globalMessageClassName?: string;
    showAvatars?: boolean;
    showTimestamps?: boolean;
    onReply: (text: string, msg: Msg) => void;
    onReact: (emoji: string, msg: Msg) => void;
    onCopy: (msg: Msg) => void;
    onDelete: (msg: Msg) => void;
    onAction: (msg: Msg, action: MsgAction) => void;
    onSpeak: (msg: Msg) => void;
    t: (key: string, defaultLabel?: string) => string;
    state: AnyObj;
    setState: (path: string, value: any) => void;
    runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>;
    threadMessages: Msg[];
    isThreadCollapsed: boolean;
    toggleThread: () => void;
}) {

    const baseByMode =
        chatMode === "ai"
            ? msg.role === "user"
                ? cn("ml-auto", roleClasses.user)
                : msg.role === "assistant"
                    ? cn("mr-auto", "text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)]", roleClasses.assistant)
                    : cn("mx-auto", " bg-(--acp-background)/50   dark:bg-(--acp-background-dark)/50 text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)]", roleClasses.system)
            : msg.role === "user"
                ? cn("ml-auto", "bg-[var(--acp-secondary-200)]  text-[var(--acp-background)]", roleClasses.user)
                : cn("mr-auto", "text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)]", roleClasses.other);

    const bubbleClass = cn(
        "group relative max-w-[80%] break-words shadow-sm transition-all duration-200",
        "px-4 py-3 rounded-2xl",
        globalMessageClassName,
        baseByMode,
        msg.className
    );

    const Avatar = ({ url, alt }: { url?: string; alt?: string }) => (
        <img
            src={url || (msg.role === "assistant" ? "/avatars/ai.png" : msg.role === "system" ? "/avatars/system.png" : "/avatars/default.png")}
            alt={alt || msg.role}
            className="w-8 h-8 rounded-full ring-2 ring-(--acp-background)"
            aria-hidden="true"
        />
    );
    const [stableChildren, setStableChildren] = useState<UIElement[] | undefined>(msg.children);
    useEffect(() => {
        const t = setTimeout(() => setStableChildren(msg.children), 100);
        return () => clearTimeout(t);
    }, [msg.children]);
    return (
        <div className={cn("flex flex-col gap-3 w-full", msg.role === "user" ? "items-end" : "items-start")} role="article">
            <div className={cn("flex items-start gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
                {showAvatars && msg.role !== "user" && <Avatar url={msg.author?.avatarUrl} alt={msg.author?.name} />}

                <div className={bubbleClass}>
                    <div className="prose prose-sm max-w-none">
                        {msg.text && msg.text.trim() && (
                            <MarkdownRender content={msg.text} className={msg.className} />
                        )}

                        {Array.isArray(stableChildren) && stableChildren.length > 0 && (
                            <div
                                className={cn(
                                    "mt-3 flex flex-col gap-3 transition-opacity duration-150",
                                    msg.status === "streaming" ? "opacity-80" : "opacity-100"
                                )}
                            >
                                <RenderChildren
                                    children={stableChildren}
                                    t={t}
                                    state={state}
                                    setState={setState}
                                    runEventHandler={runEventHandler}
                                />
                            </div>
                        )}

                        {!msg.text && (!msg.children || msg.children.length === 0) && (
                            <div className="opacity-60 italic text-xs animate-pulse">
                                {t("generating", "Generating response…")}
                            </div>
                        )}
                    </div>
                    {msg?.attachments?.length ? (
                        <div className="mt-4 space-y-3">
                            {msg?.attachments?.map((a) => {
                                if (a.type?.startsWith("image/")) {
                                    return (
                                        <div key={a.id} className="rounded-xl overflow-hidden shadow-sm">
                                            <img src={a.url!} alt={a.name} className="w-full max-w-md h-auto" />
                                        </div>
                                    );
                                }
                                if (a.type?.startsWith("video/")) {
                                    return (
                                        <video key={a.id} src={a.url!} controls className="rounded-xl max-w-md w-full shadow-sm">
                                            Your browser does not support the video tag.
                                        </video>
                                    );
                                }
                                if (a.type?.startsWith("audio/")) {
                                    return (
                                        <div key={a.id} className="bg-(--acp-secondary-100)/50 rounded-xl p-4">
                                            <audio controls className="w-full">
                                                <source src={a.url!} type={a.type!} />
                                                Your browser does not support the audio element.
                                            </audio>
                                        </div>
                                    );
                                }
                                return (
                                    <a
                                        key={a.id}
                                        href={a.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={cn(
                                            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                                            "bg-(--acp-secondary)/20 text-(--acp-foreground) dark:text-(--acp-foreground-dark) hover:bg-(--acp-secondary)/30",
                                            "transition-colors border border-(--acp-secondary)/30"
                                        )}
                                        aria-label={`Download ${a.name}`}
                                    >
                                        <DynamicIcon name="download" className="h-4 w-4" />
                                        {a.name}
                                    </a>
                                );
                            })}
                        </div>
                    ) : null}

                    {Array.isArray(msg?.tools) && msg?.tools?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {msg?.tools?.map((tool) => (
                                <Button
                                    key={tool.id}
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        runEventHandler?.(({} as AnyObj).onMessageAction, {
                                            action: "tool_action",
                                            toolId: tool.id,
                                            params: tool.params,
                                            msgId: msg.id,
                                        })
                                    }
                                    className="flex items-center gap-2"
                                    aria-label={`Use tool ${tool.label}`}
                                >
                                    <DynamicIcon name={tool.icon || "zap"} className="h-4 w-4" />
                                    {tool.label}
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Reactions */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="flex gap-2 mt-4 pt-3 border-t border-(--acp-border) dark:border-(--acp-border-dark)/50">
                            {Object.entries(msg.reactions)?.map(([emoji, users]) => (
                                <button
                                    key={emoji}
                                    className="group inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-(--acp-secondary)/20 text-(--acp-foreground) dark:text-(--acp-foreground-dark) hover:bg-(--acp-secondary)/30 transition-colors"
                                    onClick={() => onReact(emoji, msg)}
                                    title={users.join(", ")}
                                    aria-label={`React with ${emoji}`}
                                >
                                    <span className="text-lg">{emoji}</span>
                                    <span className="group-hover:opacity-100 opacity-70">{users.length}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-(--acp-border) dark:border-(--acp-border-dark)/50">
                        <div className="flex items-center gap-4">
                            {msg.role === "assistant" && (
                                <button
                                    onClick={() => onSpeak(msg)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-(--acp-secondary)/20 text-(--acp-foreground) dark:text-(--acp-foreground-dark) hover:bg-(--acp-secondary)/30 transition-colors"
                                    aria-label={t("listen", 'Listen')}
                                >
                                    <DynamicIcon name="volume-2" className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t("listen", 'Listen')}</span>
                                </button>
                            )}
                            {showTimestamps && (
                                <div className="text-xs text-(--acp-foreground-50)">{formatTime(msg.createdAt)}</div>
                            )}
                            {msg.status === "streaming" && !msg.children && (
                                <div className="flex items-center gap-1 text-xs text-(--acp-foreground-50) animate-pulse">
                                    <DynamicIcon name="loader-2" className="h-4 w-4 animate-spin" />
                                    {t("generating_ui", "Generating UI components…")}
                                </div>
                            )}
                            {msg.status === "error" && (
                                <div className="flex items-center gap-1 text-xs text-(--acp-destructive)">
                                    <DynamicIcon name="alert-circle" className="h-4 w-4" />
                                    <span>{t("error", 'Error')}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DynamicIcon name="reply" className="h-4 w-4 text-secondary-foreground" title={t("reply", 'Reply')} onClick={() => onReply(`↩️ ${msg.text || ""}`, msg)} />
                            <DynamicIcon name="copy" className="h-4 w-4 text-secondary-foreground" title={t("copy", 'Copy')} onClick={() => onCopy(msg)} />
                            <DynamicIcon name="trash-2" className="h-4 w-4 text-secondary-foreground" title={t("delete", 'Delete')} onClick={() => onDelete(msg)} />
                            {Array.isArray(msg.actions) &&
                                msg?.actions?.map((a) => (
                                    <Button
                                        key={a.id}
                                        size="sm"
                                        variant={a.variant || "outline"}
                                        className="h-7 px-2 text-xs"
                                        onClick={() => onAction(msg, a)}
                                        aria-label={a.label}
                                    >
                                        <DynamicIcon name={a.icon || "more-horizontal"} className="h-4 w-4 mr-1" />
                                        {a.label}
                                    </Button>
                                ))}
                        </div>
                    </div>
                </div>

                {showAvatars && msg.role === "user" && <Avatar url={msg.author?.avatarUrl} alt={msg.author?.name} />}
            </div>

            {threadMessages.length > 0 && (
                <div className={cn("w-full", msg.role === "user" ? "pl-12" : "ml-12")}>
                    <button
                        onClick={toggleThread}
                        className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-(--acp-secondary)/20 text-(--acp-foreground) dark:text-(--acp-foreground-dark) hover:bg-(--acp-secondary)/30 transition-colors w-full"
                        aria-expanded={!isThreadCollapsed}
                        aria-controls={`thread-${msg.id}`}
                    >
                        <DynamicIcon
                            name={isThreadCollapsed ? "chevron-down" : "chevron-up"}
                            className="h-4 w-4 group-hover:scale-110 transition-transform"
                        />
                        {isThreadCollapsed
                            ? <span>{t("show_replies", 'Show')} {`${threadMessages.length} replies`} </span>
                            : <span>{t("hide_replies", 'Hide')} {`${threadMessages.length} replies`}</span>}
                    </button>
                    {!isThreadCollapsed && (
                        <div id={`thread-${msg.id}`} role="group">
                            {threadMessages?.map((threadMsg) => (
                                <MessageBubble
                                    key={threadMsg.id}
                                    msg={threadMsg}
                                    chatMode={chatMode}
                                    roleClasses={roleClasses}
                                    globalMessageClassName={globalMessageClassName}
                                    showAvatars={false}
                                    showTimestamps={showTimestamps}
                                    onReply={onReply}
                                    onReact={onReact}
                                    onCopy={onCopy}
                                    onDelete={onDelete}
                                    onAction={onAction}
                                    onSpeak={onSpeak}
                                    t={t}
                                    state={state}
                                    setState={setState}
                                    runEventHandler={runEventHandler}
                                    threadMessages={[]}
                                    isThreadCollapsed={false}
                                    toggleThread={() => { }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

const MessageRow = memo(({ index, style, data }: MessageRowProps) => {
    const msg = data.messages[index];
    const threadMessages = data.threadMap.get(msg.id) || [];
    const isThreadCollapsed = data.collapsedThreads.has(msg.id);

    return (
        <div style={style}>
            <MessageBubble
                msg={msg}
                chatMode={data.chatMode}
                roleClasses={data.roleClasses}
                globalMessageClassName={data.messageClassName}
                showAvatars={data.showAvatars}
                showTimestamps={data.showTimestamps}
                onReply={data.onReply}
                onReact={(emoji, m) => data.onReact(emoji, m)}
                onCopy={data.onCopy}
                onDelete={data.onDelete}
                onAction={data.onAction}
                onSpeak={data.onSpeak}
                t={data.t}
                state={data.state}
                setState={data.setState}
                runEventHandler={data.runEventHandler}
                threadMessages={threadMessages}
                isThreadCollapsed={isThreadCollapsed}
                toggleThread={() => data.toggleThread(msg.id)}
            />
        </div>
    );
});
const messagesFromSource = (element: ChatElement, state: AnyObj, t: (key: string, defaultLabel?: string | undefined) => string): Msg[] => {
    if (!element.dataSourceId) return [];
    const val = resolveBinding(element.dataSourceId, state, t);
    if (!val) return []
    if (typeof val === 'string') {
        return element.richResponses ? [{
            id: cryptoRandomId(),
            role: 'assistant',
            createdAt: Date.now(),
            isFinal: true,
            status: 'read',
            children: [
                {
                    content: val,
                    contentFormat: 'markdown',
                    type: ElementType.text
                } as TextElement
            ]
        }] : [{
            id: cryptoRandomId(),
            role: 'assistant',
            createdAt: Date.now(),
            isFinal: true,
            status: 'read',
            text: val
        }];
    } else if (Array.isArray(val)) {
        return val.map((item: any) => mapMessageData(item, element.dataMap, element.richResponses));
    } else if (typeof val === 'object') {
        const resp = { ...val };
        if (element.richResponses) {
            let el: any = {};
            if (val.type?.includes('image') || (val.ext && ['png', 'jpg', 'svg', 'gif', 'webp', 'ico'].includes(val.ext))) {
                el = {
                    type: 'image',
                    src: val.content || val.text
                }
            } else if (val.type?.includes('video') || (val.ext && ['mp4', 'mov', 'mkv', 'avi', 'webm'].includes(val.ext))) {
                el = {
                    type: 'video',
                    src: val.content || val.text
                }
            } else if (codeExt.includes(val.ext)) {
                el = {
                    type: 'code',
                    value: val.content || val.text
                }
            } else {
                el = {
                    type: 'text',
                    contentFormat: 'markdown',
                    content: val.content || val.text
                }
            }

            resp.children = [el]
            delete resp.text;
            return [resp];
        } else {
            if (!resp.text && resp.content) {
                resp.text = resp.content
            }
            return [resp];
        }

    } else {
        return val
    }
};

export function Chat({
    element,
    state,
    t,
    setState,
    runEventHandler,
}: {
    element: ChatElement;
    state: AnyObj;
    setState: (path: string, value: any) => void;
    t: (key: string, defaultLabel?: string) => string;
    runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const auth = useAuth();

    const {
        chatMode = "ai",
        roleClasses = {},
        messageClassName,
        showThreadHeaders = false,
        inputMode = (element.styles?.responsiveClasses as any)?.inputMode || "textarea",
        allowVoice = true,
        voiceLanguage,
        showAvatars = false,
        typingIndicator = false,
        commandSuggestions = [],
        moderationRules = [],
        maxMessages = 1000,
    } = element;

    const placeholder = resolveBinding(element.placeholder, state, t) || "Type a message…";
    const headers = useMemo(() => ({ ...(element?.headers || {}) }), [element]);
    const [input, setInput] = useState("");
    const [attachments, setAttachments] = useState<Msg["attachments"]>([]);

    const [{ messages, typing, activeThreadId,
        participants, voice, collapsedThreads,
        commandBar }, dispatch] = useReducer(
            chatReducer,
            {
                messages: [],
                typing: {},
                activeThreadId: null,
                participants: [],
                voice: "idle",
                collapsedThreads: new Set<string>(),
                commandBar: { visible: false, suggestions: commandSuggestions },
            }
        );


    const handleDragDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            const files = Array.from(e?.dataTransfer?.files)?.map((file) => ({
                id: cryptoRandomId(),
                name: file.name,
                type: file.type,
                size: file.size,
                file,
            }));
            setAttachments((prev: any) => [...prev, ...files]);
        },
        []
    );

    const threadMap = useMemo(() => {
        const map = new Map<string, Msg[]>();
        messages.forEach((m) => {
            const tid = m.threadId || m.replyTo || "";
            if (tid) {
                const arr = map.get(tid) || [];
                arr.push(m);
                map.set(tid, arr);
            }
        });
        return map;
    }, [messages]);

    const threads = useMemo(() => {
        const map = new Map<string, Msg[]>();
        const noThread: Msg[] = [];
        for (const m of messages) {
            if (!m.threadId && !m.replyTo) noThread.push(m);
            else {
                const tid = m.threadId || m.replyTo || "";
                const arr = map.get(tid) || [];
                arr.push(m);
                map.set(tid, arr);
            }
        }
        const arr: { id: string; messages: Msg[] }[] = [];
        for (const [id, msgs] of map.entries()) arr.push({ id, messages: msgs });
        if (noThread.length) arr.unshift({ id: "", messages: noThread });
        return arr;
    }, [messages]);

    useEffect(() => {
        let mounted = true;
        initPersistence(element).then((db) => {
            if (!mounted || !db) return;
            db.load().then((msgs) => {
                if (mounted) dispatch({ type: "init_from_history", payload: msgs.slice(-maxMessages) });
            });
            const saveInterval = setInterval(() => db.save(messages), 5000);
            return () => clearInterval(saveInterval);
        });
        return () => {
            mounted = false;
        };
    }, [maxMessages, messages]);

    useEffect(() => {
        const historyKey = element.historyDataSourceId;
        if (!historyKey) return;
        const hist = state[historyKey];
        if (!Array.isArray(hist)) return;
        const normalized: Msg[] = hist?.map((h: AnyObj, i: number) => ({
            id: h.id || cryptoRandomId(),
            role: (h.role || "user") as Msg["role"],
            text: h.text || "",
            createdAt: h.createdAt || Date.now(),
            status: h.status || "delivered",
            replyTo: h.replyTo,
            threadId: h.threadId,
            reactions: h.reactions || {},
            attachments: Array.isArray(h.attachments) ? h.attachments : [],
            actions: Array.isArray(h.actions) ? h.actions : [],
            className: h.className,
            children: h.children,
            author: h.author,
            tools: h.tools,
        }));
        dispatch({ type: "init_from_history", payload: normalized.slice(-maxMessages) });
    }, [element.historyDataSourceId, state, maxMessages]);

    useEffect(() => {
        let cleanup: { close: () => void } | null = null;
        if (element.ws?.url) {
            const heads: any = { ...headers }
            heads['Authorization'] = `Bearer ${auth.token}`;
            const ref = setupWebSocket(element.ws?.url, {
                headers: heads,
                onMessage: (data) => {
                    if (data?.type === "presence_update" && Array.isArray(data.participants)) {
                        dispatch({ type: "set_participants", payload: data.participants });
                        data.participants.forEach((p: ChatParticipant) => {
                            if (p.status === "typing") {
                                dispatch({ type: "set_typing", userId: p.id, value: true });
                                setTimeout(() => dispatch({ type: "set_typing", userId: p.id, value: false }), 3000);
                            }
                        });
                    }
                },
            });
            cleanup = { close: ref.close };
        }
        return () => cleanup?.close();
    }, [element, headers]);

    useEffect(() => {
        let cleanup: { close: () => void } | null = null;

        const handleStreamMessage = (data: any) => {
            if (!data) return;
            const id = data.messageId || data.id || "stream-" + Date.now();
            if (data.type === "start" && data.messageId) {
                dispatch({
                    type: "append_msg",
                    payload: {
                        id: data.messageId,
                        role: "assistant",
                        text: "",
                        createdAt: Date.now(),
                        status: "streaming",
                        threadId: data.threadId,
                        author: data.author,
                    },
                });
            } else if (data.type === "token" && data.messageId && typeof data.delta === "string") {
                dispatch({ type: "append_token", id: data.messageId, delta: data.delta });
            } else if (data.type === "final") {
                const m: Msg = data.message;
                dispatch({
                    type: "update_msg",
                    id: m.id,
                    patch: { text: m.text, status: "delivered", actions: m.actions, tools: m.tools },
                });
            } else if (data.type === "status_update" && data.messageId && data.status) {
                dispatch({ type: "update_msg", id: data.messageId, patch: { status: data.status } });
            }
        };

        const heads: any = { ...headers }
        heads['Authorization'] = `Bearer ${auth.token}`;
        if (element.ws?.url) {
            const w = setupWebSocket(element.ws.url, {
                protocol: element.ws.protocol,
                heartbeat: element.ws.heartbeat,
                headers: heads,
                onMessage: handleStreamMessage,
            });
            cleanup = { close: w.close };
        }

        return () => cleanup?.close();
    }, [element, headers]);

    useEffect(() => {
        let cleanup: { close: () => void } | null = null;

        const handleStreamMessage = (data: any) => {
            if (!data) return;

            const id = data.messageId || data.id || "stream-" + Date.now();

            // 🔹 When first chunk, create placeholder message if not exist
            if (!messages.find((m) => m.id === id)) {
                dispatch({
                    type: "append_msg",
                    payload: {
                        id,
                        role: data.role || "assistant",
                        status: "streaming",
                        createdAt: Date.now(),
                        jsonBuffer: "",
                    },
                });
            }

            // 🔹 Append new chunk (text or JSON fragment)
            if (typeof data.delta === "string") {
                dispatch({ type: "append_stream_chunk", id, delta: data.delta });
            } else if (typeof data === "string") {
                // plain string streams (LLM output)
                dispatch({ type: "append_stream_chunk", id, delta: data });
            }

            // 🔹 If explicitly marked done
            if (data.done === true || data.type === "done") {
                dispatch({ type: "finalize_last_stream" });
            }
        };

        const heads: any = { ...headers };
        heads["Authorization"] = `Bearer ${auth.token}`;

        if (element.ws?.url) {
            const w = setupWebSocket(element.ws?.url, {
                protocol: element.ws?.protocol,
                heartbeat: element.ws?.heartbeat,
                headers: heads,
                onMessage: handleStreamMessage,
                onClose: () => dispatch({ type: "finalize_last_stream" }),
            });
            cleanup = { close: w.close };
        }
        return () => cleanup?.close();
    }, [element, headers, messages, auth.token]);


    useEffect(() => {
        dispatch({ type: "init_from_history", payload: messagesFromSource(element, state, t) });
    }, []);


    const dictation = useSpeechDictation(allowVoice, voiceLanguage, (txt) => setInput(txt));
    const capture = useAudioCapture();
    const { speak } = useCustomTTS(
        element.ttsUrl,
        auth.token,
        (err) => console.error("TTS Error:", err)
    );

    const startRecording = useCallback(async () => {
        if (!allowVoice || !capture.supported) return;
        const ok = await capture.start();
        if (ok) dispatch({ type: "set_voice", value: "recording" });
    }, [allowVoice, capture]);

    const stopRecording = useCallback(async () => {
        const blob = await capture.stop();
        dispatch({ type: "set_voice", value: "idle" });
        if (blob) {
            await handleSend({ audioBlob: blob, threadId: activeThreadId || undefined });
        }
    }, [capture, activeThreadId]);

    const toggleReaction = useCallback(
        (emoji: string, msg: Msg) => {
            runEventHandler?.((element as AnyObj).onMessageAction, { action: "react", id: msg.id, emoji });
        },
        [runEventHandler, element]
    );

    const runMsgAction = useCallback(
        (msg: Msg, action: MsgAction) => {
            runEventHandler?.((element as AnyObj).onMessageAction, {
                action: action.id,
                msgId: msg.id,
                threadId: msg.threadId,
                payload: action.payload,
            });
        },
        [runEventHandler, element]
    );

    const handleSend = useCallback(
        async (payload?: { text?: string; replyTo?: string; threadId?: string; audioBlob?: Blob }) => {
            const text = payload?.text ?? input;
            const hasText = !!text && !!text.trim();
            const hasFiles = attachments && attachments?.length > 0;
            const hasAudio = !!payload?.audioBlob;
            if (!hasText && !hasFiles && !hasAudio) return;

            const moderation = applyModeration(text, moderationRules);
            if (!moderation.allowed) {
                toast.error(`Message blocked: ${moderation.reason}`);
                return;
            }

            const localId = cryptoRandomId();
            const userMsg: Msg = {
                id: localId,
                role: "user",
                text,
                createdAt: Date.now(),
                status: "sending",
                attachments,
                replyTo: payload?.replyTo,
                threadId: payload?.threadId ?? activeThreadId ?? undefined,
            };
            dispatch({ type: "append_msg", payload: userMsg });
            dispatch({ type: "set_typing", userId: "self", value: true });

            const formPayload: AnyObj = {
                message: text,
                replyTo: payload?.replyTo,
                threadId: payload?.threadId ?? activeThreadId,
            };
            if (hasFiles) formPayload.attachments = attachments;
            if (payload?.audioBlob) {
                const file = new File([payload.audioBlob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
                formPayload.voiceBlob = file;
            }

            try {
                let requestId: string | undefined;
                let json: any;
                if (element.onSend && runEventHandler) {
                    await runEventHandler(element.onSend, formPayload);
                }
                else {
                    const headersInit: any = { ...(headers || {}) };
                    let body: BodyInit;

                    if (formPayload.voiceBlob || (attachments && attachments.length)) {
                        const fd = new FormData();
                        fd.append("message", text || "");
                        if (formPayload.replyTo) fd.append("replyTo", formPayload.replyTo);
                        if (formPayload.threadId) fd.append("threadId", formPayload.threadId);
                        if (formPayload.voiceBlob) fd.append("voice", formPayload.voiceBlob);
                        attachments?.forEach((a, i) => a.file && fd.append(`file${i}`, a.file, a.name));
                        body = fd;
                        delete headersInit["Content-Type"];
                    } else {
                        headersInit["Content-Type"] = "application/json";
                        body = JSON.stringify({
                            message: text,
                            replyTo: formPayload.replyTo,
                            threadId: formPayload.threadId,
                            rich: !!element.richResponses,
                            instructions: element.richResponses
                                ? "Return JSON matching AltCodePro AIResponse schema with elements array."
                                : undefined,
                        });
                    }
                    if (element.http) {
                        const res = await fetch(element.http?.sendUrl, {
                            method: element.http?.method || "POST",
                            headers: headersInit,
                            body,
                            ...(element.http?.fetchInit || {}),
                        });
                        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

                        json = await res.json();
                        requestId = json?.requestId || json?.id;
                    }
                    if (requestId && element.sse?.url) {
                        const streamUrl = `${element.sse.url}?requestId=${encodeURIComponent(requestId)}`;
                        const heads: any = { ...headers, Authorization: `Bearer ${auth.token}` };
                        const s = setupSSE(streamUrl, {
                            headers: heads,
                            onMessage: (data) => {
                                // You already have this dispatch logic:
                                if (typeof data === "string") {
                                    dispatch({ type: "append_stream_chunk", id: requestId!, delta: data });
                                } else if (data.done === true || data.type === "done") {
                                    dispatch({ type: "finalize_last_stream" });
                                }
                            },
                            onError: (err) => console.error("Stream error", err),
                        });
                        // auto-close after completion
                        setTimeout(() => s.close(), 300000); // safety timeout
                    } else if (json?.assistant) {
                        const m = json.assistant as Msg;
                        dispatch({ type: "append_msg", payload: { ...m, status: "delivered" } });
                    }
                }
            } catch (e) {
                dispatch({ type: "update_msg", id: localId, patch: { status: "error" } });
                toast.error("Failed to send message. Please try again.");
            } finally {
                dispatch({ type: "set_typing", userId: "self", value: false });
                setInput("");
                setAttachments([]);
                dispatch({ type: "update_msg", id: localId, patch: { status: "sent" } });
            }
        },
        [input, attachments, activeThreadId, element.onSend, runEventHandler, element, headers, moderationRules]
    );

    const handleInputChange = useCallback(
        (value: string) => {
            setInput(value);
            if (value.startsWith("/")) {
                dispatch({ type: "set_command_bar", visible: true });
            } else {
                dispatch({ type: "set_command_bar", visible: false });
            }
        },
        []
    );

    const Editor = useMemo(() => {
        const editorProps = {
            placeholder,
            value: input,
            onChange: (v: string | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const value = typeof v === "string" ? v : v.target.value;
                handleInputChange(value);
            },
            className: "min-h-[60px] flex-1",
            onKeyDown: (e: KeyboardEvent) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            },
            ref: inputRef,
            "aria-label": "Message input",
        };
        switch (inputMode) {
            case "richtext":
                return <RichTextEditor {...editorProps} />;
            case "markdown":
                return <MarkdownInput {...editorProps} />;
            case "input":
                return <input
                    type="text"
                    data-slot="input"
                    placeholder={placeholder}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    className={cn(
                        "file:text-foreground min-h-[60px] flex-1 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px]",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                    )}
                />;
            default:
                return <textarea
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    value={input}
                    data-slot="textarea"
                    className={"border-input  flex-1 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[1px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"}
                    rows={2} />;
        }
    }, [inputMode, input, placeholder, handleSend, handleInputChange]);

    const virtualizedListData = useMemo(
        () => ({
            messages: messages,
            chatMode,
            roleClasses,
            messageClassName,
            showAvatars,
            showTimestamps: !!element.showTimestamps,
            onReply: (text: string, msg: Msg) => handleSend({ text, replyTo: msg.id, threadId: msg.threadId }),
            onReact: toggleReaction,
            onCopy: (msg: Msg) => runEventHandler?.((element as AnyObj).onCopyMessage, { id: msg.id, text: msg.text }),
            onDelete: (msg: Msg) => runEventHandler?.((element as AnyObj).onDeleteMessage, { id: msg.id }),
            onSpeak: (msg: Msg) => speak(msg.text || ""),
            toggleThread: (id: string) => dispatch({ type: "toggle_thread", id }),
            onAction: runMsgAction,
            t,
            state,
            setState,
            runEventHandler,
            threadMap,
            collapsedThreads,
        }),
        [
            chatMode,
            roleClasses,
            messageClassName,
            showAvatars,
            element.showTimestamps,
            handleSend,
            toggleReaction,
            runMsgAction,
            speak,
            t,
            state,
            setState,
            runEventHandler,
            threadMap,
            collapsedThreads,
        ]
    );

    return (
        <div
            className={cn(
                "flex flex-col rounded-md shadow-sm h-full relative",
                "bg-(--acp-background) dark:bg-(--acp-background-dark) text-(--acp-foreground) dark:text-(--acp-foreground-dark) border-0",
                element.styles?.className
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDragDrop}
            ref={containerRef}
            role="region"
            aria-label="Chat interface"
        >
            {/* Quick Actions */}
            {element.quickActions?.length ? (
                <div className="p-3">
                    <RenderChildren
                        children={element.quickActions}
                        state={state}
                        t={t}
                        setState={setState}
                        runEventHandler={runEventHandler}
                    />
                </div>
            ) : null}

            {participants?.length > 0 && (
                <div
                    className="px-3 py-2 flex items-center gap-2 overflow-x-auto"
                    role="status"
                    aria-live="polite"
                >
                    {participants?.map((p) => (
                        <div key={p.id} className="flex items-center gap-2 text-xs">
                            <img
                                src={p.avatarUrl || "/avatars/default.png"}
                                className="w-5 h-5 rounded-full"
                                alt={p.name || p.id}
                                aria-hidden="true"
                            />
                            <span className="opacity-80">{p.name || p.id}</span>
                            {typing[p.id] && (
                                <span className="animate-pulse opacity-60">
                                    {t("typing_user", 'Typing')}   {`${p.name || p.id} is typing…`}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Thread Headers */}
            {showThreadHeaders && threads?.length > 1 && (
                <div className="px-3 py-2 flex items-center gap-2 overflow-x-auto">
                    {threads?.map((th) => {
                        const label = th.id || (t("general_thread") || "General");
                        const isActive = (activeThreadId || "") === th.id;
                        return (
                            <Button
                                key={th.id || "_general"}
                                size="sm"
                                variant={isActive ? "secondary" : "outline"}
                                onClick={() => dispatch({ type: "set_thread", id: th.id || null })}
                                className="flex items-center gap-2"
                                aria-current={isActive ? "true" : undefined}
                            >
                                <DynamicIcon name="message-square" className="h-4 w-4" />
                                {label} <span className="ml-2 text-xs opacity-70">({th.messages.length})</span>
                            </Button>
                        );
                    })}
                </div>
            )}

            {/* Messages (Virtualized) */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                {messages.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center h-full text-sm text-(--acp-foreground-50)"
                        role="alert"
                        aria-live="polite"
                    >
                        <DynamicIcon name="message-circle" className="h-12 w-12 mb-4 opacity-50" aria-hidden="true" />
                        <p>{t("no_messages_yet") || "No messages yet"}</p>
                        <p className="mt-1 opacity-70">{t("start_conversation", "Start a conversation")}</p>
                    </div>
                ) : (
                    chatMode === 'ai' ?
                        messages.map((msg, index) => (
                            <MessageBubble
                                key={`${msg.id}_${index}`}
                                msg={msg}
                                chatMode={chatMode}
                                roleClasses={roleClasses}
                                globalMessageClassName={messageClassName}
                                showAvatars={false}
                                showTimestamps={true}
                                onReply={virtualizedListData.onReply}
                                onReact={toggleReaction}
                                onCopy={virtualizedListData.onCopy}
                                onDelete={virtualizedListData.onDelete}
                                onAction={runMsgAction}
                                onSpeak={virtualizedListData.onSpeak}
                                toggleThread={() => virtualizedListData.toggleThread(msg.id)}
                                t={t}
                                state={state}
                                setState={setState}
                                runEventHandler={runEventHandler}
                                threadMessages={threadMap.get(msg.id) || []}
                                isThreadCollapsed={collapsedThreads.has(msg.id)}
                            />
                        ))
                        : <List
                            rowCount={messages.length}
                            rowHeight={100}
                            rowComponent={MessageRow as any}
                            rowProps={{ data: virtualizedListData }}
                        />

                )}
            </div>

            {typingIndicator && Object.values(typing).some((v) => v) && (
                <div className="px-3 py-2 text-sm text-[color-mix(in srgb, var(--acp-foreground) 70%, transparent)]">
                    <span className="flex items-center gap-2 animate-pulse">
                        <DynamicIcon name="loader-2" className="h-4 w-4 animate-spin" />
                        {t("typing") || "Typing…"}
                    </span>
                </div>
            )}

            <CommandBar
                suggestions={commandBar.suggestions}
                onSelect={(id) => {
                    runEventHandler?.((element as AnyObj).onMessageAction, { action: "command", commandId: id });
                    setInput("");
                }}
                visible={commandBar.visible}
                onClose={() => dispatch({ type: "set_command_bar", visible: false })}
            />

            <div>
                {Editor}
            </div>
            <div
                className="flex items-end border-0 justify-between rounded-xl  bg-(--acp-bg)"
                role="form"
                aria-label="Message composer"
            >
                {/* Left side drawer icons */}
                {element.leftDrawer && (
                    <div className="flex items-center pl-2 gap-1">
                        <RenderChildren
                            children={[element.leftDrawer]}
                            t={t}
                            state={state}
                            setState={setState}
                            runEventHandler={runEventHandler}
                        />
                    </div>
                )}

                {/* Right side: mic, drawer, send */}
                <div className="flex items-center pr-1 gap-1">
                    {allowVoice && (
                        <button
                            className={cn(
                                "p-2 rounded-lg hover:bg-(--acp-secondary-100) text-(--acp-foreground) dark:text-(--acp-foreground-dark) transition-colors",
                                voice === "recording" && "bg-(--acp-primary-100) text-(--acp-primary)"
                            )}
                            onClick={voice === "recording" ? stopRecording : startRecording}
                            aria-label={voice === "recording" ? "Stop recording" : "Start recording"}
                        >
                            <DynamicIcon name={voice === "recording" ? "square" : "mic"} className="h-4 w-4" />
                        </button>
                    )}

                    {element.rightDrawer && (
                        <RenderChildren
                            children={[element.rightDrawer]}
                            t={t}
                            state={state}
                            setState={setState}
                            runEventHandler={runEventHandler}
                        />
                    )}

                    <Button
                        size="icon"
                        onClick={() => handleSend()}
                        disabled={!input.trim() && attachments?.length === 0}
                        className="h-9 w-9"
                        aria-label="Send message"
                    >
                        <DynamicIcon name="send" className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div>
                {attachments && attachments?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {attachments.map((att) => (
                            <div
                                key={att.id}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-(--acp-secondary-100) text-sm"
                            >
                                <DynamicIcon name="paperclip" className="h-4 w-4" />
                                {att.name}
                                <button
                                    onClick={() => setAttachments((prev) => prev?.filter((a) => a.id !== att.id))}
                                    className="ml-1 text-(--acp-foreground-50) hover:text-(--acp-foreground) dark:text-(--acp-foreground-dark)"
                                    aria-label={`Remove ${att.name}`}
                                >
                                    <DynamicIcon name="x" className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export const ChatRenderer = memo(Chat, (prev, next) => {
    return (
        prev.element === next.element &&
        prev.state === next.state &&
        prev.t === next.t &&
        prev.setState === next.setState &&
        prev.runEventHandler === next.runEventHandler
    );
});

