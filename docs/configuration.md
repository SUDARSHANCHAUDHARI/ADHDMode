# Configuration

ADHDMode configuration changes presentation. It never changes correctness, safety, permission boundaries, or explicit output contracts.

Create a configuration:

```bash
node bin/adhd-mode.mjs init
```

The default location is `./adhd-mode.config.json`. Override it with `--config` or `ADHD_MODE_CONFIG`.

## Fields

| Field | Values | Purpose |
| --- | --- | --- |
| `mode` | `auto`, `quick`, `execute`, `debug`, `explain`, `decide`, `resume` | Select response structure |
| `profile` | `quick`, `balanced`, `guided`, `deep` | Select navigation density |
| `detailLevel` | `compact`, `balanced`, `detailed` | Preferred explanation depth |
| `showProgress` | boolean | Show recoverable state during long tasks |
| `showVerification` | boolean | Include verification or success criteria |
| `maxImmediateActions` | 1 to 10 | Limit the visible current action group |
| `timeEstimates` | `never`, `grounded-only` | Prevent unsupported duration claims |
| `language` | string | Preferred language, or `auto` |
| `alwaysOn` | boolean | Stored preference; the CLI flag controls Claude startup activation |

## Commands

```bash
node bin/adhd-mode.mjs validate
node bin/adhd-mode.mjs config
node bin/adhd-mode.mjs mode debug
node bin/adhd-mode.mjs profile guided
node bin/adhd-mode.mjs status --json
```

`init --force` creates a timestamped backup before replacing an existing file.
