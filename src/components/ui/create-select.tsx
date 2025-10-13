"use client";

import * as React from "react";
import { PlusIcon, CheckIcon } from "lucide-react";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import { EventHandler } from "../../types";
import { useActionHandler } from "../../schema/useActionHandler";

export type CreateSelectOption = { value: string; label: string };

type CreateSelectProps = {
    className?: string;
    value: string;
    options: CreateSelectOption[];
    placeholder?: React.ReactNode;
    onChange: (value: string) => void;

    /** Action to run when a user creates a new entry */
    onCreateAction?: EventHandler;

    /**
     * Build the optimistic option from the text typed by the user.
     * Defaults to using the same string for value and label.
     */
    buildOption?: (raw: string) => CreateSelectOption;

    /** Optional: disable creation UI */
    disableCreate?: boolean;
};

export function CreateSelect({
    className,
    value,
    options,
    placeholder,
    onChange,
    onCreateAction,
    buildOption = (raw) => ({ value: raw, label: raw }),
    disableCreate,
}: CreateSelectProps) {
    const [localOptions, setLocalOptions] = React.useState<CreateSelectOption[]>(options);
    const [adding, setAdding] = React.useState(false);
    const [draft, setDraft] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const { runEventHandler } = useActionHandler({ runtime: {} as any });

    // Keep local options in sync when upstream changes
    React.useEffect(() => {
        setLocalOptions(options);
    }, [options]);

    const alreadyExists = React.useMemo(() => {
        const trimmed = draft.trim().toLowerCase();
        return trimmed.length > 0 && localOptions.some(o => o.label.toLowerCase() === trimmed || o.value.toLowerCase() === trimmed);
    }, [draft, localOptions]);

    const createOption = async () => {
        const raw = draft.trim();
        if (!raw || busy || alreadyExists) return;

        const optimistic = buildOption(raw);

        // optimistic add (so UI feels instant)
        setLocalOptions((prev) => [...prev, optimistic]);
        onChange(optimistic.value);

        if (!onCreateAction) {
            // no remote action; just collapse the row
            setAdding(false);
            setDraft("");
            return;
        }

        try {
            setBusy(true);

            // Fire your action pipeline. It will update app state if the
            // action was configured with responseType:"data" and a statePath,
            // and your form will re-render with those new options via bindings.
            await runEventHandler(
                {
                    ...onCreateAction,
                    // Pass the draft as { value, label } so the action can use it
                    params: {
                        ...(onCreateAction.params || {}),
                        newOption: { value: optimistic.value, label: optimistic.label },
                    },
                },
                // Also pass as dataOverride for APIs that read from action.dataOverride
                { value: optimistic.value, label: optimistic.label }
            );
        } catch {
            // roll back optimistic add on failure
            setLocalOptions((prev) => prev.filter((o) => o.value !== optimistic.value));
            // also clear the selected value if we had just set it to the failed one
            if (value === optimistic.value) onChange("");
        } finally {
            setBusy(false);
            setAdding(false);
            setDraft("");
        }
    };

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {localOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                            {value === opt.value ? <CheckIcon className="ml-2 size-3.5 opacity-60" /> : null}
                        </SelectItem>
                    ))}

                    {!disableCreate && (
                        <div className="border-t mt-1 pt-2 px-1">
                            {!adding ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start gap-2"
                                    onClick={() => setAdding(true)}
                                >
                                    <PlusIcon className="size-4" />
                                    Add new
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Input
                                        autoFocus
                                        value={draft}
                                        placeholder="Type new option…"
                                        onChange={(e) => setDraft(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                createOption();
                                            } else if (e.key === "Escape") {
                                                setAdding(false);
                                                setDraft("");
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={!draft.trim() || alreadyExists || busy}
                                        onClick={createOption}
                                    >
                                        {busy ? "Saving…" : "Add"}
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setAdding(false);
                                            setDraft("");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}
