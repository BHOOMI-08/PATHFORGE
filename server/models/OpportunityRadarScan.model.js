import mongoose from "mongoose";

const opportunityRadarScanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", default: null },
    requestId: { type: String, required: true, trim: true, maxlength: 100 },
    analysisVersion: { type: Number, required: true, min: 1 },
    sourceFingerprint: { type: String, required: true, trim: true, maxlength: 64 },
    result: { type: mongoose.Schema.Types.Mixed, required: true },
    generatedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

opportunityRadarScanSchema.index(
  { user: 1, requestId: 1 },
  { unique: true, name: "opportunity_radar_request_unique" },
);
opportunityRadarScanSchema.index(
  { user: 1, generatedAt: -1 },
  { name: "opportunity_radar_latest" },
);

export default mongoose.model("OpportunityRadarScan", opportunityRadarScanSchema);
