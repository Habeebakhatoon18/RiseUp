import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";

async function startServer() {
  const dbConnected = await connectDatabase();
  if (!dbConnected) {
    console.warn("[server] Starting without database connection");
  }

  const server = app.listen(env.port, () => {
    console.log(`Safe Install API listening on port ${env.port} (${env.nodeEnv})`);
    console.log(`Health check: http://localhost:${env.port}/health`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    console.error("[fatal] Unhandled rejection:", reason);
  });

  process.on("uncaughtException", (err) => {
    console.error("[fatal] Uncaught exception:", err);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error("[fatal] Failed to start server:", err.message);
  process.exit(1);
});
