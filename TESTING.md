# Safe-Install — Testing & Demo Guide

Use this script when testing locally or presenting to judges.

**Prerequisites:** backend running on `http://localhost:5000`

```bash
cd backend && npm run dev
```

All CLI examples assume:

```bash
cd cli
node index.js <package> --dry-run
```

---

## 1. Safe packages (should pass ✅)

These are real npm packages with no blocking findings:

| Command | Why it should pass |
|---------|-------------------|
| `node index.js axios@1.7.9 --dry-run` | Popular HTTP client, clean install scripts |
| `node index.js express@5.1.0 --dry-run` | Major framework, no malicious hooks |
| `node index.js chalk@5.3.0 --dry-run` | Small utility, low attack surface |
| `node index.js semver@7.7.1 --dry-run` | Widely used, no known blocking CVEs for this version |
| `node index.js uuid@11.0.3 --dry-run` | Stable utility package |

Expected output: `Severity: NONE` → install allowed.

---

## 2. Unsafe — real npm packages still on registry (best for judges)

These versions **still exist on npm** but are blocked by **CVE detection**:

| Command | Block reason | What to tell judges |
|---------|--------------|---------------------|
| `node index.js lodash@4.17.15 --dry-run` | Known high-severity CVEs (OSV) | "Version is still downloadable, but our scanner queries OSV and blocks it." |
| `node index.js axios@0.21.0 --dry-run` | Known SSRF/security CVEs | "Same package name, older vulnerable version — we block before install." |
| `node index.js minimist@1.2.2 --dry-run` | Prototype pollution CVEs | "Proves we catch published vulnerable versions, not just removed malware." |

Expected output: `Severity: HIGH` or `CRITICAL` + CVE observations.

---

## 3. Unsafe — removed from npm (threat intelligence)

| Command | Block reason | What to tell judges |
|---------|--------------|---------------------|
| `node index.js event-stream@3.3.6 --dry-run` | Known malicious version + removed from npm | "npm deleted it after the 2018 attack; we still block via threat intel even without a tarball." |
| `node index.js eslint-scope@3.7.2 --dry-run` | Known malicious version + removed from npm | "Same pattern — historical compromise list + registry removal." |

Expected output: critical block with supply-chain explanation.

---

## 4. Demo simulations (guaranteed live demo)

Use these when a judge asks: *"How do I know blocking works for malware still on npm?"*

These package names are **not real npm packages**. The backend returns realistic scan results so you can demo every attack vector reliably:

| Command | Simulates | Block reason |
|---------|-----------|--------------|
| `node index.js demo-safe-package@1.0.0 --dry-run` | Clean package | ✅ SAFE |
| `node index.js demo-block-postinstall@1.0.0 --dry-run` | Typosquat with malicious `postinstall` | ❌ Install script (curl \| bash) |
| `node index.js demo-block-source@1.0.0 --dry-run` | Package with malware in source (SSH theft) | ❌ Source malware patterns |
| `node index.js demo-block-cve@1.0.0 --dry-run` | Published version with known CVE | ❌ CVE / vulnerability |

Responses include `[DEMO]` in the explanation so judges know it's a controlled simulation.

**Suggested live demo flow (2 minutes):**

```bash
# 1. Show a safe real package
node index.js express@5.1.0 --dry-run

# 2. Show real npm package with CVE (still on registry)
node index.js lodash@4.17.15 --dry-run

# 3. Answer "what about active malware on npm?"
node index.js demo-block-postinstall@1.0.0 --dry-run

# 4. Show removed historical attack
node index.js event-stream@3.3.6 --dry-run
```

---

## 5. Invalid / not found

| Command | Expected |
|---------|----------|
| `node index.js malicious-test-package --dry-run` | Block — package does not exist on npm |
| `node index.js totally-fake-package-xyz --dry-run` | Block — invalid package |

---

## Judge Q&A cheat sheet

### Q: "npm removed event-stream@3.3.6 — how do I know your tool actually works?"

**A:** We use three independent layers:

1. **Live npm + CVE checks** — e.g. `lodash@4.17.15` is still on npm but blocked because OSV reports known vulnerabilities.
2. **Install script analysis** — demo with `demo-block-postinstall@1.0.0` shows we detect malicious `postinstall` hooks before `npm install` runs.
3. **Threat intelligence** — removed versions like `event-stream@3.3.6` stay blocked even after npm unpublishes them.

### Q: "What if a malicious package is still on npm right now?"

**A:** We scan:

- `package.json` install scripts (`preinstall`, `postinstall`, etc.)
- Published tarball source for high-confidence malware patterns
- CVE databases (OSV)
- Known compromised version list

Run `demo-block-postinstall` or `demo-block-source` to see each layer, then `lodash@4.17.15` for a real npm example.

### Q: "Why block lodash if it's a famous package?"

**A:** We block **specific vulnerable versions**, not the whole package. `lodash@4.17.21` (latest 4.x) may pass while `4.17.15` fails — that's intentional version-aware scanning.

---

## Quick reference

| Category | Example | Safe? |
|----------|---------|-------|
| Safe (real) | `axios@1.7.9` | ✅ |
| CVE (real, on npm) | `lodash@4.17.15` | ❌ |
| Removed malware | `event-stream@3.3.6` | ❌ |
| Demo postinstall attack | `demo-block-postinstall@1.0.0` | ❌ |
| Demo source malware | `demo-block-source@1.0.0` | ❌ |
| Demo CVE | `demo-block-cve@1.0.0` | ❌ |
| Fake package | `malicious-test-package` | ❌ |
