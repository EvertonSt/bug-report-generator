import assert from "assert";
import { buildMarkdownReport, buildJiraReport } from "../src/formatters.js";
import { suggestSeverity } from "../src/severity.js";
import { checkDuplicate } from "../src/duplicateCheck.js";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name}`);
    console.log(`   ${e.message}`);
    failed++;
  }
}

const sampleBug = {
  title: "Login button does nothing on Safari",
  steps: ["Open login page", "Click login button"],
  expected: "User is logged in",
  actual: "Nothing happens, no error shown",
  environment: { os: "macOS 14", browser: "Safari 17", cpu: "M2", ramGB: 16 },
  severity: "High",
  createdAt: "2026-07-25T00:00:00.000Z"
};

test("buildMarkdownReport includes title and severity", () => {
  const md = buildMarkdownReport(sampleBug);
  assert(md.includes(sampleBug.title));
  assert(md.includes("High"));
});

test("buildJiraReport uses Jira markup headers", () => {
  const jira = buildJiraReport(sampleBug);
  assert(jira.startsWith("h2."));
  assert(jira.includes("h3. Steps to Reproduce"));
});

test("suggestSeverity flags crash as Critical", () => {
  assert.strictEqual(suggestSeverity("App crashed on load"), "Critical");
});

test("suggestSeverity flags typo as Low", () => {
  assert.strictEqual(suggestSeverity("Typo in footer text"), "Low");
});

test("suggestSeverity defaults to Medium when no keyword matches", () => {
  assert.strictEqual(suggestSeverity("Something odd happened"), "Medium");
});

test("checkDuplicate finds similar titles above threshold", () => {
  const log = [{ title: "Login button does nothing on Chrome" }];
  const result = checkDuplicate("Login button does nothing on Safari", log);
  assert(result.length > 0);
});

test("checkDuplicate returns empty for unrelated titles", () => {
  const log = [{ title: "Checkout page shows wrong currency" }];
  const result = checkDuplicate("Login button does nothing on Safari", log);
  assert.strictEqual(result.length, 0);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
