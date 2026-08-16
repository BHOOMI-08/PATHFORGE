import { z } from "zod";

const score = z.number().finite().int().min(0).max(100);
const stringList = z.array(z.string().trim().min(1).max(600)).max(50);

export const jobMatchRequestSchema = z.object({
  resumeId: z.string().trim().min(1, "Resume is required"),
  jobTitle: z.string().trim().min(2, "Job title must contain at least 2 characters").max(120),
  companyName: z.string().trim().max(120).optional().default(""),
  jobDescription: z.string().trim().min(80, "Job description must contain at least 80 characters").max(12000),
}).strict();

export const jobMatchSemanticSchema = z.object({
  experienceMatch: score,
  educationMatch: score,
  projectMatch: score,
  strengths: stringList.min(1),
  weaknesses: stringList,
  recommendations: stringList.min(1),
  summary: z.string().trim().min(1).max(2000),
}).strict();

export const validateJobMatchRequest = (data) => jobMatchRequestSchema.parse(data);
export const validateJobMatchSemanticResult = (data) => jobMatchSemanticSchema.parse(data);
