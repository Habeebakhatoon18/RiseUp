import { Router } from "express";
import rateLimit from "express-rate-limit";
import { scanPackage } from "../controllers/scanController.js";
import { validatePackage } from "../middleware/validatePackage.js";
import { env } from "../config/env.js";

const router = Router();

const scanRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many scan requests. Please try again later." },
});

router.post("/", scanRateLimiter, validatePackage, scanPackage);

export default router;
