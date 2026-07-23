#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const supportedOptions = new Set(['--help', '--json']);

for (const option of args) {
  if (!supportedOptions.has(option)) {
    console.error(`Unsupported option: ${option}`);
    process.exit(1);
  }
}

if (args.has('--help')) {
  console.log(`ADHDMode clean-install verifier

Usage:
  npm run verify:install
  node scripts/verify-install.mjs --json

The command validates the agent manifests and copies the canonical skill into
clean temporary project layouts for Codex, Gemini CLI, GitHub Copilot, Cursor,
and a generic Agent Skills consumer. It does not launch proprietary agent CLIs.`);
  process.exit(0);
}

function fail(message) {
  throw new Error(message);
}

function requireCondition(condition, message) {
  if (!condition) fail(message);
}

function readJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}

function listFiles(directory, base = directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(base, absolutePath).split(path.sep).join('/');
    const stats = fs.lstatSync(absolutePath);

    if (stats.isSymbolicLink()) {
      fail(`Portable skill packages must not contain symbolic links: ${relativePath}`);
    }

    if (entry.isDirectory()) {
      files.push(...listFiles(absolutePath, base));
    } else if (entry.isFile()) {
      files.push(relativePath);
    } else {
      fail(`Unsupported filesystem entry in skill package: ${relativePath}`);
    }
  }
  return files.sort();
}

function digest(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function verifyExactCopy(source, destination) {
  const sourceFiles = listFiles(source);
  const destinationFiles = listFiles(destination);
  requireCondition(
    JSON.stringify(destinationFiles) === JSON.stringify(sourceFiles),
    `Copied skill file list differs at ${destination}`,
  );

  for (const relativePath of sourceFiles) {
    const sourceDigest = digest(path.join(source, relativePath));
    const destinationDigest = digest(path.join(destination, relativePath));
    requireCondition(
      destinationDigest === sourceDigest,
      `Copied skill content differs for ${relativePath} at ${destination}`,
    );
  }

  return sourceFiles;
}

function validateCanonicalSkill(source) {
  requireCondition(fs.existsSync(source), 'Missing canonical skill directory: skills/adhd-mode');
  const skillPath = path.join(source, 'SKILL.md');
  requireCondition(fs.existsSync(skillPath), 'Canonical skill is missing SKILL.md');
  const skill = fs.readFileSync(skillPath, 'utf8');
  requireCondition(/^---\n[\s\S]+?\n---\n/.test(skill), 'SKILL.md has invalid YAML frontmatter');
  requireCondition(/\nname: adhd-mode\n/.test(skill), 'SKILL.md must declare name: adhd-mode');
  requireCondition(/\ndescription:/.test(skill), 'SKILL.md must declare a description');
  return listFiles(source);
}

function validateAgentContracts() {
  const claudePlugin = readJson('.claude-plugin/plugin.json');
  const claudeMarketplace = readJson('.claude-plugin/marketplace.json');
  const codexPlugin = readJson('.codex-plugin/plugin.json');
  const geminiExtension = readJson('gemini-extension.json');

  requireCondition(claudePlugin.name === 'adhd-mode', 'Claude plugin name must be adhd-mode');
  requireCondition(claudePlugin.hooks === './claude-hooks/hooks.json', 'Claude hook path is invalid');
  requireCondition(fs.existsSync(path.join(root, 'claude-hooks/hooks.json')), 'Claude hook manifest is missing');
  requireCondition(claudeMarketplace.plugins?.[0]?.name === 'adhd-mode', 'Claude marketplace plugin is missing');
  requireCondition(claudeMarketplace.plugins?.[0]?.source === './', 'Claude marketplace source must be ./');
  requireCondition(codexPlugin.skills === './skills/', 'Codex plugin must point to ./skills/');
  requireCondition(!('hooks' in codexPlugin), 'Codex plugin must not load Claude hooks');
  requireCondition(geminiExtension.name === 'adhd-mode', 'Gemini extension name must be adhd-mode');
  requireCondition(fs.existsSync(path.join(root, 'adapters/generic/AGENTS.md')), 'Generic AGENTS.md adapter is missing');

  return [
    {
      id: 'claude-code',
      method: 'plugin manifest and marketplace contract',
      activation: '/adhd-mode:adhd-mode',
    },
    {
      id: 'openai-codex',
      method: 'clean Agent Skill copy',
      activation: '$adhd-mode',
    },
    {
      id: 'gemini-cli',
      method: 'extension contract and clean Agent Skill copy',
      activation: '/skills list',
    },
    {
      id: 'github-copilot',
      method: 'clean Agent Skill copy',
      activation: 'automatic discovery',
    },
    {
      id: 'cursor',
      method: 'clean Agent Skill copy',
      activation: 'automatic discovery',
    },
    {
      id: 'generic-agent',
      method: 'canonical skill and AGENTS.md adapter contract',
      activation: 'tool-specific discovery',
    },
  ];
}

const source = path.join(root, 'skills/adhd-mode');
const sourceFiles = validateCanonicalSkill(source);
const agents = validateAgentContracts();
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'adhd-mode-clean-install-'));
const layouts = [
  { agent: 'openai-codex', relativePath: '.agents/skills/adhd-mode' },
  { agent: 'gemini-cli', relativePath: '.gemini/skills/adhd-mode' },
  { agent: 'github-copilot', relativePath: '.github/skills/adhd-mode' },
  { agent: 'cursor', relativePath: '.cursor/skills/adhd-mode' },
];

const verifiedLayouts = [];
try {
  for (const layout of layouts) {
    const destination = path.join(temporaryRoot, layout.agent, layout.relativePath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.cpSync(source, destination, { recursive: true });
    const copiedFiles = verifyExactCopy(source, destination);
    verifiedLayouts.push({
      agent: layout.agent,
      path: layout.relativePath,
      files: copiedFiles.length,
    });
  }
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

const report = {
  ok: true,
  canonicalSkill: 'skills/adhd-mode',
  canonicalFiles: sourceFiles.length,
  agents,
  cleanLayouts: verifiedLayouts,
  note: 'Manifest and filesystem contracts passed. Real agent launch tests remain manual.',
};

if (args.has('--json')) {
  console.log(JSON.stringify(report));
} else {
  console.log('ADHDMode clean-install verification passed.');
  console.log(`Canonical skill: ${report.canonicalSkill} (${report.canonicalFiles} files)`);
  for (const layout of report.cleanLayouts) {
    console.log(`- ${layout.agent}: ${layout.path} (${layout.files} files, exact copy)`);
  }
  console.log('- claude-code: plugin manifest, marketplace, hook isolation, and namespaced activation verified');
  console.log('- generic-agent: AGENTS.md adapter contract verified');
  console.log('Real launch tests are tracked in docs/agent-verification.md.');
}
