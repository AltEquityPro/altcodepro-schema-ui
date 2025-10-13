"use client"

import * as React from "react"
import Lottie, { LottieRefCurrentProps } from "lottie-react"
import type { AnyObj, EventHandler, LottieElement } from "../../types"
import { cn, resolveBinding } from "../../lib/utils"
import { useAppState } from "../../schema/StateContext"

/** ─────────────── Types ─────────────── */
export interface LottieRendererProps {
    element?: LottieElement | null
    state?: AnyObj
    t?: (key: string) => string
    runEventHandler?: (
        handler?: EventHandler,
        dataOverride?: AnyObj
    ) => Promise<void>
}

/** ─────────────── Renderer ─────────────── */
export function LottieRenderer({
    element,
    state,
    t,
    runEventHandler,
}: LottieRendererProps) {
    /** Prevent crashes if element is missing */
    if (!element || typeof element !== "object") {
        console.warn("⚠️ Missing or invalid element passed to LottieRenderer")
        return (
            <div className="text-xs text-muted-foreground p-2">
                Invalid Lottie element
            </div>
        )
    }

    const ctx = tryUseAppState()
    const _state = state ?? ctx.state ?? {}
    const _t = t ?? ctx.t ?? ((k: string) => k)

    /** Playback props */
    const autoplay = element.autoplay ?? true
    const loopFlag = element.loop ?? true
    const loopCount = numberOrNull(resolveBinding(element.loopCount, _state, _t))
    const speed = numberOrNull(element.speed)
    const direction = numberOrNull(element.direction) as 1 | -1 | null
    const isPlaying = booleanOrNull(resolveBinding(element.isPlaying, _state, _t))
    const progressBinding = numberOrNull(resolveBinding(element.progress, _state, _t))
    const renderer = (element.renderer as "svg" | "canvas" | "html") || "svg"
    const rendererSettings = resolveBinding(element.rendererSettings, _state, _t) as AnyObj | undefined

    const playOnVisible = !!element.playOnVisible
    const pauseWhenHidden = !!element.pauseWhenHidden
    const playOnHover = !!element.playOnHover
    const pauseOnHover = !!element.pauseOnHover
    const forceAutoplayEvenIfReducedMotion = !!element.forceAutoplayEvenIfReducedMotion

    const ariaLabel = resolveBinding(element.ariaLabel, _state, _t)
    const title = resolveBinding(element.title, _state, _t)

    /** ─────────────── Source ─────────────── */
    const src = resolveBinding(element.src, _state, _t)
    const [animationData, setAnimationData] = React.useState<any>(null)
    const [dataError, setDataError] = React.useState<string | null>(null)

    React.useEffect(() => {
        let abort = new AbortController()
        setDataError(null)

        if (!src) {
            setAnimationData(null)
            return
        }

        if (typeof src === "object") {
            setAnimationData(src)
            return
        }

        if (typeof src === "string" && src.trim().startsWith("{")) {
            try {
                setAnimationData(JSON.parse(src))
            } catch (err: any) {
                setAnimationData(null)
                setDataError("Invalid inline Lottie JSON.")
                runEventHandler?.(element.onError, {
                    error: "Invalid JSON",
                    detail: String(err?.message || err),
                })
            }
            return
        }

        if (typeof src === "string") {
            fetch(src, { signal: abort.signal })
                .then(async (r) => {
                    if (!r.ok) throw new Error(`HTTP ${r.status}`)
                    return r.json()
                })
                .then((json) => setAnimationData(json))
                .catch((err: any) => {
                    if (abort.signal.aborted) return
                    setAnimationData(null)
                    setDataError("Failed to load animation.")
                    runEventHandler?.(element.onError, {
                        error: "Fetch failed",
                        detail: String(err?.message || err),
                    })
                })
        }

        return () => abort.abort()
    }, [src])

    /** ─────────────── Refs & State ─────────────── */
    const lottieRef = React.useRef<LottieRefCurrentProps>(null)
    const rootRef = React.useRef<HTMLDivElement | null>(null)
    const [isVisible, setIsVisible] = React.useState(true)
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

    /** Safe observer setup */
    React.useEffect(() => {
        const el = rootRef.current
        if (!el || typeof IntersectionObserver === "undefined") return
        const obs = new IntersectionObserver(
            (entries) => {
                const vis = entries.some((e) => e.isIntersecting)
                setIsVisible(vis)
                runEventHandler?.(
                    vis ? element.onEnterViewport : element.onLeaveViewport,
                    { id: element.id }
                )
            },
            { threshold: 0.25 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [rootRef.current])

    /** Reduced motion preference */
    React.useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const handler = () => setPrefersReducedMotion(!!mq.matches)
        handler()
        mq.addEventListener?.("change", handler)
        return () => mq.removeEventListener?.("change", handler)
    }, [])

    const loopCounterRef = React.useRef(0)
    React.useEffect(() => {
        loopCounterRef.current = 0
    }, [animationData])

    const loopProp: boolean | number =
        typeof loopCount === "number" ? loopCount : loopFlag

    const shouldAutoplay = React.useMemo(() => {
        if (prefersReducedMotion && !forceAutoplayEvenIfReducedMotion) return false
        return autoplay
    }, [autoplay, prefersReducedMotion, forceAutoplayEvenIfReducedMotion])

    React.useEffect(() => {
        const api = lottieRef.current
        if (!api) return
        if (speed != null) api.setSpeed(speed)
        if (direction === 1 || direction === -1) api.setDirection(direction)
    }, [speed, direction])

    React.useEffect(() => {
        const api = lottieRef.current
        if (!api) return
        if (isPlaying === true) api.play()
        if (isPlaying === false) api.pause()
    }, [isPlaying])

    React.useEffect(() => {
        const api = lottieRef.current
        if (!api || progressBinding == null) return
        const total = api.getDuration(true) || 0
        if (total > 0) {
            const frame = clamp(Math.round(progressBinding * total), 0, total)
            api.goToAndStop(frame, true)
        }
    }, [progressBinding])

    React.useEffect(() => {
        const api = lottieRef.current
        if (!api || !animationData) return
        if (playOnVisible && isVisible) api.play()
        if (pauseWhenHidden && !isVisible) api.pause()
    }, [isVisible, playOnVisible, pauseWhenHidden, animationData])

    const [hovered, setHovered] = React.useState(false)
    React.useEffect(() => {
        const api = lottieRef.current
        if (!api || !animationData) return
        if (hovered && playOnHover) api.play()
        if (!hovered && pauseOnHover) api.pause()
    }, [hovered, playOnHover, pauseOnHover, animationData])

    const handleLoopComplete = React.useCallback(async () => {
        loopCounterRef.current += 1
        await runEventHandler?.(element.onLoop, {
            id: element.id,
            count: loopCounterRef.current,
        })
        if (typeof loopCount === "number" && loopCount >= 0) {
            if (loopCounterRef.current >= loopCount) lottieRef.current?.stop()
        }
    }, [runEventHandler, element.onLoop, element.id, loopCount])

    /** ─────────────── Render ─────────────── */
    return (
        <div
            ref={rootRef}
            className={cn(
                "relative w-full h-full flex items-center justify-center",
                element.styles?.className
            )}
            data-slot="lottie"
            role="img"
            aria-label={ariaLabel || "animation"}
            title={title || undefined}
            onMouseEnter={() => {
                setHovered(true)
                runEventHandler?.(element.onHoverStart, { id: element.id })
            }}
            onMouseLeave={() => {
                setHovered(false)
                runEventHandler?.(element.onHoverEnd, { id: element.id })
            }}
            onClick={() => runEventHandler?.(element.onClick, { id: element.id })}
        >
            {!animationData && !dataError && (
                <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
                    Loading animation…
                </div>
            )}
            {dataError && (
                <div className="absolute inset-0 grid place-items-center text-sm text-destructive">
                    {dataError}
                </div>
            )}
            {animationData && (
                <Lottie
                    lottieRef={lottieRef}
                    animationData={animationData}
                    autoplay={shouldAutoplay}
                    loop={loopProp}
                    style={{ width: "100%", height: "100%", maxHeight: "80vh" }}
                    renderer={renderer as any}
                    rendererSettings={rendererSettings}
                    onDOMLoaded={() => {
                        if (shouldAutoplay && lottieRef.current) {
                            lottieRef.current.play()
                        }
                        runEventHandler?.(element.onDomLoaded, { id: element.id })
                    }}
                    onComplete={() =>
                        runEventHandler?.(element.onComplete, { id: element.id })
                    }
                    onLoopComplete={handleLoopComplete}
                />
            )}
        </div>
    )
}

/** ─────────────── Helpers ─────────────── */
function tryUseAppState() {
    try {
        return useAppState()
    } catch {
        return { state: {} as AnyObj, t: (k: string) => k }
    }
}
function numberOrNull(v: any): number | null {
    const n = typeof v === "number" ? v : v != null ? Number(v) : NaN
    return isNaN(n) ? null : n
}
function booleanOrNull(v: any): boolean | null {
    if (v === true || v === false) return v
    if (v == null) return null
    if (typeof v === "string") {
        const s = v.toLowerCase().trim()
        if (["true", "1", "yes"].includes(s)) return true
        if (["false", "0", "no"].includes(s)) return false
    }
    return null
}
function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n))
}
