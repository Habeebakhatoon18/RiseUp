import { ScanRecord } from "../models/ScanRecord.js";

/**
 * Generate analytics data from scan records
 * Returns aggregated stats and charts for the dashboard
 */
export async function getAnalytics(req, res, next) {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total stats
    const [
      totalScans,
      safePackages,
      blockedInstalls,
      criticalRisks,
      dailyData,
      severityData,
    ] = await Promise.all([
      ScanRecord.countDocuments(),
      ScanRecord.countDocuments({ safe: true }),
      ScanRecord.countDocuments({ safe: false }),
      ScanRecord.countDocuments({ severity: "critical" }),
      getDailyVolume(sevenDaysAgo),
      getRiskDistribution(),
    ]);

    return res.json({
      totalScans,
      safePackages,
      blockedInstalls,
      criticalRisks,
      dailyVolume: dailyData,
      riskDistribution: severityData,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get daily scan volume for the last 7 days
 */
async function getDailyVolume(startDate) {
  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        scans: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ];

  const result = await ScanRecord.aggregate(pipeline);

  // Fill in missing days with 0 scans
  const dayMap = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    dayMap[dateStr] = 0;
  }

  result.forEach((item) => {
    dayMap[item._id] = item.scans;
  });

  return Object.entries(dayMap).map(([date, scans]) => ({
    day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
    scans,
  }));
}

/**
 * Get risk distribution (pie chart data)
 */
async function getRiskDistribution() {
  const pipeline = [
    {
      $group: {
        _id: "$severity",
        count: { $sum: 1 },
      },
    },
  ];

  const result = await ScanRecord.aggregate(pipeline);

  const severityColors = {
    critical: "#dc2626",
    high: "#f97316",
    medium: "#eab308",
    low: "#3b82f6",
    none: "#10b981",
  };

  const totalCount = result.reduce((sum, item) => sum + item.count, 0);

  return result
    .map((item) => ({
      name:
        item._id.charAt(0).toUpperCase() +
        item._id.slice(1).toLowerCase(),
      value: Math.round((item.count / totalCount) * 100),
      color: severityColors[item._id] || "#6b7280",
    }))
    .sort((a, b) => {
      const order = ["Critical", "High", "Medium", "Low", "None"];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });
}

/**
 * Get recent scans (for scan history)
 */
export async function getRecentScans(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const scans = await ScanRecord.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json(scans);
  } catch (err) {
    next(err);
  }
}

/**
 * Get package scan history
 */
export async function getPackageHistory(req, res, next) {
  try {
    const { packageName } = req.params;
    if (!packageName) {
      return res.status(400).json({ error: "Package name required" });
    }

    const scans = await ScanRecord.find({
      packageName: packageName.toLowerCase(),
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      packageName,
      scans,
      count: scans.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get vulnerability statistics
 */
export async function getVulnerabilityStats(req, res, next) {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 },
          packages: { $sum: { $cond: ["$safe", 0, 1] } },
        },
      },
    ];

    const stats = await ScanRecord.aggregate(pipeline);

    return res.json({
      byVulnerability: stats,
      totalPackagesScanned: await ScanRecord.countDocuments(),
      totalVulnerabilities: await ScanRecord.countDocuments({ safe: false }),
    });
  } catch (err) {
    next(err);
  }
}
