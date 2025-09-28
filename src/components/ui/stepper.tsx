"use client";
import { AnyObj, EventHandler, StepWizardElement } from "../../types"
import wrapWithMotion from "./wrapWithMotion"
import React from "react"
import { cn, resolveBinding } from "../../lib/utils"
import { RenderChildren } from "../../schema/RenderChildren"
import { Button } from "./button"
import { Progress } from "./progress"

function StepWizardRenderer({
    element,
    runEventHandler,
    state,
    t,
}: {
    element: StepWizardElement
    runEventHandler: (h?: EventHandler, d?: AnyObj) => Promise<void>
    state: AnyObj
    t: (key: string) => string
}) {
    const [currentStep, setCurrentStep] = React.useState(element.current || 0)

    // Filter steps based on `shouldShow` binding (if provided)
    const visibleSteps = element.steps.filter(
        (s) => !s.shouldShow || resolveBinding(s.shouldShow, state, t)
    )

    const step = visibleSteps[currentStep]
    const totalSteps = visibleSteps.length
    const progressValue = ((currentStep + 1) / totalSteps) * 100

    // Keyboard navigation
    React.useEffect(() => {
        const handleKey = async (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault()
                await handleNext()
            } else if (e.key === "ArrowRight") {
                await handleNext()
            } else if (e.key === "ArrowLeft") {
                handlePrev()
            }
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    })

    const handlePrev = () => {
        if (step.onPrev) runEventHandler(step.onPrev)
        setCurrentStep((prev) => Math.max(0, prev - 1))
    }

    const handleNext = async () => {
        if (step.validate && step.validateAction) {
            await runEventHandler(step.validateAction)
        }
        if (currentStep === totalSteps - 1) {
            if (step.onComplete) runEventHandler(step.onComplete)
        } else {
            if (step.onNext) runEventHandler(step.onNext)
            setCurrentStep((prev) => prev + 1)
        }
    }

    return wrapWithMotion(
        element,
        <div style={{ zIndex: element.zIndex }} className="flex flex-col gap-6">
            {/* Progress */}
            <Progress value={progressValue} className="h-2" />

            {/* Step indicators */}
            <div className="flex justify-between text-sm font-medium">
                {visibleSteps.map((s, idx) => (
                    <button
                        key={s.id}
                        onClick={() => setCurrentStep(idx)}
                        className={cn(
                            "px-3 py-1 rounded-md transition-colors",
                            idx === currentStep
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-accent"
                        )}
                        aria-current={idx === currentStep ? "step" : undefined}
                    >
                        {resolveBinding(s.title, state, t)}
                    </button>
                ))}
            </div>

            {/* Current step */}
            <div>
                <h3 className="text-lg font-semibold mb-2">
                    Step {currentStep + 1}: {resolveBinding(step.title, state, t)}
                </h3>
                {step.content && <RenderChildren children={step.content} />}
            </div>

            {/* Navigation */}
            <div className="flex space-x-2 mt-4">
                <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
                    Previous
                </Button>
                <Button onClick={handleNext}>
                    {currentStep === totalSteps - 1 ? "Complete" : "Next"}
                </Button>
            </div>
        </div>
    )
}

export default StepWizardRenderer