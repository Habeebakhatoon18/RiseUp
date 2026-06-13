import { env } from "../config/env.js";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const isServerError = status >= 500;

  console.error(`[error] ${req.method} ${req.path}:`, err.message);
  if (!env.isProduction) {
    console.error(err.stack);
  }

  res.status(status).json({
    error: isServerError && env.isProduction ? "Internal server error" : err.message,
    status,
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Endpoint not found" });
}
