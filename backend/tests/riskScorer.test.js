import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeFileContent,
  computeVerdict,
  maxSeverity,
} from "../services/riskScorer.js";

test("maxSeverity picks the highest risk level", () => {
  assert.equal(maxSeverity("low", "critical", "medium"), "critical");
});

test("analyzeFileContent detects suspicious patterns", () => {
  const result = analyzeFileContent("const cp = require('child_process'); eval('x')");
  assert.ok(result.indicators.includes("eval"));
  assert.equal(result.severity, "critical");
});

test("computeVerdict marks packages with critical scripts as unsafe", () => {
  const verdict = computeVerdict({
    scriptFindings: [
      {
        severity: "critical",
        reason: "Suspicious postinstall script detected",
        indicators: ["curl"],
        hook: "postinstall",
      },
    ],
    fileSignals: [],
    cves: [],
  });

  assert.equal(verdict.safe, false);
  assert.equal(verdict.severity, "critical");
});
