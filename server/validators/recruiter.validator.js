import { z } from "zod";
import { RECRUITER_CATEGORY_KEYS, RECRUITER_RUBRICS } from "../constants/recruiterRubrics.js";

const companyIds = Object.keys(RECRUITER_RUBRICS);
const score = z.number().finite().int().min(0).max(100);
const shortText = z.string().trim().min(1).max(600);
const stringList = z.array(shortText).max(12).default([]);

const priority = z.preprocess(
  (value) => typeof value === "string" ? value.trim().toLowerCase() : value,
  z.enum(["high", "medium", "low"])
);

const confidence = z.preprocess(
  (value) => typeof value === "string" ? value.trim().toLowerCase() : value,
  z.enum(["high", "medium", "low"])
);

export const recruiterRequestSchema = z.object({
  company: z.enum(companyIds, { errorMap: () => ({ message: "Select a supported company" }) }),
  targetRole: z.string().trim().min(2).max(120).optional(),
}).strict();

export const recruiterSemanticSchema = z.object({
  confidence,
  summary: z.string().trim().min(20).max(2000),
  categoryScores: z.object(
    Object.fromEntries(RECRUITER_CATEGORY_KEYS.map((key) => [key, score]))
  ).strict(),
  strengths: z.array(z.object({
    title: z.string().trim().min(1).max(160),
    evidence: shortText,
  }).strict()).min(1).max(8),
  concerns: z.array(z.object({
    title: z.string().trim().min(1).max(160),
    reason: shortText,
  }).strict()).max(8),
  missingSignals: stringList,
  resumeIssues: z.array(z.object({
    section: z.string().trim().min(1).max(100),
    issue: shortText,
    suggestion: shortText,
  }).strict()).max(10).default([]),
  companyFit: z.object({
    strongMatches: stringList,
    gaps: stringList,
  }).strict(),
  interviewFocus: stringList,
  recommendedActions: z.array(z.object({
    priority,
    action: z.string().trim().min(1).max(240),
    reason: shortText,
  }).strict()).max(10).default([]),
  expectedQuestions: z.object({
    technical: stringList,
    behavioral: stringList,
    resumeSpecific: stringList,
  }).strict().default({ technical: [], behavioral: [], resumeSpecific: [] }),
}).strict();

export const validateRecruiterSemanticResult = (data) => recruiterSemanticSchema.parse(data);

export default { recruiterRequestSchema, recruiterSemanticSchema, validateRecruiterSemanticResult };
