import test from "node:test";
import assert from "node:assert/strict";
import { enrichScanResult } from "../services/explanationBuilder.js";

test("enrichScanResult adds structured fields for CVE findings", async () => {
  const result = await enrichScanResult(
    {
      package: "minimist",
      version: "1.2.2",
      safe: false,
      severity: "critical",
      observations: ["2 known CVE(s) reported for this version"],
      cves: [
        { id: "GHSA-vh95-rmgr-6w4f", summary: "Prototype pollution", severity: "high" },
        { id: "GHSA-xv2f-5jw4-v95m", summary: "Prototype pollution", severity: "high" },
      ],
      fix: "Upgrade to a patched version or choose an alternative package.",
    },
    { scanKind: "scan" }
  );

  assert.equal(result.safe, false);
  assert.ok(result.why);
  assert.ok(result.impact);
  assert.ok(Array.isArray(result.findings));
  assert.ok(result.findings.length >= 2);
  assert.ok(result.explanation.includes(result.why));
});

test("enrichScanResult uses error severity for not found packages", async () => {
  const result = await enrichScanResult(
    {
      package: "totally-fake-package",
      version: null,
      safe: false,
      severity: "high",
      observations: ["Unable to retrieve package information from the npm registry"],
      cves: [],
      fix: "Verify the package name and try again.",
    },
    { scanKind: "not_found" }
  );

  assert.equal(result.severity, "error");
  assert.match(result.why, /does not exist on npm/i);
  assert.match(result.impact, /cannot proceed/i);
});

test("enrichScanResult preserves safe packages", async () => {
  const result = await enrichScanResult(
    {
      package: "axios",
      version: "1.7.9",
      safe: true,
      severity: "none",
      observations: [],
      cves: [],
      fix: null,
    },
    { scanKind: "scan" }
  );

  assert.equal(result.safe, true);
  assert.ok(result.why);
  assert.equal(result.recommendedFix, null);
});
