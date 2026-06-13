#!/usr/bin/env node

/**
 * Stand-in backend for CLI testing. Simulates POST /scan responses
 * until the real scanner is implemented.
 */

import http from "http";
import { scanPackageRules } from "./fallback-scan.js";

const PORT = process.env.MOCK_PORT || 5000;

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/scan") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const { package: pkg } = JSON.parse(body || "{}");
        if (!pkg) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Missing package name" }));
          return;
        }

        const result = scanPackageRules(pkg);
        console.log(`[mock-server] scan callback → ${pkg} (safe: ${result.safe})`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON body" }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Mock scan API listening on http://localhost:${PORT}/scan`);
});
