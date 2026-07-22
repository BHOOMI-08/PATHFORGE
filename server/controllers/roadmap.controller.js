import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import STATUS_CODES from "../constants/statusCodes.js";
import Roadmap from "../models/Roadmap.model.js";
import CareerDNA from "../models/CareerDNA.model.js";
import ATSAnalysis from "../models/ATSAnalysis.model.js";
import { generateLearningRoadmap } from "../services/gemini/roadmap.service.js";

/**
 * Recalculates overall progress percentage based on completed tasks
 */
const updateRoadmapProgress = (roadmap) => {
  let totalTasks = 0;
  let completedTasks = 0;

  roadmap.milestones.forEach((m) => {
    m.tasks.forEach((t) => {
      totalTasks += 1;
      if (t.completed) completedTasks += 1;
    });
  });

  roadmap.overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
};

/**
 * Generate a new learning roadmap for user
 * POST /api/v1/roadmap/generate
 */
export const generateRoadmap = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { targetRole, durationWeeks } = req.body;

  // 1. Fetch user career DNA & recent skill gaps to feed Gemini AI
  const careerDna = await CareerDNA.findOne({ user: userId });
  const latestAts = await ATSAnalysis.findOne({ user: userId }).sort({ createdAt: -1 });

  const role = targetRole || careerDna?.targetRole || "Full Stack Developer";
  const duration = Number(durationWeeks) || 6;

  const skillGaps = [
    ...(latestAts?.missingKeywords || []),
    ...(latestAts?.skillGapAdvice || []),
  ];

  const userSkills = [
    ...(careerDna?.technicalSkills || []),
    ...(careerDna?.frameworks || []),
  ];

  // 2. Call Gemini service
  const roadmapData = await generateLearningRoadmap({
    targetRole: role,
    skillGaps,
    durationWeeks: duration,
    userSkills,
  });

  // 3. Delete old roadmap if exists and persist new roadmap
  await Roadmap.deleteMany({ user: userId });

  const roadmapRecord = await Roadmap.create({
    user: userId,
    targetRole: roadmapData.targetRole,
    totalDurationWeeks: roadmapData.totalDurationWeeks,
    overallProgress: 0,
    milestones: roadmapData.milestones,
  });

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(STATUS_CODES.CREATED, roadmapRecord, "Personalized learning roadmap generated successfully")
  );
});

/**
 * Fetch active learning roadmap for user
 * GET /api/v1/roadmap
 */
export const getUserRoadmap = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const roadmap = await Roadmap.findOne({ user: userId });

  if (!roadmap) {
    return res.status(STATUS_CODES.OK).json(
      new ApiResponse(STATUS_CODES.OK, null, "No active learning roadmap found")
    );
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, roadmap, "Active roadmap retrieved successfully")
  );
});

/**
 * Toggle task completion status and update progress percentage
 * PATCH /api/v1/roadmap/task/:taskId
 */
export const toggleTaskStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { taskId } = req.params;

  const roadmap = await Roadmap.findOne({ user: userId });

  if (!roadmap) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "No active roadmap found to update task");
  }

  let taskFound = false;

  roadmap.milestones.forEach((milestone) => {
    milestone.tasks.forEach((task) => {
      if (task.taskId === taskId) {
        task.completed = !task.completed;
        taskFound = true;
      }
    });
  });

  if (!taskFound) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, `Task ID '${taskId}' not found in active roadmap`);
  }

  // Recalculate progress
  updateRoadmapProgress(roadmap);
  await roadmap.save();

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, roadmap, "Task completion status updated successfully")
  );
});

/**
 * Delete active roadmap
 * DELETE /api/v1/roadmap
 */
export const deleteRoadmap = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Roadmap.deleteMany({ user: userId });

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, null, "Learning roadmap removed successfully")
  );
});

export default {
  generateRoadmap,
  getUserRoadmap,
  toggleTaskStatus,
  deleteRoadmap,
};
