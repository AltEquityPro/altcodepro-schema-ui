"use client";

import { Star, Heart } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface RatingInputProps {
    value: number;
    max?: number;
    onChange?: (val: number) => void;
    readonly?: boolean;
    allowHalf?: boolean;
    precision?: number; // default 1, can be 0.5, 0.25, etc.
    iconSet?: "star" | "heart" | "emoji" | "custom";
    icons?: string[]; // For emoji or custom set (Lucide icon names or emoji strings)
}

export function RatingInput({
    value,
    max = 5,
    onChange,
    readonly,
    allowHalf = true,
    precision = 1,
    iconSet = "star",
    icons,
}: RatingInputProps) {
    const step = allowHalf ? precision : 1;

    const handleClick = (val: number) => {
        if (readonly) return;
        onChange?.(val);
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLButtonElement>,
        val: number
    ) => {
        if (readonly) return;

        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange?.(val);
        }

        if (e.key === "ArrowRight") {
            e.preventDefault();
            const next = Math.min(max, roundToStep(value + step, step));
            onChange?.(next);
        }

        if (e.key === "ArrowLeft") {
            e.preventDefault();
            const prev = Math.max(0, roundToStep(value - step, step));
            onChange?.(prev);
        }
    };

    const renderIcon = (val: number, active: boolean, half?: boolean) => {
        const baseStyle = cn(
            "h-6 w-6 transition-colors",
            active ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
        );

        switch (iconSet) {
            case "heart":
                return <Heart className={baseStyle} />;
            case "emoji":
                return (
                    <span
                        className={cn(
                            "text-lg select-none",
                            active ? "opacity-100" : "opacity-40"
                        )}
                    >
                        {icons?.[val - 1] || "⭐"}
                    </span>
                );
            case "custom":
                return (
                    <span
                        className={cn(
                            "text-lg select-none",
                            active ? "opacity-100" : "opacity-40"
                        )}
                    >
                        {icons?.[val - 1] || "⬤"}
                    </span>
                );
            case "star":
            default:
                return (
                    <>
                        <Star className={baseStyle} />
                        {half && (
                            <span className="absolute inset-0 w-1/2 overflow-hidden">
                                <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                            </span>
                        )}
                    </>
                );
        }
    };

    return (
        <div
            className="flex gap-1"
            role="radiogroup"
            aria-label="Rating"
            aria-readonly={readonly}
        >
            {Array.from({ length: max }).map((_, i) => {
                const fullVal = i + 1;
                const halfVal = i + 0.5;

                const isFullActive = value >= fullVal;
                const isHalfActive = allowHalf && value >= halfVal && value < fullVal;

                return (
                    <div key={i} className="relative flex">
                        {/* Half rating button */}
                        {allowHalf && iconSet === "star" && (
                            <button
                                type="button"
                                disabled={readonly}
                                onClick={() => handleClick(halfVal)}
                                onKeyDown={(e) => handleKeyDown(e, halfVal)}
                                className="absolute left-0 w-1/2 h-full focus:outline-none focus:ring-2 focus:ring-primary"
                                aria-label={`Rate ${halfVal} out of ${max}`}
                                aria-checked={value === halfVal}
                                role="radio"
                            />
                        )}

                        {/* Full rating button */}
                        <button
                            type="button"
                            disabled={readonly}
                            onClick={() => handleClick(fullVal)}
                            onKeyDown={(e) => handleKeyDown(e, fullVal)}
                            className={cn(
                                "focus:outline-none transition-colors focus:ring-2 focus:ring-primary rounded w-full flex items-center justify-center",
                                readonly && "cursor-default opacity-70"
                            )}
                            aria-label={`Rate ${fullVal} out of ${max}`}
                            aria-checked={value === fullVal}
                            role="radio"
                        >
                            {renderIcon(fullVal, isFullActive || isHalfActive, isHalfActive)}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

/* ========== Utils ========== */
function roundToStep(value: number, step: number) {
    return Math.round(value / step) * step;
}
