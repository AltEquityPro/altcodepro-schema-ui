"use client";
import React, {
    useMemo,
    useRef,
    useState,
    ChangeEvent,
    KeyboardEvent,
} from "react";
import { cn, resolveBinding } from "../../lib/utils";
import { RenderChildren } from "../../schema/RenderChildren";
import { DynamicIcon } from "./dynamic-icon";
import { MarkdownInput } from "./markdown-input";
import { RichTextEditor } from "./richtext-input";
import { ButtonRenderer } from "./button";
import { AnyObj, EventHandler, ComposerElement } from "../../types";

/* -------------------------------------------------------------------------- */
/* 🧠 ComposerRenderer — minimal, schema-driven input + actions               */
/* -------------------------------------------------------------------------- */
interface ComposerRendererProps {
    element: ComposerElement;
    state: AnyObj;
    t: (key: string, defaultLabel?: string) => string;
    runEventHandler?: (
        handler?: EventHandler | undefined,
        dataOverride?: AnyObj | undefined
    ) => Promise<void>;
}

export function ComposerRenderer({
    element,
    state,
    t,
    runEventHandler,
}: ComposerRendererProps) {
    const [input, setInput] = useState("");
    const [attachments, setAttachments] = useState<{ id: string; name: string }[]>(
        []
    );
    const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

    const placeholder =
        resolveBinding(element.placeholder, state, t) || t("Type something...");
    const inputMode = element.inputMode || "textarea";

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed && attachments.length === 0) return;
        const payload = { message: trimmed, attachments };
        const submitAction =
            element.actions?.find((a => a.isSubmit));

        if (submitAction?.onClick) await runEventHandler?.(submitAction.onClick, payload);
        else if (element.onSend) await runEventHandler?.(element.onSend, payload);

        setInput("");
        setAttachments([]);
    };

    const handleInputChange = (value: string) => {
        setInput(value);
        if (element.onChange) runEventHandler?.(element.onChange, { value });
    };

    const Editor = useMemo(() => {
        const editorProps: any = {
            placeholder,
            value: input,
            name: element.name,
            id: element.id,
            onChange: (v: string | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const value = typeof v === "string" ? v : v.target.value;
                handleInputChange(value);
            },
            className:
                cn("min-h-[44px] flex-1 resize-none border-none bg-transparent focus:outline-none text-base", element.editorClassName),
            onKeyDown: (e: KeyboardEvent) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            },
            ref: inputRef,
            "aria-label": t("Message input"),
            disabled: element.disabled === true,
            autoFocus: element.autoFocus,
        };

        switch (inputMode) {
            case "richtext":
                return <RichTextEditor {...editorProps} />;
            case "markdown":
                return <MarkdownInput {...editorProps} />;
            case "text":
                return (
                    <input
                        type="text"
                        {...editorProps}
                        className={cn(
                            "w-full border border-border rounded-md bg-transparent px-3 py-2 text-base shadow-xs",
                            editorProps.className
                        )}
                    />
                );
            default:
                return (
                    <textarea
                        {...editorProps}
                        rows={element.minRows ?? 2}
                        className={cn(
                            "w-full rounded-md border border-border bg-transparent px-3 py-2 text-base shadow-xs focus-visible:ring-1 focus-visible:ring-ring/50",
                            editorProps.className
                        )}
                    />
                );
        }
    }, [inputMode, input, placeholder]);

    /* ----------------------------------------------------------
       🎨 Final layout — Editor + Actions (auto layout)
    ---------------------------------------------------------- */
    return (
        <div
            className={cn(
                "flex flex-col gap-2 w-full",
                element.styles?.className
            )}
            role="form"
            aria-label={t("Composer")}
        >
            {/* 🧠 Editor Area */}
            <div className="w-full">{Editor}</div>

            {/* 🎛️ Action Row (schema-managed) */}
            {element.actions && element.actions?.length ? (
                <div
                    className={
                        element.actionsContainerClassName || "flex flex-wrap items-center gap-3 w-full justify-between"
                    }
                >
                    <RenderChildren
                        children={element.actions}
                        t={t}
                        state={state}
                        setState={() => { }}
                        runEventHandler={runEventHandler}
                    />
                </div>
            ) : null}

            {/* 📎 Attachments */}
            {attachments && attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {attachments.map((att) => (
                        <div
                            key={att.id}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/40 text-sm"
                        >
                            <DynamicIcon name="paperclip" className="h-4 w-4" />
                            {att.name}
                            <button
                                onClick={() =>
                                    setAttachments((prev) => prev.filter((a) => a.id !== att.id))
                                }
                                aria-label={`Remove ${att.name}`}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <DynamicIcon name="x" className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
