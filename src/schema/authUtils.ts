import { getAuthKey } from "../lib/utils";
import { UIProject } from "../types";

export type StoredAuth = {
    token?: string;
    refreshToken?: string;
    expiresAt?: number; // epoch in ms
};
export function decodeJwtExp(token: string): number | null {
    try {
        if (!token) return Date.now() + 3600 * 1000;
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload?.exp ? payload.exp * 1000 : Date.now() + 3600 * 1000;
    } catch {
        return Date.now() + 3600 * 1000;
    }
}

export async function refreshAuthToken(globalConfig: UIProject["globalConfig"], refreshToken: string): Promise<StoredAuth | null> {
    try {
        const tokenUrl = globalConfig?.auth?.oidc?.tokenUrl;
        if (!tokenUrl) return null;
        const clientId =
            typeof globalConfig?.auth?.oidc?.clientId === "string"
                ? globalConfig.auth.oidc.clientId
                : (globalConfig?.auth?.oidc?.clientId as any)?.binding || "";


        const res = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: clientId,
            }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const expiresAt =
            data.expires_in && !isNaN(data.expires_in)
                ? Date.now() + data.expires_in * 1000
                : undefined;

        return {
            token: data.access_token || data.id_token,
            refreshToken: data.refresh_token || refreshToken,
            expiresAt,
        };
    } catch (e) {
        console.error("Token refresh failed:", e);
        return null;
    }
}

export function storeAuthToken(globalConfig: UIProject["globalConfig"], auth: StoredAuth) {
    if (!auth) return;
    const authKey = getAuthKey(globalConfig);
    const storageType = globalConfig?.auth?.tokenStorage || "localStorage";
    const data = JSON.stringify(auth);

    switch (storageType) {
        case "cookie":
            document.cookie = `${authKey}=${btoa(data)}; path=/; SameSite=Lax`;
            break;
        case "memory":
            (window as any).__memoryAuth = data;
            break;
        default:
            try {
                localStorage.setItem(authKey, data);
            } catch {
                console.warn("LocalStorage unavailable; falling back to memory store");
                (window as any).__memoryAuth = data;
            }
    }
}

export function getStoredAuthToken(globalConfig: UIProject["globalConfig"]): StoredAuth | null {
    const authKey = getAuthKey(globalConfig);
    const storageType = globalConfig?.auth?.tokenStorage || "localStorage";
    let data: string | null = null;
    switch (storageType) {
        case "cookie":
            const match = document.cookie.match(new RegExp(`(^| )${authKey}=([^;]+)`));
            data = match ? atob(match[2]) : null;
            break;
        case "memory":
            data = (window as any).__memoryAuth || null;
            break;
        default:
            data = localStorage.getItem(authKey);
    }
    try {
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}


export function clearAuthToken(globalConfig: UIProject["globalConfig"]) {
    const authKey = getAuthKey(globalConfig);
    const storageType = globalConfig?.auth?.tokenStorage || "localStorage";

    switch (storageType) {
        case "cookie":
            document.cookie = `${authKey}=; Max-Age=0; path=/`;
            break;
        case "memory":
            delete (window as any).__memoryAuth;
            break;
        default:
            localStorage.removeItem(authKey);
    }
}