// server/src/scripts/auth_header.ts
/**
 * Bearer header for scripts that call the protected scrape/ingest routes.
 *
 *   SCRAPE_TOKEN=<jwt>                         use an existing token, or
 *   SCRAPE_USERNAME=... SCRAPE_PASSWORD=...    log in and use the returned token
 *
 * The account must have the instructor or admin role.
 */
import axios from "axios";

export async function getAuthHeaders(
  host: string
): Promise<Record<string, string>> {
  const token = process.env.SCRAPE_TOKEN;
  if (token) return { Authorization: `Bearer ${token}` };

  const username = process.env.SCRAPE_USERNAME;
  const password = process.env.SCRAPE_PASSWORD;
  if (!username || !password) {
    throw new Error(
      "POST /api/scrape needs an instructor or admin token. Set SCRAPE_TOKEN, or SCRAPE_USERNAME and SCRAPE_PASSWORD."
    );
  }
  const r = await axios.post(`${host.replace(/\/$/, "")}/api/auth/login`, {
    username,
    password,
  });
  return { Authorization: `Bearer ${r.data.token}` };
}
