# ADHDMode v0.1.2

ADHDMode v0.1.2 is a maintenance release focused on evidence-based state handling and accurate Codex guidance.

## Improvements

- Quick mode now returns only the requested fields and requested number of actions.
- Verified current state outranks stale checklists or planning artifacts.
- Completed publication, deployment, and verification actions are not proposed again.
- Generic closing invitations remain prohibited in quick mode.
- The release-readiness failure observed in authenticated Codex testing now has regression evaluation and contract coverage.

## Documentation corrections

- The public-release checklist now matches the verified v0.1.1 GitHub state.
- Codex documentation uses `/skills` and `@adhd-mode` as the verified path.
- `$adhd-mode` is documented as unverified legacy syntax because authenticated testing did not show observable `SKILL.md` loading.

## Validation

The deterministic repository, installation, evaluation, unit, and package gates are run on Node.js 20 and Node.js 22 before merge.

## Known verification status

Authenticated Codex discovery, primary `@adhd-mode` activation, and debug mode were observed on v0.1.1. The corrected quick-mode behavior and the remaining authenticated mode, safety, removal, reinstall, Cursor, and other-agent checks were not completed before this release. They remain tracked in issue #12.

This release does not claim that every supported agent has passed authenticated behavior testing.
