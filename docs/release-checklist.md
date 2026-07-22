# Release checklist

## Required before merge

- [ ] `npm ci` succeeds on supported Node versions.
- [ ] `npm test` passes.
- [ ] `npm run pack:check` passes.
- [ ] Claude hook is quiet when disabled and loads the skill when enabled.
- [ ] CLI init, validation, mode, profile, status, enable, and disable tests pass.
- [ ] Manifest versions match `package.json`.
- [ ] Installation commands match the current repository layout.
- [ ] No second complete policy copy exists.
- [ ] PR body records completed work and next phase.

## After merge

- Create and publish the `v0.1.0` tag and release notes.
- Test installation from a fresh machine or container for each supported agent.
- Collect real usage feedback before changing default behavior.
