# ADHDMode

**ADHD-friendly output for AI coding agents.**

ADHDMode is a portable response layer that helps AI assistants produce work that is easier to start, follow, resume, and verify. It adapts to the task instead of forcing every answer into the same short template.

ADHDMode is a communication preference tool. It does not diagnose, treat, or prove ADHD.

## What changes

Without ADHDMode:

> Your Playwright test may be failing for several reasons. You could inspect the locator, check whether the page is ready, review the trace, and consider whether the test data is correct. It may also be useful to check browser differences.

With ADHDMode:

> **Failure:** `checkout.spec.ts:42` cannot find the Pay button.
>
> **Evidence:** The trace shows the button appears after the loading overlay closes.
>
> **Fix:** Wait for the overlay to disappear before clicking.
>
> 1. Add `await expect(page.getByTestId('loading')).toBeHidden()`
> 2. Click `page.getByRole('button', { name: 'Pay' })`
> 3. Run `npx playwright test checkout.spec.ts`
>
> **Verified when:** the test passes three consecutive runs.

## Modes

| Mode | Best for | Output behavior |
| --- | --- | --- |
| `auto` | Default use | Selects the best structure for the request |
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

Then run:

```text
/adhd-mode
```

### Codex

Copy `skills/adhd-mode` into a location read by your Codex setup, or use the generated Codex metadata in `skills/adhd-mode/agents/openai.yaml`.

Invoke with:

```text
$adhd-mode
```

### Other agents

See [installation instructions](docs/install.md) for Cursor, GitHub Copilot, Gemini CLI, Zed, Hermes, and generic agents.

## Configuration

Start from [`config/default.json`](config/default.json).

```json
{
  "mode": "auto",
  "profile": "balanced",
  "detailLevel": "balanced",
  "showProgress": true,
  "showVerification": true,
  "maxImmediateActions": 5,
  "timeEstimates": "grounded-only",
  "language": "auto",
  "alwaysOn": false
}
```

Validate the repository:

```bash
npm test
```

Validate a custom configuration:

```bash
node bin/adhd-mode.mjs validate path/to/adhd-mode.config.json
```

## Design goals

1. Make the useful result visible immediately.
2. Reduce the effort required to begin.
3. Preserve technical depth when the task needs it.
4. Keep long work easy to resume.
5. Let agents perform work they already have the tools and permission to do.
6. Make completion testable.
7. Avoid unsupported time estimates and false completion claims.
8. Respect explicit output formats.

## Supported agents

ADHDMode includes source material and adapter guidance for Claude Code, OpenAI Codex, Cursor, GitHub Copilot, Gemini CLI, Zed, Hermes, and generic Agent Skills or `AGENTS.md` based tools.

## Status

`v0.1.0` is the first working skill release. It includes the core policy, profiles, agent metadata, installation guidance, configuration validation, and contract tests.

## License

MIT. See [LICENSE](LICENSE).

## Inspiration

The portable skill approach was inspired by [`ayghri/i-have-adhd`](https://github.com/ayghri/i-have-adhd). ADHDMode uses an original policy, structure, examples, configuration model, and validation suite. See [INSPIRATIONS.md](INSPIRATIONS.md).
