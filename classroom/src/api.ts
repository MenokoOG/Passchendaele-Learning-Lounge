import axios from "axios";

const API = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/$/,
  ""
);

export async function listRaw() {
  const r = await axios.get(`${API}/api/raw`);
  return r.data as any[];
}

export async function getRaw(id: string) {
  const r = await axios.get(`${API}/api/raw/${id}`);
  return r.data as any;
}

export async function rewriteRaw(
  id: string,
  style?: string,
  voiceSample?: string
) {
  const r = await axios.post(`${API}/api/raw/${id}/rewrite`, {
    style,
    voiceSample,
  });
  return r.data;
}

export async function triggerScrape(
  links: Array<{ title: string; url: string }>,
  usePuppeteer = true
) {
  const r = await axios.post(
    `${API}/api/scrape`,
    { links, usePuppeteer },
    { timeout: 600000 }
  );
  return r.data;
}
