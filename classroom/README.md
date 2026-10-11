# Passchendaele Learning Lounge — Classroom (frontend)

React + Vite + Tailwind. Design system: *Construtivismo Literário Experimental*
(tokens live in `src/index.css`; geometric / text-collage / page-turn utilities are
at the bottom of that file).

## Run

```bash
pnpm install                         # from repo root
pnpm --filter ./server run dev:mongo # local MongoDB (data in server/.mongo-data)
pnpm --filter ./server run dev       # API on :4000
pnpm --filter ./classroom run dev    # UI on :5173 (proxies /api -> :4000)
```

Seed demo users and lessons once: `pnpm --filter ./server run seed`
(admin / instructor / student, password `password` — change it).

## Pages added in the Passchendaele refactor

- `/sources` — the catalogue of archives, grouped by nation, with "In the lounge" vs link-out status
- `/privacy`, `/terms` — plain-language notices
