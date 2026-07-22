#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(scriptPath), '..');

export function parseMode(args) {
  const supported = new Set(['--check', '--publish', '--help', '-h']);
  const unknown = args.filter((arg) => !supported.has(arg));
  if (unknown.length > 0) throw new Error(`Unknown option: ${unknown.join(', ')}`);

  const help = args.includes('--help') || args.includes('-h');
  const publish = args.includes('--publish');
  const check = args.includes('--check');
  if (publish && check) throw new Error('Use either --check or --publish, not both.');
  if (help) return 'help';
  return publish ? 'publish' : 'check';
}

export function ensureSupportedNode(version = process.versions.node) {
  const major = Number.parseInt(String(version).split('.')[0], 10);
  if (!Number.isInteger(major) || major < 20) {
    throw new Error(`Node.js 20 or newer is required; found ${version}.`);
  }
  return major;
}

export function tagForVersion(version) {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Invalid package version: ${version}`);
  }
  return `v${version}`;
}

export function releaseNotesPath(version) {
  return `docs/release-notes-v${version}.md`;
}

export function normalizeVisibility(value) {
  return String(value || '').trim().toUpperCase();
}

export function releaseTitle(version) {
  return `ADHDMode v${version}`;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: options.inherit ? 'inherit' : 'pipe',
    env: process.env,
  });

  if (result.error) {
    throw new Error(`${command} could not start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const detail = [result.stderr, result.stdout].filter(Boolean).join('\n').trim();
    throw new Error(`${command} ${args.join(' ')} failed${detail ? `:\n${detail}` : '.'}`);
  }
  return String(result.stdout || '').trim();
}

function tryRun(command, args) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: 'pipe',
    env: process.env,
  });
  return {
    ok: !result.error && result.status === 0,
    stdout: String(result.stdout || '').trim(),
    stderr: String(result.stderr || '').trim(),
  };
}

function printHelp() {
  console.log(`ADHDMode release helper\n\nUsage:\n  npm run release:check\n  npm run release:publish\n\nModes:\n  --check    Validate release readiness without changing Git or GitHub.\n  --publish  Create and push the version tag, then publish the GitHub release.\n\nSafety:\n  The default mode is --check. Publishing stops unless the repository is public,\n  the working tree is clean, the current branch is main, GitHub CLI is authenticated,\n  all tests pass, and the release notes file exists.`);
}

function readPackage() {
  const packagePath = path.join(repositoryRoot, 'package.json');
  return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
}

function inspectRepository(version) {
  ensureSupportedNode();
  run('git', ['--version']);
  run('gh', ['--version']);
  run('gh', ['auth', 'status']);

  const status = run('git', ['status', '--porcelain']);
  if (status) throw new Error('The Git working tree is not clean. Commit or stash changes first.');

  const branch = run('git', ['branch', '--show-current']);
  if (branch !== 'main') throw new Error(`Release publishing must run from main; current branch is ${branch || '(detached)'}.`);

  const head = run('git', ['rev-parse', 'HEAD']);
  const repository = JSON.parse(run('gh', ['repo', 'view', '--json', 'visibility,nameWithOwner,defaultBranchRef']));
  if (normalizeVisibility(repository.visibility) !== 'PUBLIC') {
    throw new Error(`Repository ${repository.nameWithOwner || ''} must be public before release publishing.`.trim());
  }
  if (repository.defaultBranchRef?.name !== 'main') {
    throw new Error(`Expected default branch main; found ${repository.defaultBranchRef?.name || 'unknown'}.`);
  }

  const notesRelative = releaseNotesPath(version);
  const notesAbsolute = path.join(repositoryRoot, notesRelative);
  if (!fs.existsSync(notesAbsolute)) throw new Error(`Missing release notes: ${notesRelative}`);

  const tag = tagForVersion(version);
  const localTag = tryRun('git', ['rev-list', '-n', '1', tag]);
  if (localTag.ok && localTag.stdout !== head) {
    throw new Error(`Local tag ${tag} points to ${localTag.stdout}, not current HEAD ${head}.`);
  }

  const remoteTag = tryRun('git', ['ls-remote', '--exit-code', '--tags', 'origin', `refs/tags/${tag}`]);
  const release = tryRun('gh', ['release', 'view', tag, '--json', 'tagName,url']);

  return {
    branch,
    head,
    repository: repository.nameWithOwner,
    tag,
    notesRelative,
    localTagExists: localTag.ok,
    remoteTagExists: remoteTag.ok,
    releaseExists: release.ok,
    releaseUrl: release.ok ? JSON.parse(release.stdout).url : null,
  };
}

function runReleaseGates() {
  run('npm', ['ci'], { inherit: true });
  run('npm', ['test'], { inherit: true });
  run('npm', ['run', 'pack:check'], { inherit: true });
}

function printSummary(state, mode) {
  console.log('\nRelease readiness');
  console.log(`Repository: ${state.repository}`);
  console.log(`Branch: ${state.branch}`);
  console.log(`Commit: ${state.head}`);
  console.log(`Tag: ${state.tag} (${state.remoteTagExists ? 'already on origin' : 'not yet pushed'})`);
  console.log(`Release: ${state.releaseExists ? state.releaseUrl : 'not yet published'}`);
  console.log(`Notes: ${state.notesRelative}`);
  console.log(mode === 'publish' ? 'Publishing prerequisites passed.' : 'Check completed without changing Git or GitHub.');
}

function publishRelease(state, version) {
  if (!state.localTagExists) {
    run('git', ['tag', '-a', state.tag, '-m', releaseTitle(version)]);
    console.log(`Created local tag ${state.tag}.`);
  }

  if (!state.remoteTagExists) {
    run('git', ['push', 'origin', state.tag], { inherit: true });
    console.log(`Pushed ${state.tag} to origin.`);
  }

  if (!state.releaseExists) {
    run('gh', [
      'release',
      'create',
      state.tag,
      '--verify-tag',
      '--title',
      releaseTitle(version),
      '--notes-file',
      state.notesRelative,
    ], { inherit: true });
    console.log(`Published GitHub release ${state.tag}.`);
  } else {
    console.log(`GitHub release ${state.tag} already exists: ${state.releaseUrl}`);
  }
}

export function main(args = process.argv.slice(2)) {
  const mode = parseMode(args);
  if (mode === 'help') {
    printHelp();
    return;
  }

  const pkg = readPackage();
  const state = inspectRepository(pkg.version);
  runReleaseGates();
  printSummary(state, mode);

  if (mode === 'publish') publishRelease(state, pkg.version);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === scriptPath;
if (isMain) {
  try {
    main();
  } catch (error) {
    console.error(`Release blocked: ${error.message}`);
    process.exitCode = 1;
  }
}
