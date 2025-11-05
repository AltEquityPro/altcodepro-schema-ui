'use client';
import { useEffect, useCallback, useState, createContext, useContext, useRef } from "react";
import { NavigationAPI, UIProject } from "../types";
import { getAuthKey } from "../lib/utils";
import { getStoredAuthToken, refreshAuthToken, storeAuthToken, clearAuthToken } from "./authUtils";

interface AuthContextType {
    token?: string;
    refreshToken: string | null;
    expiresAt: number | null;
    user: any;
    isLoggedIn: boolean;
    login: (token: string, refreshToken?: string, expiresIn?: number) => void;
    logout: () => void;
    refresh: () => Promise<string | null>;
    setUser: (user: any) => void;
    requiresAuth?: boolean;
    reloadProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null);
const decodeJwtExp = (tkn: string): number | null => {
    try {
        const payload = JSON.parse(atob(tkn.split('.')[1]));
        if (payload.exp) return payload.exp * 1000;
    } catch { }
    return null;
};

export function AuthProvider({
    children,
    requiresAuth = false,
    globalConfig,
    setState,
    nav,
}: {
    requiresAuth?: boolean;
    children: React.ReactNode;
    globalConfig?: UIProject["globalConfig"];
    setState?: (path: string, value: any) => void;
    nav?: NavigationAPI;
}) {
    const [token, setToken] = useState<string | undefined>();
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<number | null>(null);
    const [user, setUser] = useState<any>(null);
    const [initialized, setInitialized] = useState(false);
    const hasLoadedProfile = useRef(false);

    const isLoggedIn = !!token && (!expiresAt || Date.now() < expiresAt - 5 * 60 * 1000);

    /* --------------------------------------------------
    Login / Logout / Refresh
    -------------------------------------------------- */
    const login = useCallback(
        (tkn: string, rt?: string, expiresIn?: number) => {
            const exp = decodeJwtExp(tkn) || Date.now() + (expiresIn || 3600) * 1000;
            storeAuthToken(globalConfig, { token: tkn, refreshToken: rt, expiresAt: exp });
            setToken(tkn);
            setRefreshToken(rt || null);
            setExpiresAt(exp);
        },
        [globalConfig]
    );

    const logout = useCallback(() => {
        clearAuthToken(globalConfig);
        setToken(undefined);
        setRefreshToken(null);
        setExpiresAt(null);
        setUser(null);
        hasLoadedProfile.current = false;

        if (setState) {
            setState("auth.user", null);
            setState("isAuthenticated", false);
            setState("user", null);
        }
        if (requiresAuth) {
            const loginHref = globalConfig?.auth?.loginHref || "/login";
            if (nav?.push) nav.push(loginHref);
            else if (typeof window !== "undefined") window.location.href = loginHref;
        }
    }, [globalConfig, setState, nav, requiresAuth]);


    const refresh = useCallback(async () => {
        if (!refreshToken) return null;
        const refreshed = await refreshAuthToken(globalConfig, refreshToken);
        if (refreshed?.token) {
            storeAuthToken(globalConfig, refreshed);
            setToken(refreshed.token);
            setRefreshToken(refreshed.refreshToken || null);
            setExpiresAt(refreshed.expiresAt || null);
            try {
                const pl = JSON.parse(atob(refreshed.token.split(".")[1]));
                window.dispatchEvent(new CustomEvent("authRefreshed", { detail: pl }));
            } catch { }
            return refreshed.token;
        }
        logout();
        return null;
    }, [globalConfig, refreshToken, logout]);

    const loadProfile = useCallback(async () => {
        const ds = globalConfig?.profile?.dataSources;
        if (!token || !ds?.apiUrl) return;

        const headers: Record<string, string> = {
            ...(ds.headers || {}),
            Authorization: `Bearer ${token}`,
        };

        try {
            const res = await fetch(ds.apiUrl, { method: ds.method || "GET", headers });
            if (!res.ok) {
                if (res.status === 401) logout();
                return;
            }
            const profile = await res.json();
            setUser(profile);
            setState?.("profile", profile);
            setState?.("auth.user", profile);
            setState?.("user", profile);
            setState?.("isAuthenticated", true);
        } catch (err) {
            console.warn("Error fetching user profile:", err);
        }
    }, [globalConfig, token, logout, setState]);

    /* --------------------------------------------------
    Initialize from stored token (fixed)
    -------------------------------------------------- */
    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = getStoredAuthToken(globalConfig);
        if (stored?.token) {
            login(
                stored.token,
                stored.refreshToken,
                stored.expiresAt ? (stored.expiresAt - Date.now()) / 1000 : 3600
            );
            if (!hasLoadedProfile.current) {
                hasLoadedProfile.current = true;
                loadProfile();
            }
        }
        setInitialized(true);
    }, [globalConfig, login, loadProfile]);

    /* --------------------------------------------------
    Cross-tab sync
    -------------------------------------------------- */
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === getAuthKey(globalConfig)) {
                const updated = getStoredAuthToken(globalConfig);
                if (updated?.token) {
                    login(
                        updated.token,
                        updated.refreshToken,
                        updated.expiresAt ? (updated.expiresAt - Date.now()) / 1000 : 3600
                    );
                    loadProfile();
                } else logout();
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [globalConfig, login, logout, loadProfile]);

    /* --------------------------------------------------
    Auto-load user when token changes
    -------------------------------------------------- */
    useEffect(() => {
        if (initialized && token && !hasLoadedProfile.current) {
            hasLoadedProfile.current = true;
            loadProfile();
        }
    }, [initialized, token, loadProfile]);

    /* --------------------------------------------------
    Background refresh
    -------------------------------------------------- */
    useEffect(() => {
        if (!refreshToken) return;
        const id = setInterval(() => {
            if (expiresAt && expiresAt - Date.now() < 5 * 60 * 1000) refresh();
        }, 120000);
        return () => clearInterval(id);
    }, [refreshToken, expiresAt, refresh]);

    const value: AuthContextType = {
        token,
        refreshToken,
        expiresAt,
        user,
        isLoggedIn,
        login,
        logout,
        refresh,
        setUser,
        requiresAuth,
        reloadProfile: loadProfile,
    };

    if (requiresAuth && !initialized) {
        return (
            <div className="flex h-screen w-full items-center justify-center text-muted-foreground">
                Loading session...
            </div>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* --------------------------------------------------
 💡 Hook: useAuth({ requiresAuth })
-------------------------------------------------- */
export function useAuth(options?: { requiresAuth?: boolean; nav?: NavigationAPI }) {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");

    const { requiresAuth, nav } = options || {};
    const loginHref = ctx.requiresAuth
        ? undefined
        : (ctx as any)?.globalConfig?.auth?.loginHref || "/login";

    useEffect(() => {
        if (requiresAuth && !ctx.isLoggedIn) {
            const dest = loginHref || "/login";
            if (nav?.push) nav.push(dest);
            else window.location.href = dest;
        }
    }, [requiresAuth, ctx.isLoggedIn, nav, loginHref]);

    return ctx;
}
