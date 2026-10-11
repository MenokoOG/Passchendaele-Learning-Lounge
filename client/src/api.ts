import axios from "axios";

const API = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/$/,
  ""
);

const TOKEN_KEY = "scraper_token";

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function signOut() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Log in with an instructor or admin account; the token lives for this tab only. */
export async function signIn(username: string, password: string) {
  const res = await axios.post(`${API}/api/auth/login`, { username, password });
  const role = res.data?.user?.role;
  if (role !== "instructor" && role !== "admin") {
    throw new Error("This account is not an instructor or admin.");
  }
  sessionStorage.setItem(TOKEN_KEY, res.data.token);
  return res.data.user as { username: string; role: string };
}

export async function runScrapeRequest() {
  // Adjust method/path to match your backend. Here we call GET /api/scrape
  const res = await axios.get(`${API}/api/scrape`);
  return res.data;
}

export async function listRaw() {
  const res = await axios.get(`${API}/api/raw`);
  return res.data;
}

export async function exportRaw() {
  const res = await axios.get(`${API}/api/raw/export`);
  return res.data;
}

export async function rewrite(
  id: string,
  style?: string,
  voiceSample?: string
) {
  const res = await axios.post(`${API}/api/raw/${id}/rewrite`, {
    style,
    voiceSample,
  });
  return res.data;
}

export async function scrapeLinks(
  links: Array<{ title: string; url: string }>
) {
  const res = await axios.post(
    `${API}/api/scrape`,
    { links, processNow: true, delayMs: 1500 },
    {
      timeout: 900000,
      headers: { Authorization: `Bearer ${getToken() ?? ""}` },
    }
  );
  return res.data;
}

export async function listSources() {
  const res = await axios.get(`${API}/api/scrape/sources`);
  return res.data as { nations: Record<string, string>; sources: any[] };
}
