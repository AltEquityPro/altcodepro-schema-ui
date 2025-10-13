"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { cn, resolveBinding, classesFromStyleProps } from "../../lib/utils";
import { QRReaderElement } from "../../types";

export function QRCodeRenderer({
    element,
    state,
    t,
    runEventHandler,
}: {
    element: QRReaderElement;
    state: Record<string, any>;
    t: (k: string) => string;
    runEventHandler?: (h?: any, d?: any) => Promise<void>;
}) {
    const value = resolveBinding(element.value, state, t);
    const [scanned, setScanned] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (element.mode !== "scan" || !videoRef.current) return;

        const codeReader = new BrowserQRCodeReader();
        let stop = false;

        codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
            if (stop) return;
            if (result) {
                setScanned(result.getText());
                if (element.onScan) runEventHandler?.(element.onScan, { value: result.getText() });
                stop = true;
            }
        });

        return () => {
            stop = true;
        };
    }, [element.mode, runEventHandler, element.onScan]);

    if (element.mode === "scan") {
        return (
            <div
                className={cn(
                    "flex flex-col items-center justify-center gap-2",
                    classesFromStyleProps(element.styles)
                )}
            >
                <video ref={videoRef} className="rounded border" width={element.size ?? 240} height={element.size ?? 240} />
                {scanned && (
                    <div className="text-sm break-all">
                        {t("Scanned:")} {scanned}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={classesFromStyleProps(element.styles)}>
            <QRCodeSVG value={String(value || "")} size={element.size ?? 128} />
        </div>
    );
}
