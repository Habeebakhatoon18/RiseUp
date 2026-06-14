/**
 * Known compromised packages removed from npm or widely documented in advisories.
 * Checked before registry lookup so we can still warn even when npm unpublishes a version.
 */
export const KNOWN_MALICIOUS_VERSIONS = {
  "event-stream": {
    "3.3.6": {
      severity: "critical",
      explanation:
        "event-stream@3.3.6 was a malicious release (2018 supply-chain attack). npm removed it from the registry.",
      fix: "Do not install this version. Use event-stream@4.0.1 or later.",
    },
  },
  "eslint-scope": {
    "3.7.2": {
      severity: "critical",
      explanation:
        "eslint-scope@3.7.2 was a malicious release. npm removed it from the registry.",
      fix: "Use a patched eslint-scope version.",
    },
  },
};

export function checkKnownThreat(packageName, version) {
  if (!version) {
    return null;
  }

  return KNOWN_MALICIOUS_VERSIONS[packageName]?.[version] ?? null;
}
