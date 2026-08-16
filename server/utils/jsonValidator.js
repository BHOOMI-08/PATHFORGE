import { z } from "zod";

const score = z.coerce.number().finite().transform((v) => Math.round(Math.min(100, Math.max(0, v))));
const list = z.array(z.string().trim().min(1).max(500)).max(50).default([]);
const actionCategory = z.preprocess((value) => {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : value;
  if (["technical", "keyword", "keywords", "content"].includes(normalized)) return "skills";
  if (["format", "layout"].includes(normalized)) return "formatting";
  if (["results", "experience", "achievements"].includes(normalized)) return "impact";
  return normalized;
}, z.enum(["formatting", "skills", "impact", "general"]));
const actionPriority = z.preprocess(
  (value) => typeof value === "string" ? value.trim().toLowerCase() : value,
  z.enum(["high", "medium", "low"]),
);
export const atsSemanticSchema = z.object({
  semanticScore: score, strengths: list, weaknesses: list, recommendations: list,
  summary: z.string().trim().min(1).max(2000), formattingScore: score, impactScore: score,
  parsingFailures: list, formattingAdvice: list, skillGapAdvice: list,
  actionItems: z.array(z.object({
    category: actionCategory.default("general"),
    priority: actionPriority.default("medium"),
    title: z.string().trim().min(1).max(160), description: z.string().trim().min(1).max(1000),
  })).max(30).default([]),
}).strict();
export const cleanAndParseJson = (text) => {
  if (!text || typeof text !== "string") throw new Error("AI provider returned an empty response");
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = cleaned.indexOf("{"); const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI provider response did not contain JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
};
export const validateATSSemanticResult = (data) => atsSemanticSchema.parse(data);
export const normalizeScore = (v) => Math.round(Math.min(100, Math.max(0, Number.isFinite(Number(v)) ? Number(v) : 0)));
export default { cleanAndParseJson, validateATSSemanticResult, normalizeScore };

