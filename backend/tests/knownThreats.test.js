import test from "node:test";
import assert from "node:assert/strict";
import { checkKnownThreat } from "../services/knownThreats.js";

test("checkKnownThreat flags event-stream@3.3.6", () => {
  const threat = checkKnownThreat("event-stream", "3.3.6");
  assert.ok(threat);
  assert.equal(threat.severity, "critical");
});

test("checkKnownThreat ignores safe versions", () => {
  assert.equal(checkKnownThreat("event-stream", "4.0.1"), null);
});
