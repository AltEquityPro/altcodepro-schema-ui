"use client";
import { resolveBinding } from '../../lib/utils';
import { RenderChildren } from '../../schema/RenderChildren';
import { AnyObj, CustomElement, EventHandler } from '../../types';
import wrapWithClassName from './wrapWithClassName';

export default function CustomComponentRender({ element, runEventHandler, state, setState, t }: {
    element: CustomElement,
    runEventHandler?: ((handler?: EventHandler | undefined, dataOverride?: AnyObj | undefined) => Promise<void>),
    state: AnyObj,
    setState: (path: string, value: any) => void;
    t: (key: string) => string
}) {

    const componentNames = Array.isArray(element.component)
        ? element.component
        : [element.component];

    const resolvedProps =
        element.props && typeof element.props === "object"
            ? resolveBinding(element.props, state, t)
            : {};

    const children = componentNames?.map((name: any, idx: any) => {
        const Comp =
            element?.component?.[name] ??
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
                {element.children && <RenderChildren state={state} setState={setState} t={t} children={element.children} runEventHandler={runEventHandler} />}
            </Comp>
        );
    });

    // Group handling
    if (element.groupLayout === "inline") {
        return wrapWithClassName(element, <div className="flex flex-row gap-2">{children}</div>);
    }

    if (element.groupLayout === "stack") {
        return wrapWithClassName(element, <div className="flex flex-col gap-2">{children}</div>);
    }

    return wrapWithClassName(element, <>{children}</>);
}
