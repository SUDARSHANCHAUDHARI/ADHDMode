import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hook = path.join(root, 'claude-hooks/session-start.mjs');
function run(configDir, pluginRoot = root) {
  return spawnSync(process.execPath, [hook], {
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_CONFIG_DIR: configDir, CLAUDE_PLUGIN_ROOT: pluginRoot },
  });
}

test('hook stays silent when disabled', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'adhd-mode-hook-off-'));
  const result = run(directory);
  assert.equal(result.status, 0);
  assert.equal(result.stdout, '');
  fs.rmSync(directory, { recursive: true, force: true });
});

test('hook loads canonical policy when enabled', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'adhd-mode-hook-on-'));
  fs.writeFileSync(path.join(directory, '.adhd-mode-always'), '');
  const result = run(directory);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /ADHDMODE ACTIVE/);
  assert.match(result.stdout, /Instruction precedence/);
  fs.rmSync(directory, { recursive: true, force: true });
});

test('hook reports missing policy without blocking startup', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'adhd-mode-hook-error-'));
  const pluginRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'adhd-mode-empty-'));
  fs.writeFileSync(path.join(directory, '.adhd-mode-always'), '');
  const result = run(directory, pluginRoot);
  assert.equal(result.status, 0);
  assert.match(result.stderr, /could not load/);
  fs.rmSync(directory, { recursive: true, force: true });
  fs.rmSync(pluginRoot, { recursive: true, force: true });
});
