import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Resume from "../models/Resume.model.js";
import Settings from "../models/Settings.model.js";
import RecruiterSimulator from "../models/RecruiterSimulator.model.js";
import ActivityLog from "../models/ActivityLog.model.js";
import Notification from "../models/Notification.model.js";
import { recruiterRequestSchema } from "../validators/recruiter.validator.js";
import {
  getPublicRecruiterRubric,
  getRecruiterRubric,
  RECRUITER_RUBRIC_VERSION,
} from "../constants/recruiterRubrics.js";
import { evaluateRecruiterCandidate } from "../services/gemini/recruiter.service.js";
import { combineRecruiterResult, getRecruiterDecision } from "../services/recruiterScoring.service.js";

const DISCLAIMER = "AI-generated simulation based on your resume and a simulated hiring rubric. It does not represent an official assessment or hiring decision from the selected company.";

const parseRequest = (body) => {
  const result = recruiterRequestSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(
      400,
      result.error.errors[0]?.message || "Invalid recruiter simulation request",
      result.error.errors.map((error) => error.message)
    );
  }
  return result.data;
};

const validateId = (id, label) => {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, `${label} is invalid`);
};

const findRubricForRecord = (record) => {
  const candidateId = String(record.companyId || record.company || "").trim().toLowerCase();
  return getRecruiterRubric(candidateId) || {
    id: candidateId || "legacy",
    name: record.company || "Company",
    defaultRole: record.targetRole || "Software Engineer",
    focusAreas: [],
    evaluationWeights: {},
  };
};

const mapLegacyItems = (items, detailKey) =>
  (items || []).map((item) => typeof item === "string"
    ? { title: item, [detailKey]: item }
    : item);

