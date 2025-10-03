"use client";
import React from "react";
import type { ActionRuntime, UIElement } from "../types";
import { ElementResolver } from "./ElementResolver";


export function RenderChildren({ children, runtime }: { children: UIElement[]; runtime: ActionRuntime; }) {
    return (
        <>
            {children?.map((child) => (
                <ElementResolver key={child.id} element={child} runtime={runtime} />
            ))}
        </>
    );
}
