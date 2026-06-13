import { fetchPackageMetadata } from "./npmService.js";
import { checkCVEs } from "./cveService.js";
import { checkInstallScripts } from "./scriptChecker.js";
import { scanTarballSource } from "./sourceScanner.js";
import { getAIExplanation } from "./aiService.js";
import {
  buildFallbackExplanation,
  buildObservations,
  computeVerdict,
} from "./riskScorer.js";

export async function runSecurityScan(packageName) {
  let metadata;

  try {
    metadata = await fetchPackageMetadata(packageName);
  } catch {
    return {
      package: packageName,
      safe: false,
      severity: "high",
      explanation: "Package not found or metadata could not be fetched from npm.",
      observations: ["Unable to retrieve package information from the npm registry"],
      cves: [],
      threat: null,
      fix: "Verify the package name and try again.",
    };
  }

  const { latestVersion, scripts, tarballUrl } = metadata;

  const [cves, fileSignals] = await Promise.all([
    checkCVEs(packageName, latestVersion),
    scanTarballSource(tarballUrl).catch(() => []),
  ]);

  const scriptFindings = checkInstallScripts(scripts);
  const observations = buildObservations({ scriptFindings, fileSignals, cves });
  const { safe, severity, fix } = computeVerdict({ scriptFindings, fileSignals, cves });

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
