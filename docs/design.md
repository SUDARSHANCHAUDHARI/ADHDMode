# Design

## Why task-aware modes

A fixed concise template works for some execution tasks but can damage detailed explanations, decisions, incident reports, and strict output contracts.

ADHDMode first identifies the job the response must perform, then applies the lightest structure that makes that job easier to complete.

## Canonical policy

`skills/adhd-mode/SKILL.md` is the canonical response policy.

Agent adapters should reference or reproduce it without changing behavior. Adapter drift must be detected before release.

## Boundaries

ADHDMode must not:

- weaken safety checks
- invent verification or completion
- create unsupported time estimates
- diagnose ADHD
- force workflows into casual conversation
- remove details required by the user or task
