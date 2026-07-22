import mongoose from "mongoose";

const jobMatchSchema = new mongoose.Schema(
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
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      default: "",
      trim: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    matchBreakdown: {
      technicalMatch: { type: Number, default: 0 },
      experienceMatch: { type: Number, default: 0 },
      educationMatch: { type: Number, default: 0 },
    },
    matchingSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    recommendations: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const JobMatch = mongoose.model("JobMatch", jobMatchSchema);

export default JobMatch;
