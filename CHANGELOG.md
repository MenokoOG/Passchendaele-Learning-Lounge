# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- `.gitattributes` (LF everywhere), `pnpm-lock.yaml` and a GitHub Actions workflow: frozen-lockfile install, server typecheck, server tests, classroom build.

### Changed

- License is now Apache-2.0 (`LICENSE`). The earlier `LICENSE (MIT).md` is removed and the README says so.

### Notes

- The npm lockfiles (`package-lock.json`, `classroom/package-lock.json`) are removed. `pnpm-lock.yaml` is the only lockfile.
