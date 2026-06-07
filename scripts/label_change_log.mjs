#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
}

function stableArray(value) {
  return JSON.stringify([...(value || [])].sort());
}

export function generateLabelChangeLog(oldPath, newPath) {
  const oldLabels = readJsonl(oldPath);
  const newLabels = readJsonl(newPath);
  const oldMap = new Map(oldLabels.map((label) => [label.query_id || label.id, label]));
  const newMap = new Map(newLabels.map((label) => [label.query_id || label.id, label]));
  const rows = [];

  for (const [id, newLabel] of newMap.entries()) {
    const oldLabel = oldMap.get(id);
    if (!oldLabel) {
      rows.push({ query_id: id, field: "NEW_LABEL", old_value: "", new_value: JSON.stringify(newLabel) });
      continue;
    }
    for (const key of ["intent", "gold_lane", "sufficient_context", "refusal_expected", "review_state"]) {
      if (JSON.stringify(oldLabel[key]) !== JSON.stringify(newLabel[key])) {
        rows.push({ query_id: id, field: key, old_value: oldLabel[key], new_value: newLabel[key] });
      }
    }
    for (const key of ["gold_evidence_ids", "required_fields", "must_not_invent_fields", "gold_answer_slots"]) {
      const oldValue = stableArray(oldLabel[key]);
      const newValue = stableArray(newLabel[key]);
      if (oldValue !== newValue) {
        rows.push({ query_id: id, field: key, old_value: oldValue, new_value: newValue });
      }
    }
  }

  for (const id of oldMap.keys()) {
    if (!newMap.has(id)) {
      rows.push({ query_id: id, field: "REMOVED_LABEL", old_value: JSON.stringify(oldMap.get(id)), new_value: "" });
    }
  }

  return rows.sort((a, b) => a.query_id.localeCompare(b.query_id) || a.field.localeCompare(b.field));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [oldPath, newPath] = process.argv.slice(2);
  if (!oldPath || !newPath) {
    console.error("Usage: node scripts/label_change_log.mjs <old_labels.jsonl> <new_labels.jsonl>");
    process.exit(1);
  }
  const rows = generateLabelChangeLog(oldPath, newPath);
  console.log(["query_id", "field", "old_value", "new_value"].join(","));
  for (const row of rows) {
    console.log([row.query_id, row.field, row.old_value, row.new_value].map(csvEscape).join(","));
  }
}
