// src/api/auth.ts
import client from "./index";

export type User = {
  _id?: string;
  username?: string;
  email?: string;
  role?: string;
  [k: string]: any;
};

export type LoginResponse = {
  token: string;
  user: User;
};

/**
 * Login helper used by AuthProvider.
 * The server endpoint is expected to accept { username, password } and return
 * { token, user } — if your server uses { email, password } or { username, pin }
 * change the request body accordingly here.
 */
export async function loginApi(
  username: string,
  password: string
): Promise<LoginResponse> {
  const r = await client.post("/api/auth/login", { username, password });
  return r.data as LoginResponse;
}

/**
 * Call /api/auth/me to validate token and get user details.
 * Server should return either `{ user }` or `user` — we assume `{ user }`.
 */
export async function meApi(): Promise<{ user: User }> {
  const r = await client.get("/api/auth/me");
  // accept both shapes
  if (r.data && r.data.user) return r.data as { user: User };
  return { user: r.data as User };
}

/**
 * Optional helper — call server logout if implemented (for completeness).
 * If not implemented server-side, you can ignore/remove.
 */
export async function logoutApi(): Promise<void> {
  try {
    await client.post("/api/auth/logout");
  } catch (err) {
    // ignore server logout errors — we'll still clear local state client-side
  }
}
