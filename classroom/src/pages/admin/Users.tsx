// src/pages/admin/Users.tsx
import React, { useEffect, useState } from "react";
import {
  adminListUsers,
  adminUpdateUser,
  adminDeleteUser,
  AdminUser,
} from "../../api/admin";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await adminListUsers();
      setUsers(Array.isArray(r) ? r : []);
    } catch (err: any) {
      console.error("adminListUsers error", err);
      setError(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeRole(id: string, role: string) {
    setSavingId(id);
    setError(null);
    try {
      const updated = await adminUpdateUser(id, { role });
      setUsers((s) =>
        s.map((u) => (String(u._id) === String(id) ? { ...u, ...updated } : u))
      );
    } catch (err: any) {
      console.error("update user failed", err);
      setError("Update failed");
    } finally {
      setSavingId(null);
    }
  }

  async function onDelete(id?: string) {
    if (!id) return;
    if (!confirm("Delete user? This cannot be undone.")) return;
    const prev = users;
    setUsers((s) => s.filter((u) => String(u._id) !== String(id)));
    try {
      await adminDeleteUser(String(id));
    } catch (err) {
      console.error("delete user failed", err);
      setUsers(prev);
      setError("Delete failed");
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Admin — Users</h2>

      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

      {loading ? (
        <div className="text-classroom-muted">Loading users…</div>
      ) : users.length === 0 ? (
        <div className="text-classroom-muted">No users found.</div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u._id}
              className="card-surface border border-surface-border p-3 rounded flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {u.username}{" "}
                  {u.email ? (
                    <span className="text-sm text-classroom-muted">
                      ({u.email})
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-classroom-muted mt-1">
                  Created:{" "}
                  {u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  aria-label={`Select role for ${u.username}`}
                  value={u.role ?? "student"}
                  onChange={(e) => changeRole(String(u._id), e.target.value)}
                  disabled={savingId === String(u._id)}
                  className="p-1 rounded border border-surface-border text-sm"
                >
                  <option value="student">student</option>
                  <option value="instructor">instructor</option>
                  <option value="admin">admin</option>
                </select>

                <button
                  className="btn-surface text-xs px-2 py-1"
                  onClick={() => onDelete(u._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
