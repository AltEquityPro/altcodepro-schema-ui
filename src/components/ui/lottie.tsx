"use client"

import * as React from "react"
import Lottie, { LottieRefCurrentProps } from "lottie-react"
import type { AnyObj, EventHandler, LottieElement } from "@/src/types"
import { cn, resolveBinding } from "@/src/lib/utils"
import { useAppState } from "@/src/schema/StateContext"


export interface LottieRendererProps {
    element: LottieElement
    state?: AnyObj
    t?: (key: string) => string
    runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
}

export function LottieRenderer({
    element,
    state,
    t,
    runEventHandler,
}: LottieRendererProps) {
    const ctx = tryUseAppState()
    const _state = state ?? ctx.state
    const _t = t ?? ctx.t

    const autoplay = element.autoplay ?? true
    const loopFlag = element.loop
    const loopCount = numberOrNull(resolveBinding(element.loopCount, _state, _t))
    const speed = numberOrNull(element.speed)
    const direction = numberOrNull(element.direction) as 1 | -1 | null
    const isPlaying = booleanOrNull(resolveBinding(element.isPlaying, _state, _t))
    const progressBinding = numberOrNull(resolveBinding(element.progress, _state, _t)) // 0..1
    const renderer = (element.renderer as "svg" | "canvas" | "html") || "svg"
    const rendererSettings = resolveBinding(element.rendererSettings, _state, _t) as AnyObj | undefined

    const playOnVisible = !!element.playOnVisible
    const pauseWhenHidden = !!element.pauseWhenHidden
    const playOnHover = !!element.playOnHover
    const pauseOnHover = !!element.pauseOnHover
    const forceAutoplayEvenIfReducedMotion = !!element.forceAutoplayEvenIfReducedMotion

    const ariaLabel = resolveBinding(element.ariaLabel, _state, _t)
    const title = resolveBinding(element.title, _state, _t)

    /** ── Source handling ───────────────────────────────────────────────────── */
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

        // object directly
        if (typeof src === "object") {
            setAnimationData(src)
            return () => abort.abort()
        }

        // inline JSON (string)
        if (typeof src === "string" && src.trim().startsWith("{")) {
            try {
                const parsed = JSON.parse(src)
                setAnimationData(parsed)
            } catch (err: any) {
                setAnimationData(null)
                setDataError("Invalid inline Lottie JSON.")
                runEventHandler?.(element.onError, { error: "Invalid JSON", detail: String(err?.message || err) })
            }
            return () => abort.abort()
        }

        // URL
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
                    runEventHandler?.(element.onError, { error: "Fetch failed", detail: String(err?.message || err) })
                })
        }
        return () => abort.abort()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src])

    /** ── Refs & State ──────────────────────────────────────────────────────── */
    const lottieRef = React.useRef<LottieRefCurrentProps>(null)
    const rootRef = React.useRef<HTMLDivElement | null>(null)

    const [isVisible, setIsVisible] = React.useState(true)
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

    // Visibility observer
    React.useEffect(() => {
        if (!rootRef.current) return
        const el = rootRef.current
        const obs = new IntersectionObserver(
            (entries) => {
                const vis = entries.some((e) => e.isIntersecting)
                if (vis !== isVisible) setIsVisible(vis)
                if (vis) {
                    runEventHandler?.(element.onEnterViewport, { id: element.id })
                } else {
                    runEventHandler?.(element.onLeaveViewport, { id: element.id })
                }
            },
            { root: null, rootMargin: "0px", threshold: 0.25 }
        )
        obs.observe(el)
        return () => obs.disconnect()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rootRef.current])

    // Reduced motion
    React.useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const handler = () => setPrefersReducedMotion(!!mq.matches)
        handler()
        mq.addEventListener?.("change", handler)
        return () => mq.removeEventListener?.("change", handler)
    }, [])

    /** ── Looping (finite) helper ───────────────────────────────────────────── */
    const loopCounterRef = React.useRef(0)
    React.useEffect(() => {
        loopCounterRef.current = 0
    }, [animationData])

    const shouldAutoplay = React.useMemo(() => {
        if (prefersReducedMotion && !forceAutoplayEvenIfReducedMotion) return false
        return !!autoplay
    }, [autoplay, prefersReducedMotion, forceAutoplayEvenIfReducedMotion])

    /** ── Apply speed/direction on mount/update ─────────────────────────────── */
    React.useEffect(() => {
        const api = lottieRef.current
        if (!api) return
        if (speed != null) api.setSpeed(speed)
        if (direction === 1 || direction === -1) api.setDirection(direction)
    }, [speed, direction])

    /** ── Segments & markers support ────────────────────────────────────────── */
    const segmentsBinding = resolveBinding(element.segments, _state, _t) as
        | [number, number]
        | Array<[number, number]>
        | null

    const markerStart = resolveBinding(element.markerStart, _state, _t) as string | undefined
    const markerEnd = resolveBinding(element.markerEnd, _state, _t) as string | undefined

    const computedSegments = React.useMemo(() => {
        if (!animationData) return null as [number, number] | Array<[number, number]> | null

        if (markerStart && animationData?.markers?.length) {
            const s = findMarkerFrame(animationData, markerStart)
            const e = markerEnd ? findMarkerFrame(animationData, markerEnd) : null
            if (s != null) {
                const endFrame = e != null ? e : (animationData.op ?? null)
                if (endFrame != null) return [s, endFrame] as [number, number]
            }
        }
        if (Array.isArray(segmentsBinding) || (segmentsBinding && (segmentsBinding as any)[0] != null)) {
            return segmentsBinding
        }
        return null
    }, [animationData, segmentsBinding, markerStart, markerEnd])

    /** ── Handle external play/pause/progress bindings ──────────────────────── */
    React.useEffect(() => {
        const api = lottieRef.current
        if (!api) return
        if (isPlaying === true) api.play()
        if (isPlaying === false) api.pause()
    }, [isPlaying])

    React.useEffect(() => {
        const api = lottieRef.current
        if (!api) return
        if (progressBinding == null) return
        const total = (api.getDuration(true) || 0) // frames
        if (total > 0) {
            const frame = clamp(Math.round(progressBinding * total), 0, total)
            api.goToAndStop(frame, true)
        }
    }, [progressBinding])

    /** ── Imperative controls via bound command object ──────────────────────── */
    const controlObj = resolveBinding(element.controlBinding, _state, _t) as
        | { cmd: string; args?: any; nonce?: any }
        | undefined

    const lastNonceRef = React.useRef<any>(null)
    React.useEffect(() => {
        if (!controlObj) return
        if (controlObj.nonce != null && lastNonceRef.current === controlObj.nonce) return
        lastNonceRef.current = controlObj.nonce

        const api = lottieRef.current
        if (!api) return

        try {
            switch ((controlObj.cmd || "").toLowerCase()) {
                case "play":
                    api.play()
                    break
                case "pause":
                    api.pause()
                    break
                case "stop":
                    api.stop()
                    break
                case "setspeed":
                    if (typeof controlObj.args === "number") api.setSpeed(controlObj.args)
                    break
                case "setdirection":
                    if (controlObj.args === 1 || controlObj.args === -1) api.setDirection(controlObj.args)
                    break
                case "gotoandplay": {
                    handleGoTo(api, controlObj.args, true)
                    break
                }
                case "gotoandstop": {
                    handleGoTo(api, controlObj.args, false)
                    break
                }
                case "playsegments": {
                    const { segments, force } = controlObj.args || {}
                    if (segments) api.playSegments(segments, !!force)
                    break
                }
                case "setprogress": {
                    const p = Number(controlObj.args)
                    if (!isNaN(p)) {
                        const total = (api.getDuration(true) || 0)
                        const frame = clamp(Math.round(p * total), 0, total)
                        api.goToAndStop(frame, true)
                    }
                    break
                }
            }
        } catch (err: any) {
            runEventHandler?.(element.onError, { error: "control", detail: String(err?.message || err) })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controlObj?.nonce, controlObj?.cmd, controlObj?.args])

    /** ── Visibility-driven playback ────────────────────────────────────────── */
    React.useEffect(() => {
        const api = lottieRef.current
        if (!api) return
        if (!animationData) return

        if (playOnVisible && isVisible) api.play()
        if (pauseWhenHidden && !isVisible) api.pause()
    }, [isVisible, playOnVisible, pauseWhenHidden, animationData])

    /** ── Hover interactions ────────────────────────────────────────────────── */
    const [hovered, setHovered] = React.useState(false)
    React.useEffect(() => {
        const api = lottieRef.current
        if (!api) return
        if (!animationData) return

        if (hovered && playOnHover) api.play()
        if (hovered === false && pauseOnHover) api.pause()
    }, [hovered, playOnHover, pauseOnHover, animationData])

    /** ── Loop finiteness handling ──────────────────────────────────────────── */
    const handleLoopComplete = React.useCallback(async () => {
        loopCounterRef.current += 1
        await runEventHandler?.(element.onLoop, { id: element.id, count: loopCounterRef.current })

        if (typeof loopCount === "number" && loopCount >= 0) {
            if (loopCounterRef.current >= loopCount) {
                lottieRef.current?.stop()
            }
        }
    }, [runEventHandler, element.onLoop, element.id, loopCount])

    /** ── Render ───────────────────────────────────────────────────────────── */
    const showAutoplay = shouldAutoplay && (!playOnVisible || isVisible)

    return (
        <div
            ref={rootRef}
            className={cn("relative w-full h-full", element.styles?.className)}
            data-slot="lottie"
            role="img"
            aria-label={ariaLabel || "animation"}
            title={title || undefined}
            onMouseEnter={async () => {
                setHovered(true)
                await runEventHandler?.(element.onHoverStart, { id: element.id })
            }}
            onMouseLeave={async () => {
                setHovered(false)
                await runEventHandler?.(element.onHoverEnd, { id: element.id })
            }}
            onClick={() => runEventHandler?.(element.onClick, { id: element.id })}
        >
            {(!animationData && !dataError) && (
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
                    /* Core */
                    lottieRef={lottieRef}
                    animationData={animationData}
                    autoplay={showAutoplay}
                    loop={typeof loopCount === "number" ? true : (loopFlag ?? true)}
                    style={{ width: "100%", height: "100%" }}
                    /* Renderer / Settings passthrough (lottie-web) */
                    renderer={renderer as any}
                    rendererSettings={rendererSettings}
                    /* Events */
                    onComplete={() => runEventHandler?.(element.onComplete, { id: element.id })}
                    onLoopComplete={handleLoopComplete}
                    onEnterFrame={(e: any) => {
                        if ("currentTime" in e) {
                            runEventHandler?.(element.onEnterFrame, {
                                id: element.id,
                                frame: e.currentTime,
                            });
                        }
                    }}
                    onSegmentStart={(e: any) => {
                        if ("firstFrame" in e) {
                            runEventHandler?.(element.onSegmentStart, { id: element.id, segment: e?.firstFrame != null ? [e.firstFrame, e.lastFrame] : null })
                        }
                    }}
                    onDataReady={() => runEventHandler?.(element.onDataReady, { id: element.id })}
                    onDOMLoaded={() => runEventHandler?.(element.onDomLoaded, { id: element.id })}
                    onConfigReady={() => runEventHandler?.(element.onConfigReady, { id: element.id })}
                />
            )}

            {/* Apply initial speed/direction and segments once loaded */}
            <ApplyPlaybackDirectives
                apiRef={lottieRef as any}
                speed={speed ?? undefined}
                direction={direction ?? undefined}
                segments={computedSegments ?? undefined}
                loopCount={loopCount ?? undefined}
                onError={(msg) => runEventHandler?.(element.onError, { error: msg })}
            />

            {/* Dev-only helpers */}
            {process.env.NODE_ENV === "development" && (
                <div className="pointer-events-none absolute bottom-2 right-2 text-[10px] text-foreground/60 bg-background/60 px-1 rounded">
                    Lottie
                </div>
            )}
        </div>
    )
}

