"use client"

import { resolveBinding } from "@/src/lib/utils"
import { useAppState } from "@/src/schema/StateContext"
import * as React from "react"
import { useDropzone } from "react-dropzone"
import wrapWithMotion from "./wrapWithMotion"
import { EventHandler, FileUploadElement } from "@/src/types"

type UploadStatus = "idle" | "queued" | "uploading" | "success" | "error" | "canceled"
type AnyObj = Record<string, any>

export type UploadedItem = { file: File; url?: string; meta?: AnyObj }

export type FileUploadProps = {
    /** Presigned PUT url endpoint, or a function that returns the final URL to PUT to. */
    presignUrl: string | ((file: File) => Promise<string> | string)
    /** Extra headers for the upload PUT (e.g., S3, GCS) */
    headers?: Record<string, string>
    /** Called when ALL current uploads in the batch complete (success or fail) */
    onComplete?: (summary: {
        successes: UploadedItem[]
        failures: { file: File; error: string }[]
    }) => void
    /** Called after EACH successful upload */
    onUploaded?: (item: UploadedItem) => void
    /** Called once when a file starts uploading */
    onStart?: (file: File) => void
    /** Called on progress for a single file */
    onProgress?: (file: File, progress: number) => void
    /** Called on an error for a single file */
    onError?: (file: File, error: string) => void
    /** Called whenever queue changes (add/remove/status change) */
    onQueueChange?: (queue: FileState[]) => void

    /** Accept string like ".png,.jpg,application/pdf" */
    accept?: string
    /** Max size in bytes per file */
    maxSize?: number
    /** Max number of files allowed in the queue */
    maxFiles?: number
    /** Allow multiple selection */
    multiple?: boolean
    /** Initial remote files (already uploaded) to show as read-only previews */
    initial?: { name: string; size?: number; type?: string; url: string }[]

    /** Concurrency for parallel uploads */
    concurrency?: number
    /** Extra query string or body to add to presign (if string endpoint) */
    queryParams?: (file: File) => Record<string, string>
    /** Format file size display */
    formatSize?: (bytes: number) => string

    /** Show image previews (objectURL) */
    showPreview?: boolean
    /** Class to apply when idle/drag/accept/reject; you can plug in animate.css classnames here */
    className?: string
    dragClassName?: string
    dragAcceptClassName?: string
    dragRejectClassName?: string

    /** Text overrides */
    dropText?: string
    dropActiveText?: string

    /** Custom PUT implementation (overrides presignUrl behavior) */
    customUpload?: (args: {
        file: File
        url: string
        headers?: Record<string, string>
        onProgress: (pct: number) => void
        signal: AbortSignal
    }) => Promise<{ url?: string; meta?: AnyObj }>

    /** Disable component */
    disabled?: boolean
}

export type FileState = {
    id: string
    file?: File
    name: string
    size: number
    type?: string
    previewUrl?: string
    remoteUrl?: string
    status: UploadStatus
    progress: number
    error?: string
    controller?: AbortController
    meta?: AnyObj
    /** true if this was provided via `initial` prop (already uploaded) */
    readOnly?: boolean
}

