import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { toast } from "@/hooks/use-toast";

const API_ORIGIN = import.meta.env.VITE_API_BASE || "https://api.jsgallor.com";
const API_BASE = `${API_ORIGIN}/api/luxury`;
const WEBSITE: "affordable" | "mid" | "luxury" = "luxury";

// localStorage keys
const LS_TOKEN_KEY = "luxury_auth_token";
const LS_USER_KEY = "luxury_user";

interface User {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  designation?: string;
  platform?: string;
  vipTier?: string;
  isVip?: boolean;
  isVerified?: boolean;
  avatar?: string;
  authProvider?: "local" | "google";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string
  ) => Promise<boolean>;

  // ✅ Google auth
  googleAuth: (credential: string) => Promise<boolean>;

  logout: () => Promise<void>;
  getProfile: () => Promise<User | null>;
  updateProfile: (data: Partial<User>) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalizeUser(u: User): User {
  return {
    ...u,
    platform: u.platform || WEBSITE,
    avatar:
      u.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email)}`,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = safeParse<User>(localStorage.getItem(LS_USER_KEY));
    return storedUser ? normalizeUser(storedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(LS_TOKEN_KEY);
  });

  const [isLoading, setIsLoading] = useState(true);

  // ✅ Avoid stale token inside apiRequest
  const tokenRef = useRef<string | null>(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const persistAuth = useCallback((nextToken: string | null, nextUser: User | null) => {
    tokenRef.current = nextToken;
    setToken(nextToken);
    setUser(nextUser ? normalizeUser(nextUser) : null);

    if (nextToken) localStorage.setItem(LS_TOKEN_KEY, nextToken);
    else localStorage.removeItem(LS_TOKEN_KEY);

    if (nextUser) localStorage.setItem(LS_USER_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(LS_USER_KEY);
  }, []);

  const logoutLocal = useCallback(
    (showToast = true) => {
      persistAuth(null, null);
      if (showToast) {
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
      }
    },
    [persistAuth]
  );

  const apiRequest = useCallback(
    async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };

      const currentToken = tokenRef.current;
      if (currentToken) (headers as any).Authorization = `Bearer ${currentToken}`;

      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });

      const data: any = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          logoutLocal(false);
        }
        throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
      }

      return data as T;
    },
    [logoutLocal]
  );

  const isAuthenticated = useMemo(() => !!token, [token]);

  // ✅ Boot: if token exists, refresh profile once
  const profileFetchedRef = useRef(false);
  useEffect(() => {
    (async () => {
      try {
        if (token && !profileFetchedRef.current) {
          profileFetchedRef.current = true;
          await getProfile();
        }
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ GET PROFILE
  const getProfile = useCallback(async (): Promise<User | null> => {
    try {
      const data = await apiRequest<{ success: boolean; customer?: User }>("/profile", {
        method: "GET",
      });

      const profile = data.customer ? normalizeUser(data.customer) : null;

      const currentToken = tokenRef.current;
      if (currentToken) persistAuth(currentToken, profile);

      return profile;
    } catch (e) {
      console.error("Failed to fetch profile:", e);
      return null;
    }
  }, [apiRequest, persistAuth]);

  // ✅ LOGIN
  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const data = await apiRequest<{
          success: boolean;
          message?: string;
          token: string;
          customer: User;
        }>("/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        if (!data?.token) throw new Error("Invalid login response (token missing)");
        persistAuth(data.token, data.customer ?? null);

        toast({
          title: "Welcome Back!",
          description: data.message || "You have successfully logged in.",
        });

        await getProfile().catch(() => {});
        return true;
      } catch (err) {
        toast({
          title: "Login Failed",
          description: err instanceof Error ? err.message : "Invalid credentials",
          variant: "destructive",
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiRequest, persistAuth, getProfile]
  );

  // ✅ SIGNUP
  const signup = useCallback(
    async (
      firstName: string,
      lastName: string,
      email: string,
      phone: string,
      password: string,
      confirmPassword: string
    ) => {
      setIsLoading(true);
      try {
        if (password !== confirmPassword) throw new Error("Passwords do not match");

        const data = await apiRequest<{
          success: boolean;
          message?: string;
          token: string;
          customer: User;
        }>("/signup", {
          method: "POST",
          body: JSON.stringify({ firstName, lastName, email, phone, password }),
        });

        if (!data?.token) throw new Error("Invalid signup response (token missing)");
        persistAuth(data.token, data.customer ?? null);

        toast({
          title: "Account Created!",
          description: data.message || "Welcome! Your luxury account has been created.",
        });

        await getProfile().catch(() => {});
        return true;
      } catch (err) {
        toast({
          title: "Signup Failed",
          description: err instanceof Error ? err.message : "Failed to create account",
          variant: "destructive",
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiRequest, persistAuth, getProfile]
  );

  // ✅ GOOGLE AUTH (LOGIN / SIGNUP)
  const googleAuth = useCallback(
    async (credential: string) => {
      if (!credential) {
        toast({ title: "Google Login Failed", description: "Missing credential", variant: "destructive" });
        return false;
      }

      setIsLoading(true);
      try {
        // NOTE: this endpoint is not under /api/luxury
        // Your backend route is: POST /api/auth/google
        const res = await fetch(`${API_ORIGIN}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ credential, website: WEBSITE }),
        });

        const data: any = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || data?.message || "Google authentication failed");

        if (!data?.token) throw new Error("Google auth response missing token");

        const nextUser: User = normalizeUser({
          ...(data.user || {}),
          platform: WEBSITE,
          authProvider: "google",
        });

        persistAuth(data.token, nextUser);

        toast({
          title: "✅ Google Login Success",
          description: "You are logged in with Google.",
        });

        // optional refresh from /api/luxury/profile
        await getProfile().catch(() => {});
        return true;
      } catch (err: any) {
        toast({
          title: "Google Login Failed",
          description: err?.message || "Google authentication failed",
          variant: "destructive",
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [persistAuth, getProfile]
  );

  // ✅ LOGOUT
  const logout = useCallback(async () => {
    try {
      await apiRequest("/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      logoutLocal(true);
    }
  }, [apiRequest, logoutLocal]);

  // ✅ UPDATE PROFILE
  const updateProfile = useCallback(
    async (payload: Partial<User>): Promise<User | null> => {
      try {
        const data = await apiRequest<{ success: boolean; message?: string; customer?: User }>(
          "/profile",
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        const updated = data.customer ? normalizeUser(data.customer) : null;
        if (updated) {
          const currentToken = tokenRef.current;
          persistAuth(currentToken, updated);
        }

        toast({
          title: "Profile Updated",
          description: data.message || "Profile updated successfully.",
        });

        return updated;
      } catch (err) {
        toast({
          title: "Update Failed",
          description: err instanceof Error ? err.message : "Failed to update profile",
          variant: "destructive",
        });
        throw err;
      }
    },
    [apiRequest, persistAuth]
  );

  // ✅ Refresh profile only when tab is visible
  useEffect(() => {
    if (!token) return;

    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      await getProfile();
    };

    const interval = setInterval(tick, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token, getProfile]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated,
      login,
      signup,
      googleAuth,
      logout,
      getProfile,
      updateProfile,
    }),
    [user, token, isLoading, isAuthenticated, login, signup, googleAuth, logout, getProfile, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};