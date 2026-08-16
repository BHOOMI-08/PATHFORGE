import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Interview from "../models/Interview.model.js";
import { buildInterviewContext } from "../services/interviewContext.service.js";
import {
  calculateInterviewScores,
  calculateQuestionScore,
  readinessFromScore,
} from "../services/interviewScoring.service.js";
import { generateFirstQuestion } from "../services/gemini/mentor.service.js";
import {
  interviewEvaluationAiSchema,
  interviewFinalFeedbackAiSchema,
  interviewQuestionAiSchema,
  startInterviewRequestSchema,
  submitInterviewAnswerSchema,
} from "../validators/interview.validator.js";
import { cleanAndParseJson } from "../utils/jsonValidator.js";

const question = {
  question: "How does React decide which components should render after state changes?",
  category: "React",
  difficulty: "medium",
  type: "technical",
  expectedTopics: ["reconciliation", "state", "component tree"],
  timeLimitSeconds: 180,
};

const evaluation = {
  correctness: 80,
  clarity: 70,
  depth: 60,
  communication: 90,
  strengths: ["Correctly explains state-driven rendering"],
  improvements: ["Explain reconciliation and identity in more depth"],
  idealAnswer: "React schedules an update, reconciles the new element tree, and commits the required DOM changes.",
  feedback: "The answer is accurate but should explain reconciliation and component identity.",
  followUpNeeded: true,
  nextQuestionReason: "The answer did not explain how keys affect reconciliation.",
  nextQuestion: {
    question: "How do stable keys affect React list reconciliation?",
    category: "React",
    difficulty: "medium",
    type: "technical",
    expectedTopics: ["keys", "identity", "reconciliation"],
    timeLimitSeconds: 180,
  },
};

test("interview configuration requires a bounded role and canonical seniority", () => {
  assert.equal(
    startInterviewRequestSchema.safeParse({
      targetRole: "React Developer Intern",
      seniorityLevel: "entry",
      interviewType: "technical",
    }).success,
    true,
  );
  assert.equal(
    startInterviewRequestSchema.safeParse({
      targetRole: "   ",
      seniorityLevel: "entry",
    }).success,
    false,
  );
  assert.equal(
    startInterviewRequestSchema.safeParse({
      targetRole: "Developer",
      seniorityLevel: "principal",
    }).success,
    false,
  );
  assert.equal(
    startInterviewRequestSchema.safeParse({
      targetRole: { $ne: "" },
      seniorityLevel: "mid",
    }).success,
    false,
  );
});

test("answer requests reject empty, oversized, extra, and object inputs", () => {
  assert.equal(
    submitInterviewAnswerSchema.safeParse({
      questionId: "q-12345678",
      answer: "A concrete technical answer.",
    }).success,
    true,
  );
  assert.equal(
    submitInterviewAnswerSchema.safeParse({
      questionId: "q-12345678",
      answer: "  ",
    }).success,
    false,
  );
  assert.equal(
    submitInterviewAnswerSchema.safeParse({
      questionId: "q-12345678",
      answer: "a".repeat(8001),
    }).success,
    false,
  );
  assert.equal(
    submitInterviewAnswerSchema.safeParse({
      questionId: "q-12345678",
      answer: { $gt: "" },
    }).success,
    false,
  );
});

test("question, evaluation, and final feedback AI contracts are strict", () => {
  assert.equal(interviewQuestionAiSchema.parse(question).category, "React");
  assert.equal(interviewEvaluationAiSchema.parse(evaluation).correctness, 80);
  assert.throws(() =>
    interviewQuestionAiSchema.parse({ ...question, unexpected: true }),
  );
  assert.throws(() =>
    interviewEvaluationAiSchema.parse({ ...evaluation, correctness: 101 }),
  );
  assert.throws(() =>
    interviewEvaluationAiSchema.parse(cleanAndParseJson("not valid JSON")),
  );
  assert.equal(
    interviewFinalFeedbackAiSchema.safeParse({
      overallSummary: "The candidate demonstrated a good foundation but needs deeper system knowledge.",
      detailedSummary: "The actual answers were clear and technically useful, with gaps in architecture trade-offs.",
      strengths: ["Clear explanation"],
      weaknesses: ["Limited trade-off analysis"],
      topicsToRevise: ["Distributed caching"],
      recommendedPractice: ["Practice an architecture walkthrough"],
    }).success,
    true,
  );
});

