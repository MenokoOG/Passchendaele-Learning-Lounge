import dotenv from "dotenv";
dotenv.config();

export const PORT = Number(process.env.PORT ?? 4000);
export const MONGO_URI = process.env.MONGO_URI ?? "";
export const JWT_SECRET = String(process.env.JWT_SECRET ?? "");
export const JWT_EXPIRES = String(process.env.JWT_EXPIRES ?? "7d");
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
export const PUPPETEER_SKIP_CHROMIUM_DOWNLOAD =
  process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD === "true";
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "uploads";
export const ADMIN_SECRET =
  process.env.ADMIN_SECRET ?? "optional_admin_secret_to_allow_admin_creation";
export const SCRAPER_KEY =
  process.env.SCRAPER_KEY ?? "replace_scraper_key_for_automated_scrapers";

// Basic checks: warn clearly to help local dev
if (!MONGO_URI) {
  console.warn("MONGO_URI is not set in environment. Some features will fail.");
}
if (!JWT_SECRET || JWT_SECRET.length < 16) {
  console.error(
    "JWT_SECRET is missing or too short. Set process.env.JWT_SECRET (recommend 32+ chars)."
  );
  throw new Error("Missing or too-short JWT_SECRET environment variable.");
}
