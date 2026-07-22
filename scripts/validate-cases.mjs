import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const file = path.join(process.cwd(), "evals/cases.jsonl");
const lines = fs
  .readFileSync(file, "utf8")
  .split(/\r?\n/)
  .filter(Boolean);

const allowedModes = new Set([
  "auto",
  "quick",
  "execute",
  "debug",
  "explain",
  "decide",
  "resume",
]);
const allowedRisk = new Set(["low", "medium", "high"]);
const ids = new Set();
const errors = [];

if (lines.length < 20) {
  errors.push(`Expected at least 20 evaluation cases, found ${lines.length}`);
}

for (const [index, line] of lines.entries()) {
  let item;

  try {
    item = JSON.parse(line);
  } catch (error) {
    errors.push(`Line ${index + 1} is invalid JSON: ${error.message}`);
    continue;
  }

  for (const key of ["id", "mode", "prompt", "must", "risk"]) {
    if (!(key in item)) {
      errors.push(`Case on line ${index + 1} is missing ${key}`);
    }
  }

  if (ids.has(item.id)) {
    errors.push(`Duplicate case id: ${item.id}`);
  }
  ids.add(item.id);

  if (!allowedModes.has(item.mode)) {
    errors.push(`Case ${item.id} has unsupported mode: ${item.mode}`);
  }

  if (!allowedRisk.has(item.risk)) {
    errors.push(`Case ${item.id} has unsupported risk: ${item.risk}`);
  }

  if (!Array.isArray(item.must) || item.must.length < 2) {
    errors.push(`Case ${item.id} must define at least two expectations`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Evaluation validation passed: ${lines.length} cases.`);
