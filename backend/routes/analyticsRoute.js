import { Router } from "express";
import {
  getAnalytics,
  getRecentScans,
  getPackageHistory,
  getVulnerabilityStats,
} from "../controllers/analyticsController.js";

const router = Router();

// Get dashboard analytics (summary stats and charts)
router.get("/", getAnalytics);

// Get recent scans
router.get("/recent", getRecentScans);

// Get package scan history
router.get("/package/:packageName", getPackageHistory);

// Get vulnerability statistics
router.get("/vulnerabilities", getVulnerabilityStats);

export default router;
