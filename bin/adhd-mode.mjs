#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const command = process.argv[2] || "help";
const target = process.argv[3];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const allowedModes = [
  "auto",
  "quick",
  "execute",
  "debug",
  "explain",
  "decide",
  "resume",
];
const allowedProfiles = ["quick", "balanced", "guided", "deep"];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function validateConfig(file) {
  let config;

  try {
    config = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`Cannot read configuration: ${error.message}`);
  }

  if (!allowedModes.includes(config.mode)) {
    fail(`Unsupported mode: ${config.mode}`);
  }

  if (!allowedProfiles.includes(config.profile)) {
    fail(`Unsupported profile: ${config.profile}`);
  }

  if (
    !Number.isInteger(config.maxImmediateActions) ||
    config.maxImmediateActions < 1 ||
    config.maxImmediateActions > 10
  ) {
    fail("maxImmediateActions must be an integer from 1 to 10");
  }

  console.log(`Configuration is valid: ${file}`);
}

switch (command) {
  case "validate": {
    const file = path.resolve(target || "adhd-mode.config.json");
    validateConfig(file);
    break;
  }

  case "init": {
    const destination = path.resolve(target || "adhd-mode.config.json");

    if (fs.existsSync(destination)) {
      fail(`Refusing to overwrite existing file: ${destination}`);
    }

    fs.copyFileSync(path.join(root, "config/default.json"), destination);
    console.log(`Created ${destination}`);
    break;
  }

  case "skill": {
    process.stdout.write(
      fs.readFileSync(path.join(root, "skills/adhd-mode/SKILL.md"), "utf8"),
    );
    break;
  }

  case "doctor": {
    const required = [
      "skills/adhd-mode/SKILL.md",
      ".claude-plugin/plugin.json",
      "hooks/hooks.json",
      ".codex-plugin/plugin.json",
      "gemini-extension.json",
    ];

    const missing = required.filter(
      (file) => !fs.existsSync(path.join(root, file)),
    );

    if (missing.length > 0) {
      fail(`Missing required files:\n${missing.join("\n")}`);
    }

    console.log("ADHDMode installation files are present.");
    break;
  }

  default:
    console.log(`ADHDMode CLI

Commands:
  init [file]       Create a default configuration without overwriting
  validate [file]   Validate a configuration
  skill             Print the canonical skill
  doctor            Check required installation files
`);
}
