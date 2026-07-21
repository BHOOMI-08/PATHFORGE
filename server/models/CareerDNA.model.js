import mongoose from "mongoose";

const careerDNASchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    professionalStatus: {
      type: String,
      trim: true,
      default: "Student",
    },
    education: {
      type: String,
      trim: true,
      default: "Computer Science / IT",
    },
    programmingLanguages: {
      type: [String],
      default: [],
    },
    frameworks: {
      type: [String],
      default: [],
    },
    databases: {
      type: [String],
      default: [],
    },
    technicalProficiency: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      default: "Intermediate",
    },
    experienceLevel: {
      type: String,
      enum: ["Entry", "Mid", "Senior", "Lead", "Executive"],
      default: "Entry",
    },
    projectsExperience: {
      type: String,
      trim: true,
      default: "",
    },
    skillsDescription: {
      type: String,
      trim: true,
      default: "",
    },
    technicalSkills: {
      type: [String],
      default: [],
    },
    tools: {
      type: [String],
      default: [],
    },
    softSkills: {
      type: [String],
      default: [],
    },
    targetRoles: {
      type: [String],
      default: [],
    },
    opportunityType: {
      type: String,
      trim: true,
      default: "Full-Time Job",
    },
    careerObjectives: {
      type: String,
      trim: true,
      default: "",
    },
    learningGoals: {
      type: [String],
      default: [],
    },
    targetSalary: {
      min: {
        type: Number,
        default: 5,
      },
      max: {
        type: Number,
        default: 30,
      },
      currency: {
        type: String,
        default: "INR",
      },
    },
    preferredCompanies: {
      type: [String],
      default: [],
    },
    additionalNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to populate experienceLevel and combined technicalSkills automatically if missing
careerDNASchema.pre("save", function (next) {
  const allSkills = new Set([
    ...(this.programmingLanguages || []),
    ...(this.frameworks || []),
    ...(this.databases || []),
    ...(this.technicalSkills || []),
  ]);
  this.technicalSkills = Array.from(allSkills);

  if (this.technicalProficiency === "Beginner") this.experienceLevel = "Entry";
  else if (this.technicalProficiency === "Intermediate") this.experienceLevel = "Mid";
  else if (this.technicalProficiency === "Advanced") this.experienceLevel = "Senior";
  else if (this.technicalProficiency === "Expert") this.experienceLevel = "Lead";

  next();
});

const CareerDNA = mongoose.model("CareerDNA", careerDNASchema);

export default CareerDNA;
