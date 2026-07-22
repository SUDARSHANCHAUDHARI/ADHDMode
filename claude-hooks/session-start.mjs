import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { alwaysOnFlagPath } from '../lib/paths.mjs';

const flag = alwaysOnFlagPath();
if (!fs.existsSync(flag)) process.exit(0);

try {
  const localRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const root = path.resolve(process.env.CLAUDE_PLUGIN_ROOT || localRoot);
  const skillPath = path.join(root, 'skills', 'adhd-mode', 'SKILL.md');
  const raw = fs.readFileSync(skillPath, 'utf8');
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  process.stdout.write(
    [
      'ADHDMODE ACTIVE. Apply the instructions below for this session.',
      'The user can say "disable ADHDMode" or "normal mode" to stop it for this session.',
      '',
      body,
    ].join('\n'),
  );
} catch (error) {
  process.stderr.write(`ADHDMode could not load its skill file: ${error.message}\n`);
  process.exit(0);
}
