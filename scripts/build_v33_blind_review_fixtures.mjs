#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = {
  sourcePath: path.join(repoRoot, "reports/review_fixture_v33_300_stratified.json"),
  outDir: path.join(repoRoot, "reports/human_review")
};

const editableFields = {
  reviewer_decision: ["accept", "reject", "needs_adjudication"],
  reviewer_faithfulness: ["faithful", "minor_issue", "unfaithful"],
  reviewer_usability: ["usable", "partial", "unusable"],
  reviewer_notes: "short free-text explanation"
};

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--source") parsed.sourcePath = path.resolve(args[++index]);
    else if (arg === "--out-dir") parsed.outDir = path.resolve(args[++index]);
  }
  return parsed;
}

function readFixture(filePath) {
  const fixture = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return {
    ...fixture,
    rows: Array.isArray(fixture) ? fixture : fixture.rows || []
  };
}

function blindRow(row) {
  return {
    review_id: row.review_id,
    query_id: row.query_id,
    query_text: row.query_text,
    intent: row.intent,
    refusal_expected: row.refusal_expected,
    required_fields: row.required_fields || [],
    evidence_values: row.evidence_values || {},
    delivered_answer: row.generated_answer,
    reviewer_decision: "pending",
    reviewer_faithfulness: "pending",
    reviewer_usability: "pending",
    reviewer_notes: ""
  };
}

function buildBlindFixture(source, reviewerId, reviewerRole) {
  return {
    generated_at: new Date().toISOString(),
    source_fixture: path.relative(repoRoot, source.sourcePath),
    condition_id: source.fixture.condition_id || "v3.3_contract_top3_300_delivered",
    reviewer_id: reviewerId,
    reviewer_role: reviewerRole,
    sample_size: source.fixture.rows.length,
    blinding: {
      note: "Technical metadata, model internals, timing, row-selection cues, and automated screening outputs are removed from this review copy.",
      visible_fields: [
        "review_id",
        "query_id",
        "query_text",
        "intent",
        "refusal_expected",
        "required_fields",
        "evidence_values",
        "delivered_answer",
        "reviewer_decision",
        "reviewer_faithfulness",
        "reviewer_usability",
        "reviewer_notes"
      ]
    },
    instructions: {
      task: "Judge whether each delivered answer is faithful to the listed evidence values and usable as archive-facing prose.",
      reviewer_decision: editableFields.reviewer_decision,
      reviewer_faithfulness: editableFields.reviewer_faithfulness,
      reviewer_usability: editableFields.reviewer_usability,
      reviewer_notes: editableFields.reviewer_notes,
      do_not_edit: [
        "review_id",
        "query_id",
        "query_text",
        "intent",
        "refusal_expected",
        "required_fields",
        "evidence_values",
        "delivered_answer"
      ]
    },
    rows: source.fixture.rows.map(blindRow)
  };
}

function writeMessage(outDir) {
  const message = `# Reviewer B Invitation And Consent Text

## English

You are invited to act as an independent semantic reviewer for a research paper
on AI-generated archival answers. You will review a blinded sample of 80
answers using a fixed rubric. The task asks you to judge whether each answer is
faithful to the provided evidence values and usable as archive-facing prose.

You will not be asked to provide personal or sensitive information. Your
individual identity will not be reported in the submitted manuscript. Review
outcomes will be reported only in aggregate, unless you separately agree to be
acknowledged by name after acceptance.

Participation is voluntary, and you may stop at any time before submitting the
completed review file. This is not a test of your ability; it is a semantic
audit of system outputs.

Please reply "I agree" if you consent to participate as an independent semantic
reviewer.

## 中文

我想邀请你作为一名独立语义评审员，协助评审一篇关于 AI 生成档案答案的研究论文。你需要按照固定 rubric，对一份盲审样本中的 80 条答案进行判断：每条答案是否被提供的 evidence values 支撑，以及是否适合作为面向档案检索的说明性文字。

你不需要提供任何个人敏感信息。投稿稿件中不会披露你的个人身份。评审结果只会以汇总形式报告；如果论文接收后需要在 acknowledgements 中署名致谢，会另行征得你的同意。

参与是自愿的。在提交完成的评审文件之前，你可以随时退出。这不是对你个人能力的测试，而是对系统输出进行语义审查。

如果你同意作为独立语义评审员参与，请回复："I agree"。
`;
  fs.writeFileSync(path.join(outDir, "REVIEWER_B_INVITATION_AND_CONSENT.md"), message);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const options = parseArgs(process.argv.slice(2));
  const fixture = readFixture(options.sourcePath);
  fs.mkdirSync(options.outDir, { recursive: true });

  const source = { fixture, sourcePath: options.sourcePath };
  const reviewerA = buildBlindFixture(source, "reviewer_a_author_blind", "author_rater");
  const reviewerB = buildBlindFixture(source, "reviewer_b_independent_blind", "independent_semantic_reviewer");

  const reviewerAPath = path.join(options.outDir, "v33_reviewer_a_blind_fixture.json");
  const reviewerBPath = path.join(options.outDir, "v33_reviewer_b_blind_fixture.json");
  fs.writeFileSync(reviewerAPath, `${JSON.stringify(reviewerA, null, 2)}\n`);
  fs.writeFileSync(reviewerBPath, `${JSON.stringify(reviewerB, null, 2)}\n`);
  writeMessage(options.outDir);

  console.log(JSON.stringify({
    reviewer_a: path.relative(repoRoot, reviewerAPath),
    reviewer_b: path.relative(repoRoot, reviewerBPath),
    invitation: path.relative(repoRoot, path.join(options.outDir, "REVIEWER_B_INVITATION_AND_CONSENT.md")),
    rows: fixture.rows.length
  }, null, 2));
}
