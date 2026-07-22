import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin/adhd-mode.mjs');
function run(args, cwd, env = {}) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

test('CLI completes configuration lifecycle', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'adhd-mode-cli-'));
  const config = path.join(directory, 'adhd-mode.config.json');
  assert.equal(run(['init', config, '--json'], directory).status, 0);
  assert.equal(run(['validate', config], directory).status, 0);
  assert.equal(run(['mode', 'debug', '--config', config], directory).status, 0);
  assert.equal(run(['profile', 'guided', '--config', config], directory).status, 0);
  const status = run(['status', '--config', config, '--json'], directory);
  assert.equal(status.status, 0);
  const parsed = JSON.parse(status.stdout);
  assert.equal(parsed.config.mode, 'debug');
  assert.equal(parsed.config.profile, 'guided');
  fs.rmSync(directory, { recursive: true, force: true });
});

test('CLI refuses overwrite unless force creates a backup', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'adhd-mode-force-'));
  const config = path.join(directory, 'config.json');
  assert.equal(run(['init', config], directory).status, 0);
  assert.notEqual(run(['init', config], directory).status, 0);
  const forced = run(['init', config, '--force', '--json'], directory);
  assert.equal(forced.status, 0);
  const result = JSON.parse(forced.stdout);
  assert(result.backup && fs.existsSync(result.backup));
  fs.rmSync(directory, { recursive: true, force: true });
});

test('CLI enables and disables Claude always-on mode', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'adhd-mode-claude-'));
  assert.equal(run(['enable', '--claude-dir', directory], root).status, 0);
  assert(fs.existsSync(path.join(directory, '.adhd-mode-always')));
  assert.equal(run(['disable', '--claude-dir', directory], root).status, 0);
  assert(!fs.existsSync(path.join(directory, '.adhd-mode-always')));
  fs.rmSync(directory, { recursive: true, force: true });
});

test('CLI returns nonzero for invalid values', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'adhd-mode-invalid-'));
  const config = path.join(directory, 'config.json');
  run(['init', config], directory);
  assert.notEqual(run(['mode', 'chaos', '--config', config], directory).status, 0);
  assert.notEqual(run(['profile', 'unknown', '--config', config], directory).status, 0);
  fs.rmSync(directory, { recursive: true, force: true });
});
