#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  ConfigError,
  DEFAULT_CONFIG,
  MODES,
  PROFILES,
  readConfig,
  updateConfig,
  validateConfig,
  writeJsonSafely,
} from '../lib/config.mjs';
import { alwaysOnFlagPath, defaultConfigPath } from '../lib/paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

function parseArgs(argv) {
  const positional = [];
  const options = { json: false, force: false, config: null, claudeDir: null };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--json') options.json = true;
    else if (value === '--force') options.force = true;
    else if (value === '--config') options.config = argv[++index];
    else if (value === '--claude-dir') options.claudeDir = argv[++index];
    else if (value === '--help' || value === '-h') positional.push('help');
    else positional.push(value);
  }
  return { positional, options };
}

function output(value, options) {
  if (options.json) console.log(JSON.stringify(value, null, 2));
  else if (typeof value === 'string') console.log(value);
  else {
    for (const [key, item] of Object.entries(value)) {
      console.log(`${key}: ${typeof item === 'object' ? JSON.stringify(item) : item}`);
    }
  }
}

function fail(error, options) {
  const message = error instanceof Error ? error.message : String(error);
  const details = error instanceof ConfigError ? error.errors : [];
  if (options.json) console.error(JSON.stringify({ ok: false, error: message, details }, null, 2));
  else {
    console.error(message);
    for (const detail of details) console.error(`- ${detail}`);
  }
  process.exit(1);
}

function resolvedConfig(options, positionalPath) {
  return path.resolve(positionalPath || options.config || defaultConfigPath());
}

function flagPath(options) {
  const env = options.claudeDir
    ? { ...process.env, CLAUDE_CONFIG_DIR: path.resolve(options.claudeDir) }
    : process.env;
  return alwaysOnFlagPath(env);
}

function help() {
  return `ADHDMode CLI v${pkg.version}

Usage:
  adhd-mode <command> [value] [options]

Commands:
  init [file]          Create a default configuration
  validate [file]      Validate a configuration
  config [file]        Print the active configuration
  mode <name>          Set auto, quick, execute, debug, explain, decide, or resume
  profile <name>       Set quick, balanced, guided, or deep
  enable               Enable Claude Code always-on mode
  disable              Disable Claude Code always-on mode
  status [file]        Show configuration and always-on status
  doctor               Check repository installation files and runtime
  skill                Print the canonical SKILL.md
  version              Print the version

Options:
  --config <file>      Configuration path
  --claude-dir <dir>   Override the Claude configuration directory
  --force              Back up and replace an existing file during init
  --json               Return machine-readable output
`;
}

const { positional, options } = parseArgs(process.argv.slice(2));
const command = positional[0] || 'help';

try {
  switch (command) {
    case 'init': {
      const file = resolvedConfig(options, positional[1]);
      let backup = null;
      if (fs.existsSync(file) && !options.force) {
        throw new Error(`Refusing to overwrite existing file: ${file}. Use --force to create a backup first.`);
      }
      if (fs.existsSync(file)) backup = writeJsonSafely(file, DEFAULT_CONFIG, { backup: true });
      else writeJsonSafely(file, DEFAULT_CONFIG);
      output({ ok: true, file, backup }, options);
      break;
    }
    case 'validate': {
      const file = resolvedConfig(options, positional[1]);
      const config = readConfig(file);
      output({ ok: true, file, config }, options);
      break;
    }
    case 'config': {
      const file = resolvedConfig(options, positional[1]);
      output(readConfig(file), options);
      break;
    }
    case 'mode': {
      const value = positional[1];
      if (!MODES.includes(value)) throw new Error(`Unsupported mode: ${String(value)}`);
      const file = resolvedConfig(options);
      output({ ok: true, file, config: updateConfig(file, { mode: value }) }, options);
      break;
    }
    case 'profile': {
      const value = positional[1];
      if (!PROFILES.includes(value)) throw new Error(`Unsupported profile: ${String(value)}`);
      const file = resolvedConfig(options);
      output({ ok: true, file, config: updateConfig(file, { profile: value }) }, options);
      break;
    }
    case 'enable': {
      const flag = flagPath(options);
      fs.mkdirSync(path.dirname(flag), { recursive: true });
      fs.writeFileSync(flag, 'ADHDMode always-on is enabled for Claude Code.\n', { mode: 0o600 });
      output({ ok: true, enabled: true, flag }, options);
      break;
    }
    case 'disable': {
      const flag = flagPath(options);
      fs.rmSync(flag, { force: true });
      output({ ok: true, enabled: false, flag }, options);
      break;
    }
    case 'status': {
      const file = resolvedConfig(options, positional[1]);
      const flag = flagPath(options);
      const result = {
        ok: true,
        version: pkg.version,
        configFile: file,
        configExists: fs.existsSync(file),
        configValid: false,
        alwaysOn: fs.existsSync(flag),
        alwaysOnFlag: flag,
      };
      if (result.configExists) {
        const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
        const errors = validateConfig(parsed);
        result.configValid = errors.length === 0;
        result.configErrors = errors;
        if (result.configValid) result.config = parsed;
      }
      output(result, options);
      break;
    }
    case 'doctor': {
      const required = [
        'skills/adhd-mode/SKILL.md',
        '.claude-plugin/plugin.json',
        '.claude-plugin/marketplace.json',
        '.codex-plugin/plugin.json',
        'claude-hooks/hooks.json',
        'gemini-extension.json',
      ];
      const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
      const nodeMajor = Number(process.versions.node.split('.')[0]);
      const defaultErrors = validateConfig(
        JSON.parse(fs.readFileSync(path.join(root, 'config/default.json'), 'utf8')),
      );
      const result = {
        ok: missing.length === 0 && nodeMajor >= 20 && defaultErrors.length === 0,
        node: process.versions.node,
        requiredNode: '>=20',
        missing,
        defaultConfigErrors: defaultErrors,
      };
      output(result, options);
      if (!result.ok) process.exitCode = 1;
      break;
    }
    case 'skill':
      process.stdout.write(fs.readFileSync(path.join(root, 'skills/adhd-mode/SKILL.md'), 'utf8'));
      break;
    case 'version':
      output(pkg.version, options);
      break;
    case 'help':
      process.stdout.write(help());
      break;
    default:
      throw new Error(`Unknown command: ${command}\n\n${help()}`);
  }
} catch (error) {
  fail(error, options);
}
