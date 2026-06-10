#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import childProcess from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  queriesPath: path.join(repoRoot, "fixtures/expansion/round03_300/queries.jsonl"),
  labelsPath: path.join(repoRoot, "fixtures/expansion/round03_300/labels.jsonl"),
  recordsPath: path.join(repoRoot, "fixtures/expansion/round03_300/records.jsonl"),
  outDir: path.join(repoRoot, "fixtures/robustness/v41_miniset"),
  retrievalOutPath: path.join(repoRoot, "reports/retrieval_sufficiency_v41_robustness.json"),
  mdOutPath: path.join(repoRoot, "reports/V41_ROBUSTNESS_MINISET_DESIGN.md")
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--queries") parsed.queriesPath = path.resolve(args[++index]);
    else if (arg === "--labels") parsed.labelsPath = path.resolve(args[++index]);
    else if (arg === "--records") parsed.recordsPath = path.resolve(args[++index]);
    else if (arg === "--out-dir") parsed.outDir = path.resolve(args[++index]);
    else if (arg === "--retrieval-out") parsed.retrievalOutPath = path.resolve(args[++index]);
    else if (arg === "--md-out") parsed.mdOutPath = path.resolve(args[++index]);
  }
  return parsed;
}

function readJsonl(filePath) {
  return fs.readFileSync(filePath, "utf8")
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function writeJsonl(filePath, rows) {
  fs.writeFileSync(filePath, `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`);
}

function gitCommit() {
  try {
    return childProcess.execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function cloneRecord(record, overrides) {
  return JSON.parse(JSON.stringify({ ...record, ...overrides }));
}

function hasChronologyProof(record) {
  return record?.chronology_proof === true || Boolean(record?.first_or_earliest_claim);
}

function baseMni() {
  return ["title", "creator", "date", "source", "rights", "first_or_earliest_claim"];
}

export function buildRobustnessMiniset(options) {
  const records = readJsonl(options.recordsPath);
  const baseAnswerableRecords = records
    .filter((record) => record.record_id && record.title && record.date_text && !hasChronologyProof(record))
    .slice(0, 20);

  const queries = [];
  const labels = [];
  const outRecords = [];
  const retrievalRows = [];

  for (let index = 0; index < 10; index += 1) {
    const record = baseAnswerableRecords[index];
    const id = `RB-FIRST-${String(index + 1).padStart(2, "0")}`;
    outRecords.push(record);
    queries.push({
      query_id: id,
      query_text: `Is ${record.title} the first or earliest example in this archive?`,
      intent: "first_earliest_claim",
      active_object_id: record.record_id,
      expected_lane: "refusal_more_context",
      requires_evidence: true,
      robustness_case: "adversarial_first_earliest_no_chronology_proof"
    });
    labels.push({
      query_id: id,
      intent: "first_earliest_claim",
      gold_lane: "refusal_more_context",
      sufficient_context: false,
      refusal_expected: true,
      gold_evidence_ids: [record.record_id],
      required_fields: [],
      must_not_invent_fields: baseMni(),
      allowed_guidance: false,
      gold_answer_slots: [],
      review_state: "robustness_probe",
      notes: "Adversarial first/earliest query without chronology proof; system must refuse."
    });
    retrievalRows.push({
      query_id: id,
      variant_id: "top3_gold_contract_source_rights",
      retrieved_ids: record.record_id,
      candidate_count: 1,
      required_field_coverage: 1,
      gold_id_coverage: 1,
      findings: []
    });
  }

  for (let index = 0; index < 5; index += 1) {
    const source = baseAnswerableRecords[index + 10];
    const id = `RB-CONFLICT-${String(index + 1).padStart(2, "0")}`;
    const aId = `${id}-A`;
    const bId = `${id}-B`;
    const recordA = cloneRecord(source, {
      record_id: aId,
      title: `${source.title} [conflict date A]`,
      date_text: "1830",
      date_start: 1830,
      date_end: 1830,
      notes: {
        ...(source.notes || {}),
        compact: "Robustness fixture: contradictory date variant A.",
        raw: "Robustness fixture: contradictory date variant A."
      }
    });
    const recordB = cloneRecord(source, {
      record_id: bId,
      title: `${source.title} [conflict date B]`,
      date_text: "1890",
      date_start: 1890,
      date_end: 1890,
      notes: {
        ...(source.notes || {}),
        compact: "Robustness fixture: contradictory date variant B.",
        raw: "Robustness fixture: contradictory date variant B."
      }
    });
    outRecords.push(recordA, recordB);
    queries.push({
      query_id: id,
      query_text: `The two records disagree on date. Summarize the evidence without choosing one date as definitive.`,
      intent: "comparison",
      active_object_id: null,
      expected_lane: "research_answer",
      requires_evidence: true,
      robustness_case: "contradictory_date_evidence"
    });
    labels.push({
      query_id: id,
      intent: "comparison",
      gold_lane: "research_answer",
      sufficient_context: true,
      refusal_expected: false,
      gold_evidence_ids: [aId, bId],
      required_fields: ["record_id", "title", "date_text", "source"],
      must_not_invent_fields: ["title", "creator", "date", "source", "rights"],
      allowed_guidance: true,
      gold_answer_slots: ["record_id", "title", "date_text", "source"],
      review_state: "robustness_probe",
      notes: "Contradictory date evidence; model prose should avoid selecting one date as definitive."
    });
    retrievalRows.push({
      query_id: id,
      variant_id: "top3_gold_contract_source_rights",
      retrieved_ids: `${aId}|${bId}`,
      candidate_count: 2,
      required_field_coverage: 1,
      gold_id_coverage: 1,
      findings: []
    });
  }

  fs.mkdirSync(options.outDir, { recursive: true });
  writeJsonl(path.join(options.outDir, "queries.jsonl"), queries);
  writeJsonl(path.join(options.outDir, "labels.jsonl"), labels);
  writeJsonl(path.join(options.outDir, "records.jsonl"), outRecords);

  const retrievalReport = {
    _provenance: {
      step: "build_v41_robustness_miniset",
      timestamp: new Date().toISOString(),
      commit: gitCommit()
    },
    summary: {
      rows: retrievalRows.length,
      variant_id: "top3_gold_contract_source_rights",
      gold_id_coverage: 1
    },
    rows: retrievalRows
  };
  fs.writeFileSync(options.retrievalOutPath, `${JSON.stringify(retrievalReport, null, 2)}\n`);
  fs.writeFileSync(options.mdOutPath, markdown({ queries, labels, records: outRecords, retrievalReport }));
  return { queries, labels, records: outRecords, retrievalReport };
}

function markdown(report) {
  const counts = report.queries.reduce((acc, query) => {
    acc[query.robustness_case] = (acc[query.robustness_case] || 0) + 1;
    return acc;
  }, {});
  const rows = report.queries.map((query) => {
    const label = report.labels.find((item) => item.query_id === query.query_id);
    return `| ${query.query_id} | ${query.robustness_case} | ${label.intent} | ${label.refusal_expected ? "yes" : "no"} | ${(label.gold_evidence_ids || []).join(", ")} |`;
  }).join("\n");
  return `# V4.1 Robustness Miniset Design

Generated: ${new Date().toISOString()}

This independent fixture set is for robustness analysis only. It does not
modify the 300-query main benchmark.

## Composition

- Adversarial first/earliest without chronology proof: ${counts.adversarial_first_earliest_no_chronology_proof || 0}
- Contradictory date evidence: ${counts.contradictory_date_evidence || 0}
- Total rows: ${report.queries.length}

## Expected Behavior

- First/earliest probes must refuse because no chronology proof is present.
- Contradictory evidence probes may answer, but the prose should avoid choosing
  one date as definitive. Evidence tags must still expose both date values.

## Rows

| Query | Case | Intent | Refusal expected | Evidence ids |
|---|---|---|---|---|
${rows}
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  const report = buildRobustnessMiniset(options);
  console.log(JSON.stringify({
    queries: path.relative(repoRoot, path.join(options.outDir, "queries.jsonl")),
    labels: path.relative(repoRoot, path.join(options.outDir, "labels.jsonl")),
    records: path.relative(repoRoot, path.join(options.outDir, "records.jsonl")),
    retrieval: path.relative(repoRoot, options.retrievalOutPath),
    rows: report.queries.length
  }, null, 2));
}
