# Release checklist

## Required before merge

- [x] `npm ci` succeeds on Node.js 20 and 22.
- [x] `npm test` passes on Node.js 20 and 22.
- [x] `npm run pack:check` passes on Node.js 20 and 22.
- [x] Claude hook is quiet when disabled and loads the skill when enabled.
- [x] CLI init, validation, mode, profile, status, enable, and disable tests pass.
- [x] Manifest versions match `package.json`.
- [x] Claude Code uses the namespaced `/adhd-mode:adhd-mode` command.
- [x] Codex uses the canonical Agent Skill through `.agents/skills/adhd-mode/`.
- [x] No unsupported Codex marketplace entry is published.
- [x] Gemini extension and direct-skill commands match the current repository layout.
- [x] Canonical skill copies successfully into supported agent skill locations.
- [x] No second complete policy copy exists.
- [x] PR body records completed work, validation, blocker, and next phase.
- [x] Only one pull-request validation workflow exists.
- [x] Release helper defaults to non-mutating check mode.
- [x] Release helper requires public visibility, authenticated GitHub CLI, clean `main`, release notes, and passing gates.
- [x] Release helper has no force option and does not change repository visibility.

## Required before a public announcement

- [x] Change the GitHub repository from private to public with owner approval.
- [x] Run `npm run release:check` successfully.
- [x] Run `npm run release:publish` to create the version tag and GitHub release.
- [x] Confirm remote installation from a clean environment without prior private repository access.

The current public release is [`v0.1.1`](https://github.com/SUDARSHANCHAUDHARI/ADHDMode/releases/tag/v0.1.1), published from commit `168c967419213a1e67009a1cafe3f6ad770548f7`.

## After public release

- [x] Verify public marketplace or extension installation and discovery in Claude Code and Gemini CLI.
- [x] Verify authenticated Codex `/skills` discovery and primary `@adhd-mode` activation.
- [x] Verify GitHub Copilot CLI project-skill discovery in a clean project directory.
- [ ] Complete authenticated quick, execute, resume, explain, decide, auto, and safety behavior checks tracked in [issue #12](https://github.com/SUDARSHANCHAUDHARI/ADHDMode/issues/12).
- [ ] Resolve or clarify the Codex `$adhd-mode` legacy fallback with observable skill-load evidence.
- [ ] Verify Cursor discovery in a clean desktop project.
- [ ] Verify one additional real third-party Agent Skills consumer.
- [ ] Complete removal and reinstall cycles across every supported agent.
- [ ] Collect real usage feedback before changing default behavior.
- [ ] Add model-backed evaluation only when runners are isolated, pinned, and cost-controlled.
