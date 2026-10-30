# Passchendaele Learning Lounge

An open-source learning lounge on the Battle of Passchendaele (Third Battle of Ypres, 1917). It collects public pages from archives, museums and libraries in Belgium, the UK, Canada, Australia and New Zealand. Each page is stored with its institution and reuse note. A reader built for neurodivergent and low-vision readers presents them: easy-reading mode, text-to-speech, color palettes and font scaling.

It is a personal project and may also serve my class lessons. License: Apache-2.0.

Maintainer: Lawrence Jefferson II ([MenokoOG](https://github.com/MenokoOG) on GitHub).

## What's in the repo

| Folder | What it is |
| --- | --- |
| `classroom/` | The UI. React, Vite, Tailwind. Landing page, reader, source catalogue, role-based dashboards. |
| `server/` | The API. Express, TypeScript, MongoDB. Auth, lessons, ingestion, seed scripts, tests. |
| `client/` | A small operator console for running the scraper. Not the public UI. |

## Run it

You need Node 22 (CI uses 22), pnpm 10 and MongoDB. The server can start a local MongoDB for you.

```bash
pnpm install
cp server/.env.example server/.env     # then edit the values
pnpm --filter ./server run dev:mongo   # local MongoDB, data in server/.mongo-data
pnpm --filter ./server run seed        # demo users and lessons
pnpm --filter ./server run dev         # API on :4000
pnpm --filter ./classroom run dev      # UI on :5173
```

On Windows, run these in PowerShell and swap `cp` for `Copy-Item`.

To ingest the source catalogue, start the API, then run:

```bash
pnpm --filter ./server run scrape:links
```

### Environment variables

Set these in `server/.env`. Never commit that file.

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string. |
| `JWT_SECRET` | Signing secret for auth tokens. Use 32 or more random characters. |
| `PORT` | API port. Defaults to 4000. |
| `SCRAPER_KEY` | Key the scraper uses to call the API. |
| `OPENAI_API_KEY` | Optional. Only used for the "easy reading" rewrite. |

## Sources

`server/src/data/passchendaele_sources.ts` is the single list of sources. Ingestion honors robots.txt, identifies itself as `PasschendaeleLoungeBot`, never bypasses bot walls, and refuses to store challenge pages. Sources that can't be fetched stay in the catalogue as link-out only, with a note.

## Add a lesson

A lesson has a `title`, an optional `slug` (unique), a `summary`, `contentHtml`, and a `published` flag. Unpublished lessons are visible only to their owner, instructors and admins.

1. Sign in as an instructor or admin. The seed script creates demo accounts; read `server/src/scripts/seed.ts` for the emails.
2. Send the lesson to the API:

   ```bash
   curl -X POST http://localhost:4000/api/lessons \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"title":"Why Passchendaele","slug":"why-passchendaele","summary":"Short overview","contentHtml":"<p>Lesson text.</p>","published":true}'
   ```

   Get the token from `POST /api/auth/login` (see `server/API.md`).
3. Open the UI and check the lesson in the reader.

To edit a lesson, `PUT /api/lessons/:id` with the fields you want to change. Only the owner, an instructor or an admin can do it.

TODO: no lesson editor exists in the `classroom` UI yet. Lessons are added through the API.

## Test and build

```bash
pnpm --filter ./server run test        # server tests (Jest)
pnpm --filter ./classroom run build    # UI production build
server/node_modules/.bin/tsc -p server --noEmit   # server typecheck
```

CI runs these three on every push to `main` and `claude/**` branches, and on pull requests.

## Reader features

- Easy-reading view and original view.
- Text-to-speech through the browser's SpeechSynthesis.
- Font size and line height controls.
- Palettes: gentle, high-contrast and others.
- Large touch targets, visible focus outlines, `prefers-reduced-motion` respected.

## Contributing

Open an issue or a pull request. Keep changes small and focused. TODO: add `CONTRIBUTING.md` and a code of conduct.

## Security

See [SECURITY.md](SECURITY.md). Don't open a public issue for a vulnerability.
