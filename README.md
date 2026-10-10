# Passchendaele Learning Lounge

An accessible, open-source learning lounge on the **Battle of Passchendaele (Third Battle of Ypres, 1917)**. It ingests public pages from archives, museums and libraries in Belgium, the UK, Canada, Australia and New Zealand, stores each with its institution and reuse note, and presents them in a reader built for neurodivergent and low-vision readers (easy-reading mode, text-to-speech, palettes, font scaling).

Forked from the M3n0koOg Learning Lounge platform. Maintainer: **Lawrence Jefferson II (M3n0koOg)** — https://github.com/MenokoOG

## Quick start

```bash
pnpm install
pnpm --filter ./server run dev:mongo   # local MongoDB, data in server/.mongo-data
pnpm --filter ./server run seed        # demo users, lessons, research board
pnpm --filter ./server run dev         # API  :4000
pnpm --filter ./classroom run dev      # UI   :5173
pnpm --filter ./server run scrape:links  # ingest the source catalogue
```

Server config lives in `server/.env` (see `server/.env.example`).

## Source catalogue

`server/src/data/passchendaele_sources.ts` is the single list of sources. Ingestion honours robots.txt, identifies itself as `PasschendaeleLoungeBot`, never bypasses bot walls, and refuses to store challenge pages. Sources that cannot be fetched are kept as **link-out only** with a note (currently LAC, Veterans Affairs Canada, the two National Library of NZ records, NZHistory and Britannica).

---

## Table of contents

