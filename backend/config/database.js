import mongoose from "mongoose";
import { env } from "./env.js";

mongoose.set("strictQuery", true);

export function isDatabaseConfigured() {
  return Boolean(env.mongodbUri);
}

export async function connectDatabase() {
  if (!env.mongodbUri) {
    console.warn("[db] MONGODB_URI not set — scan history persistence is disabled");
    return false;
  }

  try {
    await mongoose.connect(env.mongodbUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("[db] Connected to MongoDB");
    return true;
  } catch (error) {
    console.warn("[db] MongoDB connection failed — running without persistence:", error.message);
    return false;
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  console.log("[db] Disconnected from MongoDB");
}

export function getDatabaseStatus() {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return {
    configured: isDatabaseConfigured(),
    state: states[mongoose.connection.readyState] || "unknown",
    ready: mongoose.connection.readyState === 1,
  };
}
