# Installation

## Claude Code

```bash
claude plugin marketplace add SUDARSHANCHAUDHARI/ADHDMode
claude plugin install adhd-mode@adhd-mode
```

Run `/adhd-mode`.

### Optional always-on mode

```bash
touch ~/.claude/.adhd-mode-always
```

Return to opt-in behavior:

```bash
rm ~/.claude/.adhd-mode-always
```

The conventional `hooks/hooks.json` file is used directly. It is intentionally not declared again in the plugin manifest.

## Codex

Install or copy `skills/adhd-mode` into the skills directory used by your Codex setup. The repository includes `skills/adhd-mode/agents/openai.yaml`.

Run `$adhd-mode`.

For project-level always-on behavior, reference the canonical skill from the project `AGENTS.md`.

## Cursor

Copy `skills/adhd-mode/` to `.cursor/skills/adhd-mode/`.

Use a real directory copy rather than a symlink so Windows clones and ZIP downloads remain reliable.

## GitHub Copilot

Copy the content of `adapters/copilot/copilot-instructions.md` into the repository's `.github/copilot-instructions.md`, or install the canonical skill in a Copilot-supported skills directory.

## Gemini CLI

Install the repository as an extension when supported, or copy `skills/adhd-mode/agents/gemini.toml` into the Gemini commands directory.

The extension loads `GEMINI.md`, which points to the canonical skill.

## Zed, Hermes, and generic Agent Skills tools

Import or copy `skills/adhd-mode/` into the user-level or project-level skill directory supported by the agent.

For agents based on `AGENTS.md`, start with `adapters/generic/AGENTS.md`.

## Verify

Ask the agent:

```text
Enable ADHDMode. Explain what response modes are available.
```

A valid response should name the modes without claiming that ADHDMode diagnoses ADHD.
