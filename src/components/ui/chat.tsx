"use client"

import * as React from "react"
import { RowComponentProps, List as VirtualList } from "react-window"
import { Button } from "./button"
import { Input } from "./input"
import { cn, resolveBinding } from "@/src/lib/utils"
import type { AnyObj, ChatElement, EventHandler } from "@/src/types"

/* ========== Types ========== */
type RowProps = { items: Msg[] }
export interface ChatMessage {
    id: string
    chatId?: string
    sender: {
        id: string
        name?: string
        avatarUrl?: string
        role?: "user" | "assistant" | "system" | "moderator" | "bot"
    }
    content: string
    contentFormat?: "plain" | "markdown" | "html"
    attachments?: ChatAttachment[]
    reactions?: { [emoji: string]: string[] }
    replyTo?: string
    threadId?: string
    createdAt: string
    updatedAt?: string
    deleted?: boolean
    status?: "sending" | "sent" | "delivered" | "read" | "failed"
    metadata?: AnyObj
}

export interface ChatAttachment {
    id: string
    type: "image" | "video" | "audio" | "file" | "link"
    url: string
    name?: string
    sizeBytes?: number
    thumbnailUrl?: string
    mimeType?: string
    durationSeconds?: number
}

/* Local msg format for UI */
type Msg = {
    id: string
    role: "user" | "assistant" | "system"
    text: string
    createdAt?: number
    status?: "sending" | "sent" | "delivered" | "read" | "error"
    replyTo?: string
    threadId?: string
    reactions?: { [emoji: string]: string[] }
    attachments?: {
        id: string
        name: string
        url?: string
        type?: string
        size?: number
        file?: File
    }[]
}

interface ChatRendererProps {
    element: ChatElement
    state: AnyObj
    t: (key: string) => string
    runEventHandler: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
}

/* ========== ChatRenderer ========== */

export function ChatRenderer({
    element,
    state,
    t,
    runEventHandler,
}: ChatRendererProps) {
    const historyKey = element.historyDataSourceId
    const placeholder =
        resolveBinding(element.placeholder, state, t) || "Type a message…"

    const x = element as AnyObj
    const suggestionsKey: string | undefined = x.suggestionsDataSourceId
    const quickActions: { id: string; label: string; payload?: AnyObj }[] =
        Array.isArray(x.quickActions) ? x.quickActions : []

    const [input, setInput] = React.useState("")
    const [messages, setMessages] = React.useState<Msg[]>([])
    const [attachments, setAttachments] = React.useState<Msg["attachments"]>([])

    /* Hydrate history */
    React.useEffect(() => {
        if (!historyKey) return
        const hist = state[historyKey]
        if (!Array.isArray(hist)) return
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
        }))
        setMessages(normalized)
    }, [historyKey, state])

    /* Suggestions */
    const suggestions = React.useMemo(() => {
        if (!suggestionsKey) return []
        const v = state[suggestionsKey]
        if (!v) return []
        if (Array.isArray(v)) {
            if (typeof v[0] === "string") {
                return v.map((text: string, i: number) => ({ id: String(i), text }))
            }
            return v.map((s: any, i: number) => ({
                id: s.id ?? String(i),
                text: s.text ?? "",
            }))
        }
        return []
    }, [state, suggestionsKey])

    /* Helpers */
    const appendMessage = (msg: Msg) =>
        setMessages((prev) => [...prev, msg])
    const updateMessage = (id: string, patch: Partial<Msg>) =>
        setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
        )

    /* Send flow */
    const handleSend = async (payload?: { text?: string; replyTo?: string }) => {
        const text = payload?.text ?? input
        if (!text.trim() && attachments?.length === 0) return

        const localMsg: Msg = {
            id: cryptoRandomId(),
            role: "user",
            text,
            createdAt: Date.now(),
            status: "sending",
            attachments,
            replyTo: payload?.replyTo,
        }
        appendMessage(localMsg)

        await runEventHandler(element.onSend, {
            message: text,
            attachments,
            replyTo: payload?.replyTo,
        })

        updateMessage(localMsg.id, { status: "sent" })
        setInput("")
        setAttachments([])
    }

    /* Reaction handler */
    const toggleReaction = (msgId: string, emoji: string) => {
        runEventHandler(x.onMessageAction, { action: "react", id: msgId, emoji })
    }

    /* Virtualized row renderer */
    const Row = ({ index, style, items }: RowComponentProps<RowProps>) => {
        const msg = items[index]
        return (
            <div style={style}>
                <MessageBubble
                    msg={msg}
                    onReply={(replyText) => handleSend({ text: replyText, replyTo: msg.id })}
                    onReact={(emoji) => toggleReaction(msg.id, emoji)}
                    onCopy={() => runEventHandler(x.onCopyMessage, { id: msg.id, text: msg.text })}
                    onDelete={() => runEventHandler(x.onDeleteMessage, { id: msg.id })}
                />
            </div>
        )
    }

    return (
        <div
            className={cn(
                "flex flex-col rounded-md border bg-card shadow-sm h-full",
                element.styles?.className
            )}
        >
            {/* Quick Actions */}
            {quickActions.length > 0 && (
                <div className="border-b px-3 py-2 flex gap-2 flex-wrap">
                    {quickActions.map((qa) => (
                        <Button
                            key={qa.id}
                            size="sm"
                            onClick={() =>
                                runEventHandler(x.onMessageAction, { action: qa.id, payload: qa.payload })
                            }
                        >
                            {qa.label}
                        </Button>
                    ))}
                </div>
            )}

            {/* Messages (virtualized) */}
            <div className="flex-1 overflow-y-auto">
                <VirtualList
                    rowCount={messages.length}
                    rowHeight={80}
                    rowProps={{ items: messages }}
                    rowComponent={Row}
                    style={{ height: "100%", width: "100%" }}
                />
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
                            e.preventDefault()
                            handleSend()
                        }
                    }}
                />
                <Button onClick={() => handleSend()}>{t("send") || "Send"}</Button>
            </div>
        </div>
    )
}

