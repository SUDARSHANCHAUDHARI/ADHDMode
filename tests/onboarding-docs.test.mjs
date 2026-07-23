import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const modes = ['auto', 'quick', 'execute', 'debug', 'explain', 'decide', 'resume'];
const profiles = ['quick', 'balanced', 'guided', 'deep'];

test('README exposes quick-start and examples navigation', () => {
  const readme = read('README.md');

  assert.match(readme, /\[Quick start\]\(docs\/quickstart\.md\)/);
  assert.match(readme, /\[Examples\]\(docs\/examples\.md\)/);
  assert.match(readme, /## Start in five minutes/);
  assert.match(readme, /npm run verify:install/);
});

test('quick start covers supported agents and exact activation contracts', () => {
  const quickstart = read('docs/quickstart.md');

  for (const agent of ['Claude Code', 'OpenAI Codex', 'Gemini CLI', 'GitHub Copilot', 'Cursor']) {
    assert.match(quickstart, new RegExp(agent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  for (const contract of [
    'claude plugin marketplace add SUDARSHANCHAUDHARI/ADHDMode',
    'claude plugin install adhd-mode@adhd-mode',
    '/adhd-mode:adhd-mode',
    '/skills',
    '@adhd-mode',
    '$adhd-mode',
    'legacy-compatible',
    'gemini extensions install https://github.com/SUDARSHANCHAUDHARI/ADHDMode.git',
    '/extensions list',
    '.github/skills/adhd-mode',
    '.cursor/skills/adhd-mode',
    'npm run verify:install',
  ]) {
    assert.match(quickstart, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(quickstart, /does not count as real-agent verification/);
  assert.match(quickstart, /must not invent evidence or claim that work was completed/);
});

test('quick start documents every mode and presentation profile', () => {
  const quickstart = read('docs/quickstart.md');

  for (const mode of modes) {
    assert.ok(quickstart.includes('| `' + mode + '` |'), `quick start is missing mode ${mode}`);
  }
  for (const profile of profiles) {
    assert.ok(quickstart.includes('| `' + profile + '` |'), `quick start is missing profile ${profile}`);
  }
});

test('examples cover every response mode with evidence and verification boundaries', () => {
  const examples = read('docs/examples.md');

  for (const mode of modes) {
    assert.ok(examples.includes('## `' + mode + '`'), `examples are missing mode ${mode}`);
  }

  for (const contract of [
    'must not invent results',
    'claim that commands were run when they were not',
    'A hypothesis should remain labeled as a hypothesis',
    'The recommendation appears before the supporting analysis',
    'distinguishes completed work from remaining work',
    'How will success be verified?',
  ]) {
    assert.match(examples, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('onboarding documents link to deeper installation, configuration, and verification guidance', () => {
  const quickstart = read('docs/quickstart.md');
  const examples = read('docs/examples.md');

  assert.match(quickstart, /\[Installation\]\(install\.md\)/);
  assert.match(quickstart, /\[Configuration\]\(configuration\.md\)/);
  assert.match(quickstart, /\[Agent verification\]\(agent-verification\.md\)/);
  assert.match(examples, /\[Agent verification\]\(agent-verification\.md\)/);
});