import { runSecurityScan } from "../services/securityEngine.js";
import { isDatabaseConfigured } from "../config/database.js";
import { ScanRecord } from "../models/ScanRecord.js";

export async function scanPackage(req, res, next) {
  try {
    const result = await runSecurityScan(req.packageName);

    if (isDatabaseConfigured()) {
      await ScanRecord.create({
        packageName: result.package,
        version: result.version,
        safe: result.safe,
        severity: result.severity,
        explanation: result.explanation,
        observations: result.observations,
        cves: result.cves,
        fix: result.fix,
      });
    }

    return res.json(result);
  } catch (err) {
    next(err);
  }
}
