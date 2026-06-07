#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");

function argValue(name) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : "";
}

function list(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function quoteList(items) {
  return `[${items.map((item) => `"${item}"`).join(", ")}]`;
}

function template({ intent, lanes, requiredFields, mandatoryRefusal }) {
  return `# Intent Scaffold: ${intent}

Generated: ${new Date().toISOString()}

This scaffold is a review artifact. Do not paste it blindly; update rules and
tests together, then run \`npm run audit:full\`.

## Rule Entries

\`\`\`js
// KNOWN_INTENTS
"${intent}",

// INTENT_LANE_MAP
${intent}: ${quoteList(lanes)},

// REQUIRED_FIELDS_BY_INTENT
${intent}: ${quoteList(requiredFields)},

// STABLE_RULE_REQUIRED_FIELDS
${intent}: ${quoteList(requiredFields)},
${mandatoryRefusal ? `\n// MANDATORY_REFUSAL_INTENTS\n"${intent}",\n` : ""}
\`\`\`

## Stable Rule Checklist

- Define answerable evidence fields.
- Define stable refusal inverse condition.
- Add intent query hint markers.
- Add at least two benchmark queries.
- Add at least one negative or insufficient-evidence case.
- Re-run \`npm run audit:full\`.
`;
}

async function collectOptions() {
  let intent = argValue("intent");
  let lanes = list(argValue("lanes"));
  let requiredFields = list(argValue("required"));
  let mandatoryRefusal = ["1", "true", "yes", "y"].includes(argValue("mandatory-refusal").toLowerCase());

  if (!intent || lanes.length === 0) {
    const rl = readline.createInterface({ input, output });
    intent ||= (await rl.question("New intent name: ")).trim();
    if (lanes.length === 0) lanes = list(await rl.question("Legal lanes (comma-separated): "));
    if (requiredFields.length === 0) requiredFields = list(await rl.question("Required fields when answerable (comma-separated, blank for none): "));
    if (!argValue("mandatory-refusal")) {
      mandatoryRefusal = ["y", "yes"].includes((await rl.question("Mandatory refusal intent? (y/n): ")).trim().toLowerCase());
    }
    rl.close();
  }

  if (!/^[a-z][a-z0-9_]*$/.test(intent)) {
    throw new Error(`Invalid intent name: ${intent}`);
  }
  return { intent, lanes, requiredFields, mandatoryRefusal };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  collectOptions().then((options) => {
    const outDir = path.join(repoRoot, "reports/intent_scaffolds");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `${options.intent}.md`);
    const body = template(options);
    fs.writeFileSync(outPath, body);
    console.log(JSON.stringify({
      scaffold: path.relative(repoRoot, outPath),
      intent: options.intent,
      lanes: options.lanes,
      required_fields: options.requiredFields,
      mandatory_refusal: options.mandatoryRefusal
    }, null, 2));
  }).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
