"use client"

import * as React from "react"
import { cn, resolveBinding } from "../../lib/utils"
import type { AnyObj, CommentsElement, EventHandler } from "../../types"
import { Button } from "./button"
import { Input } from "./input"
import { Textarea } from "./textarea"

/* =====================================================================================
 * Types
 * ===================================================================================== */

type VoteDirection = "up" | "down"

export interface CommentItem {
    id: string
    author: {
        id: string
        name?: string
        avatarUrl?: string
    }
    content: string
    createdAt: string // ISO
    updatedAt?: string
    votes?: number
    userVote?: 1 | -1 | 0 // optional hint to render active state
    replies?: CommentItem[]
    // moderation flags
    flagged?: boolean
    hidden?: boolean
    pending?: boolean
    // misc
    metadata?: AnyObj
}

/* =====================================================================================
 * Props
 * ===================================================================================== */

interface CommentsRendererProps {
    element: CommentsElement
    state: AnyObj
    t: (key: string) => string
    runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
}

/* =====================================================================================
 * Main Renderer
 * ===================================================================================== */

export function CommentsRenderer({
    element,
    state,
    t,
    runEventHandler,
}: CommentsRendererProps) {
    // Resolve thread id
    const threadKey = resolveBinding(element.threadId, state, t)
    // Comments are provided by a data source and mapped into state[threadKey]
    const comments: CommentItem[] = Array.isArray(state[threadKey]) ? state[threadKey] : []

    // Local composer state
    const [newComment, setNewComment] = React.useState("")
    const [posting, setPosting] = React.useState(false)

    // Moderator filter state
    const [filter, setFilter] = React.useState<CommentsElement["moderationView"]>(
        element.moderationView || "all"
    )

    // Tab counts for moderator view
    const counts = React.useMemo(() => {
        const all = comments.length
        const flagged = comments.filter((c) => c.flagged).length
        const hidden = comments.filter((c) => c.hidden).length
        const pending = comments.filter((c) => c.pending).length
        return { all, flagged, hidden, pending }
    }, [comments])

    // Filtered list (moderator view)
    const filteredComments = React.useMemo(() => {
        switch (filter) {
            case "flagged":
                return comments.filter((c) => c.flagged)
            case "hidden":
                return comments.filter((c) => c.hidden)
            case "pending":
                return comments.filter((c) => c.pending)
            default:
                return comments
        }
    }, [comments, filter])

    // Post top-level comment
    const handlePost = async () => {
        if (!newComment.trim()) return
        setPosting(true)
        try {
            await runEventHandler?.(element.onPost, {
                threadId: threadKey,
                content: newComment,
            })
            setNewComment("")
        } finally {
            setPosting(false)
        }
    }

    return (
        <div className={cn("space-y-4", element.styles?.className)}>
            {/* Composer (hidden if moderation-only view) */}
            {!element.allowModeration && (
                <div className="rounded-md border bg-card p-3">
                    <div className="flex items-start gap-2">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={t("add_comment") || "Add a comment…"}
                            className="min-h-20"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                    e.preventDefault()
                                    handlePost()
                                }
                            }}
                        />
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setNewComment("")}
                            disabled={!newComment}
                        >
                            {t("clear") || "Clear"}
                        </Button>
                        <Button onClick={handlePost} disabled={posting || !newComment.trim()}>
                            {posting ? t("posting") || "Posting…" : t("post") || "Post"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Moderator tabs */}
            {element.allowModeration && (
                <div className="flex flex-wrap items-center gap-2 border-b pb-2">
                    <FilterTab label={t("all") || "All"} active={filter === "all"} count={counts.all} onClick={() => setFilter("all")} />
                    <FilterTab label={t("flagged") || "Flagged"} active={filter === "flagged"} count={counts.flagged} onClick={() => setFilter("flagged")} />
                    <FilterTab label={t("hidden") || "Hidden"} active={filter === "hidden"} count={counts.hidden} onClick={() => setFilter("hidden")} />
                    <FilterTab label={t("pending") || "Pending"} active={filter === "pending"} count={counts.pending} onClick={() => setFilter("pending")} />
                </div>
            )}

            {/* List */}
            <div className="space-y-3">
                {filteredComments?.length === 0 ? (
                    <EmptyState label={t("no_comments") || "No comments yet."} />
                ) : (
                    filteredComments?.map((c) => (
                        <CommentNode
                            key={c.id}
                            comment={c}
                            depth={0}
                            element={element}
                            threadKey={threadKey}
                            runEventHandler={runEventHandler}
                            t={t}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

/* =====================================================================================
 * Comment Node (recursive)
 * ===================================================================================== */

function CommentNode({
    comment,
    depth,
    element,
    threadKey,
    runEventHandler,
    t,
}: {
    comment: CommentItem
    depth: number
    element: CommentsElement
    threadKey: string
    runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
    t: (key: string) => string
}) {
    const [isReplying, setIsReplying] = React.useState(false)
    const [isEditing, setIsEditing] = React.useState(false)
    const [replyContent, setReplyContent] = React.useState("")
    const [editContent, setEditContent] = React.useState(comment.content)
    const [busy, setBusy] = React.useState<null | string>(null) // action key

    const canReply = element.allowReplies !== false && !comment.hidden && !comment.pending
    const canVote = element.allowVoting !== false && !comment.hidden && !comment.pending
    const canEdit = !!element.allowEdit && !comment.pending
    const canDelete = !!element.allowDelete
    const canFlag = !!element.allowFlagging
    const canModerate = !!element.allowModeration

    const handleReply = async () => {
        if (!replyContent.trim()) return
        setBusy("reply")
        try {
            await runEventHandler?.(element.onReply, {
                threadId: threadKey,
                parentId: comment.id,
                content: replyContent,
            })
            setReplyContent("")
            setIsReplying(false)
        } finally {
            setBusy(null)
        }
    }

    const handleEdit = async () => {
        if (!editContent.trim() || editContent === comment.content) {
            setIsEditing(false)
            return
        }
        setBusy("edit")
        try {
            await runEventHandler?.(element.onEdit, {
                threadId: threadKey,
                commentId: comment.id,
                content: editContent,
            })
            setIsEditing(false)
        } finally {
            setBusy(null)
        }
    }

    const handleDelete = async () => {
        setBusy("delete")
        try {
            await runEventHandler?.(element.onDelete, {
                threadId: threadKey,
                commentId: comment.id,
            })
        } finally {
            setBusy(null)
        }
    }

    const handleVote = async (dir: VoteDirection) => {
        if (!canVote) return
        setBusy(dir)
        try {
            await runEventHandler?.(element.onVote, {
                threadId: threadKey,
                commentId: comment.id,
                direction: dir,
            })
        } finally {
            setBusy(null)
        }
    }

    const handleFlag = async () => {
        if (!canFlag) return
        setBusy("flag")
        try {
            await runEventHandler?.(element.onFlag, {
                threadId: threadKey,
                commentId: comment.id,
            })
        } finally {
            setBusy(null)
        }
    }

    // Moderation actions
    const handleApprove = async () => {
        setBusy("approve")
        try {
            await runEventHandler?.(element.onApprove, {
                threadId: threadKey,
                commentId: comment.id,
            })
        } finally {
            setBusy(null)
        }
    }

    const handleHide = async () => {
        setBusy("hide")
        try {
            await runEventHandler?.(element.onHide, {
                threadId: threadKey,
                commentId: comment.id,
            })
        } finally {
            setBusy(null)
        }
    }

    const handleBanUser = async () => {
        setBusy("ban")
        try {
            await runEventHandler?.(element.onBanUser, {
                userId: comment.author.id,
                source: "comments",
                reason: "abuse",
            })
        } finally {
            setBusy(null)
        }
    }

    const indent = Math.min(depth, 6) * 16 // clamp indent

    if (comment.hidden && !canModerate) {
        return null
    }

    return (
        <div className="rounded-md border bg-card p-3" style={{ marginLeft: indent }}>
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Avatar url={comment.author.avatarUrl} />
                    <div className="leading-tight">
                        <div className="font-medium">{comment.author.name || t("anonymous") || "Anonymous"}</div>
                        <div className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.createdAt)}
                            {comment.updatedAt ? ` • ${t("edited") || "Edited"}` : ""}
                            {comment.pending ? ` • ${t("pending") || "Pending"}` : ""}
                            {comment.flagged ? ` • ${t("flagged") || "Flagged"}` : ""}
                            {comment.hidden ? ` • ${t("hidden") || "Hidden"}` : ""}
                        </div>
                    </div>
                </div>

                {/* Actions (top right) */}
                <div className="flex shrink-0 items-center gap-1">
                    {canVote && (
                        <div className="flex items-center gap-1">
                            <ActionChip
                                disabled={!!busy}
                                active={comment.userVote === 1}
                                onClick={() => handleVote("up")}
                                title={t("upvote") || "Up-Vote"}
                            >
                                ▲
                            </ActionChip>
                            <span className="text-xs tabular-nums min-w-[2ch] text-center">
                                {typeof comment.votes === "number" ? comment.votes : 0}
                            </span>
                            <ActionChip
                                disabled={!!busy}
                                active={comment.userVote === -1}
                                onClick={() => handleVote("down")}
                                title={t("downvote") || "Down-Vote"}
                            >
                                ▼
                            </ActionChip>
                        </div>
                    )}

                    {!canModerate && canFlag && (
                        <ActionChip disabled={!!busy} onClick={handleFlag} title={t("flag") || "Flag"}>
                            🚩
                        </ActionChip>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="mt-2">
                {isEditing ? (
                    <div className="space-y-2">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[100px]"
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={!!busy}>
                                {t("cancel") || "Cancel"}
                            </Button>
                            <Button onClick={handleEdit} disabled={!!busy || editContent.trim().length === 0}>
                                {busy === "edit" ? t("saving") || "Saving…" : t("save") || "Save"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className={cn("whitespace-pre-wrap", comment.hidden && "opacity-60 italic")}>
                        {comment.content}
                    </div>
                )}
            </div>

            {/* Footer actions */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
                {canReply && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsReplying((v) => !v)}
                        disabled={!!busy || isEditing}
                    >
                        {isReplying ? t("close_reply") || "Close reply" : t("reply") || "Reply"}
                    </Button>
                )}

                {canEdit && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing((v) => !v)}
                        disabled={!!busy || isReplying}
                    >
                        {isEditing ? (t("close_edit") || "Close edit") : (t("edit") || "Edit")}
                    </Button>
                )}

                {canDelete && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        disabled={!!busy}
                    >
                        {busy === "delete" ? t("deleting") || "Deleting…" : t("delete") || "Delete"}
                    </Button>
                )}

                {canModerate && (
                    <>
                        {!comment.pending && !comment.hidden && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleHide}
                                disabled={!!busy}
                            >
                                {busy === "hide" ? t("hiding") || "Hiding…" : t("hide") || "Hide"}
                            </Button>
                        )}
                        {comment.pending && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleApprove}
                                disabled={!!busy}
                            >
                                {busy === "approve" ? t("approving") || "Approving…" : t("approve") || "Approve"}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBanUser}
                            disabled={!!busy}
                        >
                            {busy === "ban" ? t("banning") || "Banning…" : t("ban_user") || "Ban user"}
                        </Button>
                    </>
                )}
            </div>

            {/* Reply composer */}
            {isReplying && (
                <div className="mt-2 rounded-md border bg-(--acp-background) dark:bg-(--acp-background-dark) text-(--acp-foreground) dark:text-(--acp-foreground-dark) p-2">
                    <Input
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={t("write_a_reply") || "Write a reply…"}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                e.preventDefault()
                                handleReply()
                            }
                        }}
                    />
                    <div className="mt-2 flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)}>
                            {t("cancel") || "Cancel"}
                        </Button>
                        <Button size="sm" onClick={handleReply} disabled={!!busy || replyContent.trim().length === 0}>
                            {busy === "reply" ? t("replying") || "Replying…" : t("reply") || "Reply"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Replies */}
            {Array.isArray(comment.replies) && comment.replies?.length > 0 && (
                <div className="mt-3 space-y-3">
                    {comment.replies?.map((r) => (
                        <CommentNode
                            key={r.id}
                            comment={r}
                            depth={depth + 1}
                            element={element}
                            threadKey={threadKey}
                            runEventHandler={runEventHandler}
                            t={t}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

/* =====================================================================================
 * UI bits
 * ===================================================================================== */

function FilterTab({
    label,
    count,
    active,
    onClick,
}: {
    label: string
    count?: number
    active?: boolean
    onClick: () => void
}) {
    return (
        <Button
            variant={active ? "default" : "ghost"}
            size="sm"
            onClick={onClick}
            className="gap-2"
        >
            <span>{label}</span>
            <span className="rounded bg-muted px-1.5 text-xs">{count ?? 0}</span>
        </Button>
    )
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-center rounded-md border bg-muted/30 py-8 text-sm text-muted-foreground">
            {label}
        </div>
    )
}

function Avatar({ url }: { url?: string }) {
    return (
        <div className="size-8 overflow-hidden rounded-full bg-muted">
            {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="size-full object-cover" />
            ) : (
                <div className="size-full" />
            )}
        </div>
    )
}

function ActionChip({
    children,
    onClick,
    title,
    active,
    disabled,
}: {
    children: React.ReactNode
    onClick: () => void
    title?: string
    active?: boolean
    disabled?: boolean
}) {
    return (
        <button
            type="button"
            title={title}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "rounded px-1.5 text-xs leading-5 transition",
                "bg-foreground/10 hover:bg-foreground/20",
                active && "bg-foreground/20"
            )}
        >
            {children}
        </button>
    )
}

/* =====================================================================================
 * Utils
 * ===================================================================================== */

function formatTimeAgo(iso: string) {
    const now = Date.now()
    const then = new Date(iso).getTime()
    const diff = Math.max(0, now - then)
    const sec = Math.floor(diff / 1000)
    const min = Math.floor(sec / 60)
    const hr = Math.floor(min / 60)
    const day = Math.floor(hr / 24)
    if (sec < 45) return "just now"
    if (min < 2) return "a minute ago"
    if (min < 45) return `${min} minutes ago`
    if (hr < 2) return "an hour ago"
    if (hr < 24) return `${hr} hours ago`
    if (day < 2) return "yesterday"
    return `${day} days ago`
}
