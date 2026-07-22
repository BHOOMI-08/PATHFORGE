import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  completed: {
    type: Boolean,
    default: false,
  },
  resourceLinks: [
    {
      title: { type: String, default: "Documentation" },
      url: { type: String, default: "#" },
    },
  ],
});

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  durationWeeks: {
    type: Number,
    default: 1,
  },
  weekNumber: {
    type: Number,
    default: 1,
  },
  tasks: [taskSchema],
});

const roadmapSchema = new mongoose.Schema(
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
    totalDurationWeeks: {
      type: Number,
      default: 8,
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    milestones: [milestoneSchema],
  },
  {
    timestamps: true,
  }
);

const Roadmap = mongoose.model("Roadmap", roadmapSchema);

export default Roadmap;
