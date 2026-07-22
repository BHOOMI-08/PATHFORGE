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
    targetRole: {
      type: String,
      default: "Software Development Engineer",
      trim: true,
    },
    decision: {
      type: String,
      enum: ["Shortlisted", "Borderline", "Rejected"],
      default: "Shortlisted",
    },
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
      technical: [{ type: String }],
      resumeSpecific: [{ type: String }],
    },
    rejectionRisks: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const RecruiterSimulator = mongoose.model("RecruiterSimulator", recruiterSimulatorSchema);

export default RecruiterSimulator;
