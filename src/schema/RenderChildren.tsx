"use client";

import type { AnyObj, EventHandler, UIElement } from "../types";
import { ElementResolver } from "./ElementResolver";

/**
 * Safely renders nested UI elements within a parent element.
 * Ensures stable React keys and isolates event handling.
 */
export function RenderChildren({
    children,
    t,
    state,
    setState,
    runEventHandler,
}: {
    children: UIElement[] | undefined;
    t: (key: string, defaultLabel?: string) => string;
    state: AnyObj;
    setState: (path: string, value: any) => void;
    runEventHandler?: (
        handler?: EventHandler,
        dataOverride?: AnyObj
    ) => Promise<void>;
}) {
    if (!Array.isArray(children) || children.length === 0) return null;

    return (
        <>
            {children.map((child, idx) => (
                <ElementResolver
                    key={`child-${child?.id || 'chat'}-${idx}`}
                    element={child}
                    t={t}
                    state={state}
                    setState={setState}
                    runEventHandler={runEventHandler}
                />
            ))}
        </>
    );
}
