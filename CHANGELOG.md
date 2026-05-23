# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-05-23

### Changed

- Refresh dev and docs-site dependencies (Biome, Jest, Motion, React 19.2.6, Next.js 15.5.18).
- Align the `motion` peer dependency range to `^12.40.0`.
- Harden the npm publish workflow for GitHub OIDC trusted publishing.

### Fixed

- Add CI publish dry-run validation so tarball issues are caught before release tags.

## [0.2.0] - 2026-03-19

### Changed

- Stable release with persistent-summary disclosure primitives, docs site, and GitHub Pages deployment.

[0.3.0]: https://github.com/HackEAC/reveal-ui/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/HackEAC/reveal-ui/releases/tag/v0.2.0
