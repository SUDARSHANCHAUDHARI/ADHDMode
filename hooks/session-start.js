const fs = require("fs");
const os = require("os");
const path = require("path");

const claudeDir =
  process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
const flagPath = path.join(claudeDir, ".adhd-mode-always");

if (!fs.existsSync(flagPath)) {
  process.exit(0);
}

try {
  const skillPath = path.join(
    process.env.CLAUDE_PLUGIN_ROOT || path.join(__dirname, ".."),
    "skills",
    "adhd-mode",
    "SKILL.md",
  );

  const raw = fs.readFileSync(skillPath, "utf8");
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");

  process.stdout.write(
    [
      "ADHDMODE ACTIVE. Apply the instructions below for this session.",
      'The user can say "disable ADHDMode" or "normal mode" to stop it.',
      "",
      body,
    ].join("\n"),
  );
} catch (error) {
  process.stderr.write(
    `ADHDMode could not load its skill file: ${error.message}\n`,
  );
  process.exit(0);
}
