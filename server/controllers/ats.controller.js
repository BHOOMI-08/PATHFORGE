import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import STATUS_CODES from "../constants/statusCodes.js";
import Resume from "../models/Resume.model.js";
import ATSAnalysis from "../models/ATSAnalysis.model.js";
import { evaluateResumeATS } from "../services/gemini/ats.service.js";
import { calculateDeterministicScores, combineATSResult } from "../services/atsScoring.service.js";
import { recordActivity } from "../services/activity.service.js";

const validateId = (id, label) => { if (!mongoose.isValidObjectId(id)) throw new ApiError(400, `${label} is invalid`); };
const validateJobDescription = (value) => {
 const jd = typeof value === "string" ? value.trim() : "";
 if (jd.length < 80) throw new ApiError(400, "Job description must contain at least 80 characters");
 if (jd.length > 12000) throw new ApiError(400, "Job description cannot exceed 12000 characters");
 return jd;
};
export const analyzeResume = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const resumeId = req.params.resumeId || req.body?.resumeId;
  if (!resumeId) throw new ApiError(400, "Resume ID is required");
  validateId(resumeId, "Resume ID");
  const jobDescription = validateJobDescription(req.body?.jobDescription);
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) throw new ApiError(404, "Resume not found");
  if (!resume.rawText?.trim() || resume.rawText.trim().length < 50) throw new ApiError(422, "Resume contains insufficient extractable text");

  const deterministic = calculateDeterministicScores(resume.rawText, jobDescription, resume.parsedData);
  const semantic = await evaluateResumeATS({ resumeText: resume.rawText, jobDescription });
  const result = combineATSResult(deterministic, semantic);
  const session = await mongoose.startSession();
  let createdId;
  try {
    await session.withTransaction(async () => {
      const [created] = await ATSAnalysis.create([{ user: userId, resume: resume._id, jobDescription, ...result }], { session });
      createdId = created._id;
      resume.matchHistoryMetrics = { atsScoreBaseline: result.atsScore, topSkillMatches: result.matchedKeywords, missingKeywords: result.missingKeywords };
      await resume.save({ session });
      await recordActivity({
        user: userId,
        action: "ATS_ANALYZED",
        sourceId: created._id,
        description: `ATS analysis completed with a score of ${result.atsScore}/100`,
        metadata: { analysisId: created._id, resumeId: resume._id, score: result.atsScore },
        session,
      });
    });
  } finally {
    await session.endSession();
  }
  const record = await ATSAnalysis.findOne({ _id: createdId, user: userId }).populate("resume", "fileName fileUrl createdAt status");
  res.status(201).json(new ApiResponse(201, record, "ATS analysis completed successfully"));
});
export const getLatestATSAnalysis=asyncHandler(async(req,res)=>{const record=await ATSAnalysis.findOne({user:req.user._id}).sort({createdAt:-1}).populate("resume","fileName fileUrl createdAt status");res.status(200).json(new ApiResponse(200,record,record?"Latest ATS analysis retrieved successfully":"No ATS analysis records found"));});
export const getATSHistory=asyncHandler(async(req,res)=>{const records=await ATSAnalysis.find({user:req.user._id}).sort({createdAt:-1}).limit(50).populate("resume","fileName createdAt status");res.status(200).json(new ApiResponse(200,{analyses:records},"ATS history retrieved successfully"));});
export const getATSAnalysisById=asyncHandler(async(req,res)=>{validateId(req.params.id,"Analysis ID");const record=await ATSAnalysis.findOne({_id:req.params.id,user:req.user._id}).populate("resume","fileName fileUrl createdAt status");if(!record)throw new ApiError(404,"ATS analysis record not found");res.status(200).json(new ApiResponse(200,record,"ATS analysis retrieved successfully"));});
export default {analyzeResume,getLatestATSAnalysis,getATSHistory,getATSAnalysisById};
