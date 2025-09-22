"use client";

import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface RatingInputProps {
    value: number;
    max?: number;
    onChange: (val: number) => void;
}

export function RatingInput({ value, max = 5, onChange }: RatingInputProps) {
    return (
        <div className="flex gap-1">
            {Array.from({ length: max }).map((_, i) => {
                const val = i + 1;
                return (
                    <button
                        key={val}
                        type="button"
                        onClick={() => onChange(val)}
                        className="focus:outline-none"
                    >
                        <Star
                            className={cn(
                                "h-6 w-6 transition-colors",
                                val <= value ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}
