// stepper-context.ts
"use client"
import * as React from "react"

export type StepGuard = () => Promise<boolean> | boolean
export type StepDataProvider = () => Promise<Record<string, any> | void> | (Record<string, any> | void)

type Ctx = {
    registerGuard(stepIndex: number, guard: StepGuard | null): void
    registerDataProvider(stepIndex: number, fn: StepDataProvider | null): void
}

const StepperContext = React.createContext<Ctx | null>(null)

export function useStepper() {
    const ctx = React.useContext(StepperContext)
    if (!ctx) throw new Error("useStepper must be used within <StepperProvider>")
    return ctx
}

export function StepperProvider({
    children,
    value,
}: {
    children: React.ReactNode
    value: Ctx
}) {
    return <StepperContext.Provider value={value}>{children}</StepperContext.Provider>
}

/** Hooks for step content */
export function useStepperGuard(stepIndex: number, guard: StepGuard | null) {
    const { registerGuard } = useStepper()
    React.useEffect(() => {
        registerGuard(stepIndex, guard)
        return () => registerGuard(stepIndex, null)
    }, [registerGuard, stepIndex, guard])
}

export function useStepperDataProvider(stepIndex: number, fn: StepDataProvider | null) {
    const { registerDataProvider } = useStepper()
    React.useEffect(() => {
        registerDataProvider(stepIndex, fn)
        return () => registerDataProvider(stepIndex, null)
    }, [registerDataProvider, stepIndex, fn])
}
