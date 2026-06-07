#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const steps = [
  ["gold:build", ["npm", "run", "gold:build"]],
  ["evidence:health:strict", ["npm", "run", "evidence:health:strict"]],
  ["evidence:value:strict", ["npm", "run", "evidence:value:strict"]],
  ["method:context:strict", ["npm", "run", "method:context:strict"]],
  ["labels:consistency:strict", ["npm", "run", "labels:consistency:strict"]],
  ["audit:labels:strict", ["npm", "run", "audit:labels:strict"]],
  ["gold:sufficiency", ["npm", "run", "gold:sufficiency"]],
  ["retrieval:coverage", ["npm", "run", "retrieval:coverage"]],
  ["audit:quality", ["npm", "run", "audit:quality"]]
];

for (const [name, command] of steps) {
  console.log(`\n=== ${name} ===`);
  const result = spawnSync(command[0], command.slice(1), {
    stdio: "inherit",
    shell: false
  });
  if (result.status !== 0) {
    console.error(`\nPipeline stopped at ${name}.`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nFull label adjudication pipeline passed.");
