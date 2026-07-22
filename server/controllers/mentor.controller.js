import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import STATUS_CODES from "../constants/statusCodes.js";
import Interview from "../models/Interview.model.js";
import { generateNextQuestion, evaluateInterviewSession } from "../services/gemini/mentor.service.js";

/**
 * Initialize a new mock interview session
 * POST /api/v1/mentor/session/start
 */
export const startInterviewSession = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { targetRole = "Full Stack Engineer", experienceLevel = "Mid" } = req.body;

  // 1. Generate opening AI question
  const openingQuestion = await generateNextQuestion(targetRole.trim(), experienceLevel, []);

  // 2. Persist new interview session
  const session = await Interview.create({
    user: userId,
    targetRole: targetRole.trim(),
    experienceLevel,
    status: "in_progress",
    history: [
      {
        sender: "ai",
        message: openingQuestion,
        timestamp: new Date(),
      },
    ],
  });

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(STATUS_CODES.CREATED, session, "Mock interview session initialized successfully")
  );
});

/**
 * Send user candidate answer and retrieve AI interviewer follow-up
 * POST /api/v1/mentor/session/:sessionId/message
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, "Message text is required");
  }

  const session = await Interview.findOne({ _id: sessionId, user: userId });

  if (!session) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "Interview session not found");
  }

  if (session.status === "completed") {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, "Cannot send message to a completed interview session");
  }

  // 1. Append user message
  session.history.push({
    sender: "user",
    message: message.trim(),
    timestamp: new Date(),
  });

  // 2. Generate AI follow-up question
  const aiResponse = await generateNextQuestion(session.targetRole, session.experienceLevel, session.history);

  // 3. Append AI response
  session.history.push({
    sender: "ai",
    message: aiResponse,
    timestamp: new Date(),
  });

  await session.save();

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, session, "Message processed successfully")
  );
});

/**
 * Finish interview session and generate evaluation scorecard
 * POST /api/v1/mentor/session/:sessionId/finish
 */
export const finishInterviewSession = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.params;

  const session = await Interview.findOne({ _id: sessionId, user: userId });

  if (!session) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "Interview session not found");
  }

  // 1. Evaluate complete transcript with Gemini AI
  const scorecard = await evaluateInterviewSession(session.targetRole, session.history);

  // 2. Save score & feedback
  session.score = scorecard.score;
  session.feedback = {
    overallSummary: scorecard.overallSummary,
    strengths: scorecard.strengths,
    weaknesses: scorecard.weaknesses,
    tips: scorecard.tips,
  };
  session.status = "completed";

  await session.save();

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, session, "Interview session evaluated successfully")
  );
});

/**
 * Get interview session by ID
 * GET /api/v1/mentor/session/:sessionId
 */
export const getInterviewSession = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.params;

  const session = await Interview.findOne({ _id: sessionId, user: userId });

  if (!session) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "Interview session not found");
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, session, "Interview session retrieved successfully")
  );
});

/**
 * Get all interview history for user
 * GET /api/v1/mentor/session
 */
export const getInterviewHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const history = await Interview.find({ user: userId }).sort({ createdAt: -1 });

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, history, "Interview history retrieved successfully")
  );
});

export default {
  startInterviewSession,
  sendMessage,
  finishInterviewSession,
  getInterviewSession,
  getInterviewHistory,
};
