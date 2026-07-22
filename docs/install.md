# Installation

ADHDMode keeps one canonical policy at `skills/adhd-mode/SKILL.md`. Agent-specific files only point to or package that policy.

## Claude Code

```bash
claude plugin marketplace add SUDARSHANCHAUDHARI/ADHDMode
claude plugin install adhd-mode@adhd-mode
```

Start a new session and run `/adhd-mode`.

Optional always-on mode:

```bash
node bin/adhd-mode.mjs enable
```

Disable it without uninstalling:

```bash
node bin/adhd-mode.mjs disable
```

The Claude startup hook is stored under `claude-hooks/` and is registered only by the Claude plugin manifest. It does not live in the root conventional hook directory, so other plugin systems do not load it accidentally.

## OpenAI Codex

The repository contains a standard Agent Skill in `skills/adhd-mode/` and Codex presentation metadata in `skills/adhd-mode/agents/openai.yaml`.

Use the plugin marketplace flow supported by your Codex version, or copy `skills/adhd-mode/` into a discovered user or project skills directory. Invoke `$adhd-mode` when explicit invocation is available.

## Gemini CLI

Gemini CLI can discover Agent Skills. Install this repository as an extension when your version supports bundled skills, or copy `skills/adhd-mode/` into a discovered skills directory.

The extension manifest does not inject a global `GEMINI.md`; the skill stays explicit and portable.

## GitHub Copilot

Copy the canonical skill directory into one of Copilot's supported skill locations, such as:

```text
.github/skills/adhd-mode/
.agents/skills/adhd-mode/
```

For always-on project instructions, adapt `adapters/copilot/copilot-instructions.md` into `.github/copilot-instructions.md`.

## Cursor

Copy `skills/adhd-mode/` into `.cursor/skills/adhd-mode/` or the current user-level Cursor skills location. Use a real copy rather than a symlink.

## Generic agents

Copy `skills/adhd-mode/` into the tool's Agent Skills directory. For agents that only read `AGENTS.md`, use `adapters/generic/AGENTS.md` as the project pointer.

## Verify

From the repository root:

```bash
npm ci
npm test
node bin/adhd-mode.mjs doctor
```
