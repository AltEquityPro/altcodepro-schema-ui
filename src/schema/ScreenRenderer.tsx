"use client";

import React, { useMemo } from "react";
import type { UIScreenDef, UIDefinition, AnyObj } from "./types-bridges";
import ElementResolver from "./ElementResolver";
import { useI18n } from "../lib/i18n";
import { useDataSources } from "./Datasource";
import { useAppState } from "./StateContext";
import { Toaster, toast } from "../components/ui/sonner";
import { ActionRuntime } from "./actions";
import { useActionHandler } from "./useActionHandler";
import { TooltipProvider } from "../components/ui/tooltip";//delayDuration={element.delayDuration ?? 0}
import { SidebarProvider } from "../components/ui/sidebar";

export function ScreenRenderer({
    screen, definition, locale = "en", runtime
}: {
    screen: UIScreenDef;
    definition: UIDefinition;
    locale?: string;
    runtime?: Partial<ActionRuntime>;
}) {
    const t = useI18n(definition.translations || {}, locale);
    const [state, setState] = useSchemaState(definition.initialData || {});

    const data = useDataSources({ dataSources: screen.dataSources, state, t });

    const ctx = useMemo(() => ({
        state, setState,
        t,
        data,
        runtime: {
            toast: (message, variant) => {
                if (!message) return;
                if (variant === "error") toast.error(message);
                else if (variant === "success") toast.success(message);
                else toast(message);
            },
            navigate: runtime?.navigate,
            openModal: runtime?.openModal,
            closeModal: runtime?.closeModal,
            exportFile: runtime?.exportFile,
            runScript: runtime?.runScript,
            setState: (p, v) => setState(p, v),
        } as ActionRuntime
    }), [state, setState, data, runtime, t]);

    // lifecycle
    React.useEffect(() => {
        if (screen.lifecycle?.onEnter) runEventHandler({ handler: screen.lifecycle.onEnter, state, t, data, runtime: ctx.runtime });
        return () => {
            if (screen.lifecycle?.onLeave) runEventHandler({ handler: screen.lifecycle.onLeave, state, t, data, runtime: ctx.runtime });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screen.id]);

    return (
        <div className="mx-auto w-full max-w-7xl p-4">
            {screen.elements?.map(el => <ElementResolver key={el.id} el={el} ctx={ctx} />)}
            <Toaster richColors position="top-right" />
        </div>
    );
}
