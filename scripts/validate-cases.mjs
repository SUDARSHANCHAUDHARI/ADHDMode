import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const file = path.join(process.cwd(), 'evals/cases.jsonl');
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
const allowedModes = new Set(['auto', 'quick', 'execute', 'debug', 'explain', 'decide', 'resume']);
const allowedRisk = new Set(['low', 'medium', 'high']);
const requiredCategories = new Set([
  'direct', 'output-contract', 'agent-autonomy', 'debugging', 'progress', 'safety',
  'ambiguity', 'explanation', 'decision', 'time-estimate', 'multilingual', 'medical-boundary',
]);
const ids = new Set();
const modes = new Set();
const categories = new Set();
const risks = new Set();
const errors = [];

if (lines.length < 40) errors.push(`Expected at least 40 evaluation cases, found ${lines.length}`);

for (const [index, line] of lines.entries()) {
  let item;
  try {
    item = JSON.parse(line);
  } catch (error) {
    errors.push(`Line ${index + 1} is invalid JSON: ${error.message}`);
    continue;
  }
  for (const key of ['id', 'category', 'mode', 'prompt', 'must', 'must_not', 'risk']) {
    if (!(key in item)) errors.push(`Case on line ${index + 1} is missing ${key}`);
  }
  if (typeof item.id !== 'string' || item.id.length < 3) errors.push(`Line ${index + 1} has invalid id`);
  if (ids.has(item.id)) errors.push(`Duplicate case id: ${item.id}`);
  ids.add(item.id);
  modes.add(item.mode);
  categories.add(item.category);
  risks.add(item.risk);
  if (!allowedModes.has(item.mode)) errors.push(`Case ${item.id} has unsupported mode: ${item.mode}`);
  if (!allowedRisk.has(item.risk)) errors.push(`Case ${item.id} has unsupported risk: ${item.risk}`);
  if (typeof item.prompt !== 'string' || item.prompt.trim().length < 8) errors.push(`Case ${item.id} has a weak prompt`);
  if (!Array.isArray(item.must) || item.must.length < 2) errors.push(`Case ${item.id} needs at least two required behaviors`);
  if (!Array.isArray(item.must_not) || item.must_not.length < 1) errors.push(`Case ${item.id} needs at least one forbidden behavior`);
}

for (const mode of allowedModes) if (!modes.has(mode)) errors.push(`No evaluation case covers mode: ${mode}`);
for (const category of requiredCategories) if (!categories.has(category)) errors.push(`Missing evaluation category: ${category}`);
for (const risk of allowedRisk) if (!risks.has(risk)) errors.push(`No evaluation case covers risk: ${risk}`);

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Evaluation validation passed: ${lines.length} cases across ${categories.size} categories.`);
