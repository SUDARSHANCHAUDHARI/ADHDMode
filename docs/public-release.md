# Public release process

ADHDMode uses a local release helper instead of release automation. Publishing remains an explicit maintainer action.

## Prerequisites

- The repository is public.
- Git and GitHub CLI are installed.
- `gh auth status` succeeds for an account with repository admin access.
- The local checkout is on a clean `main` branch.
- Node.js 20 or newer is installed.
- `docs/release-notes-v<version>.md` exists for the version in `package.json`.

## 1. Check readiness

```bash
npm run release:check
```

The check is non-mutating. It verifies:

- Node.js, Git, and GitHub CLI availability
- GitHub CLI authentication
- public repository visibility
- clean working tree
- current and default branch are both `main`
- release notes are present
- an existing local tag does not point to another commit
- complete tests and package inspection pass

A failed prerequisite stops the process and prints the blocker.

## 2. Publish

```bash
npm run release:publish
```

Publishing reruns every readiness check before making changes. It then:

1. creates the annotated `v<version>` tag when it does not already exist;
2. pushes the tag to `origin` when it is not already present;
3. creates the GitHub release from the matching release-notes file when it does not already exist.

The command is intentionally idempotent for a correctly published version. Existing matching tags and releases are not recreated.

## Safety boundaries

- Check-only mode is the default.
- There is no `--force` option.
- The helper never changes repository visibility.
- The helper never commits source changes.
- The helper refuses to publish from a dirty tree, detached HEAD, or non-`main` branch.
- The helper refuses to publish when an existing local version tag points to a different commit.
- No GitHub Actions release workflow is used.

## After publishing

Verify the release from a GitHub account that did not previously have private repository access. Then test the documented installation flow in Claude Code, Codex, Gemini CLI, Cursor, and GitHub Copilot.