/** ---------- helpers ---------- */
const defaultFormatSize = (b: number) => {
    if (b === 0) return "0 B"
    const k = 1024
    const dm = 1
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(b) / Math.log(k))
    return `${parseFloat((b / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const extFromType = (type?: string) =>
    type?.split("/")[1]?.toUpperCase() || undefined

const fileIconLabel = (f: FileState) => {
    if (f.type?.startsWith("image/")) return "IMG"
    if (f.type?.startsWith("video/")) return "VID"
    if (f.type?.startsWith("audio/")) return "AUD"
    return extFromType(f.type) || (f.name.split(".").pop() || "FILE").toUpperCase()
}

const idOf = (f: File | { name: string; url?: string }) =>
    `${f.name}-${Math.random().toString(36).slice(2)}`

/** ---------- component ---------- */
export function FileUpload({
    presignUrl,
    headers,
    onComplete,
    onUploaded,
    onStart,
    onProgress,
    onError,
    onQueueChange,

    accept,
    maxSize,
    maxFiles,
    multiple = true,
    initial = [],

    concurrency = 3,
    queryParams,
    formatSize = defaultFormatSize,

    showPreview = true,
    className,
    dragClassName = "ring-2 ring-primary/50",
    dragAcceptClassName = "ring-2 ring-emerald-500/60",
    dragRejectClassName = "ring-2 ring-destructive/60",

    dropText = "Drag & drop files here, or click to select",
    dropActiveText = "Drop files to upload…",

    customUpload,
    disabled = false,
}: FileUploadProps) {
    const [queue, setQueue] = React.useState<FileState[]>(() =>
        initial.map((it) => ({
            id: idOf(it),
            name: it.name,
            size: it.size ?? 0,
            type: it.type,
            remoteUrl: it.url,
            status: "success",
            progress: 100,
            readOnly: true,
        }))
    )
    const [activeCount, setActiveCount] = React.useState(0)
    const mountedRef = React.useRef(true)

    const notifyQueue = React.useCallback(
        (next: FileState[]) => onQueueChange?.(next),
        [onQueueChange]
    )

    React.useEffect(() => {
        return () => {
            mountedRef.current = false
            // abort any outstanding uploads
            setQueue((q) => {
                q.forEach((f) => f.controller?.abort())
                return q
            })
        }
    }, [])

    const setQueueSafe = React.useCallback((updater: (q: FileState[]) => FileState[]) => {
        setQueue((prev) => {
            const next = updater(prev)
            notifyQueue(next)
            return next
        })
    }, [notifyQueue])

    /** dropzone */
    const onDrop = React.useCallback(
        (accepted: File[], rejections: any[]) => {
            if (disabled) return
            if (maxFiles && accepted.length + queue.length > maxFiles) {
                // Trim to remaining slots
                accepted = accepted.slice(0, Math.max(0, maxFiles - queue.length))
            }

            const incoming = accepted.map<FileState>((file) => ({
                id: idOf(file),
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                previewUrl: showPreview && file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
                status: "queued",
                progress: 0,
            }))

            setQueueSafe((prev) => [...prev, ...incoming])
        },
        [disabled, maxFiles, queue.length, showPreview, setQueueSafe]
    )

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject,
        fileRejections,
    } = useDropzone({
        multiple,
        maxSize,
        accept: accept
            ? Object.fromEntries(accept.split(",").map((t) => [t.trim(), []]))
            : undefined,
        onDrop,
        disabled,
    })

    /** upload scheduler */
    React.useEffect(() => {
        if (disabled) return
        const canStart = () =>
            activeCount < concurrency &&
            queue.some((f) => f.status === "queued")

        if (!canStart()) return

        const startNext = async () => {
            const next = queue.find((f) => f.status === "queued")
            if (!next) return

            const controller = new AbortController()
            setActiveCount((c) => c + 1)
            setQueueSafe((prev) =>
                prev.map((f) => (f.id === next.id ? { ...f, status: "uploading", controller } : f))
            )
            if (next.file) onStart?.(next.file)

            try {
                const signedUrl =
                    typeof presignUrl === "function"
                        ? await presignUrl(next.file!)
                        : appendQuery(presignUrl, queryParams?.(next.file!) || {}, next.file?.name)

                const result = customUpload
                    ? await customUpload({
                        file: next.file!,
                        url: signedUrl,
                        headers,
                        onProgress: (pct) => {
                            if (!mountedRef.current) return
                            onProgress?.(next.file!, pct)
                            setQueueSafe((prev) =>
                                prev.map((f) => (f.id === next.id ? { ...f, progress: pct } : f))
                            )
                        },
                        signal: controller.signal,
                    })
                    : await putWithProgress({
                        file: next.file!,
                        url: signedUrl,
                        headers,
                        signal: controller.signal,
                        onProgress: (pct) => {
                            if (!mountedRef.current) return
                            onProgress?.(next.file!, pct)
                            setQueueSafe((prev) =>
                                prev.map((f) => (f.id === next.id ? { ...f, progress: pct } : f))
                            )
                        },
                    })

                const finalUrl = result.url || stripQuery(signedUrl)
                const meta = result.meta

                setQueueSafe((prev) =>
                    prev.map((f) =>
                        f.id === next.id
                            ? { ...f, status: "success", progress: 100, remoteUrl: finalUrl, meta }
                            : f
                    )
                )
                onUploaded?.({ file: next.file!, url: finalUrl, meta })
            } catch (err: any) {
                const message = err?.message || "Upload failed"
                if (next.file) onError?.(next.file, message)
                setQueueSafe((prev) =>
                    prev.map((f) => (f.id === next.id ? { ...f, status: err?.name === "AbortError" ? "canceled" : "error", error: message } : f))
                )
            } finally {
                setActiveCount((c) => Math.max(0, c - 1))
            }
        }

        // start as many as we can right now
        const toKick = Math.min(concurrency - activeCount, queue.filter(f => f.status === "queued").length)
        for (let i = 0; i < toKick; i++) {
            // using microtask to avoid tight loops fighting React state batching
            Promise.resolve().then(startNext)
        }
    }, [queue, activeCount, concurrency, presignUrl, headers, customUpload, onStart, onProgress, onUploaded, onError, disabled, setQueueSafe, queryParams])

    /** fire onComplete when no active & no queued uploads remain (only if at least one was uploading) */
    const prevUploadingRef = React.useRef(false)
    React.useEffect(() => {
        const anyUploading = queue.some((f) => f.status === "uploading")
        const anyQueued = queue.some((f) => f.status === "queued")
        const justFinished = prevUploadingRef.current && !anyUploading && !anyQueued
        prevUploadingRef.current = anyUploading || anyQueued

        if (justFinished && onComplete) {
            const successes = queue.filter((f) => f.status === "success" && f.remoteUrl).map((f) => ({
                file: f.file!,
                url: f.remoteUrl!,
                meta: f.meta,
            }))
            const failures = queue
                .filter((f) => f.status === "error")
                .map((f) => ({ file: f.file!, error: f.error || "Upload error" }))
            onComplete({ successes, failures })
        }
    }, [queue, onComplete])

    /** actions */
    const removeItem = (id: string) => {
        setQueueSafe((prev) => {
            const item = prev.find((f) => f.id === id)
            item?.controller?.abort()
            if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
            return prev.filter((f) => f.id !== id)
        })
    }
    const retryItem = (id: string) =>
        setQueueSafe((prev) =>
            prev.map((f) => (f.id === id && f.status === "error" ? { ...f, status: "queued", progress: 0, error: undefined } : f))
        )
    const cancelItem = (id: string) => {
        setQueueSafe((prev) => {
            const item = prev.find((f) => f.id === id)
            item?.controller?.abort()
            return prev.map((f) => (f.id === id ? { ...f, status: "canceled" } : f))
        })
    }
    const cancelAll = () =>
        setQueueSafe((prev) => {
            prev.forEach((f) => f.controller?.abort())
            return prev.map((f) =>
                f.status === "uploading" || f.status === "queued" ? { ...f, status: "canceled" } : f
            )
        })
    const clearCompleted = () =>
        setQueueSafe((prev) => prev.filter((f) => !(f.status === "success" || f.status === "canceled" || f.status === "error")))

    /** ui helpers */
    const dropCls = [
        "border-input transition-colors flex cursor-pointer items-center justify-center rounded-md border border-dashed p-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDragActive && dragClassName,
        isDragAccept && dragAcceptClassName,
        isDragReject && dragRejectClassName,
        disabled && "opacity-60 cursor-not-allowed",
        className,
        // example animate.css hooks (optional if you include animate.css)
        isDragActive ? "animate__animated animate__pulse" : "",
    ]
        .filter(Boolean)
        .join(" ")

    const anyUploading = queue.some((f) => f.status === "uploading" || f.status === "queued")

    return (
        <div className="space-y-3" aria-disabled={disabled}>
            {/* Dropzone */}
            <div {...getRootProps({ tabIndex: 0 })} className={dropCls} aria-label="File Upload Dropzone">
                <input {...getInputProps()} />
                <p className="text-center">
                    {isDragActive ? dropActiveText : dropText}
                    {maxFiles ? (
                        <span className="block text-xs text-muted-foreground mt-1">
                            Up to {maxFiles} file{maxFiles > 1 ? "s" : ""}, {accept ? `types: ${accept}` : "any type"}
                        </span>
                    ) : null}
                </p>
            </div>

            {/* Validation errors from dropzone */}
            {fileRejections.length > 0 && (
                <div className="text-destructive text-xs space-y-1" role="alert">
                    {fileRejections.map((rej, i) => (
                        <div key={i}>
                            {rej.file.name}: {rej.errors.map((e: any) => e.message).join(", ")}
                        </div>
                    ))}
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={cancelAll}
                    className="text-xs px-2 py-1 rounded border hover:bg-accent disabled:opacity-50"
                    disabled={!anyUploading}
                    aria-disabled={!anyUploading}
                >
                    Cancel All
                </button>
                <button
                    type="button"
                    onClick={clearCompleted}
                    className="text-xs px-2 py-1 rounded border hover:bg-accent"
                >
                    Clear Completed
                </button>
                <span className="ml-auto text-xs text-muted-foreground">
                    {queue.length} file{queue.length !== 1 ? "s" : ""} in queue
                </span>
            </div>

            {/* List */}
            {queue.length > 0 && (
                <ul className="space-y-2">
                    {queue.map((f) => (
                        <li
                            key={f.id}
                            className={[
                                "flex items-center gap-3 rounded border p-2 text-sm bg-background",
                                f.status === "uploading" ? "animate__animated animate__fadeIn" : "",
                            ].join(" ")}
                        >
                            {/* Preview / icon */}
                            <div className="h-10 w-10 rounded overflow-hidden bg-muted flex items-center justify-center shrink-0">
                                {showPreview && f.previewUrl ? (
                                    <img src={f.previewUrl} alt={f.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-[10px] font-semibold">{fileIconLabel(f)}</span>
                                )}
                            </div>

                            {/* Name + progress + status */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="truncate" title={f.name}>
                                        {f.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        {formatSize(f.size)}
                                    </span>
                                </div>

                                {/* Progress / status line */}
                                {f.status === "uploading" && (
                                    <div className="h-1.5 w-full rounded bg-muted mt-1">
                                        <div
                                            className="h-1.5 rounded bg-primary transition-all"
                                            style={{ width: `${f.progress}%` }}
                                            aria-valuenow={f.progress}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            role="progressbar"
                                        />
                                    </div>
                                )}
                                {f.status === "error" && (
                                    <p className="text-destructive text-xs mt-1">{f.error}</p>
                                )}
                                {f.status === "success" && f.remoteUrl && (
                                    <a
                                        href={f.remoteUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                    >
                                        View
                                    </a>
                                )}
                                {f.status === "canceled" && (
                                    <p className="text-xs text-muted-foreground mt-1">Canceled</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {f.status === "uploading" && (
                                    <button
                                        type="button"
                                        onClick={() => cancelItem(f.id)}
                                        className="text-xs px-2 py-1 rounded border hover:bg-accent"
                                        aria-label={`Cancel upload ${f.name}`}
                                    >
                                        Cancel
                                    </button>
                                )}
                                {f.status === "error" && (
                                    <button
                                        type="button"
                                        onClick={() => retryItem(f.id)}
                                        className="text-xs px-2 py-1 rounded border hover:bg-accent"
                                        aria-label={`Retry upload ${f.name}`}
                                    >
                                        Retry
                                    </button>
                                )}
                                {!f.readOnly && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(f.id)}
                                        className="text-xs px-2 py-1 rounded border hover:bg-accent"
                                        aria-label={`Remove ${f.name}`}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

/** ---------- low-level PUT with progress (XHR for reliable progress events) ---------- */
async function putWithProgress({
    file,
    url,
    headers,
    signal,
    onProgress,
}: {
    file: File
    url: string
    headers?: Record<string, string>
    signal: AbortSignal
    onProgress: (pct: number) => void
}): Promise<{ url?: string; meta?: AnyObj }> {
    await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("PUT", url, true)
        Object.entries(headers || {}).forEach(([k, v]) => xhr.setRequestHeader(k, v))
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream")

        const abort = () => {
            try {
                xhr.abort()
            } catch { }
            reject(Object.assign(new Error("AbortError"), { name: "AbortError" }))
        }
        signal.addEventListener("abort", abort, { once: true })

        xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
                const pct = Math.round((evt.loaded / evt.total) * 100)
                onProgress(pct)
            }
        }
        xhr.onload = () => {
            signal.removeEventListener("abort", abort)
            if (xhr.status >= 200 && xhr.status < 300) resolve()
            else reject(new Error(`Upload failed (${xhr.status})`))
        }
        xhr.onerror = () => {
            signal.removeEventListener("abort", abort)
            reject(new Error("Network error"))
        }
        xhr.send(file)
    })

    return { url }
}

/** ---------- url helpers ---------- */
function appendQuery(base: string, params: Record<string, string>, filename?: string) {
    const url = new URL(base, typeof window !== "undefined" ? window.location.href : undefined)
    Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v))
    if (filename) url.searchParams.set("filename", filename)
    return url.toString()
}
function stripQuery(u: string) {
    try {
        const url = new URL(u)
        url.search = ""
        url.hash = ""
        return url.toString()
    } catch {
        return u
    }
}

interface FileUploadRendererProps {
    element: FileUploadElement
    runEventHandler: (
        handler?: EventHandler,
        dataOverride?: AnyObj
    ) => Promise<void>
}

export function FileUploadRenderer({
    element,
    runEventHandler,
}: FileUploadRendererProps) {
    const { state, t } = useAppState()

    const accept = element.accept
    const multiple = element.multiple ?? true
    const maxSize = element.maxSize
    const presignUrl = resolveBinding(element.presignUrl, state, t)
    const headers: Record<string, string> = {}
    if (element.headers) {
        Object.entries(element.headers).forEach(([k, v]) => {
            headers[k] = resolveBinding(v, state, t)
        })
    }

    const handleUploaded = (item: { file: File; url?: string; meta?: AnyObj }) => {
        runEventHandler(element.onUploaded, { file: item.file, url: item.url, meta: item.meta })
    }
    const handleError = (file: File, error: string) => {
        runEventHandler(element.onError, { file, error })
    }
    const handleComplete = (summary: {
        successes: UploadedItem[]
        failures: { file: File; error: string }[]
    }) => {
        runEventHandler(element.onComplete, summary)
    }
    const handleQueueChange = (queue: AnyObj) => {
        runEventHandler(element.onQueueChange, { queue })
    }

    return wrapWithMotion(element,
        <FileUpload
            presignUrl={presignUrl}
            headers={headers}
            accept={accept}
            multiple={multiple}
            maxSize={maxSize}
            onUploaded={handleUploaded}
            onError={handleError}
            onComplete={handleComplete}
            onQueueChange={handleQueueChange}
        />
    )
}