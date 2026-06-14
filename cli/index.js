#!/usr/bin/env node

import "dotenv/config";
import { Command } from "commander";
import axios from "axios";
import chalk from "chalk";
import { execSync } from "child_process";
import { fallbackScan } from "./fallback-scan.js";
import { parsePackageSpec } from "./parsePackageSpec.js";

const DEFAULT_API = process.env.SAFE_INSTALL_API || "http://localhost:5000/api/scan";
const BACKEND_TIMEOUT = Number(process.env.BACKEND_TIMEOUT || 30000);

function shouldUseFallback(err) {
  if (!err.response) return true;
  const status = err.response.status;
  return status >= 502 && status <= 504;
}

async function scanPackage(pkgSpec, apiUrl, allowFallback) {
  const { name, version } = parsePackageSpec(pkgSpec);

  try {
    const { data } = await axios.post(
      apiUrl,
      { package: name, ...(version ? { version } : {}) },
      { timeout: BACKEND_TIMEOUT }
    );
    return { ...data, source: "backend" };
  } catch (err) {
    if (allowFallback && shouldUseFallback(err)) {
      const reason = err.response?.status
        ? `HTTP ${err.response.status}`
        : err.code || err.message;
      console.warn(chalk.yellow(`\nWarning: Backend unavailable (${reason}). Using local fallback scan...`));
      return fallbackScan(name);
    }
    throw err;
  }
}

function severityColor(severity) {
  const label = (severity || "NONE").toUpperCase();
  if (label === "CRITICAL") return chalk.red.bold;
  if (label === "HIGH") return chalk.red;
  if (label === "MEDIUM") return chalk.yellow;
  if (label === "ERROR") return chalk.magenta.bold;
  return chalk.green;
}

function printSection(title, body) {
  if (!body) return;
  console.log(`\n${title}`);
  console.log("");
  const lines = String(body).split("\n");
  for (const line of lines) {
    console.log(` ${line}`);
  }
}

function printFindings(findings = []) {
  if (!findings.length) return;

  console.log("\nFindings:");
  console.log("");
  for (const item of findings) {
    console.log(` • ${item}`);
  }
}

function printScanResult(data) {
  console.log("\n" + "=".repeat(70));
  console.log(` SCAN RESULT: ${data.package || data.pkg}@${data.version || "latest"}`);
  console.log("=".repeat(70));

  const severity = (data.severity || "NONE").toUpperCase();
  console.log(severityColor(severity)(`\n Severity     : ${severity}`));

  const why = data.why || data.explanation;
  const impact = data.impact;
  const recommendedFix = data.recommendedFix || data.fix;
  const saferAlternative = data.saferAlternative;

  if (data.safe) {
    printSection("Why is it safe?", why);
  } else {
    printSection("Why was it flagged?", why);
  }
  printSection("Impact:", impact);
  printSection("Recommended Fix:", recommendedFix);
  printSection("Safer Alternative:", saferAlternative);
  printFindings(data.findings);

  if (data.source === "fallback") {
    console.log(chalk.gray("\n Note         : Using local fallback scan (backend was unavailable)"));
  }

  console.log("\n" + "=".repeat(70) + "\n");
}

const program = new Command();

program
  .name("safe-install")
  .description("Safely install npm packages — backend scan with local fallback")
  .argument("<package>", "npm package name (e.g. axios or axios@1.0.0)")
  .option("-a, --api <url>", "backend scan API URL", DEFAULT_API)
  .option("-g, --global", "install globally (npm install -g)")
  .option("-D, --save-dev", "save as dev dependency")
  .option("--dry-run", "scan only — skip npm install even if safe")
  .option("--no-fallback", "require backend — fail if API is unreachable")
  .action(async (pkg, options) => {
    try {
      const data = await scanPackage(pkg, options.api, options.fallback !== false);

      printScanResult(data);

      if (!data.safe) {
        console.log(chalk.red.bold("Installation BLOCKED by Safe-Install.\n"));
        process.exit(1);
      }

      if (options.dryRun) {
        console.log(chalk.green.bold("Dry-run completed successfully. Package is safe to install.\n"));
        return;
      }

      console.log(chalk.blue(`Starting installation of ${pkg}...\n`));

      const flags = [];
      if (options.global) flags.push("-g");
      if (options.saveDev) flags.push("--save-dev");

      const cmd = `npm install ${flags.join(" ")} ${pkg}`.replace(/\s+/g, " ").trim();
      execSync(cmd, { stdio: "inherit" });

      console.log("\n" + "=".repeat(70));
      console.log(chalk.green.bold(`SUCCESS: ${pkg} installed successfully`));
      console.log("Package was verified as safe before installation.");
      console.log("=".repeat(70) + "\n");
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message;
      console.error(chalk.red(`Scan failed: ${msg}`));
      process.exit(1);
    }
  });

program.parse();
