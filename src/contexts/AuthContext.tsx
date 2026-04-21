"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    ReactNode,
} from "react";
import { User, AuthTokens } from "@/interfaces/auth";
import Cookies from "js-cookie";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO } from "@/constants/cookie";
import { getRolesFromToken, getSubscriptionFromToken } from "@/lib/tokenUtils";

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    roles: string[];
    isHost: boolean;
    isAdmin: boolean;
    subscription: string;
    login: (user: User, tokens: AuthTokens) => void;
    logout: () => void;
    updateTokens: (tokens: AuthTokens) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [subscription, setSubscription] = useState<string>("FREE");
    const [isLoading, setIsLoading] = useState(true);

    const isHost = useMemo(() => roles.includes("ROLE_HOST"), [roles]);
    const isAdmin = useMemo(() => roles.includes("ROLE_ADMIN"), [roles]);
    // Khởi tạo state từ cookie khi load
    useEffect(() => {
        try {
            const storedUser = Cookies.get(USER_INFO);
            const accessToken = Cookies.get(ACCESS_TOKEN_KEY);
            if (storedUser && accessToken) {
                setUser(JSON.parse(storedUser));
                setRoles(getRolesFromToken(accessToken));
                setSubscription(getSubscriptionFromToken(accessToken));
            }
        } catch {
            // Cookie không hợp lệ, clear hết
            Cookies.remove(USER_INFO);
            Cookies.remove(ACCESS_TOKEN_KEY);
            Cookies.remove(REFRESH_TOKEN_KEY);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback((user: User, { accessToken, refreshToken }: AuthTokens) => {
        Cookies.set(ACCESS_TOKEN_KEY, accessToken);
        Cookies.set(REFRESH_TOKEN_KEY, refreshToken);
        Cookies.set(USER_INFO, JSON.stringify(user));
        setUser(user);
        setRoles(getRolesFromToken(accessToken));
        setSubscription(getSubscriptionFromToken(accessToken));
    }, []);

    const logout = useCallback(() => {
        Cookies.remove(ACCESS_TOKEN_KEY);
        Cookies.remove(REFRESH_TOKEN_KEY);
        Cookies.remove(USER_INFO);
        setUser(null);
        setRoles([]);
        setSubscription("FREE");
    }, []);

    const updateTokens = useCallback(({ accessToken, refreshToken }: AuthTokens) => {
        Cookies.set(ACCESS_TOKEN_KEY, accessToken);
        Cookies.set(REFRESH_TOKEN_KEY, refreshToken);
        setRoles(getRolesFromToken(accessToken));
        setSubscription(getSubscriptionFromToken(accessToken));
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn: !!user,
                isLoading,
                roles,
                isHost,
                isAdmin,
                subscription,
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
