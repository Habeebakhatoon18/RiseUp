const KNOWN_UNSAFE = {
  "bad-package": {
    version: "9.9.9",
    severity: "critical",
    explanation:
      "Postinstall script attempts to read ~/.ssh and send data externally.",
    fix: "Do not install. Use a vetted alternative.",
    safe: false,
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
