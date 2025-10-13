"use client";
import type { AnyObj, EventHandler, UIElement } from "../types";
import { ElementResolver } from "./ElementResolver";


export function RenderChildren({ children, runEventHandler }: { children: UIElement[]; runEventHandler?: ((handler?: EventHandler | undefined, dataOverride?: AnyObj | undefined) => Promise<void>) | undefined }) {
    return (
        <>
            {children?.map((child) => (
                <ElementResolver key={child.id} element={child} runEventHandler={runEventHandler} />
            ))}
        </>
    );
}
