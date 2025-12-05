import axios from "axios";

const API = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/$/,
  ""
);

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
  const res = await axios.post(`${API}/api/scrape`, { links });
  return res.data;
}
