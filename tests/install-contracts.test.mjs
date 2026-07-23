import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));

const repositoryUrl = 'https://github.com/SUDARSHANCHAUDHARI/ADHDMode.git';

test('distribution manifests use the current package version and install contracts', () => {
  const pkg = readJson('package.json');
  const lock = readJson('package-lock.json');
  const marketplace = readJson('.claude-plugin/marketplace.json');
  const claudePlugin = readJson('.claude-plugin/plugin.json');
  const codexPlugin = readJson('.codex-plugin/plugin.json');
  const geminiExtension = readJson('gemini-extension.json');

  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].version, pkg.version);
  assert.equal(marketplace.$schema, 'https://json.schemastore.org/claude-code-marketplace.json');
  assert.equal(marketplace.version, pkg.version);
  assert.equal(marketplace.plugins[0].version, pkg.version);
  assert.equal(marketplace.plugins[0].source, './');
  assert.equal(claudePlugin.$schema, 'https://json.schemastore.org/claude-code-plugin-manifest.json');
  assert.equal(claudePlugin.version, pkg.version);
  assert.equal(claudePlugin.displayName, 'ADHDMode');
  assert.equal(claudePlugin.hooks, './claude-hooks/hooks.json');
  assert.equal(codexPlugin.version, pkg.version);
  assert.equal(geminiExtension.version, pkg.version);
  assert.ok(read('README.md').includes(`/releases/tag/v${pkg.version}`));
  assert.ok(read('CHANGELOG.md').includes(`## ${pkg.version}`));
  assert.equal(fs.existsSync(path.join(root, `docs/release-notes-v${pkg.version}.md`)), true);
});

test('Codex distribution uses one canonical Agent Skill', () => {
  const plugin = readJson('.codex-plugin/plugin.json');

  assert.equal(plugin.skills, './skills/');
  assert.equal('hooks' in plugin, false);
  assert.equal(fs.existsSync(path.join(root, '.agents/plugins/marketplace.json')), false);
  assert.equal(fs.existsSync(path.join(root, 'skills/adhd-mode/SKILL.md')), true);
});

test('documented commands use current agent identifiers', () => {
  const readme = read('README.md');
  const install = read('docs/install.md');

  assert.match(readme, /\/adhd-mode:adhd-mode/);
  assert.doesNotMatch(readme, /Then run `\/adhd-mode`\./);
  assert.doesNotMatch(readme, /codex plugin marketplace add/);
  assert.match(readme, /\$REPO_ROOT\/\.agents\/skills\/adhd-mode\//);
  assert.match(readme, /@adhd-mode/);
  assert.match(readme, /\$adhd-mode/);
  assert.match(readme, /legacy-compatible fallback/);
  assert.match(readme, /gemini extensions install https:\/\/github\.com\/SUDARSHANCHAUDHARI\/ADHDMode\.git/);
  assert.match(readme, /pull requests only/);

  assert.match(install, /claude plugin validate \. --strict/);
  assert.doesNotMatch(install, /codex plugin marketplace add/);
  assert.match(install, /\$HOME\/\.agents\/skills\/adhd-mode\//);
  assert.match(install, /Mentions V2 by default/);
  assert.match(install, /@adhd-mode/);
  assert.match(install, /\$adhd-mode/);
  assert.match(install, /gemini skills install .* --path skills\/adhd-mode --consent/);
  assert.match(install, /\.github\/skills\/adhd-mode\//);
  assert.match(install, /\.cursor\/skills\/adhd-mode\//);
});

test('README keeps public project and author information', () => {
  const readme = read('README.md');

  for (const heading of [
    '## Why ADHDMode',
    '## Key features',
    '## Supported agents',
    '## Installation',
    '## Safety and scope',
    '## Author',
  ]) {
    assert.match(readme, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(readme, /Sudarshan Kishor Chaudhari/);
  assert.match(readme, /https:\/\/github\.com\/SUDARSHANCHAUDHARI/);
  assert.match(readme, /Creator and maintainer of ADHDMode/);
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

test('release package includes supported distribution metadata', () => {
  const pkg = readJson('package.json');

  assert.equal(pkg.private, true);
  assert.equal(pkg.files.includes('.agents/'), false);
  assert.ok(pkg.files.includes('.claude-plugin/'));
  assert.ok(pkg.files.includes('.codex-plugin/'));
  assert.ok(pkg.files.includes('skills/'));
  assert.equal(repositoryUrl.endsWith('/ADHDMode.git'), true);
});
