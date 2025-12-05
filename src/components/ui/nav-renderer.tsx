"use client";

import { UIProject, AnyObj, NavigationMenu, EventHandler } from "../../types";
import { NavigationMenuRenderer } from "./navigation-menu";

interface NavRendererProps {
    project: UIProject;
    state: AnyObj;
    t: (key: string, defaultLabel?: string) => string;
    runEventHandler: ((handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>);
    setState: (path: string, value: any) => void;
}

export function NavRenderer({ project, state, setState, t, runEventHandler }: NavRendererProps) {
    const nav = project.navigation;
    const brand = project.brand;
    if (!nav) return null;
    const renderMenu = (menu?: NavigationMenu) => {
        if (!menu) return null;
        if (menu.visibility && !menu.visibility.show) return null;

        return <NavigationMenuRenderer
            menu={menu}
            state={state}
            brand={brand}
            t={t}
            setState={setState}
            runEventHandler={runEventHandler}
        />

    };

    return (
        <>
            {renderMenu(nav.primary)}
            {renderMenu(nav.mobileBottom)}
            {renderMenu(nav.secondary)}
        </>
    );
}