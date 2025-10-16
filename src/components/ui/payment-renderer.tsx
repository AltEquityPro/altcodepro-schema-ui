"use client"

import React, { useEffect, useMemo } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { AnyObj, EventHandler, PaymentElement } from "../../types"
import { resolveBinding } from "../../lib/utils"

export const PaymentFormRenderer = React.memo(function PaymentFormRenderer({
    element,
    runEventHandler,
    state,
    t,
}: {
    element: PaymentElement
    state: AnyObj
    runEventHandler?: (
        handler?: EventHandler | undefined,
        dataOverride?: AnyObj
    ) => Promise<void>
    t: (k: string) => string
}) {
    const publicKey =
        (resolveBinding(element.publicKey, state, t) as string) ||
        process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ||
        ""

    const checkoutUrl = resolveBinding(element.checkoutUrl, state, t) as string
    const sessionId = resolveBinding(element.sessionId, state, t) as string

    const stripePromise = useMemo(() => {
        return publicKey ? loadStripe(publicKey) : null
    }, [publicKey])

    // 🔹 Detect redirect return
    useEffect(() => {
        if (typeof window === "undefined") return
        const params = new URLSearchParams(window.location.search)
        const successParam = element.successParam || "success"
        const cancelParam = element.cancelParam || "canceled"

        if (params.get(successParam) !== null && element.onSuccess) {
            runEventHandler?.(element.onSuccess, { query: Object.fromEntries(params) })
        } else if (params.get(cancelParam) !== null && element.onCancel) {
            runEventHandler?.(element.onCancel, { query: Object.fromEntries(params) })
        }

        if (element.onReturn) {
            runEventHandler?.(element.onReturn, { query: Object.fromEntries(params) })
        }
    }, [element, runEventHandler])

    const handleCheckout = async () => {
        try {
            if (checkoutUrl) {
                // Direct URL redirect
                window.location.href = checkoutUrl
                return
            }

            if (sessionId && stripePromise) {
                const stripe = await stripePromise
                if (!stripe) throw new Error("Stripe failed to initialize")
                const { error } = await stripe.redirectToCheckout({ sessionId })
                if (error && element.onError) {
                    await runEventHandler?.(element.onError, { error })
                }
                return
            }

            throw new Error("No checkoutUrl or sessionId provided")
        } catch (err: any) {
            if (element.onError) {
                await runEventHandler?.(element.onError, { error: err })
            }
        }
    }

    return (
        <div style={{ zIndex: element.zIndex }}>
            <button
                className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                onClick={handleCheckout}
            >
                {resolveBinding(element.buttonLabel, state, t) || "Checkout"}
            </button>
        </div>
    )
})
