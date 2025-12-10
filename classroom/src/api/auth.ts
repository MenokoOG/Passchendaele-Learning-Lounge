// src/api/auth.ts
import client from "./index";

export type Prefs = {
  theme?: string;
  notificationsEnabled?: boolean;
  [k: string]: any;
};

export type User = {
  _id?: string;
  username?: string;
  email?: string;
  role?: string;
  preferences?: Prefs;
  [k: string]: any;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export async function loginApi(
  username: string,
  password: string
): Promise<LoginResponse> {
  const r = await client.post("/api/auth/login", { username, password });
  return r.data as LoginResponse;
}

export async function meApi(): Promise<{ user: User }> {
  const r = await client.get("/api/auth/me");
  if (r.data && r.data.user) return r.data as { user: User };
  return { user: r.data as User };
}

/**
 * Update current user's profile (including preferences). Server route: PUT /api/users/me
 * Returns the updated user object (no passwordHash).
 */
export async function updateProfileApi(profile: Partial<User>): Promise<User> {
  const r = await client.put("/api/users/me", profile);
  return r.data as User;
}

/**
 * Optional logout helper (server-side) — not required for client local logout.
 */
export async function logoutApi(): Promise<void> {
  try {
    await client.post("/api/auth/logout");
  } catch (err) {
    // ignore
  }
}
