// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await auth.login(identifier.trim(), password);
    setBusy(false);
    if (res.ok) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || "Login failed");
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Sign in</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email or Username</label>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full p-2 border border-surface-border rounded"
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-surface-border rounded"
            autoComplete="current-password"
            required
          />
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="flex items-center gap-3">
          <button className="btn-classroom" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <button
            type="button"
            onClick={() => {
              // Fill with seeded admin credentials (adjust if your seed uses different values)
              setIdentifier("admin"); // or "admin@example.com"
              setPassword("password"); // same as your seed script
            }}
            className="btn-surface"
          >
            Fill test
          </button>
        </div>
      </form>
    </div>
  );
}
