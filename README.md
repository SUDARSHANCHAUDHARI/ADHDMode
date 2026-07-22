# ADHDMode

**Task-aware, ADHD-friendly output for AI coding agents.**

ADHDMode helps assistants produce work that is easier to start, follow, resume, and verify. It adapts the response shape to the task instead of forcing every answer into the same short template.

ADHDMode is a communication preference tool. It does not diagnose, treat, or prove ADHD.

> **Repository access:** This repository is currently private. Remote installation commands work only for GitHub accounts that can access it. Make the repository public before announcing a public release.

## What changes

Without ADHDMode:

> Your Playwright test may be failing for several reasons. You could inspect the locator, check whether the page is ready, review the trace, and consider whether the test data is correct.

With ADHDMode:

> **Failure:** `checkout.spec.ts:42` cannot find the Pay button.
>
> **Evidence:** The trace shows the button appears after the loading overlay closes.
>
> **Fix:** Wait for the overlay to disappear before clicking.
>
> 1. Add `await expect(page.getByTestId('loading')).toBeHidden()`.
> 2. Click the Pay button.
> 3. Run `npx playwright test checkout.spec.ts`.
>
> **Verified when:** the test passes three consecutive runs.

## Modes

| Mode | Best for | Output behavior |
| --- | --- | --- |
| `auto` | Default use | Selects the best structure |
| `quick` | Direct questions | Answer first, no forced workflow |
| `execute` | Coding and setup | Objective, actions, result, verification |
| `debug` | Failures and incidents | Evidence, cause, fix, verification |
| `explain` | Learning | Structured depth without artificial brevity |
| `decide` | Comparisons | Recommendation first, then tradeoffs |
| `resume` | Interrupted work | Completed, current, blocked, next |

## Install

### Claude Code

```bash
claude plugin marketplace add SUDARSHANCHAUDHARI/ADHDMode
claude plugin install adhd-mode@adhd-mode
```

Then run the namespaced skill:

```text
/adhd-mode:adhd-mode
```

### Codex

Install ADHDMode as a standard Agent Skill by copying `skills/adhd-mode/` into one of these locations:

```text
$REPO_ROOT/.agents/skills/adhd-mode/
$HOME/.agents/skills/adhd-mode/
```

Restart the session, confirm discovery with `/skills`, and invoke it with `$adhd-mode`.

ADHDMode does not currently publish a Codex marketplace because the repository keeps one canonical skill instead of maintaining a second packaged copy under `.agents/plugins/plugins/`.

### Gemini CLI

```bash
gemini extensions install https://github.com/SUDARSHANCHAUDHARI/ADHDMode.git
```

Restart Gemini CLI, then verify with `/extensions list` and `/skills list`.

See [docs/install.md](docs/install.md) for complete platform-specific guidance.

## Local CLI

Requires Node.js 20 or newer.

```bash
node bin/adhd-mode.mjs init
node bin/adhd-mode.mjs validate
node bin/adhd-mode.mjs mode debug
node bin/adhd-mode.mjs profile guided
node bin/adhd-mode.mjs status
```

Claude Code always-on mode remains opt-in:

```bash
node bin/adhd-mode.mjs enable
node bin/adhd-mode.mjs disable
```

## Validate the project

```bash
npm ci
npm test
npm run pack:check
```

A single GitHub Actions workflow runs the same deterministic checks on pull requests only.

## Publish a release

Release publishing is a local, explicit maintainer action. It is not automated by GitHub Actions.

```bash
npm run release:check
npm run release:publish
```

`release:check` is non-mutating. `release:publish` reruns every check before creating the version tag and GitHub release. See [docs/public-release.md](docs/public-release.md) for prerequisites and safety behavior.

## Design rules

1. Put the useful result where it can be seen immediately.
2. Reduce the effort required to begin.
3. Preserve technical depth when the task needs it.
4. Keep long work easy to resume.
5. Let agents perform work they already have permission and tools to do.
6. Make completion testable.
7. Avoid unsupported time estimates and false completion claims.
8. Respect explicit output formats.

## Project status

`v0.1.0` is the initial production-ready code release. It includes the canonical policy, task modes, profiles, multi-agent metadata, configuration CLI, deterministic validation, and original evaluation cases.

## License and inspiration

MIT. See [LICENSE](LICENSE).

The portable skill approach was inspired by [`ayghri/i-have-adhd`](https://github.com/ayghri/i-have-adhd). ADHDMode uses an original policy, structure, examples, configuration model, hook implementation, and validation suite. See [INSPIRATIONS.md](INSPIRATIONS.md).
