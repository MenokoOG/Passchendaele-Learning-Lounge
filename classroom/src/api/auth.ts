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

/**
 * Login — accepts email or username depending on server implementation.
 * Returns { token, user } on success.
 */
export async function loginApi(
  usernameOrEmail: string,
  password: string
): Promise<LoginResponse> {
  const r = await client.post("/api/auth/login", {
    email: usernameOrEmail,
    username: usernameOrEmail,
    emailOrUsername: usernameOrEmail,
    password,
  });
  return r.data as LoginResponse;
}

/**
 * Fetch current authenticated user (server: GET /api/auth/me)
 */
export async function meApi(): Promise<{ user: User }> {
  const r = await client.get("/api/auth/me");
  if (r.data && r.data.user) return r.data as { user: User };
  return { user: r.data as User };
}

/**
 * Update current user's profile (client convenience).
 * Server route in your code: PUT /api/auth/profile
 * Returns updated user object.
 */
export async function updateProfileApi(profile: Partial<User>): Promise<User> {
  const r = await client.put("/api/auth/profile", profile);
  // server returns { ok: true, user } or just user — normalize
  return (r.data && (r.data.user ?? r.data)) as User;
}

/**
 * Optional logout helper (server-side) — not required for client local logout.
 */
export async function logoutApi(): Promise<void> {
  try {
    await client.post("/api/auth/logout");
  } catch {
    // ignore
  }
}
