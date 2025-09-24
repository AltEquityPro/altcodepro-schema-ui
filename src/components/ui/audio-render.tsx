"use client"

import * as React from "react"
import { cn, resolveBinding } from "@/src/lib/utils"
import { AnyObj, AudioElement, EventHandler } from "@/src/types"

interface AudioRendererProps {
    element: AudioElement
    state: AnyObj
    t: (key: string) => string
    runEventHandler: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
}

/**
 * Renders an audio player with bindings and event hooks
 */
export function AudioRenderer({
    element,
    state,
    t,
    runEventHandler,
}: AudioRendererProps) {
    const audioRef = React.useRef<HTMLAudioElement>(null)

    const src = resolveBinding(element.src, state, t)
    const volume = element.volume ?? 1.0

    React.useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
            if (element.muted !== undefined) {
                audioRef.current.muted = element.muted
            }
        }
    }, [volume, element.muted])

    return (
        <audio
            ref={audioRef}
            src={src}
            autoPlay={element.autoplay}
            controls={element.controls ?? true}
            loop={element.loop}
            muted={element.muted}
            className={cn("w-full", element.styles?.className)}
            onPlay={() => runEventHandler(element.onPlay, { id: element.id })}
            onPause={() => runEventHandler(element.onPause, { id: element.id })}
            onEnded={() => runEventHandler(element.onEnded, { id: element.id })}
        >
            Your browser does not support the <code>audio</code> element.
        </audio>
    )
}
