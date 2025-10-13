"use client";

import * as React from "react";
import { Button } from "./button";
import { Input } from "./input";
import { cn, resolveBinding } from "../../lib/utils";
import type { AnyObj, ChatElement, EventHandler } from "../../types";

/* ========== ChatRenderer ========== */
export function ChatRenderer({
    element,
    state,
    t,
    runEventHandler,
}: {
    element: ChatElement;
    state: AnyObj;
    t: (key: string) => string;
    runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>;
}) {
    const listRef = React.useRef<HTMLDivElement | null>(null);
    const historyKey = element.historyDataSourceId;
    const placeholder = resolveBinding(element.placeholder, state, t) || "Type a message…";
    const x = element as AnyObj;
    const suggestionsKey: string | undefined = x.suggestionsDataSourceId;
    const quickActions: { id: string; label: string; payload?: AnyObj }[] =
        Array.isArray(x.quickActions) ? x.quickActions : [];

    const [input, setInput] = React.useState("");
    const [messages, setMessages] = React.useState<Msg[]>([]);
    const [attachments, setAttachments] = React.useState<Msg["attachments"]>([]);
    const [isTyping, setTyping] = React.useState(false);

    /* Hydrate history */
    React.useEffect(() => {
        if (!historyKey) return;
        const hist = state[historyKey];
        if (!Array.isArray(hist)) return;
        const normalized: Msg[] = hist.map((h: AnyObj, i: number) => ({
            id: h.id || String(i),
            role: (h.role || "user") as Msg["role"],
            text: h.text || "",
            createdAt: h.createdAt ? +new Date(h.createdAt) : Date.now(),
            status: h.status || "delivered",
            replyTo: h.replyTo,
            threadId: h.threadId,
            reactions: h.reactions || {},
            attachments: Array.isArray(h.attachments) ? h.attachments : [],
        }));
        setMessages(normalized);
    }, [historyKey, state]);

    /* Auto scroll */
    React.useEffect(() => {
        if (listRef.current)
            listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    /* Suggestions */
    const suggestions = React.useMemo(() => {
        if (!suggestionsKey) return [];
        const v = state[suggestionsKey];
        if (!v) return [];
        if (Array.isArray(v)) {
            if (typeof v[0] === "string") {
                return v.map((text: string, i: number) => ({ id: String(i), text }));
            }
            return v.map((s: any, i: number) => ({
                id: s.id ?? String(i),
                text: s.text ?? "",
            }));
        }
        return [];
    }, [state, suggestionsKey]);

    /* Helpers */
    const appendMessage = (msg: Msg) => setMessages((prev) => [...prev, msg]);
    const updateMessage = (id: string, patch: Partial<Msg>) =>
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));

    /* Send flow */
    const handleSend = async (payload?: { text?: string; replyTo?: string }) => {
        const text = payload?.text ?? input;
        if (!text.trim() && attachments?.length === 0) return;

        const localMsg: Msg = {
            id: cryptoRandomId(),
            role: "user",
            text,
            createdAt: Date.now(),
            status: "sending",
            attachments,
            replyTo: payload?.replyTo,
        };
        appendMessage(localMsg);

        setTyping(true);
        await runEventHandler?.(element.onSend, {
            message: text,
            attachments,
            replyTo: payload?.replyTo,
        });
        setTyping(false);

        updateMessage(localMsg.id, { status: "sent" });
        setInput("");
        setAttachments([]);
    };

    /* Reaction handler */
    const toggleReaction = (msgId: string, emoji: string) => {
        runEventHandler?.(x.onMessageAction, { action: "react", id: msgId, emoji });
    };

    return (
        <div
            className={cn(
                "flex flex-col rounded-md border bg-card shadow-sm h-full relative",
                element.styles?.className
            )}
        >
            {/* Quick Actions */}
            {quickActions.length > 0 && (
                <div className="border-b px-3 py-2 flex gap-2 flex-wrap bg-muted/30">
                    {quickActions.map((qa) => (
                        <Button
                            key={qa.id}
                            size="sm"
                            onClick={() =>
                                runEventHandler?.(x.onMessageAction, { action: qa.id, payload: qa.payload })
                            }
                        >
                            {qa.label}
                        </Button>
                    ))}
                </div>
            )}

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-sm text-muted-foreground">
                        <p>{t("no_messages_yet") || "No messages yet"}</p>
                    </div>
                )}
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        msg={msg}
                        onReply={(replyText) => handleSend({ text: replyText, replyTo: msg.id })}
                        onReact={(emoji) => toggleReaction(msg.id, emoji)}
                        onCopy={() => runEventHandler?.(x.onCopyMessage, { id: msg.id, text: msg.text })}
                        onDelete={() => runEventHandler?.(x.onDeleteMessage, { id: msg.id })}
                    />
                ))}
                {isTyping && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="animate-pulse">{t("assistant_typing") || "Typing…"}</span>
                    </div>
                )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="px-3 pb-2 flex gap-2 flex-wrap">
                    {suggestions.map((s) => (
                        <Button key={s.id} size="sm" variant="outline" onClick={() => handleSend({ text: s.text })}>
                            {s.text}
                        </Button>
                    ))}
                </div>
            )}

            {/* Composer */}
            <div className="p-2 border-t flex gap-2">
                <Input
                    placeholder={placeholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <Button onClick={() => handleSend()}>{t("send") || "Send"}</Button>
            </div>
        </div>
    );
}

/* ========== Subcomponents ========== */
type Msg = {
    id: string;
    role: "user" | "assistant" | "system";
    text: string;
    createdAt?: number;
    status?: "sending" | "sent" | "delivered" | "read" | "error";
    replyTo?: string;
    threadId?: string;
    reactions?: { [emoji: string]: string[] };
    attachments?: { id: string; name: string; url?: string; type?: string; size?: number; file?: File }[];
};

function MessageBubble({
    msg,
    onReply,
    onReact,
    onCopy,
    onDelete,
}: {
    msg: Msg;
    onReply: (replyText: string) => void;
    onReact: (emoji: string) => void;
    onCopy: () => void;
    onDelete: () => void;
}) {
    const align =
        msg.role === "user"
            ? "ml-auto bg-primary text-primary-foreground"
            : msg.role === "assistant"
                ? "mr-auto bg-muted text-foreground"
                : "mx-auto bg-accent text-accent-foreground";

    return (
        <div
            className={cn(
                "px-3 py-2 rounded-lg max-w-[80%] break-words group relative shadow-sm transition-all",
                align
            )}
        >
            {msg.role === "system" ? (
                <div className="text-center text-xs opacity-70">{msg.text}</div>
            ) : (
                <>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    {msg.reactions && (
                        <div className="flex gap-1 mt-1">
                            {Object.entries(msg.reactions).map(([emoji, users]) => (
                                <button
                                    key={emoji}
                                    className="px-1 rounded bg-foreground/10 text-xs hover:bg-foreground/20"
                                    onClick={() => onReact(emoji)}
                                >
                                    {emoji} {users.length}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            <div className="absolute -top-2 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <IconButton title="Reply" onClick={() => onReply(`↩️ ${msg.text}`)}>↩️</IconButton>
                <IconButton title="Copy" onClick={onCopy}>⧉</IconButton>
                <IconButton title="Delete" onClick={onDelete}>✕</IconButton>
            </div>
        </div>
    );
}

function IconButton({
    title,
    onClick,
    children,
}: {
    title: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className="rounded bg-foreground/10 px-1 text-[10px] hover:bg-foreground/20"
        >
            {children}
        </button>
    );
}

function cryptoRandomId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return Math.random().toString(36).slice(2);
}
