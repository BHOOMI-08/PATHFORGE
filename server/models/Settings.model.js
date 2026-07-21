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
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
export { Settings };
