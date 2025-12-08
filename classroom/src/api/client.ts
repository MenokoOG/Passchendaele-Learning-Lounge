// classroom/src/api/client.ts
import axios from "axios";

const API = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/$/,
  ""
);

const TOKEN_KEY = "token"; // keep same key used elsewhere

export const client = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically if present in localStorage
client.interceptors.request.use((cfg) => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      cfg.headers = cfg.headers || {};
      (cfg.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return cfg;
});

// On 401, clear local token so UI can react (optional: emit an event)
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("user");
      } catch {}
    }
    return Promise.reject(err);
  }
);

export default client;
