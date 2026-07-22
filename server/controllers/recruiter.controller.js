import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import STATUS_CODES from "../constants/statusCodes.js";
import Resume from "../models/Resume.model.js";
import RecruiterSimulator from "../models/RecruiterSimulator.model.js";
import ActivityLog from "../models/ActivityLog.model.js";
import Notification from "../models/Notification.model.js";
import { simulateRecruiterScreening as runSimulation } from "../services/gemini/recruiter.service.js";

/**
 * Execute AI Recruiter Screening simulation for a target company
 * POST /api/v1/recruiter/simulate
 */
export const simulateRecruiterScreening = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { resumeId, company = "Google", targetRole = "Software Development Engineer" } = req.body;

  let resume;
  if (resumeId) {
    resume = await Resume.findOne({ _id: resumeId, user: userId });
  } else {
    resume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });
  }

  if (!resume) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "No resume found to run recruiter screening simulation");
  }

  // 1. Run Gemini AI Recruiter Simulation
  const result = await runSimulation(resume, company.trim(), targetRole.trim());

  // 2. Persist record in MongoDB
  const simulationRecord = await RecruiterSimulator.create({
    user: userId,
    resume: resume._id,
    company: company.trim(),
    targetRole: targetRole.trim(),
    decision: result.decision,
    interviewProbability: result.interviewProbability,
    reasons: result.reasons,
    expectedQuestions: result.expectedQuestions,
    rejectionRisks: result.rejectionRisks,
  });

  // 3. Log audit activity & notification
  await ActivityLog.create({
    user: userId,
    action: "ATS_ANALYZED",
    description: `Recruiter Simulator evaluated for ${company} (${result.decision})`,
  });

  await Notification.create({
    user: userId,
    title: `Recruiter Evaluation for ${company}`,
    message: `Recruiter decision: ${result.decision} (${result.interviewProbability}% interview probability).`,
    type: result.decision === "Shortlisted" ? "success" : result.decision === "Borderline" ? "info" : "warning",
    link: "/dashboard/recruiter",
  });

  const populatedRecord = await RecruiterSimulator.findById(simulationRecord._id).populate("resume", "fileName fileUrl createdAt");

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(STATUS_CODES.CREATED, populatedRecord, "Recruiter screening simulation completed successfully")
  );
});

/**
 * Get all recruiter simulations for authenticated user
 * GET /api/v1/recruiter
 */
export const getRecruiterSimulations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const simulations = await RecruiterSimulator.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("resume", "fileName fileUrl createdAt");

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, simulations, "Recruiter simulations retrieved successfully")
  );
});

/**
 * Get recruiter simulation by ID
 * GET /api/v1/recruiter/:id
 */
export const getRecruiterSimulationById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const simulation = await RecruiterSimulator.findOne({ _id: id, user: userId }).populate("resume", "fileName fileUrl createdAt");

  if (!simulation) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "Recruiter simulation record not found");
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, simulation, "Recruiter simulation retrieved successfully")
  );
});

/**
 * Delete recruiter simulation record
 * DELETE /api/v1/recruiter/:id
 */
export const deleteRecruiterSimulation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const simulation = await RecruiterSimulator.findOneAndDelete({ _id: id, user: userId });

  if (!simulation) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "Recruiter simulation record not found");
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, null, "Recruiter simulation deleted successfully")
  );
});

export default {
  simulateRecruiterScreening,
  getRecruiterSimulations,
  getRecruiterSimulationById,
  deleteRecruiterSimulation,
};
