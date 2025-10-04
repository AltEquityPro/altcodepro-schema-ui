"use client";

import {
    isVisible,
    getAccessibilityProps,
} from "../../lib/utils";
import { ContainerElement, AnyObj, ActionRuntime } from "../../types";
import { RenderChildren } from "../../schema/RenderChildren";
import clsx from "clsx";


/**
 * Renderer for ContainerElement
 */
export function ContainerRenderer({
    element,
    state = {},
    t = (s) => s,
    runtime

}: {
    element: ContainerElement;
    state?: AnyObj;
    runtime: ActionRuntime;
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
                <RenderChildren children={container.children} runtime={runtime} />
            )}
        </div>
    );
}
