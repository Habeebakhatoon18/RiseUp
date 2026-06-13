import axios from "axios";

export async function checkCVEs(packageName, version) {
  try {
    const { data } = await axios.post(
      "https://api.osv.dev/v1/query",
      {
        package: { name: packageName, ecosystem: "npm" },
        version,
      },
      { timeout: 15000 }
    );

    return (data.vulns || []).map((v) => ({
      id: v.id,
      summary: v.summary || "Known vulnerability",
      severity: normalizeSeverity(v),
    }));
  } catch {
    return [];
  }
}

function normalizeSeverity(vuln) {
  const raw =
    vuln.database_specific?.severity ||
    vuln.severity?.[0]?.score ||
    "";

  const label = String(raw).toUpperCase();
  if (label.includes("CRITICAL")) return "critical";
  if (label.includes("HIGH")) return "high";
  if (label.includes("MODERATE") || label.includes("MEDIUM")) return "medium";
  if (label.includes("LOW")) return "low";
  return "unknown";
}
