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
        "RECRUITER_SIMULATED",
        "TASK_COMPLETED",
        "CAREER_DNA_UPDATED",
        "OPPORTUNITY_RADAR_SCANNED",
        "CEO_STRATEGY_GENERATED",
      ],
      required: true,
    },
    sourceId: {
      type: String,
      trim: true,
      default: undefined,
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

activityLogSchema.index({ user: 1, createdAt: -1 }, { name: "activity_user_recent" });
activityLogSchema.index(
  { user: 1, action: 1, sourceId: 1 },
  {
    unique: true,
    partialFilterExpression: { sourceId: { $type: "string" } },
    name: "activity_logical_event_unique",
  },
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
