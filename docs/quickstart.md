# ADHDMode Quick Start

Use this guide to install ADHDMode, confirm that your agent can discover it, and run a first structured task.

ADHDMode changes how an AI coding agent presents work. It does not replace the agent, change its permissions, or override system, developer, safety, or explicit user instructions.

## 1. Choose your agent

| Agent | Install | Discover or activate |
| --- | --- | --- |
| Claude Code | Plugin marketplace | `/adhd-mode:adhd-mode` |
| OpenAI Codex | Copy the canonical skill | `/skills`, then `@adhd-mode` (`$adhd-mode` fallback) |
| Gemini CLI | Extension or direct skill install | `/extensions list` and `/skills list` |
| GitHub Copilot | Copy into a supported skill directory | Automatic discovery |
| Cursor | Copy into a supported skill directory | Automatic discovery |

For every supported path, see [Installation](install.md).

## 2. Install

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

From a local clone, copy the canonical skill into the current repository:

```bash
mkdir -p .agents/skills
cp -R skills/adhd-mode .agents/skills/adhd-mode
```

Restart Codex, confirm discovery with `/skills`, and invoke using the current Mentions V2 syntax:

```text
@adhd-mode
```

The legacy-compatible `$adhd-mode` form remains available in Codex.

### Gemini CLI

```bash
gemini extensions install https://github.com/SUDARSHANCHAUDHARI/ADHDMode.git
```

Restart Gemini CLI and confirm:

```text
/extensions list
/skills list
```

### GitHub Copilot

From a local clone:

```bash
mkdir -p .github/skills
cp -R skills/adhd-mode .github/skills/adhd-mode
```

Start a new Copilot session in the repository. Skill discovery is automatic.

### Cursor

From a local clone:

```bash
mkdir -p .cursor/skills
cp -R skills/adhd-mode .cursor/skills/adhd-mode
```

Start a new Cursor session in the repository. Skill discovery is automatic.

## 3. Run a first task

Use a concrete request and name the mode:

```text
Use ADHDMode debug mode.

My Playwright checkout test fails because the Pay button cannot be found. Separate the evidence, likely cause, fix, and verification steps.
```

A useful response should make these elements easy to find:

1. the failure or objective
2. available evidence
3. the next action or fix
4. verification criteria
5. any blocker or uncertainty

ADHDMode must not invent evidence or claim that work was completed when it was not performed.

## 4. Choose a mode

| Mode | Use it when |
| --- | --- |
| `auto` | You want ADHDMode to choose the structure |
| `quick` | You need a direct answer with minimal framing |
| `execute` | The agent is performing a multi-step task |
| `debug` | You are investigating a failure or incident |
| `explain` | You are learning a concept or system |
| `decide` | You need a recommendation with tradeoffs |
| `resume` | You are continuing interrupted work |

Examples for every mode are available in [Mode examples](examples.md).

## 5. Choose a presentation profile

| Profile | Use it when |
| --- | --- |
| `quick` | You want the smallest useful response |
| `balanced` | You want practical detail without excessive structure |
| `guided` | You want explicit checkpoints and next actions |
| `deep` | You need full technical depth |

The default profile is `balanced`.

From a local clone, configuration can be managed through the CLI:

```bash
node bin/adhd-mode.mjs init
node bin/adhd-mode.mjs mode debug
node bin/adhd-mode.mjs profile guided
node bin/adhd-mode.mjs validate
node bin/adhd-mode.mjs status
```

See [Configuration](configuration.md) for every supported option.

## 6. Verify the repository package

From a clean clone:

```bash
npm ci
npm run verify:install
npm test
npm run pack:check
```

`npm run verify:install` checks manifests and clean temporary installation layouts. It does not launch proprietary agent applications and therefore does not count as real-agent verification.

For real launch evidence, use [Agent verification](agent-verification.md).

## 7. Remove ADHDMode

Remove the installed plugin, extension, or copied skill directory using the same scope used during installation.

Common copied locations include:

```text
.agents/skills/adhd-mode/
.github/skills/adhd-mode/
.cursor/skills/adhd-mode/
~/.agents/skills/adhd-mode/
~/.copilot/skills/adhd-mode/
```

Claude Code always-on mode is optional and remains disabled until explicitly enabled. From a local clone, disable it with:

```bash
node bin/adhd-mode.mjs disable
```

After removal, start a new agent session and confirm that ADHDMode is no longer discovered or applied.

## Troubleshooting

Before opening an issue:

1. confirm the agent version and operating system
2. confirm the exact installation path or command
3. restart the agent session
4. run the documented discovery command where supported
5. capture the exact error output
6. compare the result with [Installation](install.md)

Use the structured GitHub bug or agent-verification form so the report contains enough evidence to reproduce the result.