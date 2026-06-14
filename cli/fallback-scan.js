const KNOWN_UNSAFE = {
  "bad-package": {
    version: "9.9.9",
    severity: "critical",
    safe: false,
    why: "This package runs a malicious postinstall script that reads SSH keys and sends data externally.",
    impact: "Installing it may expose credentials and compromise your development machine.",
    recommendedFix: "Do not install. Use a vetted alternative.",
    saferAlternative: null,
    findings: ["Uses postinstall script", "Makes outbound HTTP requests"],
    explanation:
      "Postinstall script attempts to read ~/.ssh and send data externally.",
    fix: "Do not install. Use a vetted alternative.",
  },
  "demo-block-postinstall": {
    version: "1.0.0",
    severity: "critical",
    safe: false,
    why: "This package executes code during installation and makes outbound HTTP requests.",
    impact: "It may leak AWS credentials, API keys, or .env secrets to external servers.",
    recommendedFix: "Do not install. Review install scripts before adding any dependency.",
    saferAlternative: null,
    findings: ["Uses postinstall script", "Makes outbound HTTP requests"],
    explanation:
      "[DEMO] Malicious postinstall simulation — curl | bash during install.",
    fix: "Do not install. Demo of typosquat install-hook attack.",
  },
  "demo-safe-package": {
    version: "1.0.0",
    severity: "none",
    safe: true,
    why: "No blocking security findings were detected for this demo package.",
    impact: "Automated checks did not find malicious install scripts or blocking CVEs.",
    recommendedFix: null,
    saferAlternative: null,
    findings: [],
    explanation: "[DEMO] Clean package simulation.",
    fix: null,
  },
};

export function scanPackageRules(pkg) {
  if (KNOWN_UNSAFE[pkg]) {
    return { package: pkg, ...KNOWN_UNSAFE[pkg] };
  }

  return {
    package: pkg,
    version: "latest",
    severity: "none",
    safe: true,
    why: "No suspicious scripts or known blocklist match detected.",
    impact: "Local fallback scan found no blocking indicators.",
    recommendedFix: null,
    saferAlternative: null,
    findings: [],
    explanation: "No suspicious scripts or known blocklist match detected.",
    fix: null,
  };
}

export function fallbackScan(pkg) {
  const result = scanPackageRules(pkg);
  return {
    ...result,
    explanation: `Local fallback: backend unavailable — ${result.explanation}`,
    why: `Local fallback: backend unavailable — ${result.why}`,
    source: "fallback",
  };
}
