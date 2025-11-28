"use client";
import React, { } from "react";

import { UIElement } from "../../types";
import {
    classesFromStyleProps,
    getAccessibilityProps,
} from "../../lib/utils";

const wrapWithClassName = (element: UIElement, children: React.ReactNode) => {
    const accessibilityProps = getAccessibilityProps(element.accessibility);

    let className = classesFromStyleProps(element.styles);
    return (
        <div
            className={className}
            {...accessibilityProps}
        >
            {children}
        </div>
    );
}

export default wrapWithClassName;
