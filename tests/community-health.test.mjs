import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const issueForms = [
  '.github/ISSUE_TEMPLATE/bug_report.yml',
  '.github/ISSUE_TEMPLATE/agent_verification.yml',
  '.github/ISSUE_TEMPLATE/feature_request.yml',
];

test('issue chooser routes security reports and disables blank issues', () => {
  const config = read('.github/ISSUE_TEMPLATE/config.yml');

  assert.match(config, /^blank_issues_enabled: false$/m);
  assert.match(config, /security\/policy/);
  assert.match(config, /docs\/install\.md/);
  assert.match(config, /docs\/agent-verification\.md/);
});

test('issue forms use valid top-level contracts and unique field ids', () => {
  for (const file of issueForms) {
    const form = read(file);

    assert.match(form, /^name: .+$/m, `${file} must declare a name`);
    assert.match(form, /^description: .+$/m, `${file} must declare a description`);
    assert.match(form, /^title: .+$/m, `${file} must declare a title prefix`);
    assert.match(form, /^body:$/m, `${file} must declare a body`);

    const ids = [...form.matchAll(/^\s+id:\s+([a-z0-9_]+)$/gm)].map((match) => match[1]);
    assert.ok(ids.length >= 5, `${file} must collect structured evidence`);
    assert.equal(new Set(ids).size, ids.length, `${file} contains duplicate field ids`);
    assert.doesNotMatch(form, /password|access[_ -]?token|api[_ -]?key/i);
  }
});

test('bug reports capture reproducible environment and evidence', () => {
  const form = read('.github/ISSUE_TEMPLATE/bug_report.yml');

  for (const contract of [
    'Affected agent',
    'Agent or tool version',
    'Operating system',
    'ADHDMode version or commit',
    'Installation method',
    'Reproduction steps',
    'Expected behavior',
    'Actual behavior',
    'Logs, screenshots, or exact output',
  ]) {
    assert.match(form, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('agent verification reports distinguish real launches from automation', () => {
  const form = read('.github/ISSUE_TEMPLATE/agent_verification.yml');

  assert.match(form, /Automated filesystem checks do not count as a successful launch/);
  assert.match(form, /Discovery evidence/);
  assert.match(form, /Activation command or action/);
  assert.match(form, /Quick mode result/);
  assert.match(form, /Debug mode result/);
  assert.match(form, /Execute mode result/);
  assert.match(form, /Resume mode result/);
  assert.match(form, /Removal or uninstall result/);
});

test('feature requests require concrete problems, safety, and verification', () => {
  const form = read('.github/ISSUE_TEMPLATE/feature_request.yml');

  assert.match(form, /Problem to solve/);
  assert.match(form, /Current behavior and evidence/);
  assert.match(form, /Proposed change/);
  assert.match(form, /Compatibility impact/);
  assert.match(form, /Correctness and safety considerations/);
  assert.match(form, /Suggested verification/);
});

test('pull request template preserves validation and safety gates', () => {
  const template = read('.github/pull_request_template.md');

  for (const contract of [
    '## Goal',
    '## Behavior impact',
    '## Agent compatibility',
    '`npm ci`',
    '`npm test`',
    '`npm run verify:install`',
    '`npm run pack:check`',
    'instruction precedence',
    'explicit user output contracts',
    'canonical skill policy',
  ]) {
    assert.match(template, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
