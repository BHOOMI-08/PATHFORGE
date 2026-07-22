import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import STATUS_CODES from "../constants/statusCodes.js";
import CareerDNA from "../models/CareerDNA.model.js";
import Resume from "../models/Resume.model.js";
import ATSAnalysis from "../models/ATSAnalysis.model.js";
import JobMatch from "../models/JobMatch.model.js";
import Interview from "../models/Interview.model.js";
import Roadmap from "../models/Roadmap.model.js";
import ActivityLog from "../models/ActivityLog.model.js";
import { generateCEOModePlan } from "../services/gemini/ceoMode.service.js";

/**
 * Generate & Retrieve AI CEO Mode Strategic Executive Plan
 * POST /api/v1/ceo-mode/generate
 */
export const generateCEORoadmap = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { targetRole = "Google SDE" } = req.body;

  // 1. Aggregate user context
  const [
    careerDna,
    latestResume,
    latestAts,
    latestJobMatch,
    completedInterviews,
    activeRoadmap,
  ] = await Promise.all([
    CareerDNA.findOne({ user: userId }),
    Resume.findOne({ user: userId }).sort({ createdAt: -1 }),
    ATSAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }),
    JobMatch.findOne({ user: userId }).sort({ createdAt: -1 }),
    Interview.find({ user: userId, status: "completed" }).sort({ createdAt: -1 }),
    Roadmap.findOne({ user: userId }),
  ]);

  const userContext = {
    careerDna: careerDna ? {
      targetRole: careerDna.targetRole,
      experienceLevel: careerDna.experienceLevel,
      technicalSkills: careerDna.technicalSkills,
      frameworks: careerDna.frameworks,
    } : null,
    resumeSkills: latestResume?.parsedData?.skills || {},
    projectsCount: latestResume?.parsedData?.projects?.length || 0,
    latestAtsScore: latestAts?.atsScore || 70,
    atsMissingKeywords: latestAts?.missingKeywords || [],
    latestJobMatchScore: latestJobMatch?.matchScore || 70,
    latestInterviewScore: completedInterviews[0]?.score || 75,
    roadmapProgress: activeRoadmap?.overallProgress || 0,
  };

  // 2. Synthesize AI CEO Mode plan with Gemini AI
  const ceoPlan = await generateCEOModePlan(targetRole.trim(), userContext);

  // 3. Log audit activity
  await ActivityLog.create({
    user: userId,
    action: "ROADMAP_GENERATED",
    description: `AI CEO Mode plan generated for ${targetRole.trim()}`,
  });

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, ceoPlan, "AI CEO Mode strategic plan generated successfully")
  );
});

/**
 * GET /api/v1/ceo-mode
 */
export const getCEORoadmap = asyncHandler(async (req, res) => {
  req.body = { targetRole: "Google SDE" };
  return generateCEORoadmap(req, res);
});

export default {
  generateCEORoadmap,
  getCEORoadmap,
};
