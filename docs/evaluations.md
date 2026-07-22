# Evaluations

Version 0.1.0 includes deterministic case validation. The cases cover response contracts and behavior expectations without requiring an API key.

Future model evaluations should compare:

1. Baseline behavior.
2. Current ADHDMode behavior.
3. Previous released ADHDMode behavior.

Recommended scoring:

| Dimension | Weight |
| --- | ---: |
| Correctness | 30% |
| Output contract adherence | 20% |
| Agent autonomy | 15% |
| Actionability | 15% |
| Safety | 10% |
| Cognitive load | 10% |

Evaluation runners must be isolated from user-level plugins, memory, hooks, and instruction files. Model and runner versions must be pinned in published results.
