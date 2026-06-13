const SEVERITY_RANK = {
  none: 0,
  unknown: 1,
  low: 2,
  medium: 3,
  high: 4,
  critical: 5,
};

const CODE_PATTERNS = [
  { pattern: /\beval\s*\(/i, label: "eval", severity: "critical" },
  { pattern: /\bFunction\s*\(/i, label: "Function constructor", severity: "critical" },
  { pattern: /\bchild_process\b/i, label: "child_process", severity: "high" },
  { pattern: /\brequire\s*\(\s*['"]child_process['"]\s*\)/i, label: "child_process import", severity: "high" },
  { pattern: /\bfetch\s*\(/i, label: "fetch", severity: "medium" },
  { pattern: /\bhttps?:\/\//i, label: "remote URL", severity: "medium" },
  { pattern: /\bprocess\.env\b/i, label: "process.env access", severity: "medium" },
  { pattern: /\b(atob|btoa)\s*\(/i, label: "base64 decode", severity: "medium" },
  { pattern: /\bBuffer\.from\s*\([^)]*['"]base64['"]/i, label: "base64 buffer", severity: "medium" },
  { pattern: /\bfs\.(readFile|writeFile|appendFile)/i, label: "filesystem access", severity: "high" },
  { pattern: /\b(os\.homedir|\.ssh|\.aws|\.npmrc)\b/i, label: "sensitive path", severity: "high" },
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

  for (const { pattern, label } of CODE_PATTERNS) {
    if (pattern.test(content)) {
      indicators.push(label);
    }
  }

  const uniqueIndicators = [...new Set(indicators)];
  const matchedPatterns = CODE_PATTERNS.filter(({ label }) =>
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

export function buildObservations({ scriptFindings = [], fileSignals = [], cves = [] }) {
  const observations = [];

  for (const finding of scriptFindings) {
    observations.push(
      `${finding.reason}: ${finding.indicators.join(", ")} (${finding.hook})`
    );
  }

  const riskyFiles = fileSignals.filter((signal) => signal.indicators.length > 0);
  if (riskyFiles.length > 0) {
    const topIndicators = [
      ...new Set(riskyFiles.flatMap((signal) => signal.indicators)),
    ].slice(0, 5);
    observations.push(
      `Suspicious source patterns in ${riskyFiles.length} file(s): ${topIndicators.join(", ")}`
    );
  }

  if (cves.length > 0) {
    observations.push(`${cves.length} known CVE(s) reported for this version`);
  }

  return observations;
}

export function computeVerdict({ scriptFindings = [], fileSignals = [], cves = [] }) {
  const scriptSeverity = maxSeverity(
    "none",
    ...scriptFindings.map((finding) => finding.severity)
  );
  const sourceSeverity = maxSeverity(
    "none",
    ...fileSignals.map((signal) => signal.severity)
  );
  const cveSeverity = maxSeverity("none", ...cves.map((cve) => cve.severity));

  const severity = maxSeverity(scriptSeverity, sourceSeverity, cveSeverity);
  const safe = severity === "none" || severity === "low" || severity === "unknown";

  let fix = null;
  if (!safe) {
    if (cves.length > 0) {
      fix = "Upgrade to a patched version or choose an alternative package.";
    } else if (scriptFindings.length > 0) {
      fix = "Review install scripts manually before installing this package.";
    } else {
      fix = "Inspect package source code or use a trusted alternative.";
    }
  }

  return { safe, severity, fix };
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