const toRecruiterResponse = (document) => {
  const record = typeof document.toObject === "function" ? document.toObject() : document;
  const rubric = findRubricForRecord(record);
  const isLegacy = !record.companyId;
  const overallScore = isLegacy
    ? Number(record.interviewProbability || 0)
    : Number(record.overallScore || 0);

  return {
    _id: record._id,
    resume: record.resume,
    company: getPublicRecruiterRubric({ ...rubric, evaluationWeights: rubric.evaluationWeights || {} }),
    targetRole: record.targetRole,
    rubricVersion: record.rubricVersion || 1,
    overallScore,
    decision: isLegacy ? getRecruiterDecision(overallScore) : record.decision,
    confidence: record.confidence || "Low",
    summary: record.summary || "This legacy simulation contains limited recruiter feedback.",
    categoryScores: record.categoryScores || {},
    strengths: record.strengths?.length
      ? record.strengths
      : mapLegacyItems(record.reasons?.positive, "evidence"),
    concerns: record.concerns?.length
      ? record.concerns
      : mapLegacyItems(record.reasons?.negative, "reason"),
    missingSignals: record.missingSignals || record.rejectionRisks || [],
    resumeIssues: record.resumeIssues || [],
    companyFit: {
      score: record.companyFit?.score || overallScore,
      strongMatches: record.companyFit?.strongMatches || [],
      gaps: record.companyFit?.gaps || record.rejectionRisks || [],
    },
    interviewFocus: record.interviewFocus || [],
    recommendedActions: record.recommendedActions || [],
    expectedQuestions: {
      technical: record.expectedQuestions?.technical || [],
      behavioral: record.expectedQuestions?.behavioral || record.expectedQuestions?.hr || [],
      resumeSpecific: record.expectedQuestions?.resumeSpecific || [],
    },
    disclaimer: DISCLAIMER,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

export const simulateRecruiterScreening = asyncHandler(async (req, res) => {
  const startedAt = Date.now();
  const input = parseRequest(req.body);
  const rubric = getRecruiterRubric(input.company);
  const userId = req.user._id;

  console.info("[RecruiterSimulator] request started", { company: rubric.id });
  const resume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });

  if (!resume) throw new ApiError(404, "No resume found for recruiter simulation");
  if (resume.status === "failed") throw new ApiError(422, "The current resume could not be parsed");
  if (!resume.rawText?.trim() || resume.rawText.trim().length < 50) {
    throw new ApiError(422, "The current resume contains insufficient extractable text");
  }

  const settings = await Settings.findOne({ user: userId }).select("profileDetails careerPreferences").lean();
  const targetRole = input.targetRole || rubric.defaultRole;
  const semanticResult = await evaluateRecruiterCandidate({
    resumeText: resume.rawText,
    parsedData: resume.parsedData,
    profile: {
      bio: settings?.profileDetails?.bio,
      preferredExperienceLevel: settings?.careerPreferences?.preferredExperienceLevel,
    },
    rubric,
    targetRole,
  });
  const result = combineRecruiterResult(semanticResult, rubric);

  const session = await mongoose.startSession();
  let createdId;
  try {
    await session.withTransaction(async () => {
      const [created] = await RecruiterSimulator.create([{
        user: userId,
        resume: resume._id,
        company: rubric.name,
        companyId: rubric.id,
        rubricVersion: RECRUITER_RUBRIC_VERSION,
        targetRole,
        ...result,
        expectedQuestions: {
          technical: result.expectedQuestions.technical,
          behavioral: result.expectedQuestions.behavioral,
          resumeSpecific: result.expectedQuestions.resumeSpecific,
        },
      }], { session });
      createdId = created._id;

      await ActivityLog.create([{
        user: userId,
        action: "RECRUITER_SIMULATED",
        sourceId: String(created._id),
        description: `Recruiter simulation completed for ${rubric.name}`,
        metadata: { companyId: rubric.id, resumeId: resume._id, overallScore: result.overallScore },
      }], { session });
    });
  } catch (error) {
    console.error("[RecruiterSimulator] persistence failed", {
      company: rubric.id,
      error: error?.message,
    });
    throw new ApiError(500, "Recruiter simulation could not be saved. Please try again.");
  } finally {
    await session.endSession();
  }

  try {
    await Notification.create({
      user: userId,
      title: `${rubric.name} recruiter simulation ready`,
      message: `${result.decision} with an overall score of ${result.overallScore}/100.`,
      type: result.overallScore >= 70 ? "success" : result.overallScore >= 55 ? "info" : "warning",
      link: "/dashboard/recruiter",
    });
  } catch {
    console.warn("[RecruiterSimulator] notification creation failed", { company: rubric.id });
  }

  const populated = await RecruiterSimulator.findById(createdId)
    .populate("resume", "fileName createdAt status");

  console.info("[RecruiterSimulator] simulation completed", {
    company: rubric.id,
    status: "success",
    durationMs: Date.now() - startedAt,
  });

  return res.status(201).json(
    new ApiResponse(201, toRecruiterResponse(populated), "Recruiter simulation completed successfully")
  );
});

export const getRecruiterSimulations = asyncHandler(async (req, res) => {
  const simulations = await RecruiterSimulator.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("resume", "fileName createdAt status");

  return res.status(200).json(
    new ApiResponse(200, simulations.map(toRecruiterResponse), "Recruiter simulation history retrieved successfully")
  );
});

export const getRecruiterSimulationById = asyncHandler(async (req, res) => {
  validateId(req.params.id, "Recruiter simulation ID");
  const simulation = await RecruiterSimulator.findOne({ _id: req.params.id, user: req.user._id })
    .populate("resume", "fileName createdAt status");
  if (!simulation) throw new ApiError(404, "Recruiter simulation record not found");

  return res.status(200).json(
    new ApiResponse(200, toRecruiterResponse(simulation), "Recruiter simulation retrieved successfully")
  );
});

export const deleteRecruiterSimulation = asyncHandler(async (req, res) => {
  validateId(req.params.id, "Recruiter simulation ID");
  const simulation = await RecruiterSimulator.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!simulation) throw new ApiError(404, "Recruiter simulation record not found");

  return res.status(200).json(
    new ApiResponse(200, null, "Recruiter simulation deleted successfully")
  );
});

export default {
  simulateRecruiterScreening,
  getRecruiterSimulations,
  getRecruiterSimulationById,
  deleteRecruiterSimulation,
};
