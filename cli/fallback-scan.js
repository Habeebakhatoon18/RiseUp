const KNOWN_UNSAFE = {
  "bad-package": {
    version: "9.9.9",
    severity: "critical",
    explanation:
      "Postinstall script attempts to read ~/.ssh and send data externally.",
    fix: "Do not install. Use a vetted alternative.",
    safe: false,
  },
  "demo-block-postinstall": {
    version: "1.0.0",
    severity: "critical",
    explanation:
      "[DEMO] Malicious postinstall simulation — curl | bash during install.",
    fix: "Do not install. Demo of typosquat install-hook attack.",
    safe: false,
  },
  "demo-safe-package": {
    version: "1.0.0",
    severity: "none",
    explanation: "[DEMO] Clean package simulation.",
    safe: true,
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
    explanation: "No suspicious scripts or known blocklist match detected.",
    safe: true,
  };
}

export function fallbackScan(pkg) {
  const result = scanPackageRules(pkg);
  return {
    ...result,
    explanation: `Local fallback: backend unavailable — ${result.explanation}`,
    source: "fallback",
  };
}
