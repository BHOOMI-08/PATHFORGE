import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Roadmap from "../models/Roadmap.model.js";
import CareerDNA from "../models/CareerDNA.model.js";
import Resume from "../models/Resume.model.js";
import ATSAnalysis from "../models/ATSAnalysis.model.js";
import JobMatch from "../models/JobMatch.model.js";
import Settings from "../models/Settings.model.js";
import { generateLearningRoadmap } from "../services/gemini/roadmap.service.js";
import {
  buildRoadmapContext,
  mergePersonalizedSkillGaps,
} from "../services/roadmapContext.service.js";
import { recalculateRoadmapProgress } from "../services/roadmapProgress.service.js";
import { recordActivity } from "../services/activity.service.js";
import {
  roadmapGenerationRequestSchema,
  taskProgressRequestSchema,
} from "../validators/roadmap.validator.js";

const parseRequest = (schema, body) => {
  const result = schema.safeParse(body || {});
  if (!result.success) {
    const errors = result.error.errors.map((issue) => issue.message);
    throw new ApiError(400, errors[0] || "Invalid roadmap request", errors);
  }
  return result.data;
};

const loadRoadmapSources = async (userId) => {
  const [careerDNA, resume, settings, previousRoadmap] = await Promise.all([
    CareerDNA.findOne({ user: userId }).lean(),
    Resume.findOne({ user: userId, status: "parsed" }).sort({ createdAt: -1 }).lean(),
    Settings.findOne({ user: userId }).lean(),
    Roadmap.findOne({ user: userId }).lean(),
  ]);

  const resumeFilter = resume ? { user: userId, resume: resume._id } : { user: userId };
  const [atsForResume, latestAts, jobMatchForResume, latestJobMatch] = await Promise.all([
    ATSAnalysis.findOne(resumeFilter).sort({ createdAt: -1 }).lean(),
    ATSAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }).lean(),
    JobMatch.findOne(resumeFilter).sort({ createdAt: -1 }).lean(),
    JobMatch.findOne({ user: userId }).sort({ createdAt: -1 }).lean(),
  ]);

  return {
    careerDNA,
    resume,
    settings,
    previousRoadmap,
    ats: atsForResume || latestAts,
    jobMatch: jobMatchForResume || latestJobMatch,
  };
};

export const generateRoadmap = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const input = parseRequest(roadmapGenerationRequestSchema, req.body);
  const sources = await loadRoadmapSources(userId);
  const personalization = buildRoadmapContext({
    user: req.user,
    ...sources,
    input,
  });

  const { roadmap, providerMetadata } = await generateLearningRoadmap({
    context: personalization.context,
  });
  const totalTasks = roadmap.milestones.reduce(
    (sum, milestone) => sum + milestone.tasks.length,
    0,
  );
  const finalMissingSkills = mergePersonalizedSkillGaps(
    personalization.currentSkills,
    personalization.missingSkills,
    roadmap.identifiedSkillGaps,
  );

  const saved = await Roadmap.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        activeKey: "active",
        version: Number(sources.previousRoadmap?.version || 0) + 1,
        targetRole: roadmap.targetRole,
        totalDurationWeeks: roadmap.totalDurationWeeks,
        weeklyHours: roadmap.weeklyHours,
        difficulty: roadmap.difficulty,
        overallSummary: roadmap.overallSummary,
        revisionWeeks: roadmap.revisionWeeks,
        overallProgress: 0,
        progress: { completedTasks: 0, totalTasks },
        milestones: roadmap.milestones,
        generatedBy: "gemini",
        geminiMetadata: {
          ...providerMetadata,
          contextHash: personalization.contextHash,
          sourceIds: personalization.sourceIds,
        },
        personalization: {
          sourcesUsed: personalization.sourcesUsed,
          currentSkills: personalization.currentSkills,
          missingSkills: finalMissingSkills,
          weights: personalization.personalizationWeights,
          dailyHours: personalization.dailyHours,
        },
      },
      $setOnInsert: { user: userId },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  const regenerated = Boolean(sources.previousRoadmap);
  await recordActivity({
    user: userId,
    action: "ROADMAP_GENERATED",
    sourceId: `${saved._id}:v${saved.version}`,
    description: `${regenerated ? "Roadmap regenerated" : "Roadmap generated"} for ${saved.targetRole}`,
    metadata: { roadmapId: saved._id, version: saved.version, targetRole: saved.targetRole },
  });
  return res
    .status(regenerated ? 200 : 201)
    .json(
      new ApiResponse(
        regenerated ? 200 : 201,
        saved,
        regenerated
          ? "Personalized roadmap regenerated successfully"
          : "Personalized roadmap generated successfully",
      ),
    );
});

export const getUserRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne({ user: req.user._id });
  const payload = roadmap ? roadmap.toObject() : null;
  if (payload) {
    payload.isLegacy = !payload.generatedBy || !payload.geminiMetadata?.contextHash;
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        payload,
        roadmap ? "Active roadmap retrieved successfully" : "No active roadmap found",
      ),
    );
});

export const toggleTaskStatus = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  if (!/^phase-\d+-task-\d+$/.test(taskId)) {
    throw new ApiError(400, "Task ID is invalid");
  }
  const input = parseRequest(taskProgressRequestSchema, req.body);
  const roadmap = await Roadmap.findOne({ user: req.user._id });
  if (!roadmap) throw new ApiError(404, "No active roadmap found to update task");
  if (!roadmap.generatedBy || !roadmap.geminiMetadata?.contextHash) {
    throw new ApiError(409, "Regenerate this legacy roadmap before updating progress");
  }

  const task = roadmap.milestones
    .flatMap((milestone) => milestone.tasks)
    .find((candidate) => candidate.taskId === taskId);
  if (!task) throw new ApiError(404, "Task not found in active roadmap");

  const wasCompleted = task.completed;
  task.completed =
    typeof input.completed === "boolean" ? input.completed : !task.completed;
  task.completedAt = task.completed ? new Date() : null;
  recalculateRoadmapProgress(roadmap);
  await roadmap.save();

  if (!wasCompleted && task.completed) {
    await recordActivity({
      user: req.user._id,
      action: "TASK_COMPLETED",
      sourceId: `${roadmap._id}:${task.taskId}:${task.completedAt.toISOString()}`,
      description: `Roadmap task completed: ${task.title}`,
      metadata: { roadmapId: roadmap._id, taskId: task.taskId },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, roadmap, "Task progress updated successfully"));
});

export const deleteRoadmap = asyncHandler(async (req, res) => {
  const deleted = await Roadmap.findOneAndDelete({ user: req.user._id });
  if (!deleted) throw new ApiError(404, "No active roadmap found to delete");
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Learning roadmap removed successfully"));
});

export default {
  generateRoadmap,
  getUserRoadmap,
  toggleTaskStatus,
  deleteRoadmap,
};
