# google-Python

MERN utility to fetch Google Python lessons into a `google_raw` MongoDB collection,
optionally rewrite/paraphrase lessons with OpenAI, and split lessons into sections.

## Requirements

- Node 18+
- MongoDB (Atlas recommended)
- (Optional) OpenAI API key if you want server-side paraphrase

## Install & Run (two shells)

# 1) Server

cd server
npm install

# start dev server

npm run dev

# 2) Client

cd ../client
npm install
npm run dev

# To run the CLI bulk scrape (once server is running)

cd ../server
npm run scrape:links

## Notes

- Puppeteer downloads Chromium during `npm install` in `server/`. Be patient.
- Set `.env` in the server folder (copy `.env.example`).
