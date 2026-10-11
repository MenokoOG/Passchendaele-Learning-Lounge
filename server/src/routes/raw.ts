// server/src/routes/raw.ts
import express from "express";
import axios from "axios";
import { RawCourse } from "../models/RawCourse.js";
import { OPENAI_API_KEY } from "../config.js";
import { buildVoicePrompt } from "../utils/openai_prompt.js";
import { localRewriteDocument } from "../utils/local_rewrite.js";

const router = express.Router();

/* Helper: trim long content for prompts (prefer paragraph boundary) */
function safeSliceForPrompt(s: string, maxChars = 15000) {
  if (!s) return "";
  if (s.length <= maxChars) return s;
  const cut = s.slice(0, maxChars);
  const lastNewline = cut.lastIndexOf("\n\n");
  if (lastNewline > Math.floor(maxChars * 0.5)) return cut.slice(0, lastNewline);
  return cut;
}

router.get("/", async (_req, res) => {
  const all = await RawCourse.find().sort({ fetchedAt: -1 }).limit(200);
  res.json(all);
});

router.get("/export", async (_req, res) => {
  const all = await RawCourse.find().sort({ fetchedAt: -1 });
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=passchendaele_raw_${Date.now()}.json`
  );
  res.json(all);
});

router.get("/:id", async (req, res) => {
  const doc = await RawCourse.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json(doc);
});

/**
 * POST /api/raw/:id/rewrite
 * Body: { style?: string, voiceSample?: string, force?: boolean }
 */
router.post("/:id/rewrite", async (req, res) => {
  const id = req.params.id;
  const style =
    req.body.style ??
    "Rewrite in a concise, clear teaching voice suitable for an experienced CTO instructing software engineers. Keep examples practical.";
  const voiceSample = req.body.voiceSample ?? null;
  const force = !!req.body.force;

  const doc = await RawCourse.findById(id);
  if (!doc) return res.status(404).json({ error: "Not found" });

  // Use contentHtml property (not html) and fallback to text
  const content = (doc as any).text ?? (doc as any).contentHtml;
  if (!content) return res.status(400).json({ error: "No content to rewrite" });

  // fallback shortcut when no OPENAI key available
  if (!OPENAI_API_KEY) {
    const short = String(content).replace(/\s+/g, " ").slice(0, 4000);
    const fallback = `PARAPHRASE (FALLBACK MODE): ${short}`;
    // store minimal metadata
    (doc as any).metadata = {
      ...(doc as any).metadata,
      lastParaphrase: {
        at: new Date(),
        style,
        model: "no-key-fallback",
        rewrittenText: fallback,
      },
    };
    await doc.save();
    return res.json({ rewritten: fallback, mode: "fallback" });
  }

  // return cached paraphrase unless forced
  const cached = (doc as any).metadata?.lastParaphrase?.rewrittenText;
  if (cached && !force) {
    return res.json({ rewritten: cached, mode: "cache" });
  }

  // build prompt (trimmed)
  const safeOriginal = safeSliceForPrompt(String(content), 15000);
  const prompt = buildVoicePrompt({
    title: (doc as any).title || "",
    original: safeOriginal,
    style,
    voiceSample,
  });

  const body = {
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1600,
    temperature: 0.15,
  };

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      body,
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 120000,
      }
    );

    const data = response?.data;
    const reply =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      JSON.stringify(data);

    // persist paraphrase
    (doc as any).metadata = {
      ...(doc as any).metadata,
      lastParaphrase: {
        at: new Date(),
        style,
        voiceSampleProvided: !!voiceSample,
        model: body.model,
        rewrittenText: reply,
        mode: "openai",
      },
    };
    await doc.save();

    return res.json({ rewritten: reply, mode: "openai" });
  } catch (err: any) {
    // log full error
    console.error("OpenAI rewrite error:", {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    });

    // If quota / 429 -> do local fallback rewrite
    const code = err?.response?.data?.error?.code;
    const status = err?.response?.status;
    if (code === "insufficient_quota" || status === 429) {
      try {
        const local = localRewriteDocument({
          title: (doc as any).title || "",
          html: String((doc as any).contentHtml || ""),
          text: String((doc as any).text || ""),
        });

        (doc as any).metadata = {
          ...(doc as any).metadata,
          lastParaphrase: {
            at: new Date(),
            style,
            voiceSampleProvided: !!voiceSample,
            model: "local-fallback",
            rewrittenText: local,
            note: "Used local fallback due to OpenAI quota/429",
          },
        };
        await doc.save();

        return res.status(200).json({
          rewritten: local,
          mode: "local-fallback",
          info: "OpenAI reported insufficient_quota or 429 — local fallback used.",
        });
      } catch (lfErr: any) {
        console.error("Local fallback failed:", lfErr);
        return res
          .status(500)
          .json({ error: "OpenAI error and local fallback failed" });
      }
    }

    // other errors: forward provider error if available
    const payload = err?.response?.data ?? {
      error: err?.message ?? "Unknown error calling OpenAI",
    };
    return res.status(status || 500).json({ error: payload });
  }
});

export default router;
