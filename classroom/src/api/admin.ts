// src/api/admin.ts
import api from "./index";
import type { AxiosResponse } from "axios";

export type AdminUser = {
  _id?: string;
  username?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  [k: string]: any;
};

type ApiResult<T> = T;

/** Helper to normalize axios responses and throw a readable Error on failure */
async function handleResponse<T>(p: Promise<AxiosResponse<T>>): Promise<T> {
  try {
    const res = await p;
    return res.data;
  } catch (err: any) {
    // prefer structured server error fields when available
    const serverMsg =
      err?.response?.data?.error ?? err?.response?.data?.message ?? null;
    const status = err?.response?.status;
    const message = serverMsg ?? err?.message ?? "API request failed";
    const e = new Error(String(message));
    // attach status for callers that want to inspect it
    (e as any).status = status;
    throw e;
  }
}

/**
 * GET /api/admin/users
 */
export async function adminListUsers(): Promise<ApiResult<AdminUser[]>> {
  return handleResponse<AdminUser[]>(api.get("/api/admin/users"));
}

/**
 * POST /api/admin/users
 * payload: { username, email?, password, role? }
 */
export async function adminCreateUser(payload: {
  username: string;
  email?: string;
  password: string;
  role?: string;
}): Promise<ApiResult<AdminUser>> {
  return handleResponse<AdminUser>(api.post("/api/admin/users", payload));
}

/**
 * PUT /api/admin/users/:id
 * payload can contain fields to update (role, username, email, etc.)
 */
export async function adminUpdateUser(
  id: string,
  payload: Partial<AdminUser>
): Promise<ApiResult<AdminUser>> {
  return handleResponse<AdminUser>(
    api.put(`/api/admin/users/${encodeURIComponent(id)}`, payload)
  );
}

/**
 * DELETE /api/admin/users/:id
 * returns whatever the server responds with (commonly { ok: true })
 */
export async function adminDeleteUser(id: string): Promise<ApiResult<any>> {
  return handleResponse<any>(
    api.delete(`/api/admin/users/${encodeURIComponent(id)}`)
  );
}

/* ---------------------------------------------------------------------------
   Admin dashboard & system endpoints (added to match front-end imports)
   ---------------------------------------------------------------------------
   Note: these expect real server endpoints. If your server uses different
   paths, update them here to match.
*/

/**
 * GET /api/admin/dashboard
 * Returns dashboard payload useful for ingest/admin UI (widgets, stats, etc).
 */
export async function adminGetDashboard(): Promise<ApiResult<any>> {
  return handleResponse<any>(api.get("/api/admin/dashboard"));
}

/**
 * GET /api/admin/system
 * Returns system status information (uptime, lastBackup, queue sizes, etc).
 * Frontend: src/pages/admin/SystemStatus.tsx calls this.
 */
export async function adminGetSystemStatus(): Promise<ApiResult<any>> {
  return handleResponse<any>(api.get("/api/admin/system"));
}

/**
 * POST /api/admin/backup
 * Trigger server-side backup / maintenance job. Server should accept the
 * request and return job info or confirmation.
 */
export async function adminTriggerBackup(
  payload?: Record<string, any>
): Promise<ApiResult<any>> {
  // payload optional; server may accept options like { force: true }
  return handleResponse<any>(api.post("/api/admin/backup", payload ?? {}));
}
