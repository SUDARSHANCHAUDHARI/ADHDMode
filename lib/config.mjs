import fs from 'node:fs';
import path from 'node:path';

export const MODES = Object.freeze([
  'auto',
  'quick',
  'execute',
  'debug',
  'explain',
  'decide',
  'resume',
]);

export const PROFILES = Object.freeze(['quick', 'balanced', 'guided', 'deep']);
export const DETAIL_LEVELS = Object.freeze(['compact', 'balanced', 'detailed']);
export const TIME_ESTIMATES = Object.freeze(['never', 'grounded-only']);

export const DEFAULT_CONFIG = Object.freeze({
  $schema: './adhd-mode.schema.json',
  mode: 'auto',
  profile: 'balanced',
  detailLevel: 'balanced',
  showProgress: true,
  showVerification: true,
  maxImmediateActions: 5,
  timeEstimates: 'grounded-only',
  language: 'auto',
  alwaysOn: false,
});

const REQUIRED_KEYS = Object.freeze([
  'mode',
  'profile',
  'detailLevel',
  'showProgress',
  'showVerification',
  'maxImmediateActions',
  'timeEstimates',
  'language',
  'alwaysOn',
]);
const ALLOWED_KEYS = new Set(['$schema', ...REQUIRED_KEYS]);

export class ConfigError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ConfigError';
    this.errors = errors;
  }
}

export function validateConfig(config) {
  const errors = [];

  if (config === null || typeof config !== 'object' || Array.isArray(config)) {
    return ['Configuration must be a JSON object.'];
  }

  for (const key of Object.keys(config)) {
    if (!ALLOWED_KEYS.has(key)) errors.push(`Unknown property: ${key}`);
  }

  for (const key of REQUIRED_KEYS) {
    if (!(key in config)) errors.push(`Missing required property: ${key}`);
  }

  if ('$schema' in config && typeof config.$schema !== 'string') {
    errors.push('$schema must be a string when provided.');
  }
  if (!MODES.includes(config.mode)) errors.push(`Unsupported mode: ${String(config.mode)}`);
  if (!PROFILES.includes(config.profile)) {
    errors.push(`Unsupported profile: ${String(config.profile)}`);
  }
  if (!DETAIL_LEVELS.includes(config.detailLevel)) {
    errors.push(`Unsupported detailLevel: ${String(config.detailLevel)}`);
  }
  if (typeof config.showProgress !== 'boolean') {
    errors.push('showProgress must be a boolean.');
  }
  if (typeof config.showVerification !== 'boolean') {
    errors.push('showVerification must be a boolean.');
  }
  if (
    !Number.isInteger(config.maxImmediateActions) ||
    config.maxImmediateActions < 1 ||
    config.maxImmediateActions > 10
  ) {
    errors.push('maxImmediateActions must be an integer from 1 to 10.');
  }
  if (!TIME_ESTIMATES.includes(config.timeEstimates)) {
    errors.push(`Unsupported timeEstimates value: ${String(config.timeEstimates)}`);
  }
  if (typeof config.language !== 'string' || config.language.trim().length < 2) {
    errors.push('language must be a string with at least two characters.');
  }
  if (typeof config.alwaysOn !== 'boolean') {
    errors.push('alwaysOn must be a boolean.');
  }

  return errors;
}

export function readConfig(file) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new ConfigError(`Cannot read configuration: ${error.message}`);
  }

  const errors = validateConfig(parsed);
  if (errors.length > 0) {
    throw new ConfigError(`Invalid configuration: ${file}`, errors);
  }
  return parsed;
}

export function writeJsonSafely(file, value, { backup = false } = {}) {
  const directory = path.dirname(file);
  fs.mkdirSync(directory, { recursive: true });

  let backupPath = null;
  if (fs.existsSync(file) && backup) {
    backupPath = `${file}.bak-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    fs.copyFileSync(file, backupPath);
  }

  const temporary = path.join(
    directory,
    `.${path.basename(file)}.${process.pid}.${Date.now()}.tmp`,
  );
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });

  try {
    fs.renameSync(temporary, file);
  } catch (error) {
    if (!['EEXIST', 'EPERM'].includes(error.code)) throw error;
    fs.rmSync(file, { force: true });
    fs.renameSync(temporary, file);
  } finally {
    fs.rmSync(temporary, { force: true });
  }

  return backupPath;
}

export function updateConfig(file, patch) {
  const current = readConfig(file);
  const updated = { ...current, ...patch };
  const errors = validateConfig(updated);
  if (errors.length > 0) throw new ConfigError('Updated configuration is invalid.', errors);
  writeJsonSafely(file, updated);
  return updated;
}
