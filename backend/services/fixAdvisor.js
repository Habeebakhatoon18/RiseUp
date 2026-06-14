import axios from "axios";

const NPM_REGISTRY = "https://registry.npmjs.org";

export async function fetchNpmLatestVersion(packageName) {
  try {
    const encodedName = encodeURIComponent(packageName);
    const { data } = await axios.get(`${NPM_REGISTRY}/${encodedName}`, {
      timeout: 8_000,
      validateStatus: (status) => status === 200,
    });
    return data["dist-tags"]?.latest || null;
  } catch {
    return null;
  }
}

async function fetchOsvFixedVersions(cveId) {
  try {
    const { data } = await axios.get(`https://api.osv.dev/v1/vulns/${cveId}`, {
      timeout: 10_000,
    });

    const fixedVersions = [];
    for (const affected of data.affected || []) {
      for (const range of affected.ranges || []) {
        for (const event of range.events || []) {
          if (event.fixed) {
            fixedVersions.push(event.fixed);
          }
        }
      }
    }

    return fixedVersions;
  } catch {
    return [];
  }
}

function pickHighestVersion(versions) {
  if (!versions.length) {
    return null;
  }

  return versions.sort((a, b) => {
    const aParts = a.split(".").map(Number);
    const bParts = b.split(".").map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i += 1) {
      const diff = (aParts[i] || 0) - (bParts[i] || 0);
      if (diff !== 0) {
        return diff;
      }
    }
    return 0;
  }).at(-1);
}

export async function resolveSuggestedFix(packageName, currentVersion, cves = []) {
  if (cves.length > 0) {
    const fixedCandidates = [];

    for (const cve of cves.slice(0, 5)) {
      const fixedVersions = await fetchOsvFixedVersions(cve.id);
      fixedCandidates.push(...fixedVersions);
    }

    const fixedVersion = pickHighestVersion([...new Set(fixedCandidates)]);
    if (fixedVersion) {
      return {
        recommendedFix: `Upgrade to version ${fixedVersion} or later.`,
        saferAlternative: `${packageName}@${fixedVersion}`,
      };
    }
  }

  const latest = await fetchNpmLatestVersion(packageName);
  if (latest && latest !== currentVersion) {
    return {
      recommendedFix: `Upgrade to version ${latest} or later.`,
      saferAlternative: `${packageName}@${latest}`,
    };
  }

  if (cves.length > 0) {
    return {
      recommendedFix: "Upgrade to a patched version or choose an alternative package.",
      saferAlternative: latest ? `${packageName}@${latest}` : null,
    };
  }

  return {
    recommendedFix: null,
    saferAlternative: latest ? `${packageName}@${latest}` : null,
  };
}
