import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { checkInstallScripts } from "../backend/services/scriptChecker.js";
import {
  buildObservations,
  buildFallbackExplanation,
  computeVerdict,
} from "../backend/services/riskScorer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.resolve(__dirname, "..");

export function resolveLocalPackageDir(packageName) {
  const packageDir = path.join(WORKSPACE_ROOT, packageName);
  const manifestPath = path.join(packageDir, "package.json");

  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  return packageDir;
}

export function scanLocalPackage(packageName) {
  const packageDir = resolveLocalPackageDir(packageName);
  if (!packageDir) {
    return null;
  }

  const manifestPath = path.join(packageDir, "package.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  if (manifest.name !== packageName) {
    return null;
  }

  const { name, version = "0.0.0", scripts = {} } = manifest;
  const scriptFindings = checkInstallScripts(scripts);
  const observations = buildObservations({ scriptFindings, fileSignals: [], cves: [] });
  const { safe, severity, fix } = computeVerdict({
    scriptFindings,
    fileSignals: [],
    cves: [],
  });

  const explanation = buildFallbackExplanation({
    packageName: name,
    version,
    safe,
    severity,
    observations,
  });

  return {
    package: name,
    version,
    safe,
    severity,
    explanation,
    observations,
    fix,
  };
}
