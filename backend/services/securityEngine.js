import { fetchPackageMetadata } from "./npmService.js";
import { checkCVEs } from "./cveService.js";
import { checkInstallScripts } from "./scriptChecker.js";
import { scanTarballSource } from "./sourceScanner.js";
import { checkKnownThreat } from "./knownThreats.js";
import { getDemoScanResult } from "./demoScenarios.js";
import { enrichScanResult } from "./explanationBuilder.js";
import {
  buildObservations,
  computeVerdict,
  summarizeSourceSignals,
} from "./riskScorer.js";

export async function runSecurityScan(packageName, requestedVersion = null) {
  const demoResult = getDemoScanResult(packageName, requestedVersion);
  if (demoResult) {
    return enrichScanResult(demoResult, { scanKind: "demo" });
  }

  const knownThreat = checkKnownThreat(packageName, requestedVersion);
  if (knownThreat) {
    return enrichScanResult(
      {
        package: packageName,
        version: requestedVersion,
        safe: false,
        severity: knownThreat.severity,
        explanation: knownThreat.explanation,
        observations: ["Known malicious version flagged by threat intelligence"],
        cves: [],
        threat: { attack: "known supply-chain compromise", version: requestedVersion },
        fix: knownThreat.fix,
      },
      {
        scanKind: "known_threat",
        knownThreat,
      }
    );
  }

  let metadata;

  try {
    metadata = await fetchPackageMetadata(packageName, requestedVersion);
  } catch (err) {
    const isMissingVersion = Boolean(
      requestedVersion && err.message?.includes("not found")
    );

    return enrichScanResult(
      {
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
      },
      {
        scanKind: isMissingVersion ? "missing_version" : "not_found",
      }
    );
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

  return enrichScanResult(
    {
      package: packageName,
      version: latestVersion,
      safe,
      severity,
      explanation: "",
      observations,
      cves,
      threat: null,
      fix,
    },
    {
      scriptFindings,
      sourceSummary,
      scanKind: "scan",
    }
  );
}
