import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { DEFAULT_CONFIG, readConfig, updateConfig, validateConfig, writeJsonSafely } from '../lib/config.mjs';

test('default configuration is valid', () => {
  assert.deepEqual(validateConfig(DEFAULT_CONFIG), []);
});

test('unknown and invalid fields are rejected', () => {
  const invalid = { ...DEFAULT_CONFIG, extra: true, mode: 'chaos', showProgress: 'yes' };
  const errors = validateConfig(invalid);
  assert(errors.some((item) => item.includes('Unknown property')));
  assert(errors.some((item) => item.includes('Unsupported mode')));
  assert(errors.some((item) => item.includes('showProgress')));
});

test('safe writes create backups and preserve valid JSON', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'adhd-mode-config-'));
  const file = path.join(directory, 'config.json');
  writeJsonSafely(file, DEFAULT_CONFIG);
  const backup = writeJsonSafely(file, { ...DEFAULT_CONFIG, mode: 'debug' }, { backup: true });
  assert(fs.existsSync(backup));
  assert.equal(readConfig(file).mode, 'debug');
  fs.rmSync(directory, { recursive: true, force: true });
});

test('config updates validate before writing', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'adhd-mode-update-'));
  const file = path.join(directory, 'config.json');
  writeJsonSafely(file, DEFAULT_CONFIG);
  assert.equal(updateConfig(file, { profile: 'guided' }).profile, 'guided');
  assert.throws(() => updateConfig(file, { profile: 'unknown' }));
  fs.rmSync(directory, { recursive: true, force: true });
});
