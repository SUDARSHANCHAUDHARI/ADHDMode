import os from 'node:os';
import path from 'node:path';

export function defaultConfigPath(env = process.env, cwd = process.cwd()) {
  return path.resolve(env.ADHD_MODE_CONFIG || path.join(cwd, 'adhd-mode.config.json'));
}

export function claudeConfigDir(env = process.env) {
  return path.resolve(env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'));
}

export function alwaysOnFlagPath(env = process.env) {
  return path.join(claudeConfigDir(env), '.adhd-mode-always');
}
