import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const root = process.cwd();

const requiredFiles = [
  "README.md",
  "LICENSE",
  "INSPIRATIONS.md",
  "adhd-mode.schema.json",
  "config/default.json",
  "skills/adhd-mode/SKILL.md",
  "skills/adhd-mode/agents/openai.yaml",
  "skills/adhd-mode/agents/gemini.toml",
  ".claude-plugin/plugin.json",
  ".claude-plugin/marketplace.json",
  "hooks/hooks.json",
  "hooks/session-start.js",
  ".codex-plugin/plugin.json",
  "gemini-extension.json",
  "GEMINI.md",
  "evals/cases.jsonl",
];

const errors = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    errors.push(`Missing required file: ${file}`);
  }
}

const jsonFiles = [
  "package.json",
  "adhd-mode.schema.json",
  "config/default.json",
  ".claude-plugin/plugin.json",
  ".claude-plugin/marketplace.json",
  ".codex-plugin/plugin.json",
  "gemini-extension.json",
  "hooks/hooks.json",
];

for (const file of jsonFiles) {
  try {
    JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  } catch (error) {
    errors.push(`Invalid JSON in ${file}: ${error.message}`);
  }
}

const plugin = JSON.parse(
  fs.readFileSync(path.join(root, ".claude-plugin/plugin.json"), "utf8"),
);

if ("hooks" in plugin) {
  errors.push(
    ".claude-plugin/plugin.json must not redeclare conventional hooks/hooks.json",
  );
}

const skill = fs.readFileSync(
  path.join(root, "skills/adhd-mode/SKILL.md"),
  "utf8",
);

for (const phrase of [
  "does not diagnose",
  "Use time estimates only when grounded",
  "Respect explicit output contracts",
  "Repeated failed fixes",
]) {
  if (!skill.toLowerCase().includes(phrase.toLowerCase())) {
    errors.push(`Canonical skill is missing required policy: ${phrase}`);
  }
}

const config = JSON.parse(
  fs.readFileSync(path.join(root, "config/default.json"), "utf8"),
);
const schema = JSON.parse(
  fs.readFileSync(path.join(root, "adhd-mode.schema.json"), "utf8"),
);

if (!schema.properties?.$schema) {
  errors.push("Configuration schema must allow the $schema metadata field");
}

const allowedModes = new Set([
  "auto",
  "quick",
  "execute",
  "debug",
  "explain",
  "decide",
  "resume",
]);

if (!allowedModes.has(config.mode)) {
  errors.push(`Unsupported default mode: ${config.mode}`);
}

if (
  !Number.isInteger(config.maxImmediateActions) ||
  config.maxImmediateActions < 1 ||
  config.maxImmediateActions > 10
) {
  errors.push("maxImmediateActions must be an integer from 1 to 10");
}

const hookPath = path.join(root, "hooks/session-start.js");
const inactiveDir = fs.mkdtempSync(path.join(os.tmpdir(), "adhd-mode-off-"));
const inactive = spawnSync(process.execPath, [hookPath], {
  encoding: "utf8",
  env: {
    ...process.env,
    CLAUDE_CONFIG_DIR: inactiveDir,
    CLAUDE_PLUGIN_ROOT: root,
  },
});

if (inactive.status !== 0 || inactive.stdout !== "") {
  errors.push("Claude hook must exit quietly when always-on mode is disabled");
}

const activeDir = fs.mkdtempSync(path.join(os.tmpdir(), "adhd-mode-on-"));
fs.writeFileSync(path.join(activeDir, ".adhd-mode-always"), "");
const active = spawnSync(process.execPath, [hookPath], {
  encoding: "utf8",
  env: {
    ...process.env,
    CLAUDE_CONFIG_DIR: activeDir,
    CLAUDE_PLUGIN_ROOT: root,
  },
});

if (active.status !== 0 || !active.stdout.includes("ADHDMODE ACTIVE")) {
  errors.push(
    `Claude hook smoke test failed: ${active.stderr || "missing active output"}`,
  );
}

fs.rmSync(inactiveDir, { recursive: true, force: true });
fs.rmSync(activeDir, { recursive: true, force: true });

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Repository validation passed.");