- [Highlights](#highlights)
- [Repository layout](#repository-layout)
- [Requirements](#requirements)
- [Quick start (development)](#quick-start-development)
- [Common CLI / scraper usage & gotchas](#common-cli--scraper-usage--gotchas)
- [Environment variables (`.env.example`)](#environment-variables-envexample)
- [Accessibility & reader features](#accessibility--reader-features)
- [Testing, linting & formatting](#testing-linting--formatting)
- [Deployment & production notes](#deployment--production-notes)
- [Architecture overview](#architecture-overview)
- [Contributing & community](#contributing--community)
- [License & credits](#license--credits)
- [Contact / reporting issues](#contact--reporting-issues)

---

## Highlights

- Ingest and normalize external lesson content into MongoDB.
- Optional server-side paraphrase/rewrite using OpenAI (instructor tools).
- Accessible LessonReader: simplified “easy reading” mode, original view, TTS (SpeechSynthesis), font size controls, and multiple color palettes (gentle, hippy, high-contrast).
- Role-aware UI: `student`, `instructor`, and `admin` experiences (dashboards and protected routes).
- CLI scripts for bulk scraping and processing content.
- Mentorship-oriented contribution model (issues labeled `mentored` for students).

---

## Repository layout

```

/server         # Node + TypeScript backend (ingest, API, rewrite, scripts)
/src
/scripts
/tests
/client         # React + Vite frontend (TypeScript, Tailwind CSS)
/src
/components
/pages
README.md
CONTRIBUTING.md
CODE_OF_CONDUCT.md
.env.example
LICENSE
.github/        # issue & PR templates

````

---

## Requirements

- Node 18+ (LTS recommended)
- npm 8+ or yarn
- MongoDB (Atlas recommended for production)
- Optional: OpenAI API key (server-side paraphrase/rewrite)
- Recommended dev environment: Linux / macOS / WSL2

---

## Quick start (development)

> Use two terminal shells (server + client) or a terminal multiplexer.

### 1) Server (dev)

```bash
cd server
npm install
# Start dev server (uses ts-node-dev or equivalent script)
npm run dev
````

### 2) Client (dev)

```bash
cd client
npm install
npm run dev
```

* Client default: Vite dev server (typically `http://localhost:5173`)
* Server default: Express API (typically `http://localhost:4000` unless `PORT` changed)

If you see errors because an `.env` file is missing, copy `.env.example` to `.env` and fill in required values before starting.

---

## Common CLI / scraper usage & gotchas

Run the scraping / processing commands from the `server/` workspace while the server is running (some scripts expect the API to be available).

Examples (from the `server/` folder):

```bash
# quick link scrape (calls server /api/scrape)
npm run scrape:links

# process pending scrape jobs
npm run process:scrapejobs
```

### Troubleshooting: "Unknown file extension '.ts'"

If you invoke TypeScript files directly with `node` and hit:

```
TypeError: Unknown file extension ".ts" ...
```

this means Node's ESM loader doesn't know how to handle `.ts`. Recommended remedies:

* Use the packaged npm scripts (`npm run ...`) which are preconfigured to run via `ts-node-dev`, `ts-node-esm`, or a build step. These scripts avoid loader issues.
* If you need to run a one-off script, use a node command that loads a TS runtime, for example (depending on your environment):

  ```bash
  # if ts-node is installed as a dev dependency
  npx ts-node-esm src/scripts/process_scrapejobs_to_raw.ts --limit=200 --delay=1200 --randomize
  ```

  or add an npm script in `server/package.json`:

  ```json
  "scripts": {
    "process:scrapejobs": "ts-node-esm src/scripts/process_scrapejobs_to_raw.ts --limit=200 --delay=1200 --randomize"
  }
  ```

  Use `ts-node-esm` (or `node --loader ts-node/esm`) only if your project is configured for ESM. If unsure, prefer the repo's existing scripts.

### Puppeteer

* Puppeteer downloads Chromium during `npm install`; this may take time and use disk space. For CI or constrained environments, set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` and provide `PUPPETEER_EXECUTABLE_PATH` to a system Chrome/Chromium.

---

## Environment variables (`.env.example`)

A committed `.env.example` is provided. Copy it to `server/.env` (and `client/.env.local` if needed) and edit values before running locally.

Key entries (do **not** commit secrets):

* `PORT` – server port (default `4000`)
* `MONGO_URI` – MongoDB connection string
* `JWT_SECRET` – authentication secret
* `OPENAI_API_KEY` – optional (used only if present)
* `PUPPETEER_EXECUTABLE_PATH` / `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`
* `VITE_API_BASE` (client) – base URL for server API

---

## Accessibility & reader features

This project focuses on readable, inclusive content:

* **Reader / LessonReader** component supports:

  * Easy-reading view (content simplified to 10-year-old level when possible)
  * Original view (raw HTML / source)
  * Font size scaling and line-height tuning
  * Color palettes (gentle/hippy palettes, neutral, and high-contrast)
  * Text-to-speech controls (play/stop using browser SpeechSynthesis)
  * Section list and video link extraction
* Accessibility considerations implemented:

  * Large touch targets and minimum button sizes
  * Focus-visible outlines and `a11y-focus` utility class
  * Respect for `prefers-reduced-motion`
  * Semantic HTML where practical; `aria` attributes on critical controls

If you are testing with assistive tech or a user with vertical nystagmus / triple vision, please try:

* Activating the high-contrast / gentle palette in the Accessibility settings
* Increasing font size and line height
* Using the TTS feature rather than reading long blocks of small text

---

## Testing, linting & formatting

Run linters, formatters and tests in each workspace:

```bash
# server
cd server
npm run lint
npm run format
npm test

# client
cd client
npm run lint
npm run format
npm test
```

Pre-commit hooks (Husky) may run linting/formatting automatically.

---

## Deployment & production notes

* Build and run production server:

  ```bash
  # server
  cd server
  npm run build
  npm run start:prod
  ```
* Build client for static hosting:

  ```bash
  cd client
  npm run build
  # deploy dist/ to Netlify, Render static, S3+CloudFront, etc.
  ```
* Store secrets (MongoDB URI, JWT secret, OpenAI key) in your host's secret manager — do **not** commit secrets.
* MongoDB Atlas is recommended for production; create least-privilege DB users and IP rules as appropriate.

---

## Architecture overview

* **Ingest pipeline**: scrapers → `ScrapeJob` queue → processing scripts → `RawCourse` documents in MongoDB → optional OpenAI rewrite → sectioning & metadata enrichment.
* **Server**: Express + TypeScript API serving REST endpoints (`/api/raw`, `/api/scrape`, `/api/ingest`, `/api/admin/*`).
* **Client**: React + Vite + Tailwind — LessonReader, accessibility controls, TTS, and role-aware dashboards (student / instructor / admin).
* **Data store**: MongoDB (Atlas or local); optionally Redis for queues/caching.

---

## Contributing & community

We welcome contributors of all levels. See `CONTRIBUTING.md` for the contribution workflow, issue templates, and how to get mentored on issues labelled `mentored`.

**Quick contributor steps**

1. Fork the repo and create a small focused branch: `feature/short-desc`
2. Run the dev servers locally and reproduce the issue or feature.
3. Keep commits atomic and open a PR with the included PR template.

We mentor students and accept small, scoped contributions — please open an issue and tag it `mentored` if you want pairing.

---

## License & credits

This project is released under the **MIT License**. See `LICENSE` for full text.

Core maintainer: **Lawrence Jefferson II (M3n0koOg)** — [https://github.com/MenokoOG](https://github.com/MenokoOG)

---

## Contact & reporting issues

Prefer opening issues on GitHub: [https://github.com/MenokoOG](https://github.com/MenokoOG)

* For bugs: include steps to reproduce, logs, Node/Mongo versions, and expected vs actual behavior.
* For security issues: **do not** open a public issue; contact the maintainer directly (email listed in `package.json`) or use a private channel.

---
