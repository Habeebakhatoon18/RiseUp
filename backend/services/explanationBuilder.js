import { resolveSuggestedFix } from "./fixAdvisor.js";
import { enhanceExplanationText } from "./aiService.js";

function buildFindings({ cves = [], observations = [], scriptFindings = [], sourceSummary = {} }) {
  const findings = [];

  for (const cve of cves) {
    findings.push(cve.id);
  }

  for (const finding of scriptFindings) {
    if (finding.hook) {
      findings.push(`Uses ${finding.hook} script`);
    }
    for (const indicator of finding.indicators || []) {
      if (/process\.env/i.test(indicator)) {
        findings.push("Reads process.env");
      }
      if (/remote URL|curl|wget|fetch/i.test(indicator)) {
        findings.push("Makes outbound HTTP requests");
      }
      if (/powershell|shell|child_process|eval/i.test(indicator)) {
        findings.push("Executes shell or dynamic code during install");
      }
    }
  }

  for (const indicator of sourceSummary.indicators || []) {
    findings.push(`Source code: ${indicator}`);
  }

  for (const observation of observations) {
    if (!findings.some((item) => observation.includes(item))) {
      findings.push(observation);
    }
  }

  return [...new Set(findings)];
}

function buildDeterministicCopy({
  packageName,
  version,
  safe,
  severity,
  cves = [],
  findings = [],
  scriptFindings = [],
  scanKind = "scan",
  knownThreat = null,
}) {
  if (scanKind === "not_found") {
    return {
      why: "The requested package does not exist on npm or metadata could not be retrieved.",
      impact: "Installation cannot proceed because the package could not be verified.",
      recommendedFix: "Verify the package name or version and try again.",
      saferAlternative: null,
    };
  }

  if (scanKind === "missing_version") {
    return {
      why: `Version ${version} is not available on the npm registry. It may have been removed after a security incident.`,
      impact: "Installation cannot proceed because this version cannot be verified or downloaded safely.",
      recommendedFix: "Choose a current, supported release from npm.",
      saferAlternative: null,
    };
  }

  if (knownThreat) {
    return {
      why: knownThreat.explanation,
      impact:
        "This version is associated with a documented supply-chain compromise. Installing it could expose your environment to malicious code.",
      recommendedFix: knownThreat.fix,
      saferAlternative: null,
    };
  }

  if (safe) {
    return {
      why: `No blocking security findings were detected for ${packageName}@${version}.`,
      impact:
        "Automated checks did not find malicious install scripts, blocking CVEs, or high-confidence malware patterns for this version.",
      recommendedFix: null,
      saferAlternative: null,
    };
  }

  if (cves.length > 0) {
    const countLabel = cves.length === 1 ? "one publicly disclosed vulnerability" : `${cves.length} publicly disclosed vulnerabilities`;
    const summaries = cves
      .slice(0, 2)
      .map((cve) => cve.summary)
      .filter(Boolean)
      .join(" ");

    return {
      why: `This package version contains ${countLabel}.`,
      impact:
        summaries ||
        "Attackers may exploit these vulnerabilities to compromise application integrity, cause denial-of-service, or execute unintended behavior when processing untrusted input.",
      recommendedFix: null,
      saferAlternative: null,
    };
  }

  if (scriptFindings.length > 0) {
    const usesInstallHook = scriptFindings.some((finding) =>
      ["preinstall", "install", "postinstall", "prepare"].includes(finding.hook)
    );
    const readsEnv = findings.includes("Reads process.env");
    const outbound = findings.includes("Makes outbound HTTP requests");

    const parts = [];
    if (usesInstallHook) {
      parts.push("executes code during installation");
    }
    if (readsEnv) {
      parts.push("accesses environment variables");
    }
    if (outbound) {
      parts.push("performs outbound network requests");
    }

    const why =
      parts.length > 0
        ? `This package ${parts.join(" and ")}.`
        : "This package contains suspicious install-time behavior detected by rule-based analysis.";

    return {
      why,
      impact:
        "It may leak AWS credentials, API keys, or .env secrets to external servers, or run untrusted code on your machine during npm install.",
      recommendedFix: "Review install scripts manually before installing this package.",
      saferAlternative: null,
    };
  }

  if (findings.some((item) => item.startsWith("Source code:"))) {
    return {
      why: "High-confidence malware-like patterns were detected in the package source code.",
      impact:
        "The package may attempt credential theft, obfuscated execution, or other post-install compromise of your development environment.",
      recommendedFix: "Do not install. Inspect package source or choose a trusted alternative.",
      saferAlternative: null,
    };
  }

  return {
    why: `${packageName}@${version} was flagged with ${severity} severity findings.`,
    impact: "Installing this package may introduce security risk to your project or development environment.",
    recommendedFix: null,
    saferAlternative: null,
  };
}

function composeLegacyExplanation({ why, impact }) {
  return [why, impact].filter(Boolean).join("\n\n");
}

export async function enrichScanResult(result, context = {}) {
  const {
    cves = result.cves || [],
    observations = result.observations || [],
    scriptFindings = context.scriptFindings || [],
    sourceSummary = context.sourceSummary || {},
    scanKind = context.scanKind || "scan",
    knownThreat = context.knownThreat || null,
  } = context;

  const findings = buildFindings({
    cves,
    observations,
    scriptFindings,
    sourceSummary,
  });

  const deterministic = buildDeterministicCopy({
    packageName: result.package,
    version: result.version,
    safe: result.safe,
    severity: result.severity,
    cves,
    findings,
    scriptFindings,
    scanKind,
    knownThreat,
  });

  let recommendedFix = result.fix || deterministic.recommendedFix;
  let saferAlternative = deterministic.saferAlternative;

  if (!result.safe && result.package && result.version && cves.length > 0) {
    const suggestion = await resolveSuggestedFix(result.package, result.version, cves);
    recommendedFix = suggestion.recommendedFix || recommendedFix;
    saferAlternative = suggestion.saferAlternative || saferAlternative;
  } else if (!result.safe && result.package && !recommendedFix) {
    const suggestion = await resolveSuggestedFix(result.package, result.version, cves);
    recommendedFix = suggestion.recommendedFix || recommendedFix;
    saferAlternative = suggestion.saferAlternative || saferAlternative;
  }

  const structuredInput = {
    packageName: result.package,
    version: result.version,
    safe: result.safe,
    severity: scanKind === "not_found" ? "error" : result.severity,
    findings,
    why: deterministic.why,
    impact: deterministic.impact,
    recommendedFix,
    saferAlternative,
    cves,
    threat: result.threat,
  };

  const enhanced = await enhanceExplanationText(structuredInput);

  const why = enhanced.why || deterministic.why;
  const impact = enhanced.impact || deterministic.impact;
  recommendedFix = enhanced.recommendedFix || recommendedFix;
  saferAlternative = enhanced.saferAlternative || saferAlternative;

  const displaySeverity = scanKind === "not_found" ? "error" : result.severity;

  return {
    ...result,
    severity: displaySeverity,
    safe: result.safe,
    why,
    impact,
    recommendedFix,
    saferAlternative,
    findings,
    explanation: composeLegacyExplanation({ why, impact }),
    fix: recommendedFix,
    observations,
    cves,
  };
}
