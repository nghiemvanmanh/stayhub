"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { User, AuthTokens } from "@/interfaces/auth";

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (user: User, tokens: AuthTokens) => void;
    logout: () => void;
    updateTokens: (tokens: AuthTokens) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = "stayhub_access_token";
const REFRESH_TOKEN_KEY = "stayhub_refresh_token";
const USER_KEY = "stayhub_user";

// Helper: set cookie
function setCookie(name: string, value: string, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

// Helper: get cookie
function getCookie(name: string): string | null {
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(name + "="));
    return match ? decodeURIComponent(match.split("=")[1]) : null;
}

// Helper: remove cookie
function removeCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Khởi tạo state từ cookie khi load
    useEffect(() => {
        try {
            const storedUser = getCookie(USER_KEY);
            const accessToken = getCookie(ACCESS_TOKEN_KEY);
            if (storedUser && accessToken) {
                setUser(JSON.parse(storedUser));
            }
        } catch {
            // Cookie không hợp lệ, clear hết
            removeCookie(USER_KEY);
            removeCookie(ACCESS_TOKEN_KEY);
            removeCookie(REFRESH_TOKEN_KEY);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback((user: User, tokens: AuthTokens) => {
        setCookie(ACCESS_TOKEN_KEY, tokens.accessToken);
        setCookie(REFRESH_TOKEN_KEY, tokens.refreshToken);
        setCookie(USER_KEY, JSON.stringify(user));
        setUser(user);
    }, []);

    const logout = useCallback(() => {
        removeCookie(ACCESS_TOKEN_KEY);
        removeCookie(REFRESH_TOKEN_KEY);
        removeCookie(USER_KEY);
        setUser(null);
    }, []);

    const updateTokens = useCallback((tokens: AuthTokens) => {
        setCookie(ACCESS_TOKEN_KEY, tokens.accessToken);
        setCookie(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn: !!user,
                isLoading,
                login,
                logout,
                updateTokens,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth phải được dùng bên trong AuthProvider");
    }
    return context;
}
