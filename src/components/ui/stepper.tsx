"use client";

import * as React from "react";
import { cn, resolveBinding } from "../../lib/utils";
import { Button } from "./button";
import { Progress } from "./progress";
import wrapWithMotion from "./wrapWithMotion";
import { RenderChildren } from "../../schema/RenderChildren";
import { ElementType, FormGroupType, type AnyObj, type EventHandler, type FormElement, type FormField, type StepWizardElement } from "../../types";
import { ElementResolver } from "@/schema/ElementResolver";

/**
 * Convert AI-generated step_wizard schemas with inline forms
 * into a valid unified FormElement with formGroupType = "step_wizard"
 */
export function normalizeWizardToForm(schema: { elements: StepWizardElement[] }): any {
    if (!schema?.elements) return schema;

    schema.elements = schema.elements?.map((element) => {
        if (element?.type !== "step_wizard" || !Array.isArray(element.steps)) return element;

        const stepsMeta: any[] = [];
        const allFormFields: FormField[] = [];
        const mergedValidation: Record<string, any> = {};

        for (const step of element.steps) {
            const stepId = step.id || `step_${Math.random().toString(36).slice(2, 8)}`;
            const stepObj = {
                id: stepId,
                title: step.title,
            };

            let formFields: any[] = [];
            let validation: Record<string, any> = {};

            // Search all step.content nodes
            for (const c of (step.content || []) as any) {
                // direct formFields array
                if (Array.isArray(c.formFields)) {
                    formFields.push(...c.formFields);
                    validation = { ...validation, ...(c.validationSchema || {}) };
                }

                // form type
                if (c.type === "form" && Array.isArray(c.formFields)) {
                    formFields.push(...c.formFields);
                    validation = { ...validation, ...(c.validationSchema || {}) };
                }

                // nested containers or child forms
                if (Array.isArray(c.children)) {
                    const innerForms = c.children.filter((ch: any) => ch.type === "form");
                    for (const innerForm of innerForms) {
                        formFields.push(...(innerForm.formFields || []));
                        validation = { ...validation, ...(innerForm.validationSchema || {}) };
                    }
                }
            }

            // 🔥 Attach stepId to every form field
            formFields = formFields?.map((f) => ({
                ...f,
                stepId,
                meta: { ...(f.meta || {}), stepId },
            }));

            // Merge fields + validation into global structure
            if (formFields.length > 0) {
                allFormFields.push(...formFields);
                Object.assign(mergedValidation, validation);
            }

            stepsMeta.push(stepObj);
        }

        // --- Build unified FormElement ---
        const newForm: FormElement = {
            ...element,
            type: ElementType.form,
            formGroupType: FormGroupType.step_wizard,
            wizardConfig: {
                steps: stepsMeta,
                linear: true,
                showProgress: true,
            },
            formFields: allFormFields,
            validationSchema: mergedValidation,
        };
        if (element.submit) newForm.submit = element.submit;
        if (element.actions) newForm.actions = element.actions;

        return newForm;
    }) as any;

    return schema;
}

/**
 * Step-by-step wizard renderer
 * ACP Theme Integrated: Uses CSS variables from GlobalThemeProvider
 */
