<div align="center">

# ADHDMode

### Task-aware, ADHD-friendly output for AI coding agents

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](CHANGELOG.md)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-43853d.svg)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)](#project-status)

**Clear next actions. Visible progress. Easier resumption.**

[Installation](#installation) · [Modes](#response-modes) · [Configuration](docs/configuration.md) · [Documentation](#documentation) · [Contributing](CONTRIBUTING.md)

</div>

---

ADHDMode is a configurable response layer for AI coding agents. It helps assistants present technical work in a way that is easier to start, follow, verify, and resume without removing the depth required for serious engineering tasks.

It is a communication and workflow preference tool. It does **not** diagnose, treat, or prove ADHD.

> **Repository access:** This repository is currently private. Remote installation commands work only for GitHub accounts that can access it. Make the repository public before announcing a public release.

## Why ADHDMode

Long or unstructured AI responses can make it difficult to identify the next action, understand progress, or resume interrupted work. ADHDMode changes the presentation layer while preserving the technical substance.

It is designed to:

- put the useful result near the top
- separate evidence, decisions, actions, and verification
- reduce unnecessary preambles and tangents
- make multi-step work easy to resume
- preserve technical detail when the task requires it
- use time estimates only when they are grounded
- respect explicit output formats and instruction precedence
- avoid false completion claims

## Example

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

## Key features

- **Seven task-aware modes** for quick answers, execution, debugging, explanation, decisions, and resumed work
- **Four presentation profiles** that control response density and guidance
- **One canonical policy** at `skills/adhd-mode/SKILL.md`
- **Multi-agent support** for Claude Code, Codex, Gemini CLI, GitHub Copilot, Cursor, and generic Agent Skills tools
- **Safe local configuration CLI** with validation, atomic writes, and backups
- **Optional Claude Code persistence** that remains disabled until explicitly enabled
- **Deterministic validation** covering repository structure, manifests, configuration, hooks, CLI behavior, packaging, and installation contracts
- **42 original evaluation cases** across low-, medium-, and high-risk tasks
- **Guarded release tooling** with a non-mutating check mode and no force option

## Response modes

| Mode | Best for | Output behavior |
| --- | --- | --- |
| `auto` | Default use | Selects the most suitable structure for the task |
| `quick` | Direct questions | Gives the answer first without forcing a workflow |
| `execute` | Coding and setup | Shows objective, actions, result, and verification |
| `debug` | Failures and incidents | Separates evidence, likely cause, fix, and verification |
| `explain` | Learning and concepts | Provides structured depth without artificial brevity |
| `decide` | Comparisons and choices | Leads with the recommendation, then explains tradeoffs |
| `resume` | Interrupted work | Restates completed work, current state, blockers, and next action |

## Presentation profiles

| Profile | Intended experience |
| --- | --- |
| `quick` | Minimal structure and the fastest route to the answer |
| `balanced` | Clear structure with practical detail; the default profile |
| `guided` | More context, checkpoints, and explicit next actions |
| `deep` | Full technical depth for complex engineering work |

## Supported agents

| Agent | Distribution method | Activation or discovery |
| --- | --- | --- |
| Claude Code | Plugin marketplace or local plugin checkout | `/adhd-mode:adhd-mode` |
| OpenAI Codex | Standard Agent Skill directory | `/skills`, then `$adhd-mode` |
| Gemini CLI | Extension or direct skill installation | `/extensions list` and `/skills list` |
| GitHub Copilot | Project or personal Agent Skill directory | Automatic skill discovery |
| Cursor | Project or user skill directory | Automatic skill discovery |
| Generic agents | Agent Skills directory or `AGENTS.md` pointer | Tool-specific discovery |

## Installation

### Claude Code

```bash
claude plugin marketplace add SUDARSHANCHAUDHARI/ADHDMode
claude plugin install adhd-mode@adhd-mode
```

Start a new Claude Code session and run:

```text
/adhd-mode:adhd-mode
```

### OpenAI Codex

Copy the canonical skill directory into either location:

```text
$REPO_ROOT/.agents/skills/adhd-mode/
$HOME/.agents/skills/adhd-mode/
```

Restart the session, confirm discovery with `/skills`, and invoke the skill with:

```text
$adhd-mode
```

ADHDMode uses the standard Agent Skill path for Codex. It does not publish an unsupported repository marketplace entry or maintain a second copy of the complete policy.

### Gemini CLI

Install the repository as an extension:

```bash
gemini extensions install https://github.com/SUDARSHANCHAUDHARI/ADHDMode.git
```

Restart Gemini CLI and verify the installation with:

```text
/extensions list
/skills list
```

### GitHub Copilot and Cursor

ADHDMode supports project-scoped and user-scoped skill directories for both tools. See [the complete installation guide](docs/install.md) for exact paths and copy commands on macOS, Linux, and Windows.

## Local CLI

Node.js 20 or newer is required for the repository CLI, validation suite, and release helper.

```bash
node bin/adhd-mode.mjs init
node bin/adhd-mode.mjs validate
node bin/adhd-mode.mjs mode debug
node bin/adhd-mode.mjs profile guided
node bin/adhd-mode.mjs status
node bin/adhd-mode.mjs doctor
```

Claude Code always-on mode is opt-in:

```bash
node bin/adhd-mode.mjs enable
node bin/adhd-mode.mjs disable
```

The CLI never enables persistence automatically.

## Configuration

ADHDMode configuration controls the active mode, presentation profile, response limits, progress behavior, time-estimate policy, and optional agent-specific behavior.

Start with the default configuration:

```bash
node bin/adhd-mode.mjs init
node bin/adhd-mode.mjs validate
```

See [Configuration](docs/configuration.md) for the schema, supported values, profiles, and examples.

## How it works

ADHDMode keeps a single canonical behavior policy and uses small agent-specific manifests or adapters around it.

```text
skills/adhd-mode/SKILL.md       Canonical response policy
config/                         Defaults and presentation profiles
bin/                            Local ADHDMode CLI
lib/                            Configuration and path utilities
claude-hooks/                   Optional Claude Code session persistence
.claude-plugin/                 Claude Code plugin metadata
.codex-plugin/                  Codex local plugin metadata
adapters/                       Copilot, Cursor, and generic-agent adapters
evals/                          Original evaluation cases
tests/                          Unit, smoke, manifest, and contract tests
docs/                           Installation, design, release, and evaluation guides
```

This structure prevents agent integrations from drifting into separate, inconsistent versions of the policy.

## Development and validation

```bash
npm ci
npm test
npm run pack:check
```

The test suite validates:

- canonical policy and repository structure
- manifest versions and agent isolation
- configuration schema and safe writes
- CLI lifecycle and error handling
- Claude hook enabled, disabled, and failure states
- supported installation paths and documented commands
- release-helper safety behavior
- evaluation-case coverage
- final package contents

A single GitHub Actions workflow runs the same deterministic checks on **pull requests only** using Node.js 20 and Node.js 22.

## Publishing a release

Release publishing is a local, explicit maintainer action. It is not automated by GitHub Actions.

```bash
npm run release:check
npm run release:publish
```

`release:check` makes no changes. `release:publish` reruns every release gate before creating the version tag and GitHub release. It refuses to publish from a private repository, dirty working tree, non-`main` branch, mismatched tag, missing release notes, unauthenticated GitHub CLI, or failed test suite.

See [Public release process](docs/public-release.md) for the full safety model and prerequisites.

## Safety and scope

ADHDMode changes how responses are structured. It must not override:

- system or developer instructions
- safety requirements
- explicit user output contracts
- permission boundaries
- confirmation requirements for destructive actions
- evidence requirements for technical or high-risk claims

Security issues should be reported according to [SECURITY.md](SECURITY.md).

## Documentation

- [Installation guide](docs/install.md)
- [Configuration reference](docs/configuration.md)
- [Design and architecture](docs/design.md)
- [Evaluation strategy](docs/evaluations.md)
- [Release checklist](docs/release-checklist.md)
- [Public release process](docs/public-release.md)
- [v0.1.0 release notes](docs/release-notes-v0.1.0.md)
- [Changelog](CHANGELOG.md)

## Project status

`v0.1.0` is the initial production-ready code release. The policy, modes, profiles, configuration CLI, multi-agent adapters, evaluation cases, package checks, and guarded local release process are complete.

The repository must be made public and the prepared release must be published before public remote installation is announced.

## Contributing

Contributions are welcome through focused pull requests. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before making changes.

Behavior changes should include tests or evaluation coverage and must preserve the single canonical policy source.

## Author

**Sudarshan Kishor Chaudhari**  
Creator and maintainer of ADHDMode  
GitHub: [@SUDARSHANCHAUDHARI](https://github.com/SUDARSHANCHAUDHARI)

## License

ADHDMode is released under the [MIT License](LICENSE).

## Inspiration and attribution

The portable skill approach was inspired by [`ayghri/i-have-adhd`](https://github.com/ayghri/i-have-adhd). ADHDMode uses an original policy, structure, examples, configuration model, hook implementation, and validation suite.

See [INSPIRATIONS.md](INSPIRATIONS.md) for complete attribution details.
