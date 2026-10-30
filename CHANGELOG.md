# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed (rename and docs)

- The README is rewritten for the Passchendaele Learning Lounge: what it is, how to run it, how to add a lesson. The "Forked from" line is gone.
- `SECURITY.md` is shorter. Dead ChatGPT links and the placeholder email are removed. A TODO marks the security contact.
- Root `package.json` lists `classroom` as a workspace. `pnpm start` now runs the server and the classroom UI. The scraper console moved to `pnpm run start:console`.
- `.gitignore` no longer ignores every `*.json` file.

### Fixed

- CI failed on every run since it was added: the server tests need `JWT_SECRET` and a MongoDB. The workflow now sets a test-only `JWT_SECRET` and starts a `mongo:7` service.

### Added

- `.gitattributes` (LF everywhere), `pnpm-lock.yaml` and a GitHub Actions workflow: frozen-lockfile install, server typecheck, server tests, classroom build.

### Changed

- License is now Apache-2.0 (`LICENSE`). The earlier `LICENSE (MIT).md` is removed and the README says so.

### Notes

- The npm lockfiles (`package-lock.json`, `classroom/package-lock.json`) are removed. `pnpm-lock.yaml` is the only lockfile.