/* ========== Subcomponents ========== */

function MessageBubble({
    msg,
    onReply,
    onReact,
    onCopy,
    onDelete,
}: {
    msg: Msg
    onReply: (replyText: string) => void
    onReact: (emoji: string) => void
    onCopy: () => void
    onDelete: () => void
}) {
    const align =
        msg.role === "user"
            ? "ml-auto bg-primary text-primary-foreground"
            : msg.role === "assistant"
                ? "mr-auto bg-muted text-foreground"
                : "mx-auto bg-accent text-accent-foreground"

    return (
        <div
            className={cn(
                "px-3 py-2 rounded-lg max-w-[80%] break-words group relative",
                align
            )}
        >
            {/* system messages centered */}
            {msg.role === "system" ? (
                <div className="text-center text-xs opacity-70">{msg.text}</div>
            ) : (
                <>
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Reactions */}
                    {msg.reactions && (
                        <div className="flex gap-1 mt-1">
                            {Object.entries(msg.reactions).map(([emoji, users]) => (
                                <button
                                    key={emoji}
                                    className="px-1 rounded bg-foreground/10 text-xs"
                                    onClick={() => onReact(emoji)}
                                >
                                    {emoji} {users.length}
                                </button>
                            ))}
                            <button
                                className="px-1 rounded bg-foreground/10 text-xs"
                                onClick={() => onReact("👍")}
                            >
                                👍
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Reply + actions */}
            <div className="absolute -top-2 right-1 flex gap-1 opacity-0 group-hover:opacity-100">
                <IconButton title="Reply" onClick={() => onReply(`↩️ ${msg.text}`)}>↩️</IconButton>
                <IconButton title="Copy" onClick={onCopy}>⧉</IconButton>
                <IconButton title="Delete" onClick={onDelete}>✕</IconButton>
            </div>
        </div>
    )
}

function IconButton({
    title,
    onClick,
    children,
}: {
    title: string
    onClick: () => void
    children: React.ReactNode
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
    )
}

/* Utils */
function cryptoRandomId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID()
    }
    return Math.random().toString(36).slice(2)
}