test("final-answer evaluation accepts no next question and no artificial strength", () => {
  const finalEvaluation = {
    ...evaluation,
    strengths: [],
    improvements: ["The answer did not address the question's core technical requirement."],
    followUpNeeded: false,
    nextQuestionReason: null,
    nextQuestion: null,
  };
  assert.equal(interviewEvaluationAiSchema.safeParse(finalEvaluation).success, true);
  assert.equal(
    interviewEvaluationAiSchema.safeParse({
      ...finalEvaluation,
      improvements: [],
    }).success,
    false,
  );
  assert.equal(
    interviewEvaluationAiSchema.safeParse({
      ...evaluation,
      nextQuestionReason: null,
    }).success,
    false,
  );
});
test("question and final interview scores are deterministic", () => {
  assert.equal(calculateQuestionScore(evaluation), 75);
  const result = calculateInterviewScores([
    {
      answer: {
        evaluation: {
          correctness: 80,
          clarity: 70,
          depth: 60,
          communication: 90,
        },
      },
    },
    {
      answer: {
        evaluation: {
          correctness: 40,
          clarity: 50,
          depth: 30,
          communication: 60,
        },
      },
    },
  ]);
  assert.deepEqual(result, {
    overall: 59,
    technicalAccuracy: 60,
    conceptualDepth: 45,
    communication: 75,
    clarity: 60,
    answeredQuestions: 2,
  });
  assert.equal(readinessFromScore(result.overall), "Developing");
});

test("personalization context uses bounded career/resume evidence without contact data", () => {
  const result = buildInterviewContext({
    targetRole: "Senior Node.js Backend Engineer",
    seniorityLevel: "senior",
    interviewType: "technical",
    careerDNA: {
      _id: "career",
      programmingLanguages: ["JavaScript"],
      frameworks: ["Express"],
      technicalSkills: Array.from({ length: 500 }, (_, index) => `Skill ${index}`),
      projectsExperience: "x".repeat(20_000),
      experienceLevel: "Mid",
    },
    resume: {
      _id: "resume",
      parsedData: {
        contactInfo: { email: "private@example.com", phone: "1234567890" },
        summary: "Backend developer",
        skills: { technical: ["Node.js", "MongoDB"] },
        projects: [],
        experience: [],
      },
    },
    settings: {
      _id: "settings",
      aiPersonalization: { interviewDifficulty: "Hard" },
    },
  });
  const serialized = JSON.stringify(result.context);
  assert.equal(result.context.target.role, "Senior Node.js Backend Engineer");
  assert.equal(result.context.target.desiredDifficulty, "hard");
  assert.equal(result.sourcesUsed.length, 3);
  assert.equal(serialized.includes("private@example.com"), false);
  assert.equal(serialized.includes("1234567890"), false);
  assert.ok(serialized.length < 15_000);
});

test("Interview schema has owned history and unique active-session indexes", () => {
  const indexes = Interview.schema.indexes();
  const active = indexes.find(([, options]) => options.name === "interview_active_unique");
  const history = indexes.find(([, options]) => options.name === "interview_history");
  assert.ok(active);
  assert.equal(active[1].unique, true);
  assert.deepEqual(active[1].partialFilterExpression, { status: "active" });
  assert.ok(history);
});

test("missing Gemini configuration returns a provider error and never a fake question", async () => {
  const original = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    await assert.rejects(
      () =>
        generateFirstQuestion({
          context: {
            target: {
              role: "React Developer",
              seniorityLevel: "entry",
              desiredDifficulty: "easy",
            },
          },
        }),
      (error) =>
        error.statusCode === 502 &&
        error.message === "Interview AI provider is not configured",
    );
  } finally {
    if (original) process.env.GEMINI_API_KEY = original;
  }
});

test("production mentor source contains no static fallback or hardcoded scorecard", () => {
  const source = fs.readFileSync(
    new URL("../services/gemini/mentor.service.js", import.meta.url),
    "utf8",
  );
  assert.equal(/fallbackOpening|fallbackFollow|fallbackInterview|score:\s*78/.test(source), false);
  assert.equal(source.includes("gemini-1.5-flash"), false);
});
