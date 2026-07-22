# Release checklist

## Required before merge

- [x] `npm ci` succeeds on Node.js 20 and 22.
- [x] `npm test` passes on Node.js 20 and 22.
- [x] `npm run pack:check` passes on Node.js 20 and 22.
- [x] Claude hook is quiet when disabled and loads the skill when enabled.
- [x] CLI init, validation, mode, profile, status, enable, and disable tests pass.
- [x] Manifest versions match `package.json`.
- [x] Claude Code uses the namespaced `/adhd-mode:adhd-mode` command.
- [x] Codex marketplace metadata points to the repository plugin and canonical skill.
- [x] Gemini extension and direct-skill commands match the current repository layout.
- [x] Canonical skill copies successfully into supported agent skill locations.
- [x] No second complete policy copy exists.
- [x] PR body records completed work, validation, blocker, and next phase.
- [x] Only one pull-request validation workflow exists.

## Required before a public announcement

- [ ] Change the GitHub repository from private to public with owner approval.
- [ ] Confirm remote installation from an account without private repository access.
- [ ] Create the `v0.1.0` tag.
- [ ] Publish GitHub release notes from `docs/release-notes-v0.1.0.md`.

## After public release

- Test a real launch in Claude Code, Codex, and Gemini CLI.
- Verify Copilot and Cursor discovery in clean project directories.
- Collect real usage feedback before changing default behavior.
- Add model-backed evaluation only when runners are isolated, pinned, and cost-controlled.
