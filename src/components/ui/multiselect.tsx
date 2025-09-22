"use client"

import * as React from "react"
import { XIcon, ChevronDownIcon, CheckIcon } from "lucide-react"
import { cn } from "@/src/lib/utils"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from "@/src/components/ui/dropdown-menu"
import { Button } from "@/src/components/ui/button"

export type MultiSelectOption = { label: string; value: string }

interface MultiselectProps {
    options: MultiSelectOption[]
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    className?: string
}

export function Multiselect({
    options,
    value,
    onChange,
    placeholder = "Select",
    className,
}: MultiselectProps) {
    const toggle = (v: string) => {
        if (value.includes(v)) {
            onChange(value.filter((x) => x !== v))
        } else {
            onChange([...value, v])
        }
    }

    const removeChip = (v: string) => {
        onChange(value.filter((x) => x !== v))
    }

    return (
        <div className={cn("w-full", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        type="button"
                        role="combobox"
                        className={cn(
                            "w-full justify-between",
                        )}
                    >
                        <div className="flex min-h-5 w-0 flex-1 flex-wrap items-center gap-1 overflow-hidden">
                            {value.length > 0 ? (
                                value.map((v) => {
                                    const opt = options.find((o) => o.value === v)
                                    return (
                                        <span
                                            key={v}
                                            className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                                        >
                                            {opt?.label ?? v}
                                            <XIcon
                                                className="size-3 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeChip(v)
                                                }}
                                            />
                                        </span>
                                    )
                                })
                            ) : (
                                <span className="text-muted-foreground">{placeholder}</span>
                            )}
                        </div>
                        <ChevronDownIcon className="ml-2 size-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[240px]">
                    {options.map((opt) => {
                        const checked = value.includes(opt.value)
                        return (
                            <DropdownMenuCheckboxItem
                                key={opt.value}
                                checked={checked}
                                onCheckedChange={() => toggle(opt.value)}
                                className="flex items-center gap-2"
                            >
                                <CheckIcon className={cn("size-4", checked ? "opacity-100" : "opacity-0")} />
                                {opt.label}
                            </DropdownMenuCheckboxItem>
                        )
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
