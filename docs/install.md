# Installation

ADHDMode keeps one canonical policy at `skills/adhd-mode/SKILL.md`. Agent-specific manifests package or point to that policy.

> **Private repository:** Remote installation requires GitHub access to `SUDARSHANCHAUDHARI/ADHDMode`. Make the repository public before sharing these commands as a public installation flow.

## Claude Code

### Install from the marketplace

```bash
claude plugin marketplace add SUDARSHANCHAUDHARI/ADHDMode
claude plugin install adhd-mode@adhd-mode
```

Claude Code namespaces plugin skills with the plugin name. Start a new session and run:

```text
/adhd-mode:adhd-mode
```

### Validate a local checkout

```bash
claude plugin validate . --strict
claude --plugin-dir .
```

In the test session, run `/adhd-mode:adhd-mode` and confirm the skill loads.

### Optional always-on mode

From a local checkout:

```bash
node bin/adhd-mode.mjs enable
node bin/adhd-mode.mjs disable
```

The CLI creates or removes `~/.claude/.adhd-mode-always`. You can manage the marker directly when the repository CLI is not available.

macOS or Linux:

```bash
mkdir -p ~/.claude
touch ~/.claude/.adhd-mode-always
rm -f ~/.claude/.adhd-mode-always
```

Windows PowerShell:

```powershell
$dir = Join-Path $HOME ".claude"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
New-Item -ItemType File -Force -Path (Join-Path $dir ".adhd-mode-always") | Out-Null
Remove-Item -Force -ErrorAction SilentlyContinue (Join-Path $dir ".adhd-mode-always")
```

The Claude startup hook is stored under `claude-hooks/` and is registered only by the Claude plugin manifest. Codex does not load it.

## OpenAI Codex

ADHDMode uses Codex Agent Skills directly. The repository does not publish a Codex marketplace entry because the official repository-marketplace layout requires a second packaged plugin directory under `.agents/plugins/plugins/`, which would duplicate the canonical skill.

### Repository-scoped installation

Copy the canonical skill directory to:

```text
$REPO_ROOT/.agents/skills/adhd-mode/
```

macOS or Linux from a local clone:

```bash
mkdir -p .agents/skills
cp -R skills/adhd-mode .agents/skills/adhd-mode
```

Windows PowerShell from a local clone:

```powershell
New-Item -ItemType Directory -Force -Path .agents/skills | Out-Null
Copy-Item -Recurse -Force skills/adhd-mode .agents/skills/adhd-mode
```

### User-scoped installation

Copy the canonical skill directory to:

```text
$HOME/.agents/skills/adhd-mode/
```

macOS or Linux:

```bash
mkdir -p ~/.agents/skills
cp -R skills/adhd-mode ~/.agents/skills/adhd-mode
```

Windows PowerShell:

```powershell
$skills = Join-Path $HOME ".agents/skills"
New-Item -ItemType Directory -Force -Path $skills | Out-Null
Copy-Item -Recurse -Force skills/adhd-mode (Join-Path $skills "adhd-mode")
```

Restart the Codex session, use `/skills` to confirm discovery, and invoke ADHDMode explicitly with:

```text
$adhd-mode
```

The optional `.codex-plugin/plugin.json` remains distribution metadata for environments that can load a local plugin directory. It declares only `./skills/` and does not include Claude hooks.

## Gemini CLI

### Install as an extension

```bash
gemini extensions install https://github.com/SUDARSHANCHAUDHARI/ADHDMode.git
```

Restart Gemini CLI, then verify:

```text
/extensions list
/skills list
```

Gemini CLI automatically discovers the skill bundled under `skills/adhd-mode/`.

### Install only the skill

```bash
gemini skills install https://github.com/SUDARSHANCHAUDHARI/ADHDMode.git --path skills/adhd-mode --consent
```

Use `/skills reload` after changing a linked or copied skill.

## GitHub Copilot

Copy the canonical skill directory into one of Copilot's project skill locations:

```text
.github/skills/adhd-mode/
.agents/skills/adhd-mode/
```

For a personal skill, use:

```text
~/.copilot/skills/adhd-mode/
~/.agents/skills/adhd-mode/
```

For always-on repository guidance, adapt `adapters/copilot/copilot-instructions.md` into `.github/copilot-instructions.md`.

## Cursor

Copy `skills/adhd-mode/` into:

```text
.cursor/skills/adhd-mode/
```

For user-level installation, use the current Cursor user skills directory. Use a real directory copy rather than a symlink so clones and ZIP downloads remain portable.

## Generic agents

Copy `skills/adhd-mode/` into the tool's Agent Skills directory. For tools that only read `AGENTS.md`, use `adapters/generic/AGENTS.md` as the project pointer.

## Repository verification

From the repository root:

```bash
npm ci
npm test
npm run pack:check
node bin/adhd-mode.mjs doctor
```

The deterministic test suite verifies manifest paths, documented commands, skill-copy layouts, configuration behavior, hook behavior, and package contents. It does not replace a real launch test in each installed agent.
