import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  ensureSupportedNode,
  normalizeVisibility,
  parseMode,
  releaseNotesPath,
  releaseTitle,
  remoteTagTarget,
  tagForVersion,
} from '../scripts/release.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('release helper defaults to non-mutating check mode', () => {
  assert.equal(parseMode([]), 'check');
  assert.equal(parseMode(['--check']), 'check');
  assert.equal(parseMode(['--publish']), 'publish');
  assert.equal(parseMode(['--help']), 'help');
  assert.equal(parseMode(['-h']), 'help');
});

test('release helper rejects ambiguous or unknown modes', () => {
  assert.throws(() => parseMode(['--check', '--publish']), /either --check or --publish/);
  assert.throws(() => parseMode(['--force']), /Unknown option/);
});

test('release metadata is derived from package version', () => {
  assert.equal(tagForVersion('0.1.0'), 'v0.1.0');
  assert.equal(tagForVersion('1.2.3-rc.1'), 'v1.2.3-rc.1');
  assert.equal(tagForVersion('1.2.3+build.4'), 'v1.2.3+build.4');
  assert.equal(releaseNotesPath('0.1.0'), 'docs/release-notes-v0.1.0.md');
  assert.equal(releaseTitle('0.1.0'), 'ADHDMode v0.1.0');
  assert.throws(() => tagForVersion('version-one'), /Invalid package version/);
});

test('release helper enforces supported Node versions', () => {
  assert.equal(ensureSupportedNode('20.0.0'), 20);
  assert.equal(ensureSupportedNode('22.4.1'), 22);
  assert.throws(() => ensureSupportedNode('18.20.0'), /Node.js 20 or newer/);
});

test('repository visibility comparison is case-insensitive', () => {
  assert.equal(normalizeVisibility('public'), 'PUBLIC');
  assert.equal(normalizeVisibility(' PUBLIC '), 'PUBLIC');
  assert.equal(normalizeVisibility(undefined), '');
});

test('remote annotated tags resolve to the peeled commit', () => {
  const output = [
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\trefs/tags/v0.1.0',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\trefs/tags/v0.1.0^{}',
  ].join('\n');

  assert.equal(remoteTagTarget(output, 'v0.1.0'), 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
});

test('remote lightweight tags resolve directly', () => {
  const output = 'cccccccccccccccccccccccccccccccccccccccc\trefs/tags/v0.1.0';
  assert.equal(remoteTagTarget(output, 'v0.1.0'), 'cccccccccccccccccccccccccccccccccccccccc');
  assert.equal(remoteTagTarget('', 'v0.1.0'), null);
});

test('help can run without GitHub CLI or repository mutations', () => {
  const result = spawnSync(process.execPath, ['scripts/release.mjs', '--help'], {
    cwd: root,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /default mode is --check/i);
  assert.match(result.stdout, /--publish/);
});
