"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

interface TagsInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
}

export function TagsInput({ value, onChange }: TagsInputProps) {
    const [inputValue, setInputValue] = React.useState("");

    const addTag = () => {
        const tag = inputValue.trim();
        if (tag && !value.includes(tag)) {
            onChange([...value, tag]);
            setInputValue("");
        }
    };

    const removeTag = (tag: string) => {
        onChange(value?.filter((t) => t !== tag));
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {value && Array.isArray(value) && value.map((tag) => (
                    <span
                        key={tag}
                        className="bg-accent text-sm px-2 py-1 rounded-full flex items-center gap-1"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-muted-foreground hover:text-red-500"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add tag"
                />
                <Button type="button" onClick={addTag}>
                    Add
                </Button>
            </div>
        </div>
    );
}
