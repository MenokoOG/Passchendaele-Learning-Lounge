# Security policy

## Reporting a vulnerability

Report privately. Don't open a public issue.

1. Use GitHub's private vulnerability reporting on this repository (Security tab, "Report a vulnerability").
2. If that isn't available, message the maintainer through [github.com/MenokoOG](https://github.com/MenokoOG) and ask for a private channel. Leave out the details until the channel exists.

<!-- TODO(Lawrence): add a security email and confirm private vulnerability reporting is turned on for this repo. -->

Include:

- A short summary and the steps to reproduce.
- The version or commit you tested.
- What an attacker could do with it.
- Whether you want credit.

## What to expect

- I'll acknowledge your report within 7 days. This is a personal project, so I don't promise faster.
- I'll tell you when I've triaged it and when a fix lands.
- I'll agree on a disclosure date with you before anything goes public.

## Good-faith research

If you stay within these limits, I won't pursue action against you:

- Test only what you need to show the problem.
- Don't read, change or keep other people's data. If you find some, stop and tell me.
- Don't run destructive tests or degrade the service.

## Scope

This repo holds the API, the UI and the scraper. Never commit secrets (`server/.env`, tokens, API keys). If you find one in the history, report it the same way.
