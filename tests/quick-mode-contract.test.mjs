import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('quick mode is concise and uses verified current state', () => {
  const skill = read('skills/adhd-mode/SKILL.md');
  const cases = read('evals/cases.jsonl')
    .trim()
    .split(/\r?\n/)
    .map((line) => JSON.parse(line));

  assert.match(skill, /Return only the requested result, fields, and number of actions/);
  assert.match(skill, /Do not recommend repeating work that is already completed, published, deployed, or verified/);
  assert.match(skill, /prefer the direct evidence/);
  assert.match(skill, /optional next step, or generic closing invitation/);
  assert.match(skill, /Verified current state outranks stale planning artifacts/);

  const regression = cases.find((item) => item.id === 'quick-current-release-state');
  assert.ok(regression);
  assert.equal(regression.mode, 'quick');
  assert.match(regression.prompt, /single most important remaining action/);
  assert.ok(regression.must.some((item) => item.includes('verified current state')));
  assert.ok(regression.must.some((item) => item.includes('one remaining action')));
  assert.ok(regression.must_not.some((item) => item.includes('rerunning release publication')));
  assert.ok(regression.must_not.some((item) => item.includes('generic closing invitation')));
});
