"use client";

import * as React from "react";
import { Undo } from "lucide-react";

interface SignatureInputProps {
    value?: string;
    onChange: (dataUrl: string) => void;
}

export function SignatureInput({ value, onChange }: SignatureInputProps) {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let drawing = false;

        const start = (e: MouseEvent) => {
            drawing = true;
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
        };
        const move = (e: MouseEvent) => {
            if (!drawing) return;
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        };
        const end = () => {
            if (!drawing) return;
            drawing = false;
            onChange(canvas.toDataURL("image/png"));
        };

        canvas.addEventListener("mousedown", start);
        canvas.addEventListener("mousemove", move);
        canvas.addEventListener("mouseup", end);
        canvas.addEventListener("mouseleave", end);

        return () => {
            canvas.removeEventListener("mousedown", start);
            canvas.removeEventListener("mousemove", move);
            canvas.removeEventListener("mouseup", end);
            canvas.removeEventListener("mouseleave", end);
        };
    }, [onChange]);

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onChange("");
    };

    return (
        <div className="space-y-2">
            <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className="border rounded bg-white w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{value ? "Signature captured" : "Please sign above"}</span>
                <button
                    type="button"
                    className="flex items-center gap-1 text-muted-foreground hover:text-red-500"
                    onClick={clear}
                >
                    <Undo className="h-4 w-4" /> Clear
                </button>
            </div>
        </div>
    );
}
