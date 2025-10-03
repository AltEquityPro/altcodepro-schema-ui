"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

import { UIElement } from "../../types";
import {
    classesFromStyleProps,
    getAccessibilityProps,
    resolveAnimation,
} from "../../lib/utils";

const wrapWithMotion = (element: UIElement, children: React.ReactNode) => {
    const animationProps = resolveAnimation(element.animations);
    const accessibilityProps = getAccessibilityProps(element.accessibility);

    let className = classesFromStyleProps(element.styles);
    let style: React.CSSProperties = (animationProps as any)?.style || {};

    /** ----------------------------
     * animate.css / css animations
     * ---------------------------- */
    if (
        element.animations?.framework === "animate.css" ||
        element.animations?.framework === "css"
    ) {
        className = [className, (animationProps as any).className]
            .filter(Boolean)
            .join(" ");
        style = { ...style, ...(animationProps as any).style };

        return (
            <div className={className} style={style} {...accessibilityProps}>
                {children}
            </div>
        );
    }

    /** ----------------------------
     * framer-motion animations
     * ---------------------------- */
    if (element.animations?.framework === "framer-motion") {
        return (
            <motion.div
                className={className}
                style={style}
                {...accessibilityProps}
                {...(animationProps as any)} // safe after normalization
            >
                {children}
            </motion.div>
        );
    }

    /** ----------------------------
     * GSAP animations
     * ---------------------------- */
    if (element.animations?.framework === "gsap") {
        const ref = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (!ref.current || !(animationProps as any).gsap) return;

            const cfg = (animationProps as any).gsap;
            gsap.fromTo(ref.current, cfg.from || {}, cfg.to || {});
        }, [animationProps]);

        return (
            <div
                ref={ref}
                className={className}
                style={style}
                {...accessibilityProps}
            >
                {children}
            </div>
        );
    }

    /** ----------------------------
     * Fallback (no animations)
     * ---------------------------- */
    return (
        <div className={className} style={style} {...accessibilityProps}>
            {children}
        </div>
    );
};

export default wrapWithMotion;
