import mongoose from "mongoose";

const ceoStrategyPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", default: null },
    requestId: { type: String, required: true, trim: true, maxlength: 100 },
    targetId: { type: String, required: true, trim: true, maxlength: 80 },
    targetInput: { type: String, required: true, trim: true, maxlength: 120 },
    analysisVersion: { type: Number, required: true, min: 1 },
    sourceFingerprint: { type: String, required: true, trim: true, maxlength: 64 },
    result: { type: mongoose.Schema.Types.Mixed, required: true },
    generatedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

ceoStrategyPlanSchema.index(
  { user: 1, requestId: 1 },
  { unique: true, name: "ceo_strategy_request_unique" },
);
ceoStrategyPlanSchema.index(
  { user: 1, generatedAt: -1 },
  { name: "ceo_strategy_latest" },
);

export default mongoose.model("CEOStrategyPlan", ceoStrategyPlanSchema);
