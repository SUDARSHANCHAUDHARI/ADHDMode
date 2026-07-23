import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));

test('public release checklist matches the current published version', () => {
  const checklist = read('docs/release-checklist.md');
  const pkg = readJson('package.json');

  for (const completedItem of [
    'Change the GitHub repository from private to public with owner approval.',
    'Run `npm run release:check` successfully.',
    'Run `npm run release:publish` to create the version tag and GitHub release.',
    'Confirm remote installation from a clean environment without prior private repository access.',
  ]) {
    assert.match(checklist, new RegExp(`- \\[x\\] ${completedItem.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}`));
  }

  assert.match(checklist, new RegExp(`releases/tag/v${pkg.version.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}`));
  assert.match(checklist, /issue #12/);
  assert.match(checklist, /Complete authenticated quick, execute, resume, explain, decide, auto, and safety behavior checks/);
  assert.doesNotMatch(checklist, /- \[ \] Change the GitHub repository from private to public/);
  assert.doesNotMatch(checklist, /- \[ \] Run `npm run release:publish`/);
});
