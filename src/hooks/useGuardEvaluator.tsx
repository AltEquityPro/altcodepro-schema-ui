// useGuardEvaluator.ts
'use client';
import { createContext, useContext, useMemo } from "react";
import { GuardRule, AnyObj, RedirectSpec } from "../types";
import { resolveBinding } from "../lib/utils";

export interface GuardResult {
    ok: boolean;
    onFail?: RedirectSpec;
    reasons?: string[];
}

export function useGuardEvaluator(guard: GuardRule | undefined, state: AnyObj, t: (k: string) => string): GuardResult {
    return useMemo(() => {
        if (!guard) return { ok: true };

        const results: boolean[] = [];
        const reasons: string[] = [];

        if (guard.requireAuth) {
            const token = state?.auth?.token || state?.authToken;
            const valid = !!token && token.length > 10;
            results.push(valid);
            if (!valid) reasons.push("auth_missing");
        }

        if (guard.requireOrganization) {
            const org = state?.organization || state?.org;
            const ok = !!org?.id || !!org?.name;
            results.push(ok);
            if (!ok) reasons.push("org_missing");
        }

        if (guard.requireConsents?.length) {
            for (const key of guard.requireConsents) {
                const val = state?.consents?.[key];
                const ok = !!val;
                results.push(ok);
                if (!ok) reasons.push(`consent_${key}_missing`);
            }
        }

        if (guard.requireOtp) {
            const ok = !!state?.auth?.otpVerified;
            results.push(ok);
            if (!ok) reasons.push("otp_not_verified");
        }

        if (guard.conditions?.length) {
            for (const c of guard.conditions) {
                const key = resolveBinding(c.key, state, t);
                const val = resolveBinding(c.value, state, t);
                let condOk = true;
                switch (c.op) {
                    case "==": condOk = key === val; break;
                    case "!=": condOk = key !== val; break;
                    case ">": condOk = key > val; break;
                    case "<": condOk = key < val; break;
                    case ">=": condOk = key >= val; break;
                    case "<=": condOk = key <= val; break;
                    case "exists": condOk = key != null; break;
                    case "not_exists": condOk = key == null; break;
                    case "matches": condOk = new RegExp(val).test(String(key ?? "")); break;
                    case "in": condOk = Array.isArray(val) && val.includes(key); break;
                    case "not_in": condOk = Array.isArray(val) && !val.includes(key); break;
                }
                results.push(condOk);
                if (!condOk) reasons.push(`condition_${c.key}_fail`);
            }
        }

        if (guard.dataSourceId) {
            const dsVal = state?.[guard.dataSourceId];
            if (dsVal === undefined) {
                // guard still loading — mark as pending but not failed
                reasons.push(`datasource_${guard.dataSourceId}_pending`);
            } else {
                const ok = Boolean(dsVal && (dsVal.ok !== false));
                results.push(ok);
                if (!ok) reasons.push(`datasource_${guard.dataSourceId}_fail`);
            }
        }

        const ok = guard.mode === "any" ? results.some(Boolean) : results.every(Boolean);
        return { ok, onFail: guard.onFail, reasons };
    }, [guard, state, t]);
}

export function useGuardStatus() {
    return useContext(GuardContext)?.lastResult;
}

export const GuardContext = createContext<{ lastResult?: GuardResult }>({});
export const useGuardContext = () => useContext(GuardContext);

export function GuardProvider({ result, children }: { result: GuardResult, children: React.ReactNode }) {
    return <GuardContext.Provider value={{ lastResult: result }}>{children}</GuardContext.Provider>;
}