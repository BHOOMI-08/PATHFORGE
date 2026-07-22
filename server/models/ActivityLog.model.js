import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        "RESUME_UPLOADED",
        "ATS_ANALYZED",
        "JOB_MATCHED",
        "ROADMAP_GENERATED",
        "INTERVIEW_COMPLETED",
        "TASK_COMPLETED",
        "CAREER_DNA_UPDATED",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
