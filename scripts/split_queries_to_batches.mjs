#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");
const defaultBaselineLabelsPath = path.join(repoRoot, "fixtures/gold/labels.jsonl");
const defaultOutPath = path.join(repoRoot, "reports/query_expansion_batches.json");

function readJsonl(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return [];
  return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function parseArgs(args) {
  const positional = [];
  const parsed = { batchSize: 50, baseline: defaultBaselineLabelsPath, out: defaultOutPath };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    if (arg === "--batch-size") {
      parsed.batchSize = Number(args[index + 1]);
      index += 1;
    } else if (arg === "--baseline") {
      parsed.baseline = path.resolve(args[index + 1]);
      index += 1;
    } else if (arg === "--out") {
      parsed.out = path.resolve(args[index + 1]);
      index += 1;
    }
  }
  parsed.queryPath = positional[0] ? path.resolve(positional[0]) : null;
  return parsed;
}

function distribution(rows) {
  const counts = new Map();
  for (const row of rows) {
    counts.set(row.intent, (counts.get(row.intent) || 0) + 1);
  }
  const total = rows.length || 1;
  return Object.fromEntries([...counts.entries()].map(([intent, count]) => [intent, count / total]));
}

function groupByIntent(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.intent)) groups.set(row.intent, []);
    groups.get(row.intent).push(row);
  }
  return groups;
}

function takeRoundRobin(groups, batch, targetSize) {
  const intents = [...groups.keys()].sort();
  let moved = true;
  while (batch.length < targetSize && moved) {
    moved = false;
    for (const intent of intents) {
      const rows = groups.get(intent) || [];
      if (rows.length === 0 || batch.length >= targetSize) continue;
      batch.push(rows.shift());
      moved = true;
    }
  }
}

export function splitQueriesToBatches(newQueries, {
  batchSize = 50,
  intentDistribution = {}
} = {}) {
  const groups = groupByIntent(newQueries);
  const batches = [];
  let batchIndex = 1;

  while ([...groups.values()].some((rows) => rows.length > 0)) {
    const batch = [];
    for (const [intent, ratio] of Object.entries(intentDistribution)) {
      const target = Math.max(0, Math.round(batchSize * ratio));
      const rows = groups.get(intent) || [];
      batch.push(...rows.splice(0, Math.min(target, rows.length)));
    }
    takeRoundRobin(groups, batch, batchSize);
    if (batch.length > 0) {
      batches.push({
        batch_id: `batch_${String(batchIndex).padStart(2, "0")}`,
        size: batch.length,
        intent_counts: Object.fromEntries(
          [...groupByIntent(batch).entries()].map(([intent, rows]) => [intent, rows.length]).sort(([a], [b]) => a.localeCompare(b))
        ),
        queries: batch
      });
      batchIndex += 1;
    }
  }

  return batches;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.queryPath) {
    console.error("Usage: node scripts/split_queries_to_batches.mjs <new_queries.jsonl> [--batch-size 50] [--baseline fixtures/gold/labels.jsonl] [--out reports/query_expansion_batches.json]");
    process.exit(1);
  }
  const newQueries = readJsonl(args.queryPath);
  const baseline = readJsonl(args.baseline);
  const batches = splitQueriesToBatches(newQueries, {
    batchSize: args.batchSize,
    intentDistribution: distribution(baseline)
  });
  const result = {
    _provenance: {
      step: "split_queries_to_batches",
      timestamp: new Date().toISOString(),
      query_path: path.relative(repoRoot, args.queryPath),
      baseline_path: path.relative(repoRoot, args.baseline),
      batch_size: args.batchSize
    },
    query_count: newQueries.length,
    batch_count: batches.length,
    batches
  };
  fs.writeFileSync(args.out, JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify({
    out: path.relative(repoRoot, args.out),
    query_count: result.query_count,
    batch_count: result.batch_count
  }, null, 2));
}
