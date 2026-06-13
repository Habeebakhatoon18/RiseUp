import mongoose from "mongoose";

const cveSchema = new mongoose.Schema(
  {
    id: String,
    summary: String,
    severity: String,
  },
  { _id: false }
);

const scanRecordSchema = new mongoose.Schema(
  {
    packageName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    version: String,
    safe: { type: Boolean, required: true },
    severity: { type: String, required: true },
    explanation: String,
    observations: [String],
    cves: [cveSchema],
    fix: String,
  },
  { timestamps: true }
);

scanRecordSchema.index({ createdAt: -1 });

export const ScanRecord =
  mongoose.models.ScanRecord || mongoose.model("ScanRecord", scanRecordSchema);
