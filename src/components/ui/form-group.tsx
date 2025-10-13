"use client";
import { useState } from "react";
import { resolveBinding, classesFromStyleProps } from "../../lib/utils";
import { FieldType, AnyObj, FormElement, FormField as FormFieldType, } from "../../types";
import { Button } from "./button";

/** ---------- Group helpers (schema-driven) ---------- */
type FormFieldUnion = FormFieldType & {
    tabId?: string;      // optional metadata on field
    stepId?: string;     // optional metadata on field
    meta?: { tabId?: string; stepId?: string }; // if you prefer meta container
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

function resolveLabel(val: any, state: AnyObj, t: (k: string) => string): string {
    const out = resolveBinding(val, state, t);
    return typeof out === "string" ? out : String(out ?? "");
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

export function Stepper({
    steps,
    currentIndex,
    className,
}: {
    steps: { id: string; label: string }[];
    currentIndex: number;
    className?: string;
}) {
    return (
        <ol className={className}>
            <div className="flex items-center justify-between w-full mb-4">
                {steps.map((s, i) => (
                    <li key={s.id} className="flex-1 text-center" data-active={i <= currentIndex ? "true" : "false"}>
                        <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center mb-1">{i + 1}</div>
                            <span className="text-xs">{s.label}</span>
                        </div>
                    </li>
                ))}
            </div>
        </ol>
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
                label: resolveLabel(tb.label ?? tb.id, state, t),
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
            <div className="mt-4">
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
    state, t,
    renderField,
}: {
    group: FormElement;
    form: any;
    state: AnyObj;
    t: (key: string) => string;
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
                label: resolveLabel(s.label ?? s.id ?? `Step ${i + 1}`, state, t),
            }))
            : derivedStepIds.map((id, i) => ({ id, label: `Step ${i + 1}` }));

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
            <Stepper steps={steps} currentIndex={current} />
            <div className="space-y-4">
                {group.formFields
                    .filter((f) => getFieldGroupId(f as FormFieldUnion, "step") === steps[current]?.id)
                    .map((f) => (
                        <div key={f.id}>{renderField(f)}</div>
                    ))}
            </div>
            <div className="mt-4 flex justify-between">
                <Button type="button" onClick={goPrev} disabled={current === 0}>
                    {t("back")}
                </Button>
                {current < steps.length - 1 ? (
                    <Button type="button" onClick={goNext}>
                        {t("next")}
                    </Button>
                ) : (
                    <Button type="submit">{t("submit")}</Button>
                )}
            </div>
        </div>
    );
}
