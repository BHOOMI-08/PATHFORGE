import mongoose from "mongoose";

const resourceLinkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    url: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { _id: false },
);

const taskSchema = new mongoose.Schema(
  {
    taskId: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 1200 },
    type: {
      type: String,
      enum: ["learn", "practice", "project", "revision", "checkpoint", "interview"],
      required: true,
    },
    estimatedHours: { type: Number, required: true, min: 0.5, max: 80 },
    outcome: { type: String, required: true, trim: true, maxlength: 600 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    resourceLinks: { type: [resourceLinkSchema], default: [] },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 1200 },
    deliverables: [{ type: String, trim: true, maxlength: 300 }],
  },
  { _id: false },
);

const milestoneSchema = new mongoose.Schema(
  {
    milestoneId: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 1200 },
    type: {
      type: String,
      enum: ["foundation", "skill", "project", "revision", "capstone", "interview"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    startWeek: { type: Number, required: true, min: 1, max: 24 },
    endWeek: { type: Number, required: true, min: 1, max: 24 },
    durationWeeks: { type: Number, required: true, min: 1, max: 24 },
    estimatedHours: { type: Number, required: true, min: 1, max: 240 },
    prerequisites: [{ type: String, trim: true, maxlength: 200 }],
    checkpoint: { type: String, required: true, trim: true, maxlength: 600 },
    project: { type: projectSchema, default: null },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
    tasks: { type: [taskSchema], default: [] },
  },
  { _id: false },
);

const roadmapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    activeKey: { type: String, enum: ["active"], default: "active", required: true },
    version: { type: Number, default: 0, min: 0 },
    targetRole: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    totalDurationWeeks: { type: Number, required: true, min: 4, max: 24 },
    weeklyHours: { type: Number, required: true, min: 1, max: 84 },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    overallSummary: { type: String, required: true, trim: true, maxlength: 2000 },
    revisionWeeks: [
      {
        _id: false,
        week: { type: Number, required: true, min: 1, max: 24 },
        focus: { type: String, required: true, trim: true, maxlength: 300 },
        checkpoint: { type: String, required: true, trim: true, maxlength: 600 },
      },
    ],
    overallProgress: { type: Number, default: 0, min: 0, max: 100 },
    progress: {
      completedTasks: { type: Number, default: 0, min: 0 },
      totalTasks: { type: Number, default: 0, min: 0 },
    },
    milestones: { type: [milestoneSchema], required: true },
    generatedBy: { type: String, enum: ["gemini"], required: true },
    geminiMetadata: {
      model: { type: String, required: true, trim: true },
      attempts: { type: Number, required: true, min: 1, max: 2 },
      generatedAt: { type: Date, required: true },
      contextHash: { type: String, required: true, trim: true },
      responseHash: { type: String, required: true, trim: true },
      sourceIds: {
        careerDNA: { type: String, default: null },
        resume: { type: String, default: null },
        ats: { type: String, default: null },
        jobMatch: { type: String, default: null },
        settings: { type: String, default: null },
        previousRoadmap: { type: String, default: null },
      },
    },
    personalization: {
      sourcesUsed: [{ type: String, trim: true }],
      currentSkills: [{ type: String, trim: true }],
      missingSkills: [{ type: String, trim: true }],
      weights: { type: Map, of: Number, default: {} },
      dailyHours: { type: Number, required: true, min: 0.5, max: 12 },
    },
  },
  { timestamps: true },
);

roadmapSchema.index(
  { user: 1, activeKey: 1 },
  { unique: true, name: "roadmap_active_unique" },
);

export default mongoose.model("Roadmap", roadmapSchema);
