// src/auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { loginApi, meApi, updateProfileApi } from "../api/auth";
import { apiRegister } from "../api"; // <-- use central client register
import { getAuthToken, getAuthUser, setAuth, clearAuth } from "./tokenStorage";

type Role = "admin" | "instructor" | "student" | string;

export type Prefs = {
  fontSize?: number;
  reducedMotion?: boolean;
  theme?: "light" | "dark" | string;
  [k: string]: any;
};

export interface User {
  _id?: string;
  username?: string;
  role?: Role;
  email?: string;
  preferences?: Prefs;
  [k: string]: any;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (
    usernameOrEmail: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  setUser: (u: User | null) => void;
  updateProfile?: (profile: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

/** Type guard for theme */
function isTheme(value: unknown): value is "light" | "dark" {
  return value === "light" || value === "dark";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getAuthUser());
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [loading, setLoading] = useState<boolean>(!!token && !user);

  useEffect(() => {
    let mounted = true;
    if (token && !user) {
      setLoading(true);
      meApi()
        .then((data: { user: any }) => {
          if (!mounted) return;
          const u = data.user;
          if (u && typeof u.username === "string") {
            const rawTheme = u?.preferences?.theme;
            setUser({
              _id: u._id,
              username: u.username,
              role: u.role,
              email: u.email,
              preferences: {
                ...(u.preferences ?? {}),
                theme: isTheme(rawTheme) ? rawTheme : undefined,
              },
            });
          } else {
            setUser(null);
          }
        })
        .catch(() => {
          clearAuth();
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [token, user]);

  async function login(usernameOrEmail: string, password: string) {
    try {
      const data = await loginApi(usernameOrEmail, password);
      if (!data?.token) return { ok: false, error: "Invalid server response" };
      setAuth(data.token, data.user);
      setToken(data.token);

      const rawTheme = data.user?.preferences?.theme;
      setUser({
        _id: data.user._id,
        username: data.user.username,
        role: data.user.role ?? "",
        email: data.user.email,
        preferences: {
          ...(data.user.preferences ?? {}),
          theme: isTheme(rawTheme) ? rawTheme : undefined,
        },
      });
      return { ok: true };
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Login failed";
      return { ok: false, error: String(msg) };
    }
  }

  async function register(username: string, email: string, password: string) {
    try {
      // use the centralized api client so baseURL / proxy / interceptors are honored
      const r = await apiRegister(username, email, password);
      // apiRegister returns r.data; server returns { token, user } — normalize
      const token = r?.token ?? r?.data?.token;
      const userObj = r?.user ?? r?.data?.user ?? r?.data ?? null;
      if (!token) return { ok: false, error: "Invalid server response" };

      setAuth(token, userObj);
      setToken(token);
      setUser({
        _id: userObj?._id,
        username: userObj?.username,
        role: userObj?.role ?? "",
        email: userObj?.email,
        preferences: userObj?.preferences ?? {},
      });

      return { ok: true };
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ?? err?.message ?? "Register failed";
      return { ok: false, error: String(msg) };
    }
  }

  function logout() {
    clearAuth();
    setToken(null);
    setUser(null);
  }

  const updateProfile = async (profile: Partial<User>) => {
    try {
      const updated = await updateProfileApi(profile);
      if (updated) {
        const mergedPrefs = {
          ...(updated.preferences ?? user?.preferences ?? {}),
        };
        const rawTheme = updated.preferences?.theme ?? user?.preferences?.theme;
        const merged: User = {
          ...(user || {}),
          ...updated,
          preferences: {
            ...mergedPrefs,
            theme: isTheme(rawTheme) ? rawTheme : undefined,
          },
        };
        setUser(merged);
        try {
          setAuth(token ?? "", merged);
        } catch {}
      }
    } catch (err) {
      console.error("updateProfile failed", err);
      throw err;
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    setUser,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
