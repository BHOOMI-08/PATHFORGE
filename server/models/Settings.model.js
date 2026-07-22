import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "dark",
    },
    accentColor: {
      type: String,
      enum: ["blue", "purple", "emerald", "cyan"],
      default: "blue",
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      default: "en",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    profileDetails: {
      username: { type: String, trim: true, default: "" },
      bio: { type: String, trim: true, default: "" },
      location: { type: String, trim: true, default: "India" },
      linkedin: { type: String, trim: true, default: "" },
      github: { type: String, trim: true, default: "" },
      portfolio: { type: String, trim: true, default: "" },
      avatarUrl: { type: String, trim: true, default: "" },
    },
    careerPreferences: {
      dreamCompany: { type: String, default: "Google" },
      dreamRole: { type: String, default: "Software Development Engineer" },
      expectedSalary: { type: String, default: "₹12–18 LPA" },
      preferredWorkType: { type: String, enum: ["Remote", "Hybrid", "On-site"], default: "Hybrid" },
      preferredCountry: { type: String, default: "India" },
      preferredExperienceLevel: { type: String, default: "Fresher" },
    },
    aiPersonalization: {
      preferredRoadmapDuration: { type: String, default: "8 Weeks" },
      learningPace: { type: String, enum: ["Slow", "Medium", "Fast"], default: "Medium" },
      explanationStyle: { type: String, enum: ["Short", "Detailed"], default: "Detailed" },
      interviewDifficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
      preferredLanguage: { type: String, default: "English" },
    },
    notifications: {
      resumeAnalysis: { type: Boolean, default: true },
      interviewResults: { type: Boolean, default: true },
      weeklyProgress: { type: Boolean, default: true },
      roadmapReminder: { type: Boolean, default: true },
      achievementAlerts: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
export { Settings };
