const PACKAGES = {
  axios: {
    name: 'axios',
    version: '1.7.9',
    downloads: '45.2M/week',
    publisher: 'axios',
    score: 96,
    status: 'safe',
    findings: {
      safe: [
        '✓ No Known CVEs',
        '✓ No Suspicious Scripts',
        '✓ Maintained Repository',
        '✓ Popular Community Usage',
      ],
      risk: [],
    },
    aiExplanation:
      'Axios is a widely-used HTTP client with a strong security track record. No post-install scripts detected. Dependencies are up to date with no known critical vulnerabilities.',
    recommendedVersion: '1.7.9',
  },
  express: {
    name: 'express',
    version: '4.21.2',
    downloads: '28.1M/week',
    publisher: 'expressjs',
    score: 91,
    status: 'safe',
    findings: {
      safe: [
        '✓ No Known CVEs',
        '✓ No Suspicious Scripts',
        '✓ Maintained Repository',
        '✓ Popular Community Usage',
      ],
      risk: [],
    },
    aiExplanation:
      'Express is a mature, well-maintained web framework. Recent versions patch known prototype pollution issues. Safe for production use at the latest version.',
    recommendedVersion: '4.21.2',
  },
  lodash: {
    name: 'lodash',
    version: '4.17.21',
    downloads: '52.8M/week',
    publisher: 'lodash',
    score: 72,
    status: 'warning',
    findings: {
      safe: ['✓ Maintained Repository', '✓ Popular Community Usage'],
      risk: ['⚠ Vulnerable Dependency', '⚠ Post Install Script Detected'],
    },
    aiExplanation:
      'This package contains a post-install script capable of executing shell commands during installation. While not inherently malicious, this increases supply-chain attack risk. Consider using version 4.17.21 with dependency audit.',
    recommendedVersion: '4.17.21',
  },
  react: {
    name: 'react',
    version: '19.0.0',
    downloads: '38.5M/week',
    publisher: 'facebook',
    score: 94,
    status: 'safe',
    findings: {
      safe: [
        '✓ No Known CVEs',
        '✓ No Suspicious Scripts',
        '✓ Maintained Repository',
        '✓ Popular Community Usage',
      ],
      risk: [],
    },
    aiExplanation:
      'React is maintained by Meta with rigorous security practices. No install scripts, minimal dependency surface, and consistent security patching across releases.',
    recommendedVersion: '19.0.0',
  },
  minimist: {
    name: 'minimist',
    version: '1.2.5',
    downloads: '62.3M/week',
    publisher: 'substack',
    score: 34,
    status: 'critical',
    findings: {
      safe: [],
      risk: [
        '⚠ Vulnerable Dependency',
        '⚠ Post Install Script Detected',
        '⚠ Known Compromised Version',
      ],
    },
    aiExplanation:
      'This package contains a post-install script capable of executing shell commands during installation. Version 1.2.5 has known compromise history in the supply chain. Do not install — use 1.2.6 or later.',
    recommendedVersion: '1.2.8',
  },
}

const DEFAULT_UNKNOWN = {
  name: '',
  version: 'unknown',
  downloads: 'N/A',
  publisher: 'unknown',
  score: 50,
  status: 'warning',
  findings: {
    safe: [],
    risk: ['⚠ Package not in database — manual review recommended'],
  },
  aiExplanation:
    'This package was not found in our security database. Proceed with caution and review the package source, maintainer history, and dependency tree manually.',
  recommendedVersion: 'unknown',
}

export function getPackageData(packageName) {
  const key = packageName.toLowerCase().trim()
  const pkg = PACKAGES[key]
  if (!pkg) {
    return { ...DEFAULT_UNKNOWN, name: packageName }
  }
  return { ...pkg }
}

export function getAnalyticsData() {
  return {
    totalScans: 2400000,
    safePackages: 1890000,
    blockedInstalls: 18400,
    criticalRisks: 9200,
    dailyVolume: [
      { day: 'Mon', scans: 4200 },
      { day: 'Tue', scans: 5100 },
      { day: 'Wed', scans: 4800 },
      { day: 'Thu', scans: 6200 },
      { day: 'Fri', scans: 5900 },
      { day: 'Sat', scans: 3100 },
      { day: 'Sun', scans: 2800 },
    ],
    riskDistribution: [
      { name: 'Safe', value: 78, color: '#059669' },
      { name: 'Warning', value: 15, color: '#f59e0b' },
      { name: 'Critical', value: 7, color: '#ef4444' },
    ],
  }
}

export { PACKAGES }
