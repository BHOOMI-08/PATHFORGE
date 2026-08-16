import mongoose from "mongoose";

const recruiterSimulatorSchema = new mongoose.Schema(
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
    company: {
      type: String,
      required: true,
      trim: true,
    },
    companyId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    rubricVersion: {
      type: Number,
      default: 1,
    },
    targetRole: {
      type: String,
      default: "Software Development Engineer",
      trim: true,
    },
    decision: {
      type: String,
      enum: [
        "Strong Interview Potential",
        "Potential Interview",
        "Borderline",
        "Needs Improvement",
        "Shortlisted",
        "Rejected",
      ],
      default: "Needs Improvement",
    },
    overallScore: { type: Number, min: 0, max: 100, default: 0 },
    confidence: { type: String, enum: ["High", "Medium", "Low"], default: "Low" },
    summary: { type: String, default: "", trim: true },
    categoryScores: {
      technicalSkills: { type: Number, min: 0, max: 100, default: 0 },
      dsa: { type: Number, min: 0, max: 100, default: 0 },
      projects: { type: Number, min: 0, max: 100, default: 0 },
      experience: { type: Number, min: 0, max: 100, default: 0 },
      systemDesign: { type: Number, min: 0, max: 100, default: 0 },
      impact: { type: Number, min: 0, max: 100, default: 0 },
      resumeQuality: { type: Number, min: 0, max: 100, default: 0 },
    },
    strengths: [{
      title: { type: String, default: "" },
      evidence: { type: String, default: "" },
    }],
    concerns: [{
      title: { type: String, default: "" },
      reason: { type: String, default: "" },
    }],
    missingSignals: [{ type: String }],
    resumeIssues: [{
      section: { type: String, default: "" },
      issue: { type: String, default: "" },
      suggestion: { type: String, default: "" },
    }],
    companyFit: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      strongMatches: [{ type: String }],
      gaps: [{ type: String }],
    },
    interviewFocus: [{ type: String }],
    recommendedActions: [{
      priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
      action: { type: String, default: "" },
      reason: { type: String, default: "" },
    }],
    interviewProbability: {
      type: Number,
      min: 0,
      max: 100,
      default: 75,
    },
    reasons: {
      positive: [{ type: String }],
      negative: [{ type: String }],
    },
    expectedQuestions: {
      hr: [{ type: String }],
      behavioral: [{ type: String }],
      technical: [{ type: String }],
      resumeSpecific: [{ type: String }],
    },
    rejectionRisks: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

recruiterSimulatorSchema.index({ user: 1, createdAt: -1 });

const RecruiterSimulator = mongoose.model("RecruiterSimulator", recruiterSimulatorSchema);

export default RecruiterSimulator;
