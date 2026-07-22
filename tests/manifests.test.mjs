import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

test('all manifest versions match package version', () => {
  const version = read('package.json').version;
  assert.equal(read('.claude-plugin/plugin.json').version, version);
  assert.equal(read('.claude-plugin/marketplace.json').metadata.version, version);
  assert.equal(read('.codex-plugin/plugin.json').version, version);
  assert.equal(read('gemini-extension.json').version, version);
});

test('agent-specific loading stays isolated', () => {
  assert.equal(read('.claude-plugin/plugin.json').hooks, './claude-hooks/hooks.json');
  assert.equal(read('.codex-plugin/plugin.json').skills, './skills/');
  assert.equal('hooks' in read('.codex-plugin/plugin.json'), false);
  assert.equal(fs.existsSync(path.join(root, 'hooks/hooks.json')), false);
});
