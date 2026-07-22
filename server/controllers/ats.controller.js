import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import STATUS_CODES from "../constants/statusCodes.js";
import Resume from "../models/Resume.model.js";
import ATSAnalysis from "../models/ATSAnalysis.model.js";
import { evaluateResumeATS } from "../services/gemini/ats.service.js";

/**
 * Trigger ATS Evaluation for a given resume (or user's latest resume)
 * POST /api/v1/ats/analyze/:resumeId?
 */
export const analyzeResume = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const targetResumeId = req.params.resumeId || req.body.resumeId;

  let resume;
  if (targetResumeId) {
    resume = await Resume.findOne({ _id: targetResumeId, user: userId });
  } else {
    resume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });
  }

  if (!resume) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "No resume found to run ATS analysis");
  }

  // 1. Run Gemini AI ATS evaluation
  const atsResult = await evaluateResumeATS(resume);

  // 2. Persist analysis record
  const atsAnalysis = await ATSAnalysis.create({
    user: userId,
    resume: resume._id,
    atsScore: atsResult.atsScore,
    breakdown: atsResult.breakdown,
    missingKeywords: atsResult.missingKeywords,
    parsingFailures: atsResult.parsingFailures,
    formattingAdvice: atsResult.formattingAdvice,
    skillGapAdvice: atsResult.skillGapAdvice,
    actionItems: atsResult.actionItems,
  });

  // 3. Update baseline metrics on target Resume document
  resume.matchHistoryMetrics = {
    atsScoreBaseline: atsResult.atsScore,
    topSkillMatches: resume.parsedData?.skills?.technical || [],
    missingKeywords: atsResult.missingKeywords,
  };
  await resume.save();

  const populatedRecord = await ATSAnalysis.findById(atsAnalysis._id).populate("resume", "fileName fileUrl createdAt");

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(STATUS_CODES.CREATED, populatedRecord, "ATS Analysis completed successfully")
  );
});

/**
 * Get latest ATS analysis for authenticated user
 * GET /api/v1/ats/latest
 */
export const getLatestATSAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const latestAnalysis = await ATSAnalysis.findOne({ user: userId })
    .sort({ createdAt: -1 })
    .populate("resume", "fileName fileUrl createdAt status");

  if (!latestAnalysis) {
    return res.status(STATUS_CODES.OK).json(
      new ApiResponse(STATUS_CODES.OK, null, "No ATS analysis records found")
    );
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, latestAnalysis, "Latest ATS analysis retrieved successfully")
  );
});

/**
 * Get ATS analysis by ID
 * GET /api/v1/ats/:id
 */
export const getATSAnalysisById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const analysis = await ATSAnalysis.findOne({ _id: id, user: userId })
    .populate("resume", "fileName fileUrl createdAt status");

  if (!analysis) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "ATS analysis record not found");
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, analysis, "ATS analysis retrieved successfully")
  );
});

export default {
  analyzeResume,
  getLatestATSAnalysis,
  getATSAnalysisById,
};
