import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      min: 1,
      default: undefined,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: "",
    },
    rawText: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["uploaded", "processing", "parsed", "failed"],
      default: "uploaded",
    },
    parsedData: {
      contactInfo: {
        name: { type: String, default: "" },
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        location: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        github: { type: String, default: "" },
        portfolio: { type: String, default: "" },
      },
      summary: { type: String, default: "" },
      education: [
        {
          institution: { type: String, default: "" },
          degree: { type: String, default: "" },
          fieldOfStudy: { type: String, default: "" },
          startDate: { type: String, default: "" },
          endDate: { type: String, default: "" },
          grade: { type: String, default: "" },
          description: { type: String, default: "" },
        },
      ],
      experience: [
        {
          company: { type: String, default: "" },
          position: { type: String, default: "" },
          location: { type: String, default: "" },
          startDate: { type: String, default: "" },
          endDate: { type: String, default: "" },
          isCurrent: { type: Boolean, default: false },
          highlights: [{ type: String }],
        },
      ],
      projects: [
        {
          title: { type: String, default: "" },
          description: { type: String, default: "" },
          technologies: [{ type: String }],
          link: { type: String, default: "" },
        },
      ],
      skills: {
        technical: [{ type: String }],
        soft: [{ type: String }],
        tools: [{ type: String }],
        languages: [{ type: String }],
      },
      certifications: [
        {
          name: { type: String, default: "" },
          issuer: { type: String, default: "" },
          issueDate: { type: String, default: "" },
        },
      ],
    },
    matchHistoryMetrics: {
      atsScoreBaseline: { type: Number, default: 0 },
      topSkillMatches: [{ type: String }],
      missingKeywords: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.index(
  { user: 1, versionNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { versionNumber: { $type: "number" } },
    name: "resume_user_version_unique",
  },
);
resumeSchema.index({ user: 1, createdAt: 1 }, { name: "resume_user_chronology" });

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
