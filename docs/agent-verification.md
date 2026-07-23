# Agent Verification

This guide separates deterministic repository checks from real launch tests inside supported AI agents.

## Automated clean-install check

Run from the repository root:

```bash
npm ci
npm run verify:install
```

The verifier:

- validates the canonical `skills/adhd-mode/SKILL.md` package
- rejects symbolic links so copied skills remain portable
- validates Claude Code marketplace, plugin, and hook-isolation contracts
- validates Codex and Gemini distribution metadata
- copies the canonical skill into clean temporary Codex, Gemini CLI, GitHub Copilot, and Cursor project layouts
- compares every copied file with the canonical source using SHA-256
- verifies the generic `AGENTS.md` adapter exists
- deletes all temporary verification directories after completion

For machine-readable output:

```bash
node scripts/verify-install.mjs --json
```

This command verifies manifests and filesystem installation contracts. It does not claim that a proprietary agent launched or discovered the skill.

## Real launch matrix

Record one result for every supported agent and operating system combination tested.

| Agent | Install or discovery action | Activation check | Status |
| --- | --- | --- | --- |
| Claude Code | Install repository marketplace and plugin | `/adhd-mode:adhd-mode` | Not yet recorded |
| OpenAI Codex | Copy to `.agents/skills/adhd-mode/` and restart | `/skills`, then `@adhd-mode`; retry `$adhd-mode` only as the legacy-compatible fallback | Not yet recorded |
| Gemini CLI | Install extension or direct skill and restart | `/extensions list` and `/skills list` | Not yet recorded |
| GitHub Copilot | Copy to `.github/skills/adhd-mode/` | Confirm automatic skill discovery | Not yet recorded |
| Cursor | Copy to `.cursor/skills/adhd-mode/` | Confirm automatic skill discovery | Not yet recorded |
| Generic Agent Skills tool | Copy canonical skill to its supported directory | Tool-specific discovery | Not yet recorded |

Use only these result values:

- `Passed`
- `Failed`
- `Blocked by environment`
- `Not yet tested`

Do not mark an agent as passed based only on repository tests or upstream source inspection.

## Standard behavior prompts

Run the same prompts in every agent so results are comparable.

### Quick mode

```text
Use ADHDMode quick mode. Explain why this Playwright locator may be flaky.
```

Expected shape:

- answer appears immediately
- no forced multi-step workflow
- enough technical detail to act

### Debug mode

```text
Use ADHDMode debug mode. Investigate this failing test and separate evidence, cause, fix, and verification.
```

Expected shape:

- evidence is separated from assumptions
- cause is not presented as proven without evidence
- fix and verification are explicit

### Execute mode

```text
Use ADHDMode execute mode. Create a small Node.js script, run it, and verify the result.
```

Expected shape:

- objective and actions are clear
- execution result is reported honestly
- completion includes a concrete verification

### Resume mode

```text
Use ADHDMode resume mode. Summarize completed work, current state, blockers, and the next action.
```

Expected shape:

- completed work is distinct from remaining work
- blockers are visible
- one immediate next action is easy to find

## Test record template

Copy this section for each real launch test:

```markdown
### <Agent name>

- Date:
- ADHDMode version or commit:
- Agent version:
- Operating system:
- Installation method:
- Discovery command or evidence:
- Activation command:
- Quick mode: Passed / Failed
- Debug mode: Passed / Failed
- Execute mode: Passed / Failed
- Resume mode: Passed / Failed
- Uninstall or removal test: Passed / Failed
- Notes:
```

## Failure report

When a test fails, record:

1. exact installation command or copy path
2. exact agent and operating-system version
3. complete error output or discovery result
4. whether the failure reproduces in a clean folder or profile
5. whether removing and reinstalling changes the result
6. the smallest repository change that could resolve the confirmed failure

Behavior should not be changed from assumptions. Open a focused issue only after a failure is reproduced or supported by reliable evidence.