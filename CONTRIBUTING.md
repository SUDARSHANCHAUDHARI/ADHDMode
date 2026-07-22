# Contributing

## Principles

Changes should improve actionability without reducing correctness, safety, or required technical depth.

Do not add a rule only because it makes one example shorter. A new rule should work across multiple task types and include tests for its failure modes.

## Local checks

```bash
npm test
```

## Pull requests

Include:

1. The behavior being changed.
2. Why the existing behavior is insufficient.
3. Examples before and after the change.
4. Tests or evaluation cases.
5. Any agent-specific compatibility impact.
