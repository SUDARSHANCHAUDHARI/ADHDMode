import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));

const repositoryUrl = 'https://github.com/SUDARSHANCHAUDHARI/ADHDMode.git';

test('Claude marketplace and plugin use current install contracts', () => {
  const marketplace = readJson('.claude-plugin/marketplace.json');
  const plugin = readJson('.claude-plugin/plugin.json');

  assert.equal(marketplace.$schema, 'https://json.schemastore.org/claude-code-marketplace.json');
  assert.equal(marketplace.version, '0.1.0');
  assert.equal(marketplace.plugins[0].source, './');
  assert.equal(plugin.$schema, 'https://json.schemastore.org/claude-code-plugin-manifest.json');
  assert.equal(plugin.displayName, 'ADHDMode');
  assert.equal(plugin.hooks, './claude-hooks/hooks.json');
});

test('Codex marketplace points to the repository plugin', () => {
  const marketplace = readJson('.agents/plugins/marketplace.json');
  const plugin = readJson('.codex-plugin/plugin.json');
  const entry = marketplace.plugins[0];

  assert.equal(marketplace.interface.displayName, 'ADHDMode');
  assert.equal(entry.name, 'adhd-mode');
  assert.deepEqual(entry.source, {
    source: 'url',
    url: repositoryUrl,
    ref: 'main',
  });
  assert.equal(entry.policy.installation, 'AVAILABLE');
  assert.equal(entry.policy.authentication, 'ON_INSTALL');
  assert.equal(plugin.skills, './skills/');
  assert.equal('hooks' in plugin, false);
});

test('documented commands use current agent identifiers', () => {
  const readme = read('README.md');
  const install = read('docs/install.md');

  assert.match(readme, /\/adhd-mode:adhd-mode/);
  assert.doesNotMatch(readme, /Then run `\/adhd-mode`\./);
  assert.match(readme, /codex plugin marketplace add SUDARSHANCHAUDHARI\/ADHDMode/);
  assert.match(readme, /gemini extensions install https:\/\/github\.com\/SUDARSHANCHAUDHARI\/ADHDMode\.git/);
  assert.match(readme, /pull requests only/);

  assert.match(install, /claude plugin validate \. --strict/);
  assert.match(install, /gemini skills install .* --path skills\/adhd-mode --consent/);
  assert.match(install, /\.github\/skills\/adhd-mode\//);
  assert.match(install, /\.cursor\/skills\/adhd-mode\//);
});

test('canonical skill can be copied into supported project skill locations', () => {
  const source = path.join(root, 'skills/adhd-mode');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'adhd-mode-install-'));
  const destinations = [
    '.agents/skills/adhd-mode',
    '.gemini/skills/adhd-mode',
    '.cursor/skills/adhd-mode',
    '.github/skills/adhd-mode',
  ];

  try {
    for (const relative of destinations) {
      const destination = path.join(temporary, relative);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.cpSync(source, destination, { recursive: true });
      const skill = fs.readFileSync(path.join(destination, 'SKILL.md'), 'utf8');
      assert.match(skill, /^---\n/);
      assert.match(skill, /\nname: adhd-mode\n/);
      assert.match(skill, /\ndescription:/);
    }
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('release package includes distribution metadata', () => {
  const pkg = readJson('package.json');

  assert.equal(pkg.private, true);
  assert.ok(pkg.files.includes('.agents/'));
  assert.ok(pkg.files.includes('.claude-plugin/'));
  assert.ok(pkg.files.includes('.codex-plugin/'));
  assert.ok(pkg.files.includes('skills/'));
});
