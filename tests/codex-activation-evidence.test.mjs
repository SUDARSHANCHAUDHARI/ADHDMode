import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('Codex guidance distinguishes verified activation from legacy syntax', () => {
  const readme = read('README.md');
  const install = read('docs/install.md');
  const quickstart = read('docs/quickstart.md');
  const verification = read('docs/agent-verification.md');

  for (const document of [readme, install, quickstart, verification]) {
    assert.match(document, /@adhd-mode/);
    assert.match(document, /\$adhd-mode/);
  }

  assert.match(readme, /unverified legacy syntax/);
  assert.match(readme, /observable `SKILL\.md` loading/);
  assert.match(install, /Do not treat this as a verified activation path/);
  assert.match(quickstart, /use `@adhd-mode` as the verified activation path/);
  assert.match(verification, /test `\$adhd-mode` separately as unverified legacy syntax/);
  assert.doesNotMatch(readme, /legacy-compatible fallback/);
  assert.doesNotMatch(quickstart, /form remains available in Codex/);
});
