# Contributing

Changes should improve actionability without reducing correctness, safety, or
required technical depth.

Do not add a rule only because it makes one example shorter. A new rule should
work across multiple task types and include deterministic tests or evaluation
cases for its failure modes.

## Local checks

```bash
npm ci
npm test
npm run pack:check
```

## Pull requests

Describe the behavior being changed, why the current behavior is insufficient,
the verification performed, and any agent-specific compatibility impact.
