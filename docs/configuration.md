# Configuration

The default configuration is stored in `config/default.json` and validated against `adhd-mode.schema.json`.

## Profiles

### quick

For direct questions and small, low-risk tasks.

### balanced

Default profile. Keeps actions visible while preserving enough context.

### guided

Uses smaller execution steps and more visible progress state.

### deep

Preserves full explanation, decision context, risks, and verification details.

## Time estimates

`grounded-only` permits estimates only when supported by task scope, measured runtime, tool output, or relevant historical data.

`never` suppresses estimates.

## Immediate actions

`maxImmediateActions` controls the number of actions shown in the immediate path. It does not permit required information to be deleted. Remaining work should move to a clearly named later or reference section.
