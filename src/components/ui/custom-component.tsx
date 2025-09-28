"use client";
import { resolveBinding } from '../../lib/utils';
import { RenderChildren } from '../../schema/RenderChildren';
import { AnyObj, CustomElement } from '../../types';
import wrapWithMotion from './wrapWithMotion';

export default function CustomComponentRender({ element, runtime, state, t }: {
    element: CustomElement, runtime: any, state: AnyObj,
    t: (key: string) => string
}) {

    const componentNames = Array.isArray(element.component)
        ? element.component
        : [element.component];

    const resolvedProps =
        element.props && typeof element.props === "object"
            ? resolveBinding(element.props, state, t)
            : {};

    const children = componentNames.map((name: any, idx: any) => {
        const Comp =
            runtime?.elementComponents?.[name] ??
            (() => (
                <div
                    key={`${element.id}-${idx}`}
                    data-slot="element-fallback"
                    className="text-destructive text-sm p-2 border border-dashed rounded"
                >
                    ⚠️ element Component not found: <code>{name}</code>
                </div>
            ));

        return (
            <Comp
                key={`${element.id}-${idx}`}
                id={`${element.id}-${idx}`}
                {...resolvedProps}
                style={{
                    zIndex: element.zIndex,
                    ...(resolvedProps?.style || {}),
                }}
                aria-label={resolveBinding(element.accessibility?.ariaLabel, state, t)}
                aria-hidden={!element.visibility?.show}
            >
                {element.children && <RenderChildren children={element.children} />}
            </Comp>
        );
    });

    // Group handling
    if (element.groupLayout === "inline") {
        return wrapWithMotion(element, <div className="flex flex-row gap-2">{children}</div>);
    }

    if (element.groupLayout === "stack") {
        return wrapWithMotion(element, <div className="flex flex-col gap-2">{children}</div>);
    }

    return wrapWithMotion(element, <>{children}</>);
}
