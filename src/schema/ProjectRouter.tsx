"use client";

import React, { useMemo } from "react";
import type { UIProject, UIDefinition, IRoute } from "./types-bridges";
import { ScreenRenderer } from "./ScreenRenderer";

// Minimal in-app router adapter.
// In Next.js, pass current route + matching UIDefinition.
export function ProjectRouter({
    project,
    route,
    definition,
    locale = "en",
    navigate,
}: {
    project: UIProject;
    route: IRoute;                // the matched route (from your own router / Next route)
    definition: UIDefinition;     // loaded screen definition for this route
    locale?: string;
    navigate?: (href: string, replace?: boolean) => void;
}) {
    const screenId = route.screenId || definition.screens[0]?.id;
    const screen = useMemo(() => definition.screens.find(s => s.id === screenId) || definition.screens[0], [definition, screenId]);

    return (
        <ScreenRenderer
            screen={screen}
            definition={definition}
            locale={locale}
            runtime={{ navigate }}
        />
    );
}
