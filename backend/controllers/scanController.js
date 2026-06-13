import { runSecurityScan } from "../services/securityEngine.js";

export async function scanPackage(req, res) {
  try {
    const packageName = req.body?.package?.trim();
    if (!packageName) {
      return res.status(400).json({ error: "Missing required field: package" });
    }

    const result = await runSecurityScan(packageName);
    return res.json(result);
  } catch (err) {
    console.error("Scan error:", err.message);
    return res.status(500).json({
      error: "Scan failed",
      message: err.message,
    });
  }
}