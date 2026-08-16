import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Resume from "../models/Resume.model.js";
import JobMatch from "../models/JobMatch.model.js";
import { jobMatchRequestSchema } from "../validators/jobMatch.validator.js";
import { evaluateJobMatch } from "../services/gemini/jobmatch.service.js";
import { calculateSkillGap, combineJobMatchResult } from "../services/jobMatchScoring.service.js";
import { recordActivity } from "../services/activity.service.js";

const parseRequest = (body) => {
  const result = jobMatchRequestSchema.safeParse(body);
  if (!result.success) throw new ApiError(400, result.error.errors[0]?.message || "Invalid job match request", result.error.errors.map((e) => e.message));
  return result.data;
};
const validateId = (id, label) => { if (!mongoose.isValidObjectId(id)) throw new ApiError(400, `${label} is invalid`); };

export const createJobMatch = asyncHandler(async (req, res) => {
  const input = parseRequest(req.body);
  validateId(input.resumeId, "Resume ID");
  const resume = await Resume.findOne({ _id: input.resumeId, user: req.user._id });
  if (!resume) throw new ApiError(404, "Resume not found");
  if (!resume.rawText?.trim() || resume.rawText.trim().length < 50) throw new ApiError(422, "Resume contains insufficient extractable text");

  const deterministic = calculateSkillGap(resume.rawText, input.jobDescription);
  const semantic = await evaluateJobMatch({ resumeText: resume.rawText, ...input });
  const result = combineJobMatchResult(deterministic, semantic);
  const session = await mongoose.startSession();
  let createdId;
  try {
    await session.withTransaction(async () => {
      const [created] = await JobMatch.create([{ user: req.user._id, resume: resume._id, ...input, ...result }], { session });
      createdId = created._id;
      await recordActivity({
        user: req.user._id,
        action: "JOB_MATCHED",
        sourceId: created._id,
        description: `Job match analyzed for ${created.jobTitle}`,
        metadata: { jobMatchId: created._id, resumeId: resume._id, score: result.matchScore },
        session,
      });
    });
  } finally {
    await session.endSession();
  }
  const record = await JobMatch.findOne({ _id: createdId, user: req.user._id }).populate("resume", "fileName fileUrl createdAt status");
  return res.status(201).json(new ApiResponse(201, record, "Job match evaluation completed successfully"));
});

export const getJobMatches = asyncHandler(async (req, res) => {
  const matches = await JobMatch.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50).populate("resume", "fileName fileUrl createdAt status");
  return res.status(200).json(new ApiResponse(200, matches, "Job match history retrieved successfully"));
});

export const getJobMatchById = asyncHandler(async (req, res) => {
  validateId(req.params.id, "Job match ID");
  const match = await JobMatch.findOne({ _id: req.params.id, user: req.user._id }).populate("resume", "fileName fileUrl createdAt status");
  if (!match) throw new ApiError(404, "Job match record not found");
  return res.status(200).json(new ApiResponse(200, match, "Job match record retrieved successfully"));
});

export const deleteJobMatch = asyncHandler(async (req, res) => {
  validateId(req.params.id, "Job match ID");
  const match = await JobMatch.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!match) throw new ApiError(404, "Job match record not found");
  return res.status(200).json(new ApiResponse(200, null, "Job match record deleted successfully"));
});

export default { createJobMatch, getJobMatches, getJobMatchById, deleteJobMatch };
