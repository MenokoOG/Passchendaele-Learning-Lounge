// src/pages/Register.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function RegisterPage() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await register(username, email, password);
      navigate("/");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto card-surface border border-surface-border p-6 rounded">
      <h2 className="text-xl font-semibold mb-4">Create account</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            className="w-full p-2 rounded border border-surface-border"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="w-full p-2 rounded border border-surface-border"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            className="w-full p-2 rounded border border-surface-border"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>

        <div className="flex items-center justify-end">
          <button className="btn-classroom" type="submit" disabled={busy}>
            {busy ? "Creating..." : "Create account"}
          </button>
        </div>
      </form>
    </div>
  );
}
