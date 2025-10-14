"use client";

import * as React from "react";
import { cn, resolveBinding } from "../../lib/utils";
import { Button } from "./button";
import { Progress } from "./progress";
import wrapWithMotion from "./wrapWithMotion";
import { RenderChildren } from "../../schema/RenderChildren";
import type { AnyObj, EventHandler, StepWizardElement } from "../../types";

/**
 * Step-by-step wizard renderer
 * Supports dynamic binding, validation, keyboard navigation, and progress tracking.
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
    t: (key: string) => string;
}) {
    const [currentStep, setCurrentStep] = React.useState(element.current || 0);

    // Filter steps based on visibility bindings
    const visibleSteps = React.useMemo(
        () =>
            (element.steps || []).filter(
                (s) => !s.shouldShow || resolveBinding(s.shouldShow, state, t)
            ),
        [element.steps, state, t]
    );

    const step = visibleSteps[currentStep];
    const totalSteps = visibleSteps.length;
    const progressValue = totalSteps
        ? ((currentStep + 1) / totalSteps) * 100
        : 0;

    // --- Navigation handlers ---
    const handlePrev = React.useCallback(() => {
        if (step?.onPrev) runEventHandler?.(step.onPrev);
        setCurrentStep((prev) => Math.max(0, prev - 1));
    }, [step, runEventHandler]);

    const handleNext = React.useCallback(async () => {
        if (!step) return;

        // Validation step (if defined)
        if (step.validate && step.validateAction) {
            await runEventHandler?.(step.validateAction);
        }

        // Last step → Complete
        if (currentStep === totalSteps - 1) {
            if (step.onComplete) await runEventHandler?.(step.onComplete);
        } else {
            if (step.onNext) await runEventHandler?.(step.onNext);
            setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
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

    // --- Safety: handle empty steps ---
    if (!visibleSteps.length) {
        return wrapWithMotion(
            element,
            <div className="text-neutral-400 text-sm italic">
                {t("wizard.empty") || "No steps configured"}
            </div>
        );
    }

    return wrapWithMotion(
        element,
        <div
            style={{ zIndex: element.zIndex }}
            className="flex flex-col gap-6 p-4 rounded-lg border border-neutral-800 bg-neutral-950/50"
        >
            {/* 🔹 Progress bar */}
            <Progress value={progressValue} className="h-2" />

            {/* 🔹 Step indicators */}
            <div className="flex justify-between text-sm font-medium overflow-x-auto pb-2">
                {visibleSteps.map((s, idx) => (
                    <button
                        key={s.id || `step-${idx}`}
                        onClick={() => setCurrentStep(idx)}
                        className={cn(
                            "px-3 py-1.5 rounded-md whitespace-nowrap transition-colors",
                            idx === currentStep
                                ? "bg-blue-600 text-white"
                                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                        )}
                        aria-current={idx === currentStep ? "step" : undefined}
                    >
                        {resolveBinding(s.title, state, t)}
                    </button>
                ))}
            </div>

            {/* 🔹 Step content */}
            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3 text-neutral-100">
                    {t("wizard.step")} {currentStep + 1}:{" "}
                    {resolveBinding(step?.title, state, t)}
                </h3>
                {step?.content ? (
                    <RenderChildren
                        state={state} t={t} setState={setState}
                        children={Array.isArray(step.content) ? step.content : [step.content]}
                        runEventHandler={runEventHandler}
                    />
                ) : (
                    <div className="text-neutral-400 italic">
                        {t("wizard.no_content") || "No content for this step"}
                    </div>
                )}
            </div>

            {/* 🔹 Navigation buttons */}
            <div className="flex space-x-2 mt-6">
                <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                >
                    {t("wizard.previous") || "Previous"}
                </Button>
                <Button onClick={handleNext}>
                    {currentStep === totalSteps - 1
                        ? t("wizard.complete") || "Complete"
                        : t("wizard.next") || "Next"}
                </Button>
            </div>
        </div>
    );
}
