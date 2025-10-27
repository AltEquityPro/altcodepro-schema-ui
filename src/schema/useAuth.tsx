'use client';
import { useEffect, useCallback, useState, createContext, useContext } from "react";
import { NavigationAPI, UIProject } from "../types";
import { getAuthKey } from "../lib/utils";
import { getStoredAuthToken, refreshAuthToken, storeAuthToken } from "./authUtils";
import { clearAuthToken } from "./useActionHandler";

/* --------------------------------------------------
 🔑 Auth Context Type
-------------------------------------------------- */
interface AuthContextType {
    token?: string ;
    refreshToken: string | null;
    expiresAt: number | null;
    user: any;
    isLoggedIn: boolean;
    login: (token: string, refreshToken?: string, expiresIn?: number) => void;
    logout: () => void;
    refresh: () => Promise<string | null>;
    setUser: (user: any) => void;
    requiresAuth?: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

/* --------------------------------------------------
 🧠 AuthProvider
-------------------------------------------------- */
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
    const [token, setToken] = useState<string | undefined>(undefined);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<number | null>(null);
    const [user, setUser] = useState<any>(null);
    const [initialized, setInitialized] = useState(false);
    const isLoggedIn = !!token && (!expiresAt || Date.now() < expiresAt - 5 * 60 * 1000);

    /* --------------------------------------------------
       🔐 Login / Logout / Refresh
    -------------------------------------------------- */
    const login = useCallback((tkn: string, rt?: string, expiresIn?: number) => {
        const exp = Date.now() + (expiresIn || 3600) * 1000;
        storeAuthToken(globalConfig, { token: tkn, refreshToken: rt, expiresAt: exp });
        setToken(tkn);
        setRefreshToken(rt || null);
        setExpiresAt(exp);
    }, [globalConfig]);

    const logout = useCallback(() => {
        clearAuthToken(globalConfig);
        setToken(undefined);
        setRefreshToken(null);
        setExpiresAt(null);
        setUser(null);
        if (setState) {
            setState("auth.user", null);
            setState("isAuthenticated", false);
            setState("user", null);
        }

        // only redirect if layout or screen explicitly requires login
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

    /* --------------------------------------------------
       🚀 Initialize from stored token
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
        }

        setInitialized(true);

        // 🔁 cross-tab sync
        const onStorage = (e: StorageEvent) => {
            if (e.key === getAuthKey(globalConfig)) {
                const updated = getStoredAuthToken(globalConfig);
                if (updated?.token) {
                    login(
                        updated.token,
                        updated.refreshToken,
                        updated.expiresAt ? (updated.expiresAt - Date.now()) / 1000 : 3600
                    );
                } else logout();
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [globalConfig]);

    /* --------------------------------------------------
       👤 Auto-load user when layout requires auth
    -------------------------------------------------- */
    useEffect(() => {
        const loadProfile = async () => {
            const ds = globalConfig?.profile?.dataSources;
            const url = ds?.apiUrl;
            if (!url) return;

            const method = ds.method || "GET";
            const headers: Record<string, string> = {
                ...(ds.headers || {}),
                Authorization: `Bearer ${token}`,
            };
            const options: any = { method, headers };
            if (ds.credentials) options.credentials = ds.credentials;

            try {
                const res = await fetch(url, options);
                if (!res.ok) {
                    if (res.status === 401 && requiresAuth) {
                        logout();
                        return;
                    }
                    console.warn(`Failed to load user profile: HTTP ${res.status}`);
                    return;
                }

                const profile = await res.json();
                setUser(profile);
                if (setState) {
                    setState("profile", profile);
                    setState("auth.user", profile);
                    setState("user", profile);
                    setState("isAuthenticated", true);
                }
            } catch (err) {
                console.warn("Error fetching user profile:", err);
            }
        };

        if (requiresAuth && token) loadProfile();
    }, [token, globalConfig, requiresAuth]);

    /* --------------------------------------------------
       ⏰ Background refresh
    -------------------------------------------------- */
    useEffect(() => {
        if (!refreshToken) return;
        const id = setInterval(() => {
            if (expiresAt && expiresAt - Date.now() < 5 * 60 * 1000) refresh();
        }, 120000);
        return () => clearInterval(id);
    }, [refreshToken, expiresAt, refresh]);

    /* --------------------------------------------------
       ✅ Context Value
    -------------------------------------------------- */
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
    const loginHref = ctx?.requiresAuth
        ? undefined
        : (ctx as any)?.globalConfig?.auth?.loginHref || "/login";

    // If screen explicitly requires auth, ensure login
    useEffect(() => {
        if (requiresAuth && !ctx.isLoggedIn) {
            if (typeof window !== "undefined") {
                const dest = loginHref || "/login";
                if (nav?.push) nav.push(dest);
                else window.location.href = dest;
            }
        }
    }, [requiresAuth, ctx.isLoggedIn]);

    // Lazy-load user if public layout but screen now needs auth
    useEffect(() => {
        const maybeLoadUser = async () => {
            if (!requiresAuth || ctx.user || !ctx.token) return;
            // load user profile on demand for screens that need it
            try {
                const ds = (ctx as any)?.globalConfig?.profile?.dataSources;
                const url = ds?.apiUrl;
                if (!url) return;

                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${ctx.token}` },
                });
                if (!res.ok) {
                    if (res.status === 401) ctx.logout();
                    return;
                }
                const profile = await res.json();
                ctx.setUser(profile);
            } catch (e) {
                console.warn("Failed to fetch user on-demand", e);
            }
        };
        maybeLoadUser();
    }, [requiresAuth, ctx.token]);

    return ctx;
}
