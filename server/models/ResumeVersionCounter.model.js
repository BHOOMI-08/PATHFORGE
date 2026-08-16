import mongoose from "mongoose";

const resumeVersionCounterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    sequence: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("ResumeVersionCounter", resumeVersionCounterSchema);
