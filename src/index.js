#!/usr/bin/env node

/**
 * Bug Report Generator — QA Companion CLI
 *
 * Helps QA testers produce fast, consistent bug reports.
 * Can build a report from scratch (interactive prompts) or ingest
 * a failed test result (e.g. from a Cypress/Mocha JSON output) and
 * pre-fill most of the report automatically.
 *
 * Usage:
 *   node src/index.js create              -> interactive bug report
 *   node src/index.js from-test <path>     -> generate report from failed test JSON
 *   node src/index.js check-duplicate      -> check a new bug against logged bugs
 */

import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import clipboardy from "clipboardy";
import si from "systeminformation";
import { buildMarkdownReport, buildJiraReport } from "./formatters.js";
import { getEnvironmentInfo } from "./environment.js";
import { checkDuplicate, loadBugLog, saveBugToLog } from "./duplicateCheck.js";
import { suggestSeverity } from "./severity.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const command = process.argv[2];

async function createInteractive() {
  const answers = await inquirer.prompt([
    { type: "input", name: "title", message: "Bug title:" },
    { type: "input", name: "stepsToReproduce", message: "Steps to reproduce (semicolon-separated):" },
    { type: "input", name: "expected", message: "Expected result:" },
    { type: "input", name: "actual", message: "Actual result:" },
    {
      type: "list",
      name: "format",
      message: "Output format:",
      choices: ["Markdown", "Jira", "Plain text (clipboard)"]
    }
  ]);

  const env = await getEnvironmentInfo();
  const severity = suggestSeverity(answers.actual);

  const bug = {
    title: answers.title,
    steps: answers.stepsToReproduce.split(";").map((s) => s.trim()).filter(Boolean),
    expected: answers.expected,
    actual: answers.actual,
    environment: env,
    severity,
    createdAt: new Date().toISOString()
  };

  const dupes = checkDuplicate(bug.title, loadBugLog());
  if (dupes.length) {
    console.log("\n⚠️  Similar existing bug(s) found:");
    dupes.forEach((d) => console.log(`   - [${(d.score * 100).toFixed(0)}%] ${d.title}`));
  }

  let output;
  if (answers.format === "Markdown") output = buildMarkdownReport(bug);
  else if (answers.format === "Jira") output = buildJiraReport(bug);
  else output = buildMarkdownReport(bug);

  console.log("\n----- GENERATED BUG REPORT -----\n");
  console.log(output);

  try {
    await clipboardy.write(output);
    console.log("\n✅ Copied to clipboard.");
  } catch {
    console.log("\n(Clipboard not available in this environment — copy manually above.)");
  }

  saveBugToLog(bug);
}

async function fromTestResult(testFilePath) {
  if (!testFilePath || !fs.existsSync(testFilePath)) {
    console.error("Usage: node src/index.js from-test <path-to-test-results.json>");
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(testFilePath, "utf-8"));
  const failedTests = extractFailedTests(raw);

  if (!failedTests.length) {
    console.log("No failed tests found in the provided results file.");
    return;
  }

  const env = await getEnvironmentInfo();
  const bugLog = loadBugLog();

  for (const test of failedTests) {
    const bug = {
      title: `[Auto] ${test.title}`,
      steps: [`Run automated test: "${test.fullTitle || test.title}"`],
      expected: "Test should pass.",
      actual: test.err?.message || "Test failed — see stack trace.",
      environment: env,
      severity: suggestSeverity(test.err?.message || ""),
      createdAt: new Date().toISOString()
    };

    const dupes = checkDuplicate(bug.title, bugLog);
    console.log("\n----- BUG REPORT (from failed test) -----\n");
    console.log(buildMarkdownReport(bug));
    if (dupes.length) {
      console.log(`\n⚠️  Possible duplicate of: ${dupes[0].title}`);
    }
    saveBugToLog(bug);
  }
}

// Supports common Mocha/Cypress JSON reporter shapes.
function extractFailedTests(raw) {
  if (Array.isArray(raw.failures)) return raw.failures;
  if (raw.results) {
    return raw.results.flatMap((r) => r.suites?.flatMap((s) => s.tests?.filter((t) => t.state === "failed") || []) || []);
  }
  return [];
}

async function main() {
  switch (command) {
    case "create":
      await createInteractive();
      break;
    case "from-test":
      await fromTestResult(process.argv[3]);
      break;
    default:
      console.log(`Bug Report Generator — QA Companion CLI

Commands:
  create              Interactively build a bug report
  from-test <path>    Generate report(s) from a failed test JSON file
`);
  }
}

main();
