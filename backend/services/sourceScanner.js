import axios from "axios";
import fs from "fs";
import path from "path";
import os from "os";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";
import { extract } from "tar";
import { analyzeFileContent } from "./riskScorer.js";

function walkJsFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      walkJsFiles(fullPath, files);
    } else if (/\.(js|mjs|cjs|ts)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

export async function scanTarballSource(tarballUrl) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "safe-install-"));
  const tgzPath = path.join(tmpDir, "package.tgz");
  const extractDir = path.join(tmpDir, "extracted");

  try {
    const response = await axios.get(tarballUrl, {
      responseType: "stream",
      timeout: 30000,
    });
    await pipeline(response.data, createWriteStream(tgzPath));

    fs.mkdirSync(extractDir, { recursive: true });
    await extract({ file: tgzPath, cwd: extractDir, strip: 0 });

    const pkgRoot = fs.readdirSync(extractDir)[0];
    const scanRoot = pkgRoot ? path.join(extractDir, pkgRoot) : extractDir;
    const jsFiles = walkJsFiles(scanRoot).slice(0, 200);

    const fileSignals = [];

    for (const file of jsFiles) {
      let content;
      try {
        content = fs.readFileSync(file, "utf8");
      } catch {
        continue;
      }
      if (content.length > 500_000) continue;

      fileSignals.push(analyzeFileContent(content));
    }

    return fileSignals;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
