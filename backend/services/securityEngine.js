import { fetchPackageMetadata } from "./npmService.js";

export async function runSecurityScan(packageName) {
  try {
    const metadata = await fetchPackageMetadata(packageName);

    return {
      package: packageName,
      version: metadata.latestVersion,
      safe: true,
      severity: "none",
      explanation:
        "Package found on npm registry. Advanced security checks not implemented yet.",
      observations: [],
      cves: [],
      threat: null,
      fix: null,
    };
  } catch (err) {
    return {
      package: packageName,
      safe: false,
      severity: "high",
      explanation:
        "Package not found or metadata could not be fetched.",
      observations: [
        "Unable to retrieve package information",
      ],
      cves: [],
      threat: null,
      fix: "Verify the package name",
    };
  }
}