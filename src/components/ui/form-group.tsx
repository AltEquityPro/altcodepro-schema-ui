"use client";
import { useState } from "react";
import { resolveBinding, classesFromStyleProps, cn } from "../../lib/utils";
import { FieldType, AnyObj, FormElement, FormField as FormFieldType, EventHandler, } from "../../types";
import { Button } from "./button";
import { Progress } from "./progress";
import { Check, Loader2 } from "lucide-react";
import { toast } from "./sonner";

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
    formFields: FormFieldType[] | undefined,
    kind: "tab" | "step",
    groupId: string
): string[] {
    if (!formFields?.length) return [];
    return formFields
        .filter((f) => getFieldGroupId(f as FormFieldUnion, kind) === groupId)
        .flatMap((f) =>
            f.fieldType === FieldType.input
                ? [((f as any).input?.name as string)].filter(Boolean)
                : []
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
                "flex flex-col gap-6 p-4 rounded-lg border shadow-sm transition-colors duration-200",
                "border-[var(--acp-border)] dark:border-[var(--acp-border-dark)] bg-[var(--acp-background)] dark:bg-[var(--acp-background-dark)] text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)]",
                "dark:border-[var(--acp-border-dark)] dark:bg-[var(--acp-background-dark)] dark:text-[var(--acp-foreground-dark)]",
                className
            )}
        >
            <Progress
                value={progressValue}
                className={cn(
                    "h-2 rounded-full overflow-hidden transition-colors",
                    "bg-(--acp-border) dark:bg-(--acp-border-dark)",
                    "*:data-[slot=progress-bar]:bg-(--acp-primary) dark:*:data-[slot=progress-bar]:bg-(--acp-primary-dark)"
                )}
            />
            <div className="flex justify-between text-sm font-medium overflow-x-auto pb-2">
                {steps.map((step, idx) => {
                    const isCompleted = idx < currentIndex;
                    const isActive = idx === currentIndex;

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "flex flex-col items-center text-center transition-all duration-200 w-full",
                                isActive &&
                                "text-[var(--acp-primary)] dark:text-[var(--acp-primary-dark)] font-semibold"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-8 h-8 flex items-center justify-center rounded-full border-2 mb-2 text-sm font-medium transition-colors duration-200",
                                    isCompleted
                                        ? "bg-[var(--acp-primary)] border-[var(--acp-primary)] text-[var(--acp-background)] dark:bg-[var(--acp-primary-dark)] dark:border-[var(--acp-primary-dark)] dark:text-[var(--acp-background-dark)]"
                                        : isActive
                                            ? "border-[var(--acp-primary)] bg-[color-mix(in_srgb,var(--acp-primary)15%,transparent)] text-[var(--acp-primary-800)] dark:border-[var(--acp-primary-dark)] dark:bg-[color-mix(in_srgb,var(--acp-primary-dark)25%,transparent)] dark:text-[var(--acp-primary-dark)]"
                                            : "border-[var(--acp-border)] dark:border-[var(--acp-border-dark)] bg-[var(--acp-background)] dark:bg-[var(--acp-background-dark)] text-[var(--acp-secondary-600)] dark:border-[var(--acp-border-dark)] dark:bg-[var(--acp-background-dark)] dark:text-[var(--acp-secondary-400)]"
                                )}
                            >
                                {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span
                                className={cn(
                                    "text-xs whitespace-nowrap px-1 transition-colors duration-200",
                                    isActive
                                        ? "text-[var(--acp-primary)] dark:text-[var(--acp-primary-dark)]"
                                        : isCompleted
                                            ? "text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)] dark:text-[var(--acp-foreground-dark)]"
                                            : "text-[var(--acp-secondary-500)] dark:text-[var(--acp-secondary-400)]"
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
        (group.formFields ?? [])
            .map((f) => getFieldGroupId(f as FormFieldUnion, "tab"))
            .filter(Boolean) as string[]
    );
    const tabs =
        (group as any).tabs?.length
            ? (group as any).tabs?.map((tb: any) => ({
                id: tb.id,
                label: resolveBinding(tb.label ?? tb.id, state, t),
            }))
            : derivedTabIds?.map((id) => ({ id, label: id }));

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
    element,
    t,
    renderField,
    runEventHandler,
}: {
    group: FormElement;
    element: FormElement;
    form: any;
    state: AnyObj;
    t: (key: string, defaultLabel?: string) => string;
    runEventHandler?: (
        handler?: EventHandler | undefined,
        dataOverride?: AnyObj
    ) => Promise<void>;
    renderField: (f: FormFieldType) => React.ReactNode;
}) {
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(false);

    const derivedStepIds = unique(
        (group.formFields ?? [])
            .map((f) => getFieldGroupId(f as FormFieldUnion, "step"))
            .filter(Boolean) as string[]
    );

    const steps =
        (group as any).steps?.length
            ? (group as any)?.steps?.map((s: any, i: number) => ({
                id: s.id ?? `step-${i}`,
                title: resolveBinding(s.title ?? s.id ?? `Step ${i + 1}`, state, t),
                description: resolveBinding(s.description, state, t),
                submit: s.submit,
            }))
            : derivedStepIds?.map((id, i) => ({ id, title: `Step ${i + 1}` }));

    const currentStepId = steps[current]?.id;
    const currentStep = steps[current];

    const goNext = async () => {
        const stepFields = (group as any).steps?.[current]?.formFields ?? [];
        const names = stepFields
            .filter((f: any) => f.fieldType === FieldType.input && f.input?.name)
            .map((f: any) => f.input.name);
        const ok = names.length ? await form.trigger(names) : await form.trigger();
        if (!ok) {
            toast.error(t("Please correct the highlighted fields before continuing"));
            return
        };

        setLoading(true);
        try {
            if (currentStep?.submit?.onClick) {
                const data = form.getValues();
                await runEventHandler?.(currentStep.submit.onClick, data);
            }
            setCurrent((c) => Math.min(c + 1, steps.length - 1));
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async () => {
        const stepFields = (group as any).steps?.[current]?.formFields ?? [];
        const names = stepFields
            .filter((f: any) => f.fieldType === FieldType.input && f.input?.name)
            .map((f: any) => f.input.name);
        const valid = await form.trigger(undefined, { shouldFocus: true });
        if (!valid) {
            toast.error(t("Please correct the highlighted fields before continuing"));
            return
        };
        setLoading(true);
        try {
            const submitEvent = currentStep?.submit?.onClick || group?.submit?.onClick || element.submit?.onClick
            const data = form.getValues();
            await runEventHandler?.(submitEvent, data);
        } catch (error: any) {
            toast.error((error?.message || error?.details || error?.detail) || 'An error occured');
        } finally {
            setLoading(false);
        }
    };

    const goPrev = () => setCurrent((c) => Math.max(0, c - 1));
    const nestedFields = (group as any).steps?.[current]?.formFields;
    const flatFields = group.formFields?.filter(
        (f) => getFieldGroupId(f as FormFieldUnion, "step") === currentStepId
    );

    return (
        <div className={classesFromStyleProps(group.styles)}>
            <FormStepper steps={steps} currentIndex={current} />
            <div className="space-y-4">
                {(nestedFields?.length ? nestedFields : flatFields)?.map(
                    (f: FormFieldType) => <div key={f.id}>{renderField(f)}</div>
                )}
            </div>
            <div className="flex justify-between space-x-2 mt-6">
                {current > 0 ? (
                    <Button
                        type="button"
                        onClick={goPrev}
                        disabled={loading}
                        className="border-(--acp-border) dark:border-(--acp-border-dark) text-(--acp-foreground) dark:text-(--acp-foreground-dark) hover:bg-(--acp-primary-50)"
                    >
                        {t("back", "Back")}
                    </Button>
                ) : (
                    <div />
                )}

                {current < steps.length - 1 ? (
                    <Button
                        type="button"
                        onClick={goNext}
                        disabled={loading}
                        className={cn(
                            "bg-(--acp-primary) text-(--acp-background) hover:bg-(--acp-primary-600)"
                        )}
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : t("next", "Next")}
                    </Button>
                ) : (
                    <Button type="button" onClick={onSubmit} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : t("submit", "Submit")}
                    </Button>
                )}
            </div>
        </div>
    );
}