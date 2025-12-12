// server/src/utils/robots_check.ts
import axios from "axios";

/**
 * Very small robots.txt checker:
 * - fetches /robots.txt
 * - finds the most-relevant User-agent block (exact match then '*')
 * - checks Disallow rules (prefix match)
 *
 * Returns true if allowed, false if disallowed.
 *
 * Note: this is intentionally conservative/simple (no Crawl-Delay, no sitemap usage).
 */

export async function isUrlAllowed(
  url: string,
  userAgent = "google-tee-bot/1.0"
): Promise<boolean> {
  try {
    const u = new URL(url);
    const robotsUrl = `${u.protocol}//${u.host}/robots.txt`;

    const resp = await axios.get(robotsUrl, {
      timeout: 5000,
      validateStatus: () => true,
    });
    if (resp.status !== 200) {
      // No robots.txt or unreachable -> allow by default (change to `false` to be stricter)
      return true;
    }

    const txt = String(resp.data || "");
    // split into lines and normalize
    const lines = txt.split(/\r?\n/).map((l: string) => l.trim());

    // parse simple blocks: user-agent lines followed by Disallow lines until next user-agent
    type Block = { agents: string[]; disallows: string[] };
    const blocks: Block[] = [];
    let cur: Block | null = null;

    for (const rawLine of lines) {
      if (!rawLine || rawLine.startsWith("#")) continue;
      const [kRaw, ...vParts] = rawLine.split(":");
      if (!kRaw) continue;
      const key = kRaw.trim().toLowerCase();
      const val = vParts.join(":").trim();

      if (key === "user-agent") {
        if (!cur) cur = { agents: [], disallows: [] };
        // New block when a user-agent after we've already started a block with data
        if (cur && cur.agents.length > 0 && cur.disallows.length > 0) {
          // push and start a new block
          blocks.push(cur);
          cur = { agents: [], disallows: [] };
        }
        cur!.agents.push(val.toLowerCase());
      } else if (key === "disallow") {
        if (!cur) cur = { agents: [], disallows: [] };
        cur.disallows.push(val);
      } else {
        // ignore other directives
      }
    }
    if (cur) blocks.push(cur);

    // Find best-matching block: exact user-agent or '*' fallback
    const ua = userAgent.toLowerCase();
    let matched: Block | null = null;
    // exact or substring match
    for (const b of blocks) {
      for (const a of b.agents) {
        if (a === ua || (a !== "*" && ua.includes(a))) {
          matched = b;
          break;
        }
      }
      if (matched) break;
    }
    if (!matched) {
      // find star block
      matched = blocks.find((b) => b.agents.includes("*")) || null;
    }

    if (!matched) return true; // no rules -> allowed

    // check disallow rules (prefix match)
    const pathToCheck = u.pathname + (u.search || "");
    for (const d of matched.disallows) {
      const rule = d.trim();
      if (rule === "") continue; // empty disallow means allow all
      // treat trailing slash / or path prefix matching
      if (pathToCheck.startsWith(rule)) {
        return false; // blocked
      }
    }

    return true;
  } catch (err) {
    // on error be permissive (so you can still test). If you want stricter, return false here.
    console.warn(
      "robots check failed — allowing by default:",
      (err as any)?.message ?? err
    );
    return true;
  }
}
