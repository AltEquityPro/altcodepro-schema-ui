"use client";
import { useState } from "react";
import { resolveBinding, classesFromStyleProps, cn } from "../../lib/utils";
import { FieldType, AnyObj, FormElement, FormField as FormFieldType, } from "../../types";
import { Button } from "./button";
import { Progress } from "./progress";
import { Check } from "lucide-react";

type FormFieldUnion = FormFieldType & {
    tabId?: string;
    stepId?: string;
    meta?: { tabId?: string; stepId?: string };
};

const getFieldGroupId = (f: FormFieldUnion, kind: "tab" | "step") =>
    kind === "tab" ? (f.tabId ?? f.meta?.tabId) : (f.stepId ?? f.meta?.stepId);

function unique<T>(arr: T[]) {
    return [...new Set(arr)];
}

function namesForGroup(
    formFields: FormFieldType[],
    kind: "tab" | "step",
    groupId: string
): string[] {
    return formFields
        .filter((f) => getFieldGroupId(f as FormFieldUnion, kind) === groupId)
        .flatMap((f) =>
            f.fieldType === FieldType.input ? [((f as any).input?.name as string)].filter(Boolean) : []
        );
}


export function TabsBar({
    tabs,
    activeId,
    onTab,
    className,
}: {
    tabs: { id: string; label: string }[];
    activeId: string;
    onTab: (id: string) => void;
    className?: string;
}) {
    return (
        <div className={className}>
            <div className="flex gap-4 border-b">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => onTab(t.id)}
                        data-active={activeId === t.id ? "true" : "false"}
                        className="pb-2"
                    >
                        {t.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function FormStepper({
    steps,
    currentIndex,
    className,
}: {
    steps: { id: string; title: string }[];
    currentIndex: number;
    className?: string;
}) {
    const progressValue =
        steps.length > 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;

    return (
        <div
            className={cn(
                "flex flex-col gap-6 p-4 rounded-lg border",
                "border-[var(--acp-border)] bg-[var(--acp-background)] text-[var(--acp-foreground)]",
                "shadow-sm transition-colors duration-200", className
            )}
        >
            {/* Progress bar */}
            <Progress
                value={progressValue}
                className={cn(
                    "h-2 rounded-full overflow-hidden",
                    "bg-[var(--acp-border)] [&>[data-slot=progress-bar]]:bg-[var(--acp-primary)]"
                )}
            />

            {/* Step indicators */}
            <div className="flex justify-between text-sm font-medium overflow-x-auto pb-2">
                {steps.map((step, idx) => {
                    const isCompleted = idx < currentIndex;
                    const isActive = idx === currentIndex;

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "flex flex-col items-center text-center transition-all duration-200 w-full",
                                isActive && "text-[var(--acp-primary)] font-semibold"
                            )}
                        >
                            {/* Step circle */}
                            <div
                                className={cn(
                                    "w-8 h-8 flex items-center justify-center rounded-full border-2 mb-2 text-sm font-medium transition-colors duration-200",
                                    isCompleted
                                        ? "bg-[var(--acp-primary)] border-[var(--acp-primary)] text-[var(--acp-background)]"
                                        : isActive
                                            ? "border-[var(--acp-primary)] bg-[var(--acp-primary-50)] text-[var(--acp-primary-800)]"
                                            : "border-[var(--acp-border)] bg-[var(--acp-background)] text-[var(--acp-foreground)]"
                                )}
                            >
                                {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                            </div>

                            {/* Step label */}
                            <span
                                className={cn(
                                    "text-xs whitespace-nowrap px-1",
                                    "transition-colors duration-200",
                                    isActive
                                        ? "text-[var(--acp-primary)]"
                                        : isCompleted
                                            ? "text-[var(--acp-foreground)]"
                                            : "text-[var(--acp-secondary-500)]"
                                )}
                            >
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function TabGroup({
    group,
    form,
    renderField,
    state,
    t,
}: {
    group: FormElement;
    form: any;
    state: AnyObj;
    t: (key: string) => string;
    renderField: (f: FormFieldType) => React.ReactNode;
}) {
    // Prefer explicit group.tabs; otherwise derive from fields' tabId
    const derivedTabIds = unique(
        group.formFields
            .map((f) => getFieldGroupId(f as FormFieldUnion, "tab"))
            .filter(Boolean) as string[]
    );
    const tabs =
        (group as any).tabs?.length
            ? (group as any).tabs.map((tb: any) => ({
                id: tb.id,
                label: resolveBinding(tb.label ?? tb.id, state, t),
            }))
            : derivedTabIds.map((id) => ({ id, label: id }));

    const [activeId, setActiveId] = useState<string>(tabs[0]?.id || "tab0");

    const onChangeTab = async (id: string) => {
        // validate only current tab’s fields (if any); else allow change
        const currentNames = namesForGroup(group.formFields, "tab", activeId);
        const ok = currentNames.length ? await form.trigger(currentNames) : true;
        if (ok) setActiveId(id);
    };

    return (
        <div className={classesFromStyleProps(group.styles)}>
            <TabsBar tabs={tabs} activeId={activeId} onTab={onChangeTab} />
            <div className="mt-1">
                {group.formFields
                    .filter((f) => getFieldGroupId(f as FormFieldUnion, "tab") === activeId)
                    .map((f) => (
                        <div key={f.id}>{renderField(f)}</div>
                    ))}
            </div>
        </div>
    );
}

export function WizardGroup({
    group,
    form,
    state,
    t,
    renderField,
}: {
    group: FormElement;
    form: any;
    state: AnyObj;
    t: (key: string, defaultLabel?: string) => string;
    renderField: (f: FormFieldType) => React.ReactNode;
}) {
    // Prefer explicit group.steps; otherwise derive from fields' stepId
    const derivedStepIds = unique(
        group.formFields
            .map((f) => getFieldGroupId(f as FormFieldUnion, "step"))
            .filter(Boolean) as string[]
    );
    const steps =
        (group as any).steps?.length
            ? (group as any).steps.map((s: any, i: number) => ({
                id: s.id ?? `step-${i}`,
                title: resolveBinding(s.title ?? s.id ?? `Step ${i + 1}`, state, t),
                description: resolveBinding(s.description, state, t),
            }))
            : derivedStepIds.map((id, i) => ({ id, title: `Step ${i + 1}` }));

    const [current, setCurrent] = useState(0);
    const goNext = async () => {
        const stepId = steps[current]?.id;
        const names = namesForGroup(group.formFields, "step", stepId);
        const ok = names.length ? await form.trigger(names) : await form.trigger(); // fallback to all
        if (ok) setCurrent((c) => Math.min(c + 1, steps.length - 1));
    };
    const goPrev = () => setCurrent((c) => Math.max(0, c - 1));
    return (
        <div className={classesFromStyleProps(group.styles)}>
            <FormStepper steps={steps} currentIndex={current} />
            <div className="space-y-4">
                {group.formFields
                    .filter((f) => getFieldGroupId(f as FormFieldUnion, "step") === steps[current]?.id)
                    .map((f) => (
                        <div key={f.id}>{renderField(f)}</div>
                    ))}
            </div>
            <div className="flex justify-between space-x-2 mt-6">
                <Button type="button" onClick={goPrev} disabled={current === 0}
                    className="border-[var(--acp-border)] text-[var(--acp-foreground)] hover:bg-[var(--acp-primary-50)]">
                    {t("back", "Back")}
                </Button>
                {current < steps.length - 1 ? (
                    <Button type="button" onClick={goNext} className={cn(
                        "bg-[var(--acp-primary)] text-[var(--acp-background)] hover:bg-[var(--acp-primary-600)]"
                    )}>
                        {t("next", "Next")}
                    </Button>
                ) : (
                    <Button type="submit" >
                        {t("submit", "Submit")}
                    </Button>
                )}
            </div>
        </div>
    );
}
