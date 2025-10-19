"use client";

import * as React from "react";
import { XIcon, ChevronDownIcon, CheckIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";

export type MultiSelectOption = { label: string; value: string };

interface MultiselectProps {
    options: MultiSelectOption[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function Multiselect({
    options,
    value,
    onChange,
    placeholder = "Select",
    className,
}: MultiselectProps) {
    const toggle = (v: string) => {
        if (value.includes(v)) onChange(value.filter((x) => x !== v));
        else onChange([...value, v]);
    };

    const removeChip = (v: string) => {
        onChange(value.filter((x) => x !== v));
    };

    return (
        <div className={cn("w-full", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        type="button"
                        role="combobox"
                        className={cn(
                            "w-full justify-between border-[var(--acp-border)] bg-[var(--acp-background)] text-[var(--acp-foreground)]",
                            "hover:bg-[var(--acp-primary-50)] dark:hover:bg-[var(--acp-primary-900)] transition-colors"
                        )}
                    >
                        <div className="flex min-h-5 w-0 flex-1 flex-wrap items-center gap-1 overflow-hidden">
                            {value.length > 0 ? (
                                value.map((v) => {
                                    const opt = options.find((o) => o.value === v);
                                    return (
                                        <span
                                            key={v}
                                            className="flex items-center gap-1 rounded-full bg-[var(--acp-primary-100)] px-2 py-0.5 text-xs text-[var(--acp-primary-700)] dark:bg-[var(--acp-primary-800)] dark:text-[var(--acp-primary-100)]"
                                        >
                                            {opt?.label ?? v}
                                            <XIcon
                                                className="size-3 cursor-pointer hover:text-[var(--acp-primary-900)]"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeChip(v);
                                                }}
                                            />
                                        </span>
                                    );
                                })
                            ) : (
                                <span className="text-muted-foreground">{placeholder}</span>
                            )}
                        </div>
                        <ChevronDownIcon className="ml-2 size-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>

                {/* Dropdown Menu */}
                <DropdownMenuContent
                    align="start"
                    sideOffset={4}
                    className={cn(
                        // 💡 Fix clipping & overlap
                        "fixed z-[9999] min-w-[240px] max-h-[320px] overflow-y-auto",
                        // 🎨 Apply ACP theme
                        "rounded-md border border-[var(--acp-border)] bg-[var(--acp-background)] text-[var(--acp-foreground)]",
                        "shadow-lg backdrop-blur-sm animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
                    )}
                >
                    {options.map((opt) => {
                        const checked = value.includes(opt.value);
                        return (
                            <DropdownMenuCheckboxItem
                                key={opt.value}
                                checked={checked}
                                onCheckedChange={() => toggle(opt.value)}
                                className={cn(
                                    "flex items-center gap-2 cursor-pointer rounded-sm px-2 py-1.5 text-sm outline-none select-none",
                                    "focus:bg-[var(--acp-primary-100)] dark:focus:bg-[var(--acp-primary-900)] focus:text-[var(--acp-primary-800)] dark:focus:text-[var(--acp-primary-100)]",
                                    "data-[checked]:bg-[var(--acp-primary-50)] dark:data-[checked]:bg-[var(--acp-primary-800)]",
                                    "data-[checked]:text-[var(--acp-primary-800)] dark:data-[checked]:text-[var(--acp-primary-100)]"
                                )}
                            >
                                <CheckIcon
                                    className={cn(
                                        "size-4 text-[var(--acp-primary-700)] transition-opacity",
                                        checked ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {opt.label}
                            </DropdownMenuCheckboxItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
