"use client";

import React, { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "./button";
import { cn } from "@/src/lib/utils";
import { AnyObj, SignaturePadElement, EventHandler } from "@/src/types";
import { useAppState } from "@/src/schema/StateContext";

interface SignaturePadRendererProps {
    element: SignaturePadElement;
    runEventHandler: (
        handler?: EventHandler,
        dataOverride?: AnyObj
    ) => Promise<void>;
}

export function SignaturePadRenderer({
    element,
    runEventHandler,
}: SignaturePadRendererProps) {
    const { state, t } = useAppState();
    const sigRef = useRef<SignatureCanvas | null>(null);

    // ---- Config from schema ----
    const exportType = element.exportType || "png";
    const strokeColor = element.strokeColor || "#000";
    const backgroundColor = element.backgroundColor || "transparent";
    const minWidth = element.minWidth ?? 0.5;
    const maxWidth = element.maxWidth ?? 2.5;
    const velocityFilterWeight = element.velocityFilterWeight ?? 0.7;
    const readOnly = element.readOnly ?? false;

    const multiSignatures = element.multiSignatures ?? false;
    const participants: AnyObj[] = element.participantsDataSourceId
        ? state[element.participantsDataSourceId] || []
        : [];

    const [activeParticipant, setActiveParticipant] = useState<string | null>(
        element.initialParticipantId ||
        (participants.length > 0 ? participants[0].id : null)
    );

    const [signatures, setSignatures] = useState<Record<string, string>>({});
    const [autosaveTimer, setAutosaveTimer] = useState<NodeJS.Timeout | null>(
        null
    );

    // ---- Helpers ----
    const exportSignature = (): string | null => {
        if (!sigRef.current) return null;
        try {
            if (exportType === "svg")
                return sigRef.current.toDataURL("image/svg+xml");
            if (exportType === "jpeg")
                return sigRef.current.toDataURL("image/jpeg", element.exportQuality ?? 0.95);
            return sigRef.current.toDataURL("image/png");
        } catch (e) {
            console.error("Export error", e);
            return null;
        }
    };

    const saveSignature = async (trigger: "change" | "save") => {
        const dataUrl = exportSignature();
        if (!dataUrl) return;

        const key = multiSignatures && activeParticipant ? activeParticipant : "default";
        setSignatures((prev) => ({ ...prev, [key]: dataUrl }));

        const handler = trigger === "save" ? element.onSave : element.onChange;
        await runEventHandler(handler, {
            id: element.id,
            participantId: activeParticipant,
            signature: dataUrl,
        });
    };

    const clearSignature = async () => {
        sigRef.current?.clear();
        if (multiSignatures && activeParticipant) {
            setSignatures((prev) => {
                const next = { ...prev };
                delete next[activeParticipant];
                return next;
            });
        } else {
            setSignatures((prev) => {
                const next = { ...prev };
                delete next.default;
                return next;
            });
        }
        await runEventHandler(element.onClear, { id: element.id });
    };

    const undoSignature = async () => {
        const data = sigRef.current?.toData();
        if (!data?.length) return;
        data.pop();
        sigRef.current?.fromData(data);
        await runEventHandler(element.onUndo, { id: element.id });
    };

    // ---- Auto-save with debounce ----
    const handleChange = () => {
        if (element.autosave) {
            if (autosaveTimer) clearTimeout(autosaveTimer);
            const timer = setTimeout(
                () => saveSignature("change"),
                element.autosaveDebounceMs ?? 500
            );
            setAutosaveTimer(timer);
        }
    };

    useEffect(() => {
        return () => {
            if (autosaveTimer) clearTimeout(autosaveTimer);
        };
    }, [autosaveTimer]);

    // ---- UI ----
    return (
        <div
            className={cn(
                "flex flex-col gap-2 border rounded-md p-2 bg-background",
                element.styles?.className
            )}
        >
            {/* Participants */}
            {multiSignatures && participants.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                    {participants.map((p) => (
                        <Button
                            key={p.id}
                            size="sm"
                            variant={p.id === activeParticipant ? "default" : "outline"}
                            onClick={() => {
                                setActiveParticipant(p.id);
                                runEventHandler(element.onParticipantChange, {
                                    id: element.id,
                                    participantId: p.id,
                                });
                            }}
                        >
                            {p.label || p.id}
                        </Button>
                    ))}
                </div>
            )}

            {/* Canvas */}
            <SignatureCanvas
                ref={sigRef}
                penColor={strokeColor}
                backgroundColor={backgroundColor}
                minWidth={minWidth}
                maxWidth={maxWidth}
                velocityFilterWeight={velocityFilterWeight}
                canvasProps={{
                    className: cn(
                        "border rounded-md w-full h-48 cursor-crosshair bg-white"
                    ),
                    "aria-label": t("signature_pad") || "Signature Pad",
                }}
                onEnd={handleChange}
            />

            {/* Controls */}
            <div className="flex gap-2 mt-2">
                {element.clearButton && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={clearSignature}
                        disabled={readOnly}
                    >
                        {t("clear") || "Clear"}
                    </Button>
                )}
                {element.undoButton && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={undoSignature}
                        disabled={readOnly}
                    >
                        {t("undo") || "Undo"}
                    </Button>
                )}
                {element.saveButton && (
                    <Button
                        size="sm"
                        variant="default"
                        onClick={() => saveSignature("save")}
                        disabled={readOnly}
                    >
                        {t("save") || "Save"}
                    </Button>
                )}
            </div>

            {/* Preview */}
            {element.preview &&
                (multiSignatures
                    ? Object.entries(signatures)
                    : [["default", signatures.default]]
                ).map(([pid, sig]) =>
                    sig ? (
                        <div key={pid} className="mt-2">
                            <div className="text-xs text-muted-foreground mb-1">
                                {multiSignatures
                                    ? `${pid} ${t("preview") || "preview"}:`
                                    : t("preview") || "Preview:"}
                            </div>
                            <img
                                src={sig}
                                alt={t("signature_preview") || "Signature Preview"}
                                className="border rounded-md max-h-32"
                            />
                        </div>
                    ) : null
                )}
        </div>
    );
}
