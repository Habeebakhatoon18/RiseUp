#!/usr/bin/env node

import { Command } from "commander";
import axios from "axios";
import { execSync } from "child_process";
import { fallbackScan } from "./fallback-scan.js";

const DEFAULT_API = process.env.SAFE_INSTALL_API || "http://localhost:5000/scan";
const BACKEND_TIMEOUT = Number(process.env.BACKEND_TIMEOUT || 30000);

function shouldUseFallback(err) {
  if (!err.response) return true;
  const status = err.response.status;
  return status >= 502 && status <= 504;
}

async function scanPackage(pkg, apiUrl, allowFallback) {
  try {
    const { data } = await axios.post(
      apiUrl,
      { package: pkg },
      { timeout: BACKEND_TIMEOUT }
    );
    return { ...data, source: "backend" };
  } catch (err) {
    if (allowFallback && shouldUseFallback(err)) {
      const reason = err.response?.status
        ? `HTTP ${err.response.status}`
        : err.code || err.message;
      console.warn(`\n⚠ Backend unavailable (${reason}). Using local fallback scan...`);
      return fallbackScan(pkg);
    }
    throw err;
  }
}
function printScanResult(data) {

      if (data.package) {
        console.log(`\n${data.package}@${data.version || "latest"}`);
      }
      if (data.severity) {
        console.log(`Severity: ${data.severity}`);
      }
      if (data.explanation) {
        console.log(`\n${data.explanation}`);
      }
      if (data.fix) {
        console.log(`\nFix: ${data.fix}`);
      }
        if (data.source === "fallback") {
    console.log("\n(source: local fallback — backend scan was not used)");
  }
}

const program = new Command();

program
  .name("safe-install")
  .description("Safely install npm packages — backend scan with local fallback")
  .argument("<package>", "npm package name (e.g. axios)")
  .option("-a, --api <url>", "backend scan API URL", DEFAULT_API)
  .option("-g, --global", "install globally (npm install -g)")
  .option("-D, --save-dev", "save as dev dependency")
  .option("--dry-run", "scan only — skip npm install even if safe")
  .option("--no-fallback", "require backend — fail if API is unreachable")
  .action(async (pkg, options) => {
    try {
      const data = await scanPackage(pkg, options.api, options.fallback);

      printScanResult(data);

      if (data.safe) {
          if (options.dryRun) {
          console.log("\n✅ Package is safe (dry-run — install skipped).");
          return;
        }
        const flags = [];
        if (options.global) flags.push("-g");
        if (options.saveDev) flags.push("--save-dev");
        const cmd = `npm install ${flags.join(" ")} ${pkg}`.replace(/\s+/g, " ").trim();
        execSync(cmd, { stdio: "inherit" });
      } else {
        console.log("\n❌ Installation blocked.");
        process.exit(1);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(`Scan failed: ${msg}`);
      process.exit(1);
    }
  });

program.parse();
