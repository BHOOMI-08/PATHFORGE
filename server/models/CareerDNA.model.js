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
    educationDetails: {
      degree: { type: String, default: "B.Tech / B.E." },
      branch: { type: String, default: "Computer Science & Engineering" },
      collegeName: { type: String, default: "" },
      currentYear: { type: String, default: "3rd Year" },
      graduationYear: { type: String, default: "2026" },
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
    experienceDetails: {
      types: { type: [String], default: ["Fresher"] },
      years: { type: String, default: "0 Years" },
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
    softSkillRatings: {
      communication: { type: Number, default: 4 },
      leadership: { type: Number, default: 3 },
      problemSolving: { type: Number, default: 4 },
      teamwork: { type: Number, default: 4 },
      confidence: { type: Number, default: 3 },
      timeManagement: { type: Number, default: 4 },
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
    learningPreferences: {
      hoursPerDay: { type: Number, default: 3 },
      learningSpeed: { type: String, enum: ["Slow", "Medium", "Fast"], default: "Medium" },
      learningStyle: { type: String, default: "Projects" },
    },
    careerChallenges: {
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
      bandLabel: {
        type: String,
        default: "8–12 LPA",
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
export { CareerDNA };
