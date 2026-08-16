import mongoose from "mongoose";

const providerCallSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["opening_question", "answer_evaluation", "final_feedback"], required: true },
    questionId: { type: String, default: null },
    model: { type: String, required: true, trim: true, maxlength: 120 },
    attempts: { type: Number, required: true, min: 1, max: 2 },
    generatedAt: { type: Date, required: true },
    responseHash: { type: String, required: true, trim: true, maxlength: 64 },
  },
  { _id: false },
);

const evaluationSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true, min: 0, max: 100 },
    correctness: { type: Number, required: true, min: 0, max: 100 },
    clarity: { type: Number, required: true, min: 0, max: 100 },
    depth: { type: Number, required: true, min: 0, max: 100 },
    communication: { type: Number, required: true, min: 0, max: 100 },
    strengths: [{ type: String, trim: true, maxlength: 500 }],
    improvements: [{ type: String, trim: true, maxlength: 500 }],
    idealAnswer: { type: String, required: true, trim: true, maxlength: 4000 },
    feedback: { type: String, required: true, trim: true, maxlength: 2000 },
    followUpNeeded: { type: Boolean, required: true },
    nextQuestionReason: { type: String, default: null, trim: true, maxlength: 600 },
  },
  { _id: false },
);

const answerSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 8000 },
    submittedAt: { type: Date, required: true },
    skipped: { type: Boolean, default: false },
    evaluation: { type: evaluationSchema, required: true },
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true, trim: true, maxlength: 100 },
    question: { type: String, required: true, trim: true, minlength: 10, maxlength: 1200 },
    category: { type: String, required: true, trim: true, maxlength: 120 },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    type: { type: String, enum: ["technical", "behavioral", "system_design", "debugging", "coding"], required: true },
    expectedTopics: [{ type: String, trim: true, maxlength: 120 }],
    timeLimitSeconds: { type: Number, required: true, min: 60, max: 900 },
    source: { type: String, enum: ["opening", "follow_up", "progression"], required: true },
    answer: { type: answerSchema, default: null },
    generatedAt: { type: Date, required: true },
    providerMetadata: { type: providerCallSchema, required: true },
  },
  { _id: false },
);

const legacyMessageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "ai"] },
    message: { type: String, maxlength: 8000 },
    timestamp: { type: Date },
  },
  { _id: false },
);

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", default: null },
    targetRole: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    seniorityLevel: { type: String, enum: ["entry", "mid", "senior"], default: "mid" },
    experienceLevel: { type: String, enum: ["Entry", "Mid", "Senior"], default: undefined },
    interviewType: { type: String, enum: ["technical"], default: "technical" },
    desiredDifficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    status: { type: String, enum: ["active", "completed", "abandoned", "in_progress"], default: "active", index: true },
    currentQuestionIndex: { type: Number, default: 0, min: 0, max: 7 },
    maxQuestions: { type: Number, default: 5, min: 3, max: 8 },
    questions: { type: [questionSchema], default: [] },
    history: { type: [legacyMessageSchema], default: undefined },
    score: { type: Number, min: 0, max: 100, default: 0 },
    scoreBreakdown: {
      technicalAccuracy: { type: Number, min: 0, max: 100, default: 0 },
      conceptualDepth: { type: Number, min: 0, max: 100, default: 0 },
      communication: { type: Number, min: 0, max: 100, default: 0 },
      clarity: { type: Number, min: 0, max: 100, default: 0 },
      answeredQuestions: { type: Number, min: 0, max: 8, default: 0 },
    },
    feedback: {
      overallSummary: { type: String, default: "", trim: true, maxlength: 2400 },
      detailedSummary: { type: String, default: "", trim: true, maxlength: 5000 },
      strengths: [{ type: String, trim: true, maxlength: 500 }],
      weaknesses: [{ type: String, trim: true, maxlength: 500 }],
      topicsToRevise: [{ type: String, trim: true, maxlength: 200 }],
      recommendedPractice: [{ type: String, trim: true, maxlength: 500 }],
      tips: [{ type: String, trim: true, maxlength: 500 }],
      readinessLevel: { type: String, default: "", trim: true, maxlength: 80 },
    },
    personalization: {
      sourcesUsed: [{ type: String, trim: true, maxlength: 40 }],
      currentSkills: [{ type: String, trim: true, maxlength: 160 }],
      contextHash: { type: String, default: null, maxlength: 64 },
      sourceIds: {
        careerDNA: { type: String, default: null },
        resume: { type: String, default: null },
        settings: { type: String, default: null },
      },
    },
    aiMetadata: {
      provider: { type: String, enum: ["gemini"], default: "gemini" },
      model: { type: String, trim: true, maxlength: 120 },
      calls: { type: [providerCallSchema], default: [] },
    },
    processingQuestionId: { type: String, default: null, maxlength: 100 },
    processingStartedAt: { type: Date, default: null },
    finalizing: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true, optimisticConcurrency: true },
);

interviewSchema.index(
  { user: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" }, name: "interview_active_unique" },
);
interviewSchema.index({ user: 1, createdAt: -1 }, { name: "interview_history" });
interviewSchema.index(
  { user: 1, resume: 1, completedAt: -1 },
  { name: "interview_user_resume_completed" },
);

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;
