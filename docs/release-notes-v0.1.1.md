# ADHDMode v0.1.1

ADHDMode v0.1.1 is a maintenance release focused on installation confidence, contributor readiness, onboarding, and current agent compatibility. It does not change the canonical ADHDMode response policy.

This release packages the repository improvements merged after v0.1.0. See the [complete comparison](https://github.com/SUDARSHANCHAUDHARI/ADHDMode/compare/v0.1.0...v0.1.1).

## Highlights

- Added `npm run verify:install` for deterministic clean-install validation across supported skill layouts.
- Added machine-readable installation verification with `node scripts/verify-install.mjs --json`.
- Added structured GitHub issue forms and a pull-request template for actionable contributions.
- Added a five-minute quick start, troubleshooting guidance, and examples for all seven response modes.
- Added a real-agent verification matrix that separates repository checks from genuine application launches.
- Updated OpenAI Codex guidance for stable Mentions V2: use `@adhd-mode` by default, with `$adhd-mode` retained as a legacy-compatible fallback.

## Compatibility and behavior

- The canonical skill remains at `skills/adhd-mode/SKILL.md`.
- Claude Code, Codex, Gemini CLI, GitHub Copilot, Cursor, and generic Agent Skills packaging remain supported.
- No automatic release workflow is added to `main`.
- No real proprietary-agent launch is claimed by deterministic repository tests. Real launch evidence remains tracked in issue #12.

## Validation

The release preparation is validated on Node.js 20 and Node.js 22 with:

- `npm ci`
- complete `npm test`
- clean-install and version-contract tests
- `npm run pack:check`
