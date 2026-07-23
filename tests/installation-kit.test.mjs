import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import test from 'node:test';

const root = process.cwd();
const script = path.join(root, 'scripts/verify-install.mjs');

function run(...args) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: 'utf8',
  });
}

test('clean-install verifier produces a complete machine-readable report', () => {
  const result = run('--json');

  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.ok, true);
  assert.equal(report.canonicalSkill, 'skills/adhd-mode');
  assert.ok(report.canonicalFiles >= 1);

  assert.deepEqual(
    report.agents.map((agent) => agent.id),
    [
      'claude-code',
      'openai-codex',
      'gemini-cli',
      'github-copilot',
      'cursor',
      'generic-agent',
    ],
  );

  assert.deepEqual(
    report.cleanLayouts.map((layout) => layout.path),
    [
      '.agents/skills/adhd-mode',
      '.gemini/skills/adhd-mode',
      '.github/skills/adhd-mode',
      '.cursor/skills/adhd-mode',
    ],
  );

  for (const layout of report.cleanLayouts) {
    assert.ok(layout.files >= 1);
  }
  assert.match(report.note, /Real agent launch tests remain manual/);
});

test('clean-install verifier provides useful human output', () => {
  const result = run();

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /ADHDMode clean-install verification passed/);
  assert.match(result.stdout, /openai-codex/);
  assert.match(result.stdout, /github-copilot/);
  assert.match(result.stdout, /docs\/agent-verification\.md/);
});

test('clean-install verifier rejects unsupported options', () => {
  const result = run('--force');

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unsupported option: --force/);
});
