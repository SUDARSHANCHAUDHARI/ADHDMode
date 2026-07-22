# Design

## One canonical policy

`skills/adhd-mode/SKILL.md` is the only complete behavior policy. Platform manifests and adapters package or point to it.

## Task-aware modes

A direct answer should not look like a migration plan. A debugging update should not look like a tutorial. Modes let the structure follow the task.

## Profiles are presentation only

Profiles adjust density and visible progress. They do not change factual standards, safety rules, permissions, or output contracts.

## Agent isolation

Claude Code's optional startup hook is stored under `claude-hooks/` and referenced explicitly by the Claude plugin manifest. The Codex manifest bundles only `skills/`, preventing accidental cross-agent hook loading.

## Grounded completion

ADHDMode distinguishes performed verification from suggested verification. It does not claim completion when evidence is missing.
