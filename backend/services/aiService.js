import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

function getApiKeys() {
  if (!env.geminiApiKey) {
    return [];
  }

  return env.geminiApiKey
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

function parseJsonBlock(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

export async function enhanceExplanationText(structuredInput) {
  const fallback = {
    why: structuredInput.why,
    impact: structuredInput.impact,
    recommendedFix: structuredInput.recommendedFix,
    saferAlternative: structuredInput.saferAlternative,
  };

  const apiKeys = getApiKeys();
  if (!apiKeys.length) {
    return fallback;
  }

  const prompt = `
You are a security explanation assistant for npm package scans.

IMPORTANT RULES:
- Do NOT change the safe/unsafe decision. Detection is already complete.
- Do NOT invent CVE IDs, versions, or findings.
- Rewrite only the explanation fields in clear developer-friendly English.
- Keep recommendedFix and saferAlternative exactly as provided unless empty.
- Return ONLY valid JSON with this shape:
{
  "why": "string",
  "impact": "string",
  "recommendedFix": "string or null",
  "saferAlternative": "string or null"
}

Package: ${structuredInput.packageName}@${structuredInput.version || "latest"}
Safe: ${structuredInput.safe}
Severity: ${structuredInput.severity}
Findings: ${JSON.stringify(structuredInput.findings)}
CVEs: ${JSON.stringify(structuredInput.cves?.map((cve) => cve.id) || [])}
Current why: ${structuredInput.why}
Current impact: ${structuredInput.impact}
Current recommendedFix: ${structuredInput.recommendedFix || "null"}
Current saferAlternative: ${structuredInput.saferAlternative || "null"}
`;

  for (const key of apiKeys) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const parsed = parseJsonBlock(result.response.text());

      if (!parsed) {
        continue;
      }

      return {
        why: parsed.why || fallback.why,
        impact: parsed.impact || fallback.impact,
        recommendedFix: structuredInput.recommendedFix || parsed.recommendedFix || null,
        saferAlternative: structuredInput.saferAlternative || parsed.saferAlternative || null,
      };
    } catch (err) {
      console.error("[ai] Explanation enhancement failed:", err.message);
      if (
        err.message.includes("429") ||
        err.message.includes("RESOURCE_EXHAUSTED") ||
        err.message.includes("quota")
      ) {
        continue;
      }
      break;
    }
  }

  return fallback;
}

/** @deprecated Use enhanceExplanationText via enrichScanResult */
export async function getAIExplanation(input) {
  const enhanced = await enhanceExplanationText({
    packageName: input.packageName,
    version: input.version,
    safe: input.safe,
    severity: input.severity,
    findings: input.observations || [],
    why: input.fallback,
    impact: "",
    recommendedFix: input.fix,
    saferAlternative: null,
    cves: input.cves || [],
    threat: input.threat,
  });

  return [enhanced.why, enhanced.impact].filter(Boolean).join("\n\n") || input.fallback;
}
