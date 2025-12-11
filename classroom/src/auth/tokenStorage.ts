// src/auth/tokenStorage.ts
const TOKEN_KEY = "token";
const USER_KEY = "user";

/** Get token (or null) */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Get parsed user or null */
export function getAuthUser(): any | null {
  try {
    const s = localStorage.getItem(USER_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

/** Save token + user (user can be object or null) */
export function setAuth(token: string, user: any) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user ?? {}));
  } catch {
    // ignore
  }
}

/** Clear client auth state */
export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}
