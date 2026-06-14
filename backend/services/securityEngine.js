import { fetchPackageMetadata } from "./npmService.js";
import { checkCVEs } from "./cveService.js";
import { checkInstallScripts } from "./scriptChecker.js";
import { scanTarballSource } from "./sourceScanner.js";
import { getAIExplanation } from "./aiService.js";
import { checkKnownThreat } from "./knownThreats.js";
import { getDemoScanResult } from "./demoScenarios.js";
import {
  buildFallbackExplanation,
  buildObservations,
  computeVerdict,
  summarizeSourceSignals,
} from "./riskScorer.js";

export async function runSecurityScan(packageName, requestedVersion = null) {
  const demoResult = getDemoScanResult(packageName, requestedVersion);
  if (demoResult) {
    return demoResult;
  }

  const knownThreat = checkKnownThreat(packageName, requestedVersion);
  if (knownThreat) {
    return {
      package: packageName,
      version: requestedVersion,
      safe: false,
      severity: knownThreat.severity,
      explanation: knownThreat.explanation,
      observations: ["Known malicious version flagged by threat intelligence"],
      cves: [],
      threat: { attack: "known supply-chain compromise", version: requestedVersion },
      fix: knownThreat.fix,
    };
  }

  let metadata;

  try {
    metadata = await fetchPackageMetadata(packageName, requestedVersion);
  } catch (err) {
    const isMissingVersion = Boolean(
      requestedVersion && err.message?.includes("not found")
    );

    return {
      package: packageName,
      version: requestedVersion || null,
      safe: false,
      severity: isMissingVersion ? "critical" : "high",
      explanation: isMissingVersion
        ? `Version ${requestedVersion} is not available on npm. It may have been removed due to a security incident.`
        : "Package not found or metadata could not be fetched from npm.",
      observations: isMissingVersion
        ? [`npm registry has no tarball for ${packageName}@${requestedVersion}`]
        : ["Unable to retrieve package information from the npm registry"],
      cves: [],
      threat: isMissingVersion ? { attack: "removed or unavailable version" } : null,
      fix: isMissingVersion
        ? "Do not install this version. Choose a current, supported release from npm."
        : requestedVersion
          ? "Verify the package name and version, then try again."
          : "Verify the package name and try again.",
    };
  }

  const { latestVersion, scripts, tarballUrl } = metadata;

  const [cves, fileSignals] = await Promise.all([
    checkCVEs(packageName, latestVersion),
    scanTarballSource(tarballUrl).catch(() => []),
  ]);

  const scriptFindings = checkInstallScripts(scripts);
  const sourceSummary = summarizeSourceSignals(fileSignals);
  const observations = buildObservations({ scriptFindings, sourceSummary, cves });
  const { safe, severity, fix } = computeVerdict({
    scriptFindings,
    sourceSummary,
    cves,
  });

  const fallback = buildFallbackExplanation({
    packageName,
    version: latestVersion,
    safe,
    severity,
    observations,
  });

  const explanation = await getAIExplanation({
    packageName,
    version: latestVersion,
    severity,
    safe,
    observations,
    cves,
    threat: null,
    fix,
    fallback,
  });

  return {
    package: packageName,
    version: latestVersion,
    safe,
    severity,
    explanation,
    observations,
    cves,
    threat: null,
    fix,
  };
}
