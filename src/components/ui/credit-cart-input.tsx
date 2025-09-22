"use client";

import { CreditCard } from "lucide-react";
import { Input } from "@/src/components/ui/input";

interface CreditCardInputProps {
    value: string;
    onChange: (val: string) => void;
}

export function CreditCardInput({ value, onChange }: CreditCardInputProps) {
    const formatCardNumber = (val: string) => {
        return val
            .replace(/\D/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
    };

    return (
        <div className="relative">
            <CreditCard className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                inputMode="numeric"
                placeholder="•••• •••• •••• ••••"
                className="pl-8"
                maxLength={19 + 3}
                value={value ?? ""}
                onChange={(e) => onChange(formatCardNumber(e.target.value))}
            />
        </div>
    );
}
