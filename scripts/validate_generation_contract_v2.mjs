#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateGenerationContract } from "./validate_generation_contract.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const answersPath = process.argv.slice(2).find((arg) => !arg.startsWith("-"));
  if (!answersPath) {
    console.error("Usage: node scripts/validate_generation_contract_v2.mjs <answers.jsonl> [--strict]");
    process.exit(1);
  }
  const result = validateGenerationContract({ answersPath });
  console.log(JSON.stringify({
    validator: "generation_contract_v2_structured_value_match",
    answer_count: result.answer_count,
    fail_count: result.fail_count,
    warn_count: result.warn_count,
    note: "v2 reuses the canonical generation contract engine with evidence-value matching."
  }, null, 2));
  if (process.argv.includes("--strict") && result.fail_count > 0) process.exitCode = 1;
}

export { validateGenerationContract as validateGenerationV2 };
