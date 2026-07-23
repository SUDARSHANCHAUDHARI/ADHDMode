# ADHDMode Mode Examples

These examples show the intended presentation pattern for each ADHDMode response mode. They are illustrative contracts, not fixed templates. The agent should adapt the structure to the task, available evidence, risk, and explicit user instructions.

ADHDMode must preserve correctness and technical depth. It must not invent results, hide uncertainty, or claim that commands were run when they were not.

## `auto`

Use `auto` when you want ADHDMode to select the most suitable response structure.

### Prompt

```text
Use ADHDMode auto mode. Help me understand why our deployment failed and tell me what to do next.
```

### Example response

> **Failure:** The deployment stopped during the database migration step.
>
> **Evidence available:** The log contains `relation "accounts" already exists`.
>
> **Likely cause:** The migration is trying to create a table that already exists, possibly because schema state and migration history are out of sync.
>
> **Next action:** Check the migration table and compare the deployed schema with the migration file before retrying.
>
> **Do not do yet:** Do not delete the existing table without confirming whether it contains production data.

`auto` should choose a debugging structure here because the request describes a failure.

## `quick`

Use `quick` for a direct answer that does not need a multi-step workflow.

### Prompt

```text
Use ADHDMode quick mode. What is the difference between npm ci and npm install?
```

### Example response

> **Use `npm ci` for reproducible installs in CI and clean environments.** It installs exactly from `package-lock.json`, removes an existing `node_modules`, and fails when the lockfile and `package.json` disagree.
>
> **Use `npm install` during normal development** when dependencies or the lockfile may need to change.

The useful answer appears first, without forcing progress sections or artificial checklists.

## `execute`

Use `execute` when the agent is carrying out a task with observable steps and a verifiable result.

### Prompt

```text
Use ADHDMode execute mode. Add a health-check endpoint to this Express app, run the tests, and report the result.
```

### Example response

> **Objective:** Add `GET /health` returning HTTP 200 and a small JSON status response.
>
> **Completed:**
> 1. Added the route in `src/server.js`.
> 2. Added a request test in `tests/health.test.js`.
> 3. Ran `npm test`.
>
> **Result:** All 18 tests passed.
>
> **Changed files:**
> - `src/server.js`
> - `tests/health.test.js`
>
> **Verified when:** `GET /health` returns `{"status":"ok"}` and the test suite remains green.

When execution has not occurred, the agent must say what it would do rather than presenting planned work as completed work.

## `debug`

Use `debug` to separate symptoms, evidence, hypotheses, fixes, and verification.

### Prompt

```text
Use ADHDMode debug mode. This Playwright test fails intermittently because the Pay button cannot be found.
```

### Example response

> **Failure:** The test times out waiting for the Pay button.
>
> **Evidence:** The trace shows a loading overlay covering the checkout panel until after the click attempt.
>
> **Likely cause:** The test waits for the button to exist but not for the blocking overlay to disappear.
>
> **Fix:**
>
> ```js
> await expect(page.getByTestId('loading')).toBeHidden();
> await page.getByRole('button', { name: 'Pay' }).click();
> ```
>
> **Verification:** Run the test repeatedly and inspect the trace for any remaining click interception.
>
> ```bash
> npx playwright test checkout.spec.ts --repeat-each=10
> ```

A hypothesis should remain labeled as a hypothesis until supported by evidence.

## `explain`

Use `explain` when understanding is more important than immediate execution.

### Prompt

```text
Use ADHDMode explain mode. Explain event-loop blocking in Node.js with a practical example.
```

### Example response

> **Core idea:** Node.js can handle many connections efficiently, but JavaScript execution on the main event loop is still single-threaded. A long synchronous task delays every callback waiting behind it.
>
> **Example:**
>
> ```js
> app.get('/slow', (_req, res) => {
>   const end = Date.now() + 5000;
>   while (Date.now() < end) {}
>   res.send('done');
> });
> ```
>
> During that five-second loop, unrelated requests handled by the same process may also wait.
>
> **Better approaches:** Use asynchronous APIs, worker threads for CPU-heavy work, or an external job queue.
>
> **Remember:** `async` does not automatically make CPU-bound JavaScript non-blocking.

The response keeps enough depth to teach the concept without burying the core idea.

## `decide`

Use `decide` when the user needs a recommendation and explicit tradeoffs.

### Prompt

```text
Use ADHDMode decide mode. Should this small Node.js CLI use SQLite or PostgreSQL?
```

### Example response

> **Recommendation: Use SQLite** for a local single-user CLI unless remote access, concurrent writers, or centralized operations are near-term requirements.
>
> **Why SQLite fits:**
> - no database server to operate
> - simple local backup and distribution
> - strong enough transactional behavior for typical CLI data
>
> **Choose PostgreSQL instead when:**
> - multiple machines must share the same data
> - concurrent writes are common
> - access control, replication, or managed hosting is required
>
> **Decision trigger:** Start with SQLite, but keep the persistence layer isolated if shared deployment is a realistic next phase.

The recommendation appears before the supporting analysis.

## `resume`

Use `resume` after an interruption, handoff, or context switch.

### Prompt

```text
Use ADHDMode resume mode. Continue the release work from these notes: tests passed, README updated, release tag not created, repository is still private.
```

### Example response

> **Completed:**
> - Test suite passed.
> - README was updated.
>
> **Current state:** The release tag has not been created, and the private repository prevents public installation.
>
> **Blocker:** Repository visibility must be changed by an owner before publishing.
>
> **Next action:** Make the repository public, then rerun the non-mutating release check.
>
> ```bash
> npm run release:check
> ```
>
> **Do not repeat:** README and test work are already complete unless the release check identifies a new problem.

The response distinguishes completed work from remaining work and gives one clear next action.

## Combining a mode and profile

A mode controls the task structure. A profile controls presentation density.

Examples:

```text
Use ADHDMode debug mode with the quick profile.
```

```text
Use ADHDMode execute mode with the guided profile.
```

```text
Use ADHDMode explain mode with the deep profile.
```

The profile must not remove evidence, safety requirements, explicit output contracts, or critical technical detail.

## Evaluating a response

A strong ADHDMode response should make it easy to answer:

1. What is the result, failure, recommendation, or current state?
2. What evidence supports it?
3. What should happen next?
4. How will success be verified?
5. What remains uncertain, blocked, or not performed?

For standardized real-agent tests, see [Agent verification](agent-verification.md).
