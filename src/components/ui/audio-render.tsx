"use client";

import * as React from "react";
import {
    cn,
    resolveBinding,
    classesFromStyleProps,
    getAccessibilityProps,
    resolveAnimation,
} from "../../lib/utils";
import { AnyObj, AudioElement, EventHandler } from "../../types";

interface AudioRendererProps {
    element: AudioElement;
    state: AnyObj;
    t: (key: string) => string;
    runEventHandler: (
        handler?: EventHandler,
        dataOverride?: AnyObj
    ) => Promise<void>;
}

/**
 * Schema-driven Audio renderer
 */
export function AudioRenderer({
    element,
    state,
    t,
    runEventHandler,
}: AudioRendererProps) {
    const audioRef = React.useRef<HTMLAudioElement>(null);

    // Resolve schema bindings
    const src = resolveBinding(element.src, state, t);
    const volume = element.volume ?? 1.0;

    // Apply volume & mute state
    React.useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            if (element.muted !== undefined) {
                audioRef.current.muted = element.muted;
            }
        }
    }, [volume, element.muted]);

    // Schema-driven styles & accessibility
    const className = classesFromStyleProps(element.styles);
    const acc = getAccessibilityProps(element.accessibility);

    // Schema-driven animations
    const anim = resolveAnimation(element.animations);

    // Animate.css / CSS
    if (
        element.animations?.framework === "animate.css" ||
        element.animations?.framework === "css"
    ) {
        return (
            <audio
                ref={audioRef}
                src={src}
                autoPlay={element.autoplay}
                controls={element.controls ?? true}
                loop={element.loop}
                muted={element.muted}
                className={cn("w-full", className, (anim as any)?.className)}
                style={(anim as any)?.style}
                onPlay={() => runEventHandler(element.onPlay, { id: element.id })}
                onPause={() => runEventHandler(element.onPause, { id: element.id })}
                onEnded={() => runEventHandler(element.onEnded, { id: element.id })}
                {...acc}
            >
                Your browser does not support the <code>audio</code> element.
            </audio>
        );
    }

    // Framer Motion
    if (element.animations?.framework === "framer-motion") {
        const { motion } = require("framer-motion");
        const motionProps = anim as any;
        const MotionAudio = motion("audio");
        return (
            <MotionAudio
                ref={audioRef}
                src={src}
                autoPlay={element.autoplay}
                controls={element.controls ?? true}
                loop={element.loop}
                muted={element.muted}
                className={cn("w-full", className)}
                onPlay={() => runEventHandler(element.onPlay, { id: element.id })}
                onPause={() => runEventHandler(element.onPause, { id: element.id })}
                onEnded={() => runEventHandler(element.onEnded, { id: element.id })}
                {...motionProps}
                {...acc}
            >
                Your browser does not support the <code>audio</code> element.
            </MotionAudio>
        );
    }

    // GSAP
    if (element.animations?.framework === "gsap") {
        const ref = React.useRef<HTMLAudioElement>(null);
        React.useEffect(() => {
            const cfg = (anim as any)?.gsap;
            if (!ref.current || !cfg) return;
            import("gsap").then(({ default: gsap }) => {
                if (cfg.from && cfg.to) gsap.fromTo(ref.current, cfg.from, cfg);
                else gsap.to(ref.current, cfg);
            });
        }, [anim]);
        return (
            <audio
                ref={ref}
                src={src}
                autoPlay={element.autoplay}
                controls={element.controls ?? true}
                loop={element.loop}
                muted={element.muted}
                className={cn("w-full", className, (anim as any)?.className)}
                style={(anim as any)?.style}
                onPlay={() => runEventHandler(element.onPlay, { id: element.id })}
                onPause={() => runEventHandler(element.onPause, { id: element.id })}
                onEnded={() => runEventHandler(element.onEnded, { id: element.id })}
                {...acc}
            >
                Your browser does not support the <code>audio</code> element.
            </audio>
        );
    }

    // Default (no animations)
    return (
        <audio
            ref={audioRef}
            src={src}
            autoPlay={element.autoplay}
            controls={element.controls ?? true}
            loop={element.loop}
            muted={element.muted}
            className={cn("w-full", className)}
            onPlay={() => runEventHandler(element.onPlay, { id: element.id })}
            onPause={() => runEventHandler(element.onPause, { id: element.id })}
            onEnded={() => runEventHandler(element.onEnded, { id: element.id })}
            {...acc}
        >
            Your browser does not support the <code>audio</code> element.
        </audio>
    );
}
