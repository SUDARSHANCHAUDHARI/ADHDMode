# Evaluations

ADHDMode separates deterministic release checks from optional model-backed evaluation.

## Deterministic checks

`npm test` verifies:

- repository structure and manifest consistency
- canonical policy boundaries
- configuration validation and safe writes
- CLI lifecycle and machine-readable output
- Claude hook enabled, disabled, and failure states
- evaluation case format and category coverage

## Case set

`evals/cases.jsonl` contains original cases covering direct answers, output contracts, editing, execution, debugging, repeated failures, interruptions, decisions, destructive operations, ambiguity, unsupported estimates, multilingual work, and medical boundaries.

Each case declares:

- `id`
- `category`
- expected `mode`
- prompt
- required behaviors in `must`
- forbidden behaviors in `must_not`
- risk level

## Model-backed evaluation

Model judging is intentionally not part of the v0.1.0 merge gate. It should be added only after runners can isolate user configuration, pin model versions, control cost, blind conditions, and reject incomplete comparisons.
