"use client";

import {
    isVisible,
    getAccessibilityProps,
} from "../../lib/utils";
import { ContainerElement, AnyObj, EventHandler } from "../../types";
import { RenderChildren } from "../../schema/RenderChildren";
import clsx from "clsx";


/**
 * Renderer for ContainerElement
 */
export function ContainerRenderer({
    element,
    state = {},
    setState,
    t = (s) => s,
    runEventHandler
}: {
    element: ContainerElement;
    state?: AnyObj;
    setState: (path: string, value: any) => void;
    runEventHandler?: (handler?: EventHandler | undefined, dataOverride?: AnyObj | undefined) => Promise<void>;
    t?: (s: string) => string;
}) {
    const container = element;

    if (!isVisible(container.visibility, state, t)) return null;

    const accessibilityProps = getAccessibilityProps(
        container.accessibility,
        state,
        t
    );

    return (
        <div
            id={container.id}
            data-slot="container"
            className={clsx(container.styles?.className, container.styles?.responsiveClasses)}
            style={{
                zIndex: container.zIndex,
            }}
            {...accessibilityProps}
        >
            {container.children && (
                <RenderChildren state={state} setState={setState} t={t} children={container.children} runEventHandler={runEventHandler} />
            )}
        </div>
    );
}
