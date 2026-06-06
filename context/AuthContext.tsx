"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  _id: string;
  name: string;
  email: string;
  mobile?: string;

  status: 'pending' | 'approved' | 'rejected';
  role: 'user' | 'admin';
  avatarConfig?: {
    image?: string;
    color?: string;
  };
}

interface LoginResult {
  success: boolean;
  requiresOtp?: boolean;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string, isAdmin?: boolean) => Promise<LoginResult>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ success: false }),
  verifyOtp: async () => false,
  logout: () => {},
  isLoading: true,
  updateUser: () => {},
});

const SESSION_KEY = "callu_session";
const USER_KEY = "callu_user";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const storedSession = localStorage.getItem(SESSION_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession) as { token: string; expiresAt: string };

            // Check if session has expired client-side
            if (parsed?.token && parsed?.expiresAt) {
              const expiryTime = new Date(parsed.expiresAt).getTime();
              const now = Date.now();

              if (expiryTime > now) {
                // Restore cached user immediately so UI doesn't flash logged-out
                if (storedUser) {
                  try {
                    const cachedUser = JSON.parse(storedUser);
                    setUser(cachedUser);
                  } catch {
                    // ignore parse errors, server validation will correct state
                  }
                }

                console.log("[Auth] Session found, validating with server...");
                try {
                  const res = await fetch("/api/auth/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: parsed.token }),
                  });

                  if (res.ok) {
                    const data = await res.json();
                    console.log("[Auth] ✓ Session validated, user:", data.user?.email);
                    setUser(data.user);
                    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
                    setIsLoading(false);
                    return;
                  } else if (res.status === 401 || res.status === 404) {
                    // Only clear on definitive auth failures — session truly invalid/expired
                    console.warn("[Auth] Session rejected by server (", res.status, "), clearing.");
                    localStorage.removeItem(SESSION_KEY);
                    localStorage.removeItem(USER_KEY);
                    setUser(null);
                  } else {
                    // Server error (500, 503, etc.) or Railway cold-start — keep session & cached user
                    console.warn("[Auth] Server error during session check (", res.status, "), keeping cached session.");
                    // User was already restored from cache above; just continue
                    setIsLoading(false);
                    return;
                  }
                } catch (error) {
                  // Network failure (offline, Railway cold-start timeout, etc.)
                  // Keep session and cached user intact — do NOT clear localStorage
                  console.warn("[Auth] Network error during session validation, using cached user:", error);
                  setIsLoading(false);
                  return;
                }
              } else {
                // Client-side expiry check: session definitely expired
                console.warn("[Auth] Stored session expired client-side, clearing...");
                localStorage.removeItem(SESSION_KEY);
                localStorage.removeItem(USER_KEY);
                setUser(null);
              }
            }
          } catch (parseError) {
            console.error("[Auth] Failed to parse stored session:", parseError);
            localStorage.removeItem(SESSION_KEY);
          }
        }

        // Fallback: no session token — restore user from cache if present
        if (storedUser) {
          try {
            const cachedUser = JSON.parse(storedUser);
            console.log("[Auth] Using stored user from cache:", cachedUser.email);
            setUser(cachedUser);
          } catch (parseError) {
            console.error("[Auth] Failed to parse stored user:", parseError);
            localStorage.removeItem(USER_KEY);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, []);

  const login = async (identifier: string, password: string, isAdmin?: boolean): Promise<LoginResult> => {
    try {
      const body = isAdmin
        ? { adminId: identifier, password }
        : { identifier, password };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return { success: false };
      }

      // Admin login — no session token
      if (data.user && data.user.role === "admin") {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { success: true };
      }

      // Regular user — session returned directly
      if (data.user) {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        if (data.sessionToken && data.expiresAt) {
          localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ token: data.sessionToken, expiresAt: data.expiresAt })
          );
        }
        return { success: true };
      }

      toast.error("Unexpected response from server.");
      return { success: false };
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  };

  const verifyOtp = async (email: string, code: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid verification code");
        return false;
      }

      setUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      if (data.sessionToken && data.expiresAt) {
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ token: data.sessionToken, expiresAt: data.expiresAt })
        );
      }
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_KEY);
    router.push("/");
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, verifyOtp, logout, isLoading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
