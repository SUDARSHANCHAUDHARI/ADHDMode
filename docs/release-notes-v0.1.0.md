# ADHDMode v0.1.0

ADHDMode v0.1.0 is the first production-ready code release of the task-aware response skill.

## Included

- Seven response modes: auto, quick, execute, debug, explain, decide, and resume
- Four presentation profiles: quick, balanced, guided, and deep
- One canonical Agent Skill at `skills/adhd-mode/SKILL.md`
- Claude Code, Codex, Gemini CLI, Cursor, GitHub Copilot, and generic agent adapters
- Safe local configuration CLI with atomic writes and backups
- Opt-in Claude Code session persistence
- 42 original evaluation cases across 12 categories
- Deterministic repository, configuration, manifest, hook, CLI, packaging, and installation-contract tests
- One pull-request-only GitHub Actions workflow for Node.js 20 and 22

## Installation identifiers

- Claude Code skill: `/adhd-mode:adhd-mode`
- Codex skill: `$adhd-mode`
- Gemini CLI skill name: `adhd-mode`
- Repository: `SUDARSHANCHAUDHARI/ADHDMode`

## Safety and scope

ADHDMode changes response structure and task presentation. It does not diagnose or treat ADHD. It must not override system instructions, safety requirements, explicit output contracts, permission boundaries, or destructive-action confirmation requirements.

## Validation

The release gate includes:

```bash
npm ci
npm test
npm run pack:check
```

The package remains marked `private` to prevent accidental npm publication.

## Known release condition

The GitHub repository is currently private. Remote installation is available only to accounts with repository access. Change the repository visibility to public before announcing a public release.
