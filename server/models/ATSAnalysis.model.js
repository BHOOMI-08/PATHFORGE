import mongoose from "mongoose";

const atsAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
      index: true,
    },
    atsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    breakdown: {
      formattingScore: { type: Number, default: 0 },
      contentScore: { type: Number, default: 0 },
      keywordScore: { type: Number, default: 0 },
      impactScore: { type: Number, default: 0 },
    },
    missingKeywords: [{ type: String }],
    parsingFailures: [{ type: String }],
    formattingAdvice: [{ type: String }],
    skillGapAdvice: [{ type: String }],
    actionItems: [
      {
        category: { type: String, default: "general" },
        priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
        title: { type: String, required: true },
        description: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ATSAnalysis = mongoose.model("ATSAnalysis", atsAnalysisSchema);

export default ATSAnalysis;