export default function StepWizardRenderer({
    element,
    runEventHandler,
    state,
    setState,
    t,
}: {
    element: StepWizardElement;
    setState: (path: string, value: any) => void;
    runEventHandler?: (h?: EventHandler, d?: AnyObj) => Promise<void>;
    state: AnyObj;
    t: (key: string, defaultLabel?: string) => string;
}) {
    // --- Normalize malformed wizard schemas before rendering ---
    const normalized = React.useMemo(() => normalizeWizardToForm({ elements: [element] }), [element]);
    const fixedElement = normalized?.elements?.[0] || element;
    const [currentStep, setCurrentStep] = React.useState(fixedElement.current || 0);

    // Visible steps (respect conditional bindings)
    const visibleSteps = React.useMemo(
        () =>
            (fixedElement.steps || []).filter(
                (s: any) => !s.shouldShow || resolveBinding(s.shouldShow, state, t)
            ),
        [fixedElement.steps, state, t]
    );

    const step = visibleSteps[currentStep];
    const totalSteps = visibleSteps.length;
    const progressValue = totalSteps ? ((currentStep + 1) / totalSteps) * 100 : 0;

    // --- Navigation handlers ---
    const handlePrev = React.useCallback(() => {
        if (step?.onPrev) runEventHandler?.(step.onPrev);
        setCurrentStep((prev: any) => Math.max(0, prev - 1));
    }, [step, runEventHandler]);

    const handleNext = React.useCallback(async () => {
        if (!step) return;

        // Optional validation
        if (step.validate && step.validateAction) {
            await runEventHandler?.(step.validateAction);
        }

        // Completion logic
        if (currentStep === totalSteps - 1) {
            if (step.onComplete) await runEventHandler?.(step.onComplete);
        } else {
            if (step.onNext) await runEventHandler?.(step.onNext);
            setCurrentStep((prev: any) => Math.min(prev + 1, totalSteps - 1));
        }
    }, [step, currentStep, totalSteps, runEventHandler]);

    // --- Keyboard navigation ---
    React.useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === "ArrowRight") {
                e.preventDefault();
                handleNext();
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                handlePrev();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [handleNext, handlePrev]);

    if (!visibleSteps.length) {
        return wrapWithMotion(
            fixedElement,
            <div className="text-[var(--acp-secondary-500)] text-sm italic">
                {t("wizard.empty", "No steps configured")}
            </div>
        );
    }
    if (fixedElement.type == 'form') {
        return <ElementResolver element={fixedElement} state={state} setState={setState} t={t} runEventHandler={runEventHandler} />
    }

    // --- Render ---
    return wrapWithMotion(
        fixedElement,
        <div
            style={{ zIndex: fixedElement.zIndex }}
            className={cn(
                "flex flex-col gap-6 p-4 rounded-lg border",
                "border-[var(--acp-border)] bg-[var(--acp-background)] text-[var(--acp-foreground)]",
                "shadow-sm transition-colors duration-200"
            )}
        >
            {/* Progress Bar */}
            <Progress
                value={progressValue}
                className="h-2 bg-[var(--acp-border)] [&>[data-slot=progress-bar]]:bg-[var(--acp-primary)]"
            />

            {/* Step Indicators */}
            <div className="flex justify-between text-sm font-medium overflow-x-auto pb-2">
                {visibleSteps?.map((s: any, idx: number) => (
                    <button
                        key={s.id || `step-${idx}`}
                        onClick={() => setCurrentStep(idx)}
                        className={cn(
                            "px-3 py-1.5 mr-2 rounded-md whitespace-nowrap transition-colors duration-150",
                            idx === currentStep
                                ? "bg-[var(--acp-primary)] text-[var(--acp-background)]"
                                : "bg-[var(--acp-primary-50)] text-[var(--acp-primary-800)] hover:bg-[var(--acp-primary-100)]",
                            "dark:data-[active]:bg-[var(--acp-primary-800)] dark:data-[active]:text-[var(--acp-primary-50)]"
                        )}
                        aria-current={idx === currentStep ? "step" : undefined}
                    >
                        {resolveBinding(s.title, state, t)}
                    </button>
                ))}
            </div>

            {/* Step Content */}
            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3 text-[var(--acp-foreground)]">
                    {t("wizard.step")} {currentStep + 1}:{" "}
                    {resolveBinding(step?.title, state, t)}
                </h3>

                {step?.content ? (
                    <RenderChildren
                        state={state}
                        t={t}
                        setState={setState}
                        children={Array.isArray(step.content) ? step.content : [step.content]}
                        runEventHandler={runEventHandler}
                    />
                ) : (
                    <div className="text-[var(--acp-secondary-500)] italic">
                        {t("wizard.no_content", "No content for this step")}
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between space-x-2 mt-6">
                <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="border-[var(--acp-border)] text-[var(--acp-foreground)] hover:bg-[var(--acp-primary-50)]"
                >
                    {t("wizard.previous", "Previous")}
                </Button>

                <Button
                    onClick={handleNext}
                    className={cn(
                        "bg-[var(--acp-primary)] text-[var(--acp-background)] hover:bg-[var(--acp-primary-600)]"
                    )}
                >
                    {currentStep === totalSteps - 1
                        ? t("wizard.complete", "Complete")
                        : t("wizard.next", "Next")}
                </Button>
            </div>
        </div>
    );
}
