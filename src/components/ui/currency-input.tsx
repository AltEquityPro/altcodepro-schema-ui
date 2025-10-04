"use client";
import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * CurrencyInput
 * - Pure React + Intl.NumberFormat (no external libs)
 * - Locale-aware formatting/parsing
 * - Emits number | undefined to parent
 * - Preserves caret position while typing
 * - Tailwind/shadcn Input look
 */
export type CurrencyInputProps = Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type" | "inputMode"
> & {
    value?: number | null;
    onChange?: (value: number | undefined) => void;
    locale?: string;          // e.g. "en-US" | "de-DE", defaults to browser
    currency?: string;        // e.g. "USD" | "EUR" — if provided, shows symbol
    minFractionDigits?: number; // default 2
    maxFractionDigits?: number; // default 2
    allowNegative?: boolean;    // default false
};

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    (
        {
            className,
            value,
            onChange,
            locale,
            currency,
            minFractionDigits = 2,
            maxFractionDigits = 2,
            allowNegative = false,
            placeholder,
            ...rest
        },
        ref
    ) => {
        const resolvedLocale =
            locale ||
            (typeof navigator !== "undefined" ? navigator.language : "en-US");

        // Build formatter
        const formatter = React.useMemo(() => {
            return new Intl.NumberFormat(resolvedLocale, {
                style: currency ? "currency" : "decimal",
                currency: currency || undefined,
                minimumFractionDigits: minFractionDigits,
                maximumFractionDigits: maxFractionDigits,
            });
        }, [resolvedLocale, currency, minFractionDigits, maxFractionDigits]);

        // Extract locale parts (decimal & group separator)
        const parts = React.useMemo(() => {
            const sample = formatter.format(1234567.89);
            const p = (Intl as any).NumberFormat.prototype.formatToParts
                ? formatter.formatToParts(1234567.89)
                : null;

            let decimal = ".";
            let group = ",";
            let minus = "-";
            let currencySymbol = "";

            if (p && Array.isArray(p)) {
                for (const part of p) {
                    if (part.type === "decimal") decimal = part.value;
                    if (part.type === "group") group = part.value;
                    if (part.type === "minusSign") minus = part.value;
                    if (part.type === "currency") currencySymbol = part.value;
                }
            } else {
                // Fallback guess from sample string
                // Find non-digits — last one is likely decimal
                const nonDigits = sample.replace(/\d/g, "");
                const last = nonDigits.slice(-1);
                if (last) decimal = last;
                group = nonDigits.replace(new RegExp(`[${escapeRegex(decimal)}]$`), "").slice(-1) || group;
            }

            return { decimal, group, minus, currencySymbol };
        }, [formatter]);

        const [display, setDisplay] = React.useState<string>("");

        // Keep internal display in sync with numeric value prop
        React.useEffect(() => {
            if (value === null || value === undefined || Number.isNaN(value)) {
                setDisplay("");
            } else {
                setDisplay(formatter.format(value));
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [value, formatter]);

        // Helpers
        function escapeRegex(s: string) {
            return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }

        function toDigitsOnly(s: string) {
            return s.replace(/\D/g, "");
        }

        function parseLocalized(input: string): number | undefined {
            if (!input) return undefined;

            // Normalize: remove currency symbols & spaces
            let raw = input
                .replace(new RegExp(escapeRegex(parts.currencySymbol), "g"), "")
                .replace(/\s/g, "");

            // Handle negative
            let isNegative = false;
            if (raw.includes(parts.minus)) {
                isNegative = true;
                raw = raw.replace(new RegExp(escapeRegex(parts.minus), "g"), "");
            }

            // Remove group separators, unify decimal to '.'
            if (parts.group) {
                raw = raw.replace(new RegExp(escapeRegex(parts.group), "g"), "");
            }
            if (parts.decimal && parts.decimal !== ".") {
                raw = raw.replace(new RegExp(escapeRegex(parts.decimal), "g"), ".");
            }

            // Keep only one decimal point (first)
            const firstDot = raw.indexOf(".");
            if (firstDot !== -1) {
                raw =
                    raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, "");
            }

            // Strip anything not digit or dot
            raw = raw.replace(/[^0-9.]/g, "");

            if (!raw) return undefined;

            let num = Number(raw);
            if (Number.isNaN(num)) return undefined;
            if (!allowNegative && num < 0) num = Math.abs(num);
            if (allowNegative && isNegative) num = -num;

            // Limit fraction digits
            if (maxFractionDigits >= 0) {
                const factor = Math.pow(10, maxFractionDigits);
                num = Math.round(num * factor) / factor;
            }

            return num;
        }

        // Caret preservation by tracking count of digits left of caret pre/post format
        function countDigitsLeftOfCaret(val: string, caret: number) {
            let count = 0;
            for (let i = 0; i < Math.min(caret, val.length); i++) {
                if (/\d/.test(val[i])) count++;
            }
            return count;
        }

        function findCaretFromDigitsCount(val: string, targetDigitsLeft: number) {
            if (targetDigitsLeft <= 0) return 0;
            let count = 0;
            for (let i = 0; i < val.length; i++) {
                if (/\d/.test(val[i])) {
                    count++;
                    if (count === targetDigitsLeft) return i + 1;
                }
            }
            return val.length;
        }

        const inputRef = React.useRef<HTMLInputElement>(null);
        React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

        function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
            const el = e.target;
            const prevDisplay = el.value;
            const prevCaret = el.selectionStart ?? prevDisplay.length;
            const prevDigitsLeft = countDigitsLeftOfCaret(prevDisplay, prevCaret);

            const numeric = parseLocalized(prevDisplay);
            const nextDisplay = numeric === undefined && prevDisplay.trim() === ""
                ? ""
                : numeric === undefined
                    ? prevDisplay // let user continue typing invalid intermediate states; don't jump too hard
                    : formatter.format(numeric);

            setDisplay(nextDisplay);

            // emit number or undefined
            onChange?.(numeric);

            // restore caret based on digits-left count
            requestAnimationFrame(() => {
                const el2 = inputRef.current;
                if (!el2) return;
                const nextCaret = findCaretFromDigitsCount(nextDisplay, prevDigitsLeft);
                el2.setSelectionRange(nextCaret, nextCaret);
            });
        }

        function handleBlur() {
            // On blur, snap/normalize formatting strictly
            const numeric = parseLocalized(display);
            const finalDisplay =
                numeric === undefined ? "" : formatter.format(numeric);
            setDisplay(finalDisplay);
            onChange?.(numeric);
        }

        return (
            <input
                ref={inputRef}
                inputMode="decimal"
                // pattern allows digits, localized decimal separator, minus, and spaces
                pattern={`[0-9${escapeRegex(parts.decimal)}${allowNegative ? escapeRegex(parts.minus) : ""} ]*`}
                placeholder={placeholder}
                value={display}
                onChange={handleChange}
                onBlur={handleBlur}
                className={cn(
                    "border-input flex h-10 w-full rounded-md border bg-background text-foreground px-3 py-2",
                    "text-sm shadow-sm placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...rest}
            />
        );
    }
);

CurrencyInput.displayName = "CurrencyInput";