/* ───────────────────────────── Helpers & subcomponents ─────────────────────────── */

function tryUseAppState() {
    try {
        return useAppState()
    } catch {
        return { state: {} as AnyObj, t: (k: string) => k }
    }
}

function numberOrNull(v: any): number | null {
    const n = typeof v === "number" ? v : (v != null ? Number(v) : NaN)
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

function findMarkerFrame(json: any, name: string): number | null {
    const markers: Array<{ tm: number; cm: string }> | undefined = json?.markers
    if (!markers?.length) return null
    const m = markers.find((mk) => mk.cm === name)
    return m ? Math.round(m.tm) : null
}

function handleGoTo(api: LottieRefCurrentProps, arg: any, play: boolean) {
    if (typeof arg === "number") {
        api[play ? "goToAndPlay" : "goToAndStop"](arg, true)
        return
    }
    if (typeof arg === "object" && arg) {
        if (typeof arg.progress === "number") {
            const total = api.getDuration(true) || 0
            const frame = clamp(Math.round(arg.progress * total), 0, total)
            api[play ? "goToAndPlay" : "goToAndStop"](frame, true)
            return
        }
        if (typeof arg.frame === "number") {
            api[play ? "goToAndPlay" : "goToAndStop"](arg.frame, true)
            return
        }
    }
}

/**
 * ApplyPlaybackDirectives — once animation is ready, apply:
 *  - speed
 *  - direction
 *  - segments (playSegments if provided)
 *  - finite loop logic bootstrap (by forcing play so loop events fire)
 */
function ApplyPlaybackDirectives({
    apiRef,
    speed,
    direction,
    segments,
    loopCount,
    onError,
}: {
    apiRef: React.RefObject<LottieRefCurrentProps>
    speed?: number
    direction?: 1 | -1
    segments?: [number, number] | Array<[number, number]>
    loopCount?: number
    onError?: (msg: string) => void
}) {
    const appliedRef = React.useRef(false)

    React.useEffect(() => {
        const api = apiRef.current
        if (!api) return
        if (appliedRef.current) return

        try {
            if (speed != null) api.setSpeed(speed)
            if (direction === 1 || direction === -1) api.setDirection(direction)

            if (segments) {
                api.playSegments(segments as any, true)
            } else if (typeof loopCount === "number") {
                // ensure playback starts so we can count loops
                api.play()
            }

            appliedRef.current = true
        } catch (err: any) {
            onError?.(String(err?.message || err))
        }
    }, [apiRef, speed, direction, segments, loopCount, onError])

    return null
}

export default LottieRenderer
