import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

const genAI = env.geminiApiKey ? new GoogleGenerativeAI(env.geminiApiKey) : null;

export async function getAIExplanation({
  packageName,
  version,
  severity,
  safe,
  observations,
  cves,
  threat,
  fix,
  fallback,
}) {
  if (!genAI) {
    return fallback;
  }

  const details = [
    observations?.length
      ? `Observations:\n${observations.map((item) => `- ${item}`).join("\n")}`
      : "",
    cves?.length
      ? `CVEs:\n${cves.map((cve) => `- ${cve.id} (${cve.severity})`).join("\n")}`
      : "",
    threat ? `Threat: ${threat.attack || "known compromise"}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Explain the npm package security scan in simple English.

Package: ${packageName}@${version}
Safe to install: ${safe}
Severity: ${severity}

${details}

Fix:
${fix || "None"}

Respond in exactly this format:

Risk:
<1-2 sentences>

Impact:
<1-2 sentences>

Recommendation:
<1-2 sentences>
`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("[ai] Gemini explanation failed:", err.message);
    return fallback;
  }
}
