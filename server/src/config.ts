import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT ?? 4000;
export const MONGO_URI = process.env.MONGO_URI ?? "";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
export const PUPPETEER_SKIP_CHROMIUM_DOWNLOAD =
  process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD === "true";
