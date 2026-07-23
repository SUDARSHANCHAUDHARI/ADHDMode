# Contributing

Thank you for helping improve ADHDMode.

Changes should improve actionability without reducing correctness, safety, instruction precedence, explicit output contracts, or the technical depth required by the task.

Do not add a rule only because it makes one example shorter. A behavior rule should work across multiple task types and include deterministic tests or evaluation cases for its likely failure modes.

## Choose the right report

Use the structured GitHub forms so maintainers receive enough evidence to act:

- **Bug report** — reproducible installation, discovery, activation, behavior, compatibility, CLI, hook, packaging, or documentation problems
- **Agent verification report** — real Claude Code, Codex, Gemini CLI, GitHub Copilot, Cursor, or generic Agent Skills launch evidence
- **Feature request** — a concrete workflow problem with a proposed change, compatibility impact, safety analysis, and verification plan
- **Security vulnerability** — use the private process in [SECURITY.md](SECURITY.md); never publish credentials, tokens, private data, or exploit details in a public issue

Automated repository checks do not count as a successful real-agent launch. Follow [docs/agent-verification.md](docs/agent-verification.md) when recording agent verification evidence.

## Development setup

Node.js 20 or newer is required.

```bash
npm ci
npm test
npm run verify:install
npm run pack:check
```

`npm run verify:install` validates manifests and clean temporary installation layouts. It does not launch proprietary agent applications.

## Change rules

- Keep `skills/adhd-mode/SKILL.md` as the single canonical response policy.
- Do not duplicate the full policy inside agent-specific adapters or manifests.
- Preserve system and developer instruction precedence.
- Respect explicit user output formats, permission boundaries, and confirmation requirements.
- Do not claim completion without evidence.
- Keep optional persistence features disabled until explicitly enabled.
- Add deterministic tests or evaluation coverage for behavior changes.
- Update installation contracts and verification documentation when agent integration paths change.
- Do not add post-merge, scheduled, or release workflows without an explicit design decision.

## Pull requests

Keep pull requests focused and use the repository PR template. Describe:

1. the concrete problem being solved
2. the smallest meaningful change
3. behavior and agent-compatibility impact
4. verification performed
5. correctness, safety, and migration considerations

Documentation-only changes should still confirm that commands, paths, versions, and public links are accurate.

## Real-agent evidence

When a change affects an agent integration, include or link evidence containing:

- ADHDMode version or commit
- agent version
- operating system
- exact installation method
- discovery evidence
- activation command
- pass, fail, or blocked status
- exact output for failures
- uninstall or removal result

Confirmed agent-specific failures should become focused issues rather than broad speculative behavior changes.
