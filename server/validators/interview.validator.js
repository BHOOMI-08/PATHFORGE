import { z } from "zod";

const boundedText = (min, max) => z.string().trim().min(min).max(max);
const score = z.number().finite().int().min(0).max(100);

export const interviewQuestionAiSchema = z
  .object({
    question: boundedText(10, 1200),
    category: boundedText(2, 120),
    difficulty: z.enum(["easy", "medium", "hard"]),
    type: z.enum(["technical", "behavioral", "system_design", "debugging", "coding"]),
    expectedTopics: z.array(boundedText(1, 120)).min(1).max(12),
    timeLimitSeconds: z.number().int().min(60).max(900),
  })
  .strict();

export const interviewEvaluationAiSchema = z
  .object({
    correctness: score,
    clarity: score,
    depth: score,
    communication: score,
    strengths: z.array(boundedText(2, 500)).max(8),
    improvements: z.array(boundedText(2, 500)).max(8),
    idealAnswer: boundedText(20, 4000),
    feedback: boundedText(10, 2000),
    followUpNeeded: z.boolean(),
    nextQuestionReason: boundedText(5, 600).nullable(),
    nextQuestion: interviewQuestionAiSchema.nullable(),
  })
  .strict()
  .superRefine((evaluation, context) => {
    if (evaluation.strengths.length + evaluation.improvements.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["improvements"],
        message: "Evaluation must include at least one strength or improvement",
      });
    }
    if (evaluation.nextQuestion && !evaluation.nextQuestionReason) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nextQuestionReason"],
        message: "A next-question reason is required when a next question is present",
      });
    }
  });

export const interviewFinalFeedbackAiSchema = z
  .object({
    overallSummary: boundedText(20, 2400),
    detailedSummary: boundedText(30, 5000),
    strengths: z.array(boundedText(2, 500)).min(1).max(12),
    weaknesses: z.array(boundedText(2, 500)).min(1).max(12),
    topicsToRevise: z.array(boundedText(1, 200)).min(1).max(20),
    recommendedPractice: z.array(boundedText(2, 500)).min(1).max(15),
  })
  .strict();

export const startInterviewRequestSchema = z
  .object({
    targetRole: boundedText(2, 120),
    seniorityLevel: z.enum(["entry", "mid", "senior"]),
    interviewType: z.enum(["technical"]).default("technical"),
  })
  .strict();

export const submitInterviewAnswerSchema = z
  .object({
    questionId: boundedText(8, 100),
    answer: boundedText(1, 8000),
  })
  .strict();

export const validateInterviewQuestion = (value) => interviewQuestionAiSchema.parse(value);
export const validateInterviewEvaluation = (value) => interviewEvaluationAiSchema.parse(value);
export const validateInterviewFinalFeedback = (value) =>
  interviewFinalFeedbackAiSchema.parse(value);

