import express from "express";
import cors from "cors";
import helmet from "helmet";
import scanRoutes from "./routes/scanRoute.js";
import analyticsRoutes from "./routes/analyticsRoute.js";
import { env } from "./config/env.js";
import { getDatabaseStatus } from "./config/database.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

if (env.trustProxy) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(",").map((item) => item.trim()),
    methods: ["GET", "POST"],
  })
);
app.use(express.json({ limit: env.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: env.bodyLimit }));

if (!env.isProduction) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

app.get("/health", (req, res) => {
  const db = getDatabaseStatus();
  const healthy = !db.configured || db.ready;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    database: db,
  });
});

app.get("/", (req, res) => {
  res.json({
    name: "Safe Install API",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      scan: "POST /api/scan",
    },
  });
});

app.use("/api/scan", scanRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
