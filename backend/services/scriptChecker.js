const INSTALL_HOOKS = ["preinstall", "install", "postinstall", "prepare"];

const SUSPICIOUS_SCRIPT_PATTERNS = [
  { pattern: /\bcurl\b/i, label: "curl", severity: "high" },
  { pattern: /\bwget\b/i, label: "wget", severity: "high" },
  { pattern: /\bpowershell\b/i, label: "powershell", severity: "critical" },
  { pattern: /\bInvoke-WebRequest\b/i, label: "Invoke-WebRequest", severity: "critical" },
  { pattern: /\beval\s*\(/i, label: "eval", severity: "critical" },
  { pattern: /\bchild_process\b/i, label: "child_process", severity: "high" },
  { pattern: /\bprocess\.env\b/i, label: "process.env", severity: "medium" },
  { pattern: /https?:\/\//i, label: "remote URL", severity: "high" },
  { pattern: /\b(bash|sh|cmd|exec)\b/i, label: "shell execution", severity: "high" },
];

export function checkInstallScripts(scripts = {}) {
  const findings = [];

  for (const hook of INSTALL_HOOKS) {
    const script = scripts[hook];
    if (!script) continue;

    const matched = SUSPICIOUS_SCRIPT_PATTERNS.filter(({ pattern }) =>
      pattern.test(script)
    );

    if (matched.length === 0) continue;

    findings.push({
      type: "install_script",
      hook,
      script,
      severity: matched.some((m) => m.severity === "critical")
        ? "critical"
        : "high",
      indicators: [...new Set(matched.map((m) => m.label))],
      reason: `Suspicious ${hook} script detected`,
    });
  }

  return findings;
}