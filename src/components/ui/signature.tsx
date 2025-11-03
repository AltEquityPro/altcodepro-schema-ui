"use client";

import React, { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { jsPDF } from "jspdf"; // for PDF export
import { Button } from "./button";
import { cn } from "../../lib/utils";
import { AnyObj, SignaturePadElement, EventHandler } from "../../types";

interface SignaturePadRendererProps {
    element: SignaturePadElement;
    state: AnyObj
    t: (key: string) => string
    runEventHandler?: (
        handler?: EventHandler,
        dataOverride?: AnyObj
    ) => Promise<void>;
}

export function SignaturePadRenderer({
    element,
    runEventHandler,
    state,
    t
}: SignaturePadRendererProps) {

    const sigRef = useRef<SignatureCanvas | null>(null);

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

    /* ====== Persistence: hydrate & resume ====== */
    useEffect(() => {
        if (!element.signatureDataSourceId) return;
        const stored = state[element.signatureDataSourceId];
        if (!stored) return;

        if (multiSignatures && typeof stored === "object") {
            setSignatures(stored);
            if (element.resumeFromSaved && sigRef.current && activeParticipant) {
                const sig = stored[activeParticipant];
                if (sig) sigRef.current.fromDataURL(sig);
            }
        } else if (typeof stored === "string") {
            setSignatures({ default: stored });
            if (element.resumeFromSaved && sigRef.current) {
                sigRef.current.fromDataURL(stored);
            }
        }
    }, [
        state,
        element.signatureDataSourceId,
        element.resumeFromSaved,
        multiSignatures,
        activeParticipant,
    ]);

    /* ====== Helpers ====== */
    const exportSignature = (): string | null => {
        if (!sigRef.current) return null;
        try {
            if (exportType === "svg")
                return sigRef.current.toDataURL("image/svg+xml");
            if (exportType === "jpeg")
                return sigRef.current.toDataURL(
                    "image/jpeg",
                    element.exportQuality ?? 0.95
                );
            return sigRef.current.toDataURL("image/png");
        } catch (e) {
            console.error("Export error", e);
            return null;
        }
    };

    const saveSignature = async (trigger: "change" | "save") => {
        const dataUrl = exportSignature();
        if (!dataUrl) return;

        const key =
            multiSignatures && activeParticipant ? activeParticipant : "default";
        const updated = { ...signatures, [key]: dataUrl };
        setSignatures(updated);

        if (element.signatureDataSourceId) {
            state[element.signatureDataSourceId] = multiSignatures ? updated : dataUrl;
        }

        const handler = trigger === "save" ? element.onSave : element.onChange;
        await runEventHandler?.(handler, {
            id: element.id,
            participantId: activeParticipant,
            signature: dataUrl,
        });
    };

    const clearSignature = async () => {
        sigRef.current?.clear();
        const key =
            multiSignatures && activeParticipant ? activeParticipant : "default";
        const updated = { ...signatures };
        delete updated[key];
        setSignatures(updated);

        if (element.signatureDataSourceId) {
            state[element.signatureDataSourceId] = multiSignatures ? updated : "";
        }

        await runEventHandler?.(element.onClear, { id: element.id });
    };

    const undoSignature = async () => {
        const data = sigRef.current?.toData();
        if (!data?.length) return;
        data.pop();
        sigRef.current?.fromData(data);
        await runEventHandler?.(element.onUndo, { id: element.id });
    };

    /* ====== Auto-save ====== */
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

    /* ====== Bulk export ====== */
    const bulkExport = async () => {
        if (!multiSignatures) {
            const sig = signatures.default;
            if (!sig) return;
            await runEventHandler?.(element.onExport, {
                id: element.id,
                signatures,
                format: "json",
            });
            downloadJSON(signatures, "signatures.json");
            return;
        }

        // JSON export
        downloadJSON(signatures, "signatures.json");

        // PDF export
        const pdf = new jsPDF();
        Object.entries(signatures).forEach(([pid, sig], idx) => {
            if (idx > 0) pdf.addPage();
            pdf.setFontSize(12);
            pdf.text(`Signature: ${pid}`, 10, 10);
            if (sig) {
                pdf.addImage(sig, "PNG", 10, 20, 180, 60);
            }
        });
        pdf.save("signatures.pdf");

        await runEventHandler?.(element.onExport, {
            id: element.id,
            signatures,
            format: "pdf",
        });
    };

    /* ====== UI ====== */
    return (
        <div
            className={cn(
                "flex flex-col gap-2 border rounded-md p-2 bg-(--acp-background) dark:bg-(--acp-background-dark) text-(--acp-foreground) dark:text-(--acp-foreground-dark)",
                element.styles?.className
            )}
        >
            {/* Participants */}
            {multiSignatures && participants.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                    {participants?.map((p) => (
                        <Button
                            key={p.id}
                            size="sm"
                            variant={p.id === activeParticipant ? "default" : "outline"}
                            onClick={() => {
                                setActiveParticipant(p.id);
                                runEventHandler?.(element.onParticipantChange, {
                                    id: element.id,
                                    participantId: p.id,
                                });
                                if (
                                    element.resumeFromSaved &&
                                    sigRef.current &&
                                    signatures[p.id]
                                ) {
                                    sigRef.current.fromDataURL(signatures[p.id]);
                                } else {
                                    sigRef.current?.clear();
                                }
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
            <div className="flex gap-2 mt-2 flex-wrap">
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
                {element.exportButton && (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={bulkExport}
                        disabled={!Object.keys(signatures).length}
                    >
                        {t("export") || "Export All"}
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

/* ========== Utils ========== */
function downloadJSON(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
