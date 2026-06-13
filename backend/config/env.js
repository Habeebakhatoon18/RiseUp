import dotenv from "dotenv";

dotenv.config();

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name, fallback = "") {
  const value = process.env[name]?.trim();
  return value || fallback;
}

const nodeEnv = optionalEnv("NODE_ENV", "development");
const isProduction = nodeEnv === "production";
const isTest = nodeEnv === "test";

const mongodbUri = optionalEnv("MONGODB_URI");
if (isProduction && !mongodbUri) {
  requireEnv("MONGODB_URI");
}

export const env = {
  nodeEnv,
  isProduction,
  isTest,
  port: Number(process.env.PORT || 5000),
  mongodbUri: mongodbUri || null,
  geminiApiKey: optionalEnv("GEMINI_API_KEY"),
  corsOrigin: isProduction
    ? requireEnv("CORS_ORIGIN")
    : optionalEnv("CORS_ORIGIN", "http://localhost:5173"),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
  bodyLimit: optionalEnv("BODY_LIMIT", "1mb"),
  trustProxy: optionalEnv("TRUST_PROXY", "false") === "true",
};
