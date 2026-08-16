import { z } from "zod";

const httpsUrl = z
  .string()
  .url()
  .refine((value) => new URL(value).protocol === "https:", "Resource links must use HTTPS");

const resourceSchema = z
  .object({
    title: z.string().trim().min(2).max(120),
    url: httpsUrl,
  })
  .strict();

const taskSchema = z
  .object({
    title: z.string().trim().min(3).max(180),
    description: z.string().trim().min(10).max(1200),
    type: z.enum(["learn", "practice", "project", "revision", "checkpoint", "interview"]),
    estimatedHours: z.number().finite().min(0.5).max(80),
    outcome: z.string().trim().min(5).max(600),
    resourceLinks: z.array(resourceSchema).max(5),
  })
  .strict();

const projectSchema = z
  .object({
    title: z.string().trim().min(3).max(180),
    description: z.string().trim().min(10).max(1200),
    deliverables: z.array(z.string().trim().min(2).max(300)).min(1).max(12),
  })
  .strict();

const milestoneSchema = z
  .object({
    title: z.string().trim().min(3).max(180),
    description: z.string().trim().min(10).max(1200),
    type: z.enum(["foundation", "skill", "project", "revision", "capstone", "interview"]),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
    startWeek: z.number().int().min(1).max(24),
    endWeek: z.number().int().min(1).max(24),
    estimatedHours: z.number().finite().min(1).max(240),
    prerequisites: z.array(z.string().trim().min(1).max(200)).max(20),
    checkpoint: z.string().trim().min(5).max(600),
    project: projectSchema.nullable(),
    tasks: z.array(taskSchema).min(2).max(12),
  })
  .strict()
  .refine((value) => value.endWeek >= value.startWeek, {
    message: "Milestone endWeek must not precede startWeek",
  });

export const roadmapGenerationRequestSchema = z
  .object({
    targetRole: z.string().trim().min(2).max(120).optional(),
    durationWeeks: z.coerce.number().int().min(4).max(24).optional(),
    difficulty: z.enum(["Adaptive", "Beginner", "Intermediate", "Advanced"]).optional(),
    dailyHours: z.coerce.number().finite().min(0.5).max(12).optional(),
    regenerationReason: z.string().trim().max(500).optional(),
  })
  .strict();

const revisionWeekSchema = z
  .object({
    week: z.number().int().min(1).max(24),
    focus: z.string().trim().min(3).max(300),
    checkpoint: z.string().trim().min(5).max(600),
  })
  .strict();
export const roadmapAiResponseSchema = z
  .object({
    targetRole: z.string().trim().min(2).max(120),
    totalDurationWeeks: z.number().int().min(4).max(24),
    weeklyHours: z.number().finite().min(1).max(84),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
    overallSummary: z.string().trim().min(20).max(2000),
    identifiedSkillGaps: z.array(z.string().trim().min(1).max(180)).min(1).max(30),
    revisionWeeks: z.array(revisionWeekSchema).min(1).max(8),
    milestones: z.array(milestoneSchema).min(4).max(12),
  })
  .strict();

export const taskProgressRequestSchema = z
  .object({
    completed: z.boolean().optional(),
  })
  .strict();

export const validateRoadmapAiResponse = (value) => roadmapAiResponseSchema.parse(value);

