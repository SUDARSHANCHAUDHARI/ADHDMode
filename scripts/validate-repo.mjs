import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { validateConfig } from '../lib/config.mjs';

const root = process.cwd();
const errors = [];
const requiredFiles = [
  'README.md',
  'LICENSE',
  'INSPIRATIONS.md',
  'SECURITY.md',
  'CHANGELOG.md',
  'adhd-mode.schema.json',
  'config/default.json',
  'skills/adhd-mode/SKILL.md',
  'skills/adhd-mode/agents/openai.yaml',
  '.claude-plugin/plugin.json',
  '.claude-plugin/marketplace.json',
  'claude-hooks/hooks.json',
  'claude-hooks/session-start.mjs',
  '.codex-plugin/plugin.json',
  'gemini-extension.json',
  'bin/adhd-mode.mjs',
  'lib/config.mjs',
  'lib/paths.mjs',
  'docs/install.md',
  'docs/release-notes-v0.1.0.md',
  'evals/cases.jsonl',
  'tests/install-contracts.test.mjs',
  '.github/workflows/validate.yml',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing required file: ${file}`);
}

for (const forbidden of [
  'hooks/hooks.json',
  'hooks/session-start.js',
  'GEMINI.md',
  'skills/adhd-mode/agents/gemini.toml',
  '.agents/plugins/marketplace.json',
]) {
  if (fs.existsSync(path.join(root, forbidden))) {
    errors.push(`Forbidden legacy or unsupported file remains: ${forbidden}`);
  }
}

const jsonFiles = [
  'package.json',
  'adhd-mode.schema.json',
  'config/default.json',
  '.claude-plugin/plugin.json',
  '.claude-plugin/marketplace.json',
  '.codex-plugin/plugin.json',
  'gemini-extension.json',
  'claude-hooks/hooks.json',
];
const json = new Map();
for (const file of jsonFiles) {
  try {
    json.set(file, JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')));
  } catch (error) {
    errors.push(`Invalid JSON in ${file}: ${error.message}`);
  }
}

const pkg = json.get('package.json');
if (pkg) {
  if (pkg.engines?.node !== '>=20') errors.push('package.json must require Node.js >=20');
  if (pkg.private !== true) errors.push('package.json must remain private to prevent accidental npm publication');
  if (pkg.bin?.['adhd-mode'] !== './bin/adhd-mode.mjs') errors.push('CLI bin path is invalid');
  if (pkg.files?.includes('.agents/')) errors.push('Package must not include an unsupported Codex marketplace directory');
}

const versioned = [
  ['.claude-plugin/plugin.json', 'version'],
  ['.claude-plugin/marketplace.json', 'version'],
  ['.codex-plugin/plugin.json', 'version'],
  ['gemini-extension.json', 'version'],
];
function nested(object, expression) {
  return expression.split('.').reduce((value, key) => value?.[key], object);
}
for (const [file, field] of versioned) {
  const value = nested(json.get(file), field);
  if (pkg && value !== pkg.version) errors.push(`${file} ${field} must match package version`);
}

const claude = json.get('.claude-plugin/plugin.json');
if (claude?.$schema !== 'https://json.schemastore.org/claude-code-plugin-manifest.json') {
  errors.push('Claude plugin must declare the current manifest schema');
}
if (claude?.displayName !== 'ADHDMode') errors.push('Claude plugin displayName must be ADHDMode');
if (claude?.hooks !== './claude-hooks/hooks.json') {
  errors.push('Claude plugin must explicitly isolate its hooks under claude-hooks/');
}

const claudeMarketplace = json.get('.claude-plugin/marketplace.json');
if (claudeMarketplace?.$schema !== 'https://json.schemastore.org/claude-code-marketplace.json') {
  errors.push('Claude marketplace must declare the current marketplace schema');
}
if ('metadata' in (claudeMarketplace || {})) {
  errors.push('Claude marketplace version and description must use supported top-level fields');
}
if (claudeMarketplace?.plugins?.[0]?.source !== './') {
  errors.push('Claude marketplace source must be ./');
}

const codex = json.get('.codex-plugin/plugin.json');
if (codex?.skills !== './skills/') errors.push('Codex plugin must bundle only ./skills/');
if ('hooks' in (codex || {})) errors.push('Codex plugin must not declare Claude hooks');
if (!codex?.author?.name) errors.push('Codex plugin must declare author.name');
for (const field of ['displayName', 'shortDescription', 'longDescription', 'developerName', 'category']) {
  if (!codex?.interface?.[field]) errors.push(`Codex plugin interface is missing ${field}`);
}

const config = json.get('config/default.json');
if (config) {
  for (const error of validateConfig(config)) errors.push(`Default config: ${error}`);
}
const schema = json.get('adhd-mode.schema.json');
if (!schema?.properties?.$schema) errors.push('Configuration schema must allow $schema metadata');
if (schema?.additionalProperties !== false) errors.push('Configuration schema must reject unknown properties');

const skillPath = path.join(root, 'skills/adhd-mode/SKILL.md');
if (fs.existsSync(skillPath)) {
  const skill = fs.readFileSync(skillPath, 'utf8');
  for (const phrase of [
    'does not diagnose',
    'Instruction precedence',
    'Use time estimates only when grounded',
    'Respect explicit output contracts',
    'Repeated failed fixes',
    '## Configuration',
  ]) {
    if (!skill.toLowerCase().includes(phrase.toLowerCase())) {
      errors.push(`Canonical skill is missing required policy: ${phrase}`);
    }
  }
  if (!/^---\n[\s\S]+?\n---\n/.test(skill)) errors.push('SKILL.md must have valid YAML frontmatter');
}

const readText = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readme = fs.existsSync(path.join(root, 'README.md')) ? readText('README.md') : '';
const install = fs.existsSync(path.join(root, 'docs/install.md')) ? readText('docs/install.md') : '';
for (const [file, text, phrases] of [
  ['README.md', readme, [
    '/adhd-mode:adhd-mode',
    '$REPO_ROOT/.agents/skills/adhd-mode/',
    '$adhd-mode',
    'gemini extensions install https://github.com/SUDARSHANCHAUDHARI/ADHDMode.git',
    'pull requests only',
  ]],
  ['docs/install.md', install, [
    'claude plugin validate . --strict',
    '/adhd-mode:adhd-mode',
    '$REPO_ROOT/.agents/skills/adhd-mode/',
    '$HOME/.agents/skills/adhd-mode/',
    'gemini skills install https://github.com/SUDARSHANCHAUDHARI/ADHDMode.git --path skills/adhd-mode --consent',
    '.github/skills/adhd-mode/',
    '.cursor/skills/adhd-mode/',
  ]],
]) {
  for (const phrase of phrases) {
    if (!text.includes(phrase)) errors.push(`${file} is missing installation contract: ${phrase}`);
  }
}
if (readme.includes('Then run `/adhd-mode`.')) errors.push('README uses the unnamespaced Claude skill command');
if (readme.includes('codex plugin marketplace add')) errors.push('README advertises an unsupported Codex marketplace flow');
if (install.includes('codex plugin marketplace add')) errors.push('Installation guide advertises an unsupported Codex marketplace flow');
if (readme.includes('pushes to `main`')) errors.push('README incorrectly claims validation runs after merge');

const hookPath = path.join(root, 'claude-hooks/session-start.mjs');
function runHook(configDir, pluginRoot = root) {
  return spawnSync(process.execPath, [hookPath], {
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_CONFIG_DIR: configDir, CLAUDE_PLUGIN_ROOT: pluginRoot },
  });
}
if (fs.existsSync(hookPath)) {
  const inactiveDir = fs.mkdtempSync(path.join(os.tmpdir(), 'adhd-mode-off-'));
  const inactive = runHook(inactiveDir);
  if (inactive.status !== 0 || inactive.stdout !== '') {
    errors.push('Claude hook must exit quietly when always-on mode is disabled');
  }

  const activeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'adhd-mode-on-'));
  fs.writeFileSync(path.join(activeDir, '.adhd-mode-always'), '');
  const active = runHook(activeDir);
  if (active.status !== 0 || !active.stdout.includes('ADHDMODE ACTIVE')) {
    errors.push(`Claude hook active smoke test failed: ${active.stderr || 'missing output'}`);
  }

  const missingRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'adhd-mode-missing-'));
  const missing = runHook(activeDir, missingRoot);
  if (missing.status !== 0 || !missing.stderr.includes('could not load')) {
    errors.push('Claude hook must report load failures without blocking startup');
  }
  fs.rmSync(inactiveDir, { recursive: true, force: true });
  fs.rmSync(activeDir, { recursive: true, force: true });
  fs.rmSync(missingRoot, { recursive: true, force: true });
}

const workflowDir = path.join(root, '.github/workflows');
if (fs.existsSync(workflowDir)) {
  const workflows = fs.readdirSync(workflowDir).filter((file) => /\.ya?ml$/.test(file));
  if (workflows.length !== 1 || workflows[0] !== 'validate.yml') {
    errors.push(`Expected exactly one workflow named validate.yml, found: ${workflows.join(', ')}`);
  }
  const workflow = readText('.github/workflows/validate.yml');
  if (!/^\s*pull_request:/m.test(workflow)) errors.push('Validation workflow must run on pull requests');
  if (/^\s*push:/m.test(workflow)) errors.push('Validation workflow must not run automatically after merge');
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('Repository validation passed.');
