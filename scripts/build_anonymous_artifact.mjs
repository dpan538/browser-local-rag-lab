#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaultFiles = [
  "README.md",
  "EXPERIMENT_STATUS.md",
  "CLAIMS_AND_NON_CLAIMS.md",
  "REPRODUCIBILITY.md",
  "DATA_CARD.md",
  "SOURCE_ATTRIBUTION.md",
  "MODEL_RUNTIME_CARD.md",
  "EVIDENCE_PACKET_SPEC.md",
  "ANSWER_LANE_SPEC.md",
  "package.json",
  "browser_lab/webllm_round.html",
  "browser_lab/webllm_round.js",
  "browser_lab/webllm_v33.html",
  "fixtures/expansion/round03_300/queries.jsonl",
  "fixtures/expansion/round03_300/labels.jsonl",
  "fixtures/expansion/round03_300/records.jsonl",
  "reports/FINAL_ARTIFACT_INDEX.md",
  "reports/WEBLLM_ROUND_03_LATENCY300_V33_POSTPROCESSED_PROSE.md",
  "reports/STATISTICAL_EVIDENCE_V42.md",
  "reports/RAW_VS_DELIVERED_V33.md",
  "reports/QUALITY_REVIEW_PROTOCOL_V33.md",
  "reports/QUALITY_REVIEW_SUMMARY_V33_300.md",
  "reports/review_fixture_v33_300_stratified.json",
  "reports/GOLD_LABEL_AUDIT_300.md",
  "reports/RETRIEVAL_SUFFICIENCY_300_CONTRACT.md",
  "reports/PROMPT_AUDIT_ROUND03_300_V33.md",
  "reports/CONTRACT_ORACLE_ROUND03_300_CONTRACT.md",
  "reports/QUALITY_FAITHFULNESS_V33_300.md",
  "reports/QUALITY_USABILITY_V33_300.md",
  "reports/HALLUCINATION_V33_300.md",
  "reports/MISREADING_V33_300.md",
  "reports/GUARDRAIL_COMPLIANCE_V33_300.md",
  "reports/FACTS_COVERAGE_V33_300.md",
  "reports/READABILITY_V33_300.md",
  "reports/V41_FINAL_CROSS_MODEL_RECORD.md",
  "reports/V42_EVIDENCE_CLOSURE_ANALYSIS.md",
  "reports/V42_ROBUSTNESS_EVAL.md",
  "experiments/v3.3_contract_top3_300/manifest.json",
  "scripts/build_v33_manifest.mjs",
  "scripts/build_v33_review_fixture.mjs",
  "scripts/summarize_v33_human_review.mjs",
  "scripts/compare_raw_delivered_v33.mjs",
  "scripts/statistical_evidence_v42.mjs"
];

function parseArgs(args) {
  const options = {
    outDir: path.join(repoRoot, "artifact_anonymous"),
    overwrite: false
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--out") options.outDir = path.resolve(args[++index]);
    else if (arg === "--overwrite") options.overwrite = true;
  }
  return options;
}

function scrubText(text) {
  return text
    .replace(/dpan538\/browser-local-rag-lab/gi, "[anonymized-repo]")
    .replace(/https:\/\/github\.com\/dpan538\/browser-local-rag-lab/gi, "[anonymized-repo-url]")
    .replace(/\bDai Pan\b/g, "[author]")
    .replace(/\bPan Dai\b/g, "[author]")
    .replace(/潘岱/g, "[author]")
    .replace(/"commit_sha":\s*"[^"]+"/g, '"commit_sha": "[removed_for_anonymous_review]"')
    .replace(/"generated_at":\s*"[^"]+"/g, '"generated_at": "[removed_for_anonymous_review]"');
}

function shouldScrub(filePath) {
  return /\.(md|json|jsonl|js|html|cff|txt)$/i.test(filePath);
}

function copyFile(relativePath, outDir) {
  const sourcePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(sourcePath)) return null;
  const targetPath = path.join(outDir, relativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  if (shouldScrub(relativePath)) {
    fs.writeFileSync(targetPath, scrubText(fs.readFileSync(sourcePath, "utf8")));
  } else {
    fs.copyFileSync(sourcePath, targetPath);
  }
  return relativePath;
}

function writeAnonymousReadme(outDir, copiedFiles) {
  const readme = `# Anonymous Research Artifact

This package is an anonymized review copy of the V3.3 controlled browser-local
RAG research artifact.

## Included Scope

- final controlled condition: \`v3.3_contract_top3_300_delivered\`
- paper-facing reports, specs, and quality screens
- compact public metadata fixtures
- scripts needed to regenerate paper-facing non-WebGPU artifacts

## Excluded Scope

- public repository identity and author metadata
- Git history
- model weights and browser caches
- images, raw HTML, cookies, sessions, and secrets
- historical diagnostic reports not needed for paper review

## Files

${copiedFiles.map((file) => `- \`${file}\``).join("\n")}
`;
  fs.writeFileSync(path.join(outDir, "ANONYMOUS_ARTIFACT_README.md"), readme);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const options = parseArgs(process.argv.slice(2));
  if (fs.existsSync(options.outDir)) {
    if (!options.overwrite) {
      console.error(`Output directory already exists: ${path.relative(repoRoot, options.outDir)}`);
      console.error("Use --overwrite to replace it.");
      process.exit(1);
    }
    fs.rmSync(options.outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(options.outDir, { recursive: true });
  const copiedFiles = defaultFiles.map((file) => copyFile(file, options.outDir)).filter(Boolean);
  writeAnonymousReadme(options.outDir, copiedFiles);
  console.log(JSON.stringify({
    out_dir: path.relative(repoRoot, options.outDir),
    copied_files: copiedFiles.length,
    note: "Review the anonymized artifact before sharing; do not include Git history or public repository URLs."
  }, null, 2));
}
