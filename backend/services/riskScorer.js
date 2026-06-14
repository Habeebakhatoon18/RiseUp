const SEVERITY_RANK = {
  none: 0,
  unknown: 1,
  low: 2,
  medium: 3,
  high: 4,
  critical: 5,
};

// High-confidence malware indicators — not patterns common in normal libraries.
const MALWARE_PATTERNS = [
  {
    pattern: /\beval\s*\(\s*(atob|Buffer\.from|unescape|decodeURIComponent)/i,
    label: "obfuscated eval",
    severity: "critical",
  },
  {
    pattern: /(id_rsa|\.ssh\/|\.aws\/credentials|\.npmrc|\.gitconfig)/i,
    label: "credential path targeting",
    severity: "critical",
  },
  {
    pattern: /require\s*\(\s*['"]child_process['"]\s*\)[\s\S]{0,300}\.(exec|execSync|spawn)\s*\(/i,
    label: "shell execution via child_process",
    severity: "critical",
  },
  {
    pattern: /\b(coinhive|crypto-miner|xmrig|stratum\+tcp)/i,
    label: "cryptominer signature",
    severity: "critical",
  },
  {
    pattern: /(postinstall|preinstall)[\s\S]{0,80}(curl|wget|powershell|Invoke-WebRequest)/i,
    label: "install-hook download",
    severity: "critical",
  },
];

export function maxSeverity(...severities) {
  return severities.reduce((current, next) => {
    if ((SEVERITY_RANK[next] ?? 0) > (SEVERITY_RANK[current] ?? 0)) {
      return next;
    }
    return current;
  }, "none");
}

export function analyzeFileContent(content) {
  const indicators = [];

  for (const { pattern, label } of MALWARE_PATTERNS) {
    if (pattern.test(content)) {
      indicators.push(label);
    }
  }

  const uniqueIndicators = [...new Set(indicators)];
  const matchedPatterns = MALWARE_PATTERNS.filter(({ label }) =>
    uniqueIndicators.includes(label)
  );

  const severity =
    matchedPatterns.length === 0
      ? "none"
      : maxSeverity(...matchedPatterns.map(({ severity: s }) => s));

  return {
    indicators: uniqueIndicators,
    severity,
  };
}

export function summarizeSourceSignals(fileSignals = []) {
  const riskyFiles = fileSignals.filter((signal) => signal.indicators.length > 0);

  if (riskyFiles.length === 0) {
    return { severity: "none", indicators: [], riskyFileCount: 0 };
  }

  const indicators = [...new Set(riskyFiles.flatMap((signal) => signal.indicators))];
  const severity = maxSeverity(...riskyFiles.map((signal) => signal.severity));

  return {
    severity,
    indicators,
    riskyFileCount: riskyFiles.length,
  };
}

export function buildObservations({
  scriptFindings = [],
  sourceSummary = { severity: "none", indicators: [], riskyFileCount: 0 },
  cves = [],
}) {
  const observations = [];

  for (const finding of scriptFindings) {
    observations.push(
      `${finding.reason}: ${finding.indicators.join(", ")} (${finding.hook})`
    );
  }

  if (sourceSummary.riskyFileCount > 0) {
    observations.push(
      `High-confidence malware patterns in ${sourceSummary.riskyFileCount} file(s): ${sourceSummary.indicators.join(", ")}`
    );
  }

  if (cves.length > 0) {
    observations.push(`${cves.length} known CVE(s) reported for this version`);
  }

  return observations;
}

/**
 * Only install scripts, CVEs, and high-confidence source malware can block installs.
 * Benign library code (process.env, fetch, Function, URLs) must not trigger blocks.
 */
export function computeVerdict({
  scriptFindings = [],
  sourceSummary = { severity: "none" },
  cves = [],
}) {
  const scriptSeverity = maxSeverity(
    "none",
    ...scriptFindings.map((finding) => finding.severity)
  );
  const cveSeverity = maxSeverity("none", ...cves.map((cve) => cve.severity));
  const sourceSeverity = sourceSummary.severity || "none";

  const blockingSeverity = maxSeverity(scriptSeverity, cveSeverity, sourceSeverity);
  const safe =
    blockingSeverity === "none" ||
    blockingSeverity === "low" ||
    blockingSeverity === "unknown";

  let fix = null;
  if (!safe) {
    if (cves.length > 0) {
      fix = "Upgrade to a patched version or choose an alternative package.";
    } else if (scriptFindings.length > 0) {
      fix = "Review install scripts manually before installing this package.";
    } else {
      fix = "Do not install — malware-like patterns detected in package source.";
    }
  }

  return { safe, severity: blockingSeverity, fix };
}

export function buildFallbackExplanation({
  packageName,
  version,
  safe,
  severity,
  observations,
}) {
  const headline = safe
    ? `${packageName}@${version} appears safe based on automated checks.`
    : `${packageName}@${version} has ${severity} severity findings.`;

  if (observations.length === 0) {
    return headline;
  }

  return `${headline}\n\nObservations:\n${observations.map((item) => `- ${item}`).join("\n")}`;
}
