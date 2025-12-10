// src/api/admin.ts
import client from "./index";

export type AdminUser = {
  _id?: string;
  username?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

export async function adminListUsers(): Promise<AdminUser[]> {
  const r = await client.get("/api/users");
  return Array.isArray(r.data) ? r.data : r.data?.users ?? [];
}

export async function adminUpdateUser(id: string, patch: Partial<AdminUser>) {
  const r = await client.put(`/api/users/${id}`, patch);
  return r.data;
}

export async function adminDeleteUser(id: string) {
  const r = await client.delete(`/api/users/${id}`);
  return r.data;
}

export async function adminGetDashboard() {
  const r = await client.get("/api/dashboard");
  return r.data;
}

export async function adminGetSystemStatus() {
  // best-effort endpoint; may not exist server-side
  const r = await client.get("/api/admin/system/status");
  return r.data;
}

export async function adminTriggerBackup() {
  const r = await client.post("/api/admin/system/backup");
  return r.data;
}
