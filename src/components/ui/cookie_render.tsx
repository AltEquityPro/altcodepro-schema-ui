"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { UIProject, AnyObj } from "../../types";
import { resolveBinding } from "../../lib/utils";
import { Button } from "./button";

export function CookieBannerRenderer({
    project,
    state,
    setState,
    t,
}: {
    project: UIProject;
    state: AnyObj;
    setState: (path: string, value: any) => void;
    t: (key: string) => string;
}) {
    const c = project.cookie_banner;
    if (!c) return null;

    const consentKey = c.persistKey || "consent.cookies";

    const [preferences, setPreferences] = useState<Record<string, boolean>>({});
    const [modalOpen, setModalOpen] = useState(false);

    // Check if user already accepted
    const hasConsent =
        typeof window !== "undefined" &&
        (localStorage.getItem(consentKey + "_status") === "accepted" ||
            localStorage.getItem(consentKey + "_status") === "customized");

    // Load preferences
    useEffect(() => {
        if (!c) return;
        try {
            const saved = localStorage.getItem(consentKey);
            if (saved) {
                setPreferences(JSON.parse(saved));
            } else {
                const defaults: Record<string, boolean> = {};
                c.options?.forEach((opt) => {
                    defaults[opt.id] = opt.defaultValue ?? !!opt.required;
                });
                setPreferences(defaults);
            }
        } catch (e) {
            console.warn("Cookie pref load error", e);
        }
    }, [c]);

    if (hasConsent) return null;

    /** Accept all cookies */
    const onAcceptAll = () => {
        const all: Record<string, boolean> = {};
        c.options?.forEach((opt) => (all[opt.id] = true));
        localStorage.setItem(consentKey, JSON.stringify(all));
        localStorage.setItem(consentKey + "_status", "accepted");
        window.location.reload();
    };

    /** Save custom preferences */
    const onSave = () => {
        localStorage.setItem(consentKey, JSON.stringify(preferences));
        localStorage.setItem(consentKey + "_status", "customized");
        setModalOpen(false);
        window.location.reload();
    };

    return (
        <>
            {/* ==============================  
                COOKIE BANNER 
            =============================== */}
            <div
                className={clsx(
                    "fixed left-0 right-0 z-50 pointer-events-none",
                    c.position === "bottom" ? "bottom-6" : "top-6"
                )}
            >
                <div
                    className={clsx(
                        "pointer-events-auto mx-auto max-w-5xl rounded-md shadow-md p-4 flex flex-col gap-3",
                        c.styles?.className || "bg-white text-black"
                    )}
                >
                    {c.description && (
                        <p className="text-sm text-muted-foreground">
                            {resolveBinding(c.description, state, t)}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-3">
                        {/* Manage Preferences */}
                        {c.manageButton && (
                            <Button
                                variant={
                                    c.manageButton.variant || "secondary"
                                }
                                onClick={() => setModalOpen(true)}
                            >
                                {resolveBinding(
                                    c.manageButton.text ||
                                    { binding: "cookie.manage" },
                                    state,
                                    t
                                )}
                            </Button>
                        )}

                        {/* Accept All */}
                        {c.acceptButton && (
                            <Button
                                variant={c.acceptButton.variant || "primary"}
                                onClick={onAcceptAll}
                            >
                                {resolveBinding(
                                    c.acceptButton.text ||
                                    { binding: "cookie.accept_all" },
                                    state,
                                    t
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* ==============================  
                PREFERENCES MODAL  
            =============================== */}
            {modalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-lg w-full p-6 shadow-xl relative">
                        {/* Close Button */}
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-black"
                            onClick={() => setModalOpen(false)}
                        >
                            ✕
                        </button>

                        {/* Title */}
                        <h2 className="text-xl font-semibold mb-4">
                            {resolveBinding(
                                c.preferencesModal?.title ||
                                { binding: "cookie.preferences" },
                                state,
                                t
                            )}
                        </h2>

                        {/* OPTIONS */}
                        <div className="space-y-4">
                            {c.options?.map((opt) => (
                                <div
                                    key={opt.id}
                                    className="flex items-start gap-3 p-3 border rounded-lg"
                                >
                                    <input
                                        type="checkbox"
                                        className="mt-1"
                                        checked={preferences[opt.id]}
                                        disabled={opt.required}
                                        onChange={(e) =>
                                            setPreferences((prev) => ({
                                                ...prev,
                                                [opt.id]: opt.required
                                                    ? true
                                                    : e.target.checked,
                                            }))
                                        }
                                    />

                                    <div>
                                        <div className="font-medium">
                                            {resolveBinding(
                                                opt.label,
                                                state,
                                                t
                                            )}
                                        </div>

                                        {opt.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {resolveBinding(
                                                    opt.description,
                                                    state,
                                                    t
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* SAVE BUTTON */}
                        <div className="mt-6 flex justify-end">
                            <Button
                                variant={
                                    c.saveButton?.variant || "primary"
                                }
                                onClick={onSave}
                            >
                                {resolveBinding(
                                    c.saveButton?.text || {
                                        binding: "cookie.save",
                                    },
                                    state,
                                    t
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
