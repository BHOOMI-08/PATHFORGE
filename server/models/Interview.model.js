import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["user", "ai"],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      required: true,
      trim: true,
    },
    experienceLevel: {
      type: String,
      enum: ["Entry", "Mid", "Senior"],
      default: "Mid",
    },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    history: [messageSchema],
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    feedback: {
      overallSummary: { type: String, default: "" },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      tips: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
