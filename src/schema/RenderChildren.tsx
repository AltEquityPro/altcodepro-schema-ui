"use client";
import React from "react";
import type { UIElement } from "../types";
import { ElementResolver } from "./ElementResolver";


export function RenderChildren({ children }: { children: UIElement[]; }) {
    return (
        <>
            {children?.map((child) => (
                <ElementResolver key={child.id} element={child} />
            ))}
        </>
    );
}
