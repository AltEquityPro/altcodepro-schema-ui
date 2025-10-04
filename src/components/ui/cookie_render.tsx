"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { UIProject, AnyObj, EventHandler, ElementType } from "../../types";
import { resolveBinding } from "../../lib/utils";
import { ElementResolver } from "../../schema/ElementResolver";
import { ModalRenderer } from "./dialog";
import { Button } from "./button";

export function CookieBannerRenderer({
    project,
    state,
    t,
}: {
    project: UIProject;
    state: AnyObj;
    t: (key: string) => string;
}) {
    const c = project.cookie_banner;
    const key = c?.persistKey || "consent.cookies";
    const [open, setOpen] = useState(false);
    const [preferences, setPreferences] = useState<Record<string, boolean>>({});
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!c) return;
        try {
            const v = localStorage.getItem(key);
            if (!v) {
                // initialize defaults
                const defaults: Record<string, boolean> = {};
                c.options?.forEach((opt) => {
                    defaults[opt.id] = opt.defaultValue ?? !!opt.required;
                });
                setPreferences(defaults);
            } else {
                setPreferences(JSON.parse(v));
            }
            setOpen(v !== "accepted" && v !== "customized");
        } catch {
            /* ignore */
        }
    }, [c, key]);

    if (!c || !open) return null;

    const onAcceptAll = () => {
        try {
            const allAccepted: Record<string, boolean> = {};
            c.options?.forEach((opt) => (allAccepted[opt.id] = true));
            localStorage.setItem(key, JSON.stringify(allAccepted));
        } catch { }
        setOpen(false);
    };

    const onSavePreferences = () => {
        try {
            localStorage.setItem(key, JSON.stringify(preferences));
            localStorage.setItem(key + "_status", "customized");
        } catch { }
        setOpen(false);
        setShowModal(false);
    };
    const localRunEventHandler = async (handler?: any, dataOverride?: AnyObj) => {
        if (!handler) return;
        if (handler.action === "update_state" && handler.params?.fn) {
            handler.params.fn(dataOverride?.pressed);
        }
        if (handler.action === "ui_close_modal") {
            setShowModal(false);
        }
        if (handler.action === "cookie_accept" && handler.params?.fn) {
            handler.params.fn();
        }
    };
    return (
        <>
            {/* Banner */}
            <div
                className={clsx(
                    "fixed left-0 right-0 z-50",
                    c.position === "bottom" ? "bottom-0" : "top-0"
                )}
            >
                <div
                    className={clsx(
                        "mx-auto max-w-5xl rounded-md shadow-md p-4 flex flex-col gap-3 bg-background text-foreground",
                        c.styles?.className
                    )}
                >
                    {c.description && (
                        <p className="text-sm">{resolveBinding(c.description, state, t)}</p>
                    )}
                    <div className="flex items-center justify-end gap-3">
                        {c.manageButton && (
                            <ElementResolver
                                element={{
                                    ...c.manageButton,
                                    onClick: {
                                        action: "ui_open_modal" as any,
                                        params: { fn: () => setShowModal(true) },
                                    },
                                }}
                                runtime={{}}
                            />
                        )}
                        {c.acceptButton && (
                            <Button onClick={onAcceptAll}>
                                {resolveBinding(c.acceptButton.text, state, t)}
                            </Button>

                        )}
                    </div>
                </div>
            </div>

            {/* Preferences Modal */}
            {c.preferencesModal && (
                <ModalRenderer
                    element={{
                        ...c.preferencesModal,
                        isOpen: showModal,
                        onClose: { action: "ui_close_modal" as any, params: { fn: () => setShowModal(false) } },
                        content: [
                            {
                                id: "cookie-options",
                                name: "Cookie Options",
                                type: ElementType.container,
                                layout: "flex",
                                gap: 3,
                                children: c.options?.map((opt) => ({
                                    id: opt.id,
                                    name: opt.label as string,
                                    type: "toggle",
                                    label: opt.label,
                                    pressed: preferences[opt.id],
                                    onToggle: {
                                        action: "update_state",
                                        params: {
                                            fn: (val: boolean) =>
                                                setPreferences((prev) => ({
                                                    ...prev,
                                                    [opt.id]: opt.required ? true : val,
                                                })),
                                        },
                                    },
                                })) as any,
                            },
                            ...(c.saveButton
                                ? [
                                    {
                                        ...c.saveButton,
                                        onClick: {
                                            action: "cookie_accept" as any,
                                            params: { fn: onSavePreferences },
                                        },
                                    },
                                ]
                                : []),
                        ],
                    }}
                    runEventHandler={localRunEventHandler}
                    runtime={{}}
                />
            )}
        </>
    );
}
