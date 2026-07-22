import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import STATUS_CODES from "../constants/statusCodes.js";
import Resume from "../models/Resume.model.js";
import JobMatch from "../models/JobMatch.model.js";
import { evaluateJobMatch } from "../services/gemini/jobmatch.service.js";

/**
 * Execute job match evaluation against parsed resume
 * POST /api/v1/job-match
 */
export const createJobMatch = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { resumeId, jobTitle, companyName, jobDescription } = req.body;

  if (!jobTitle || !jobTitle.trim()) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, "Job Title is required");
  }

  if (!jobDescription || !jobDescription.trim()) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, "Job Description is required");
  }

  let resume;
  if (resumeId) {
    resume = await Resume.findOne({ _id: resumeId, user: userId });
  } else {
    resume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });
  }

  if (!resume) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "No resume found to run job match comparison");
  }

  // 1. Evaluate job match using Gemini AI service
  const matchResult = await evaluateJobMatch(resume, jobDescription.trim(), jobTitle.trim());

  // 2. Persist record in MongoDB
  const jobMatchRecord = await JobMatch.create({
    user: userId,
    resume: resume._id,
    jobTitle: jobTitle.trim(),
    companyName: companyName ? companyName.trim() : "",
    jobDescription: jobDescription.trim(),
    matchScore: matchResult.matchScore,
    matchBreakdown: matchResult.matchBreakdown,
    matchingSkills: matchResult.matchingSkills,
    missingSkills: matchResult.missingSkills,
    recommendations: matchResult.recommendations,
  });

  const populatedRecord = await JobMatch.findById(jobMatchRecord._id).populate("resume", "fileName fileUrl createdAt");

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(STATUS_CODES.CREATED, populatedRecord, "Job match evaluation completed successfully")
  );
});

/**
 * Get all job match comparisons for user
 * GET /api/v1/job-match
 */
export const getJobMatches = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const matches = await JobMatch.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("resume", "fileName fileUrl createdAt");

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, matches, "Job match history retrieved successfully")
  );
});

/**
 * Get specific job match comparison by ID
 * GET /api/v1/job-match/:id
 */
export const getJobMatchById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const match = await JobMatch.findOne({ _id: id, user: userId }).populate("resume", "fileName fileUrl createdAt");

  if (!match) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "Job match record not found");
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, match, "Job match record retrieved successfully")
  );
});

/**
 * Delete job match evaluation record
 * DELETE /api/v1/job-match/:id
 */
export const deleteJobMatch = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const match = await JobMatch.findOneAndDelete({ _id: id, user: userId });

  if (!match) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "Job match record not found");
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, null, "Job match record deleted successfully")
  );
});

export default {
  createJobMatch,
  getJobMatches,
  getJobMatchById,
  deleteJobMatch,
};
