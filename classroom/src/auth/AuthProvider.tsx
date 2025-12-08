// src/auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { loginApi, meApi } from "../api/auth";
import { getAuthToken, getAuthUser, setAuth, clearAuth } from "./tokenStorage";

type Role = "admin" | "instructor" | "student" | string;

export interface User {
  _id?: string;
  username: string;
  role: Role;
  email?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getAuthUser());
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [loading, setLoading] = useState<boolean>(!!token && !user);

  // If we have a token but no user, attempt /api/auth/me
  useEffect(() => {
    let mounted = true;
    if (token && !user) {
      setLoading(true);
      meApi()
        .then((data: { user: any }) => {
          if (!mounted) return;
          if (data.user && typeof data.user.username === "string") {
            setUser({
              _id: data.user._id,
              username: data.user.username,
              role: data.user.role,
              email: data.user.email,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        })
        .catch(() => {
          // bad token — clear
          clearAuth();
          setUser(null);
          setToken(null);
          setLoading(false);
        });
    }
    return () => {
      mounted = false;
    };
  }, [token]);

  async function login(username: string, password: string) {
    try {
      const data = await loginApi(username, password);
      // Expect server to return { token, user }
      if (!data?.token) {
        return { ok: false, error: "Invalid server response" };
      }
      setAuth(data.token, data.user);
      setToken(data.token);
      setUser(
        data.user && typeof data.user.username === "string"
          ? {
              _id: data.user._id,
              username: data.user.username,
              role: data.user.role ?? "",
              email: data.user.email,
            }
          : null
      );
      return { ok: true };
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Login failed";
      return { ok: false, error: String(msg) };
    }
  }

  function logout() {
    clearAuth();
    setToken(null);
    setUser(null);
  }

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
