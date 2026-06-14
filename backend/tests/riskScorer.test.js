import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeFileContent,
  computeVerdict,
  maxSeverity,
  summarizeSourceSignals,
} from "../services/riskScorer.js";

test("maxSeverity picks the highest risk level", () => {
  assert.equal(maxSeverity("low", "critical", "medium"), "critical");
});

test("analyzeFileContent ignores common library patterns", () => {
  const normalLibrary = `
    const fn = Function('return this')();
    const url = 'https://example.com';
    const port = process.env.PORT || 3000;
    fetch(url);
  `;

  const result = analyzeFileContent(normalLibrary);
  assert.equal(result.severity, "none");
  assert.equal(result.indicators.length, 0);
});

test("analyzeFileContent flags credential theft patterns", () => {
  const malicious = "const key = fs.readFileSync(require('os').homedir() + '/.ssh/id_rsa')";
  const result = analyzeFileContent(malicious);
  assert.ok(result.indicators.includes("credential path targeting"));
});

test("computeVerdict does not block packages for benign source-only signals", () => {
  const verdict = computeVerdict({
    scriptFindings: [],
    sourceSummary: { severity: "none", indicators: [], riskyFileCount: 0 },
    cves: [],
  });

  assert.equal(verdict.safe, true);
  assert.equal(verdict.severity, "none");
});

test("computeVerdict blocks packages with suspicious install scripts", () => {
  const verdict = computeVerdict({
    scriptFindings: [
      {
        severity: "critical",
        reason: "Suspicious postinstall script detected",
        indicators: ["curl"],
        hook: "postinstall",
      },
    ],
    sourceSummary: { severity: "none", indicators: [], riskyFileCount: 0 },
    cves: [],
  });

  assert.equal(verdict.safe, false);
  assert.equal(verdict.severity, "critical");
});

test("summarizeSourceSignals aggregates risky files", () => {
  const summary = summarizeSourceSignals([
    { indicators: ["obfuscated eval"], severity: "critical" },
    { indicators: [], severity: "none" },
  ]);

  assert.equal(summary.riskyFileCount, 1);
  assert.equal(summary.severity, "critical");
});
