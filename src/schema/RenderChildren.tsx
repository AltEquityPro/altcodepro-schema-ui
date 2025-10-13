"use client";

import * as React from "react";
import type { AnyObj, EventHandler, UIElement } from "../types";
import { ElementResolver } from "./ElementResolver";

/**
 * Safely renders nested UI elements within a parent element.
 * Ensures stable React keys and isolates event handling.
 */
export function RenderChildren({
    children,
    runEventHandler,
}: {
    children: UIElement[] | undefined;
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
                    key={child.id || `child-${idx}`}
                    element={child}
                    runEventHandler={runEventHandler}
                />
            ))}
        </>
    );
}
