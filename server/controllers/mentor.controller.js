import crypto from "node:crypto";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Interview from "../models/Interview.model.js";
import CareerDNA from "../models/CareerDNA.model.js";
import Resume from "../models/Resume.model.js";
import Settings from "../models/Settings.model.js";
import { recordActivity } from "../services/activity.service.js";
import {
  evaluateAnswerAndGenerateNext,
  generateFinalInterviewFeedback,
  generateFirstQuestion,
  MENTOR_MODEL_NAME,
} from "../services/gemini/mentor.service.js";
import { buildInterviewContext } from "../services/interviewContext.service.js";
import {
  calculateInterviewScores,
  calculateQuestionScore,
  readinessFromScore,
} from "../services/interviewScoring.service.js";
import {
  startInterviewRequestSchema,
  submitInterviewAnswerSchema,
} from "../validators/interview.validator.js";

const MAX_QUESTIONS = 5;
const PROCESSING_LOCK_MS = 5 * 60 * 1000;

const parseRequest = (schema, body) => {
  const result = schema.safeParse(body || {});
  if (!result.success) {
    const errors = result.error.errors.map((issue) => issue.message);
    throw new ApiError(400, errors[0] || "Invalid interview request", errors);
  }
  return result.data;
};

const assertSessionId = (sessionId) => {
  if (!mongoose.isValidObjectId(sessionId)) {
    throw new ApiError(404, "Interview session not found");
  }
};

const loadContextSources = async (userId) => {
  const [careerDNA, resume, settings] = await Promise.all([
    CareerDNA.findOne({ user: userId }).lean(),
    Resume.findOne({ user: userId, status: "parsed" }).sort({ createdAt: -1 }).lean(),
    Settings.findOne({ user: userId }).lean(),
  ]);
  return { careerDNA, resume, settings };
};

const createContext = async (userId, config) =>
  buildInterviewContext({
    ...config,
    ...(await loadContextSources(userId)),
  });

const makeProviderCall = (kind, questionId, metadata) => ({
  kind,
  questionId,
  ...metadata,
});

const makeQuestion = (question, metadata, source) => {
  const questionId = `q-${crypto.randomUUID()}`;
  return {
    questionId,
    ...question,
    source,
    answer: null,
    generatedAt: metadata.generatedAt,
    providerMetadata: makeProviderCall(
      source === "opening" ? "opening_question" : "answer_evaluation",
      questionId,
      metadata,
    ),
  };
};

const toClientSession = (document) => {
  const payload = document?.toObject ? document.toObject() : { ...document };
  payload.isLegacy =
    !payload.aiMetadata?.model ||
    !Array.isArray(payload.questions) ||
    payload.questions.length === 0;
  payload.isProcessing = Boolean(payload.processingQuestionId || payload.finalizing);
  payload.questions = (payload.questions || []).map((question) => {
    const safeQuestion = { ...question };
    if (!safeQuestion.answer) delete safeQuestion.expectedTopics;
    delete safeQuestion.providerMetadata;
    return safeQuestion;
  });
  if (payload.aiMetadata) {
    payload.aiMetadata = {
      provider: payload.aiMetadata.provider,
      model: payload.aiMetadata.model,
      callCount: payload.aiMetadata.calls?.length || 0,
    };
  }
  delete payload.processingQuestionId;
  delete payload.processingStartedAt;
  delete payload.finalizing;
  return payload;
};

export const startInterviewSession = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const input = parseRequest(startInterviewRequestSchema, req.body);
  const activeSessionExists = await Interview.exists({ user: userId, status: "active" });
  if (activeSessionExists) {
    throw new ApiError(409, "An active interview session already exists");
  }
  const personalization = await createContext(userId, input);
  const { value: firstQuestion, providerMetadata } = await generateFirstQuestion({
    context: personalization.context,
  });
  const storedQuestion = makeQuestion(firstQuestion, providerMetadata, "opening");
  const providerCall = makeProviderCall(
    "opening_question",
    storedQuestion.questionId,
    providerMetadata,
  );

  let session;
  try {
    session = await Interview.create({
      user: userId,
      resume: personalization.sourceIds.resume,
      targetRole: input.targetRole,
      seniorityLevel: input.seniorityLevel,
      interviewType: input.interviewType,
      desiredDifficulty: personalization.desiredDifficulty,
      status: "active",
      currentQuestionIndex: 0,
      maxQuestions: MAX_QUESTIONS,
      questions: [storedQuestion],
      personalization: {
        sourcesUsed: personalization.sourcesUsed,
        currentSkills: personalization.currentSkills,
        contextHash: personalization.contextHash,
        sourceIds: personalization.sourceIds,
      },
      aiMetadata: {
        provider: "gemini",
        model: MENTOR_MODEL_NAME,
        calls: [providerCall],
      },
      startedAt: new Date(),
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, "An active interview session already exists");
    }
    throw error;
  }

  return res
    .status(201)
    .json(new ApiResponse(201, toClientSession(session), "Mock interview session initialized successfully"));
});

export const submitInterviewAnswer = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.params;
  assertSessionId(sessionId);
  const input = parseRequest(submitInterviewAnswerSchema, req.body);

  const existing = await Interview.findOne({ _id: sessionId, user: userId });
  if (!existing) throw new ApiError(404, "Interview session not found");
  if (existing.status !== "active") {
    throw new ApiError(409, "Cannot submit an answer to a non-active interview session");
  }
  const questionIndex = existing.questions.findIndex(
    (question) => question.questionId === input.questionId,
  );
  if (questionIndex < 0) throw new ApiError(404, "Interview question not found");
  if (questionIndex !== existing.currentQuestionIndex) {
    throw new ApiError(409, "Only the current interview question can be answered");
  }
  if (existing.questions[questionIndex].answer) {
    throw new ApiError(409, "This interview question has already been answered");
  }

  const staleBefore = new Date(Date.now() - PROCESSING_LOCK_MS);
  const locked = await Interview.findOneAndUpdate(
    {
      _id: sessionId,
      user: userId,
      status: "active",
      currentQuestionIndex: questionIndex,
      finalizing: false,
      $or: [
        { processingQuestionId: null },
        { processingQuestionId: { $exists: false } },
        { processingStartedAt: { $lt: staleBefore } },
      ],
      questions: {
        $elemMatch: { questionId: input.questionId, answer: null },
      },
    },
    {
      $set: {
        processingQuestionId: input.questionId,
        processingStartedAt: new Date(),
      },
    },
    { new: true },
  );
  if (!locked) throw new ApiError(409, "This answer is already being processed");

  let persisted = false;
  try {
    const personalization = await createContext(userId, {
      targetRole: locked.targetRole,
      seniorityLevel: locked.seniorityLevel,
      interviewType: locked.interviewType,
    });
    const currentQuestion = locked.questions[questionIndex];
    const shouldGenerateNext = locked.questions.length < locked.maxQuestions;
    const { value: providerEvaluation, providerMetadata } =
      await evaluateAnswerAndGenerateNext({
        context: personalization.context,
        questions: locked.questions,
        currentQuestion,
        answer: input.answer,
        shouldGenerateNext,
      });

    const { nextQuestion, ...evaluationFields } = providerEvaluation;
    const questionScore = calculateQuestionScore(providerEvaluation);
    const followUpNeeded =
      shouldGenerateNext &&
      (questionScore < 60 || (providerEvaluation.followUpNeeded && questionScore < 85));
    const evaluation = {
      ...evaluationFields,
      followUpNeeded,
      nextQuestionReason: nextQuestion ? providerEvaluation.nextQuestionReason : null,
      score: questionScore,
    };
    const updatedQuestions = locked.questions.map((question) => question.toObject());
    updatedQuestions[questionIndex].answer = {
      text: input.answer,
      submittedAt: new Date(),
      skipped: false,
      evaluation,
    };
    let nextQuestionIndex = questionIndex;
    if (nextQuestion) {
      const source = evaluation.followUpNeeded ? "follow_up" : "progression";
      updatedQuestions.push(makeQuestion(nextQuestion, providerMetadata, source));
      nextQuestionIndex = questionIndex + 1;
    }

    const update = {
      $set: {
        questions: updatedQuestions,
        currentQuestionIndex: nextQuestionIndex,
        processingQuestionId: null,
        processingStartedAt: null,
      },
      $push: {
        "aiMetadata.calls": makeProviderCall(
          "answer_evaluation",
          input.questionId,
          providerMetadata,
        ),
      },
    };

    const updated = await Interview.findOneAndUpdate(
      {
        _id: sessionId,
        user: userId,
        status: "active",
        processingQuestionId: input.questionId,
      },
      update,
      { new: true, runValidators: true },
    );
    if (!updated) throw new ApiError(409, "Interview session changed while processing the answer");
    persisted = true;
    return res
      .status(200)
      .json(new ApiResponse(200, toClientSession(updated), "Answer evaluated successfully"));
  } finally {
    if (!persisted) {
      await Interview.updateOne(
        { _id: sessionId, user: userId, processingQuestionId: input.questionId },
        { $set: { processingQuestionId: null, processingStartedAt: null } },
      );
    }
  }
});

export const finishInterviewSession = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.params;
  assertSessionId(sessionId);

  const existing = await Interview.findOne({ _id: sessionId, user: userId });
  if (!existing) throw new ApiError(404, "Interview session not found");
  if (existing.status === "completed") {
    return res
      .status(200)
      .json(new ApiResponse(200, toClientSession(existing), "Interview session already completed"));
  }
  if (existing.status !== "active" || existing.processingQuestionId) {
    throw new ApiError(409, "Interview session cannot be completed while another operation is active");
  }
  const answeredQuestions = existing.questions.filter((question) => question.answer).length;
  if (!answeredQuestions) {
    throw new ApiError(400, "Answer at least one question before finishing the interview");
  }

  const locked = await Interview.findOneAndUpdate(
    { _id: sessionId, user: userId, status: "active", finalizing: false, processingQuestionId: null },
    { $set: { finalizing: true } },
    { new: true },
  );
  if (!locked) throw new ApiError(409, "Interview completion is already in progress");

  let persisted = false;
  try {
    const deterministicScores = calculateInterviewScores(locked.questions);
    const personalization = await createContext(userId, {
      targetRole: locked.targetRole,
      seniorityLevel: locked.seniorityLevel,
      interviewType: locked.interviewType,
    });
    const { value: narrative, providerMetadata } = await generateFinalInterviewFeedback({
      context: personalization.context,
      questions: locked.questions,
      deterministicScores,
    });
    const readinessLevel = readinessFromScore(deterministicScores.overall);
    const completedAt = new Date();
    const completed = await Interview.findOneAndUpdate(
      { _id: sessionId, user: userId, status: "active", finalizing: true },
      {
        $set: {
          status: "completed",
          score: deterministicScores.overall,
          scoreBreakdown: {
            technicalAccuracy: deterministicScores.technicalAccuracy,
            conceptualDepth: deterministicScores.conceptualDepth,
            communication: deterministicScores.communication,
            clarity: deterministicScores.clarity,
            answeredQuestions: deterministicScores.answeredQuestions,
          },
          feedback: {
            ...narrative,
            tips: narrative.recommendedPractice,
            readinessLevel,
          },
          completedAt,
          finalizing: false,
        },
        $push: {
          "aiMetadata.calls": makeProviderCall(
            "final_feedback",
            null,
            providerMetadata,
          ),
        },
      },
      { new: true, runValidators: true },
    );
    if (!completed) throw new ApiError(409, "Interview session changed while completing");
    await recordActivity({
      user: userId,
      action: "INTERVIEW_COMPLETED",
      sourceId: completed._id,
      description: `Mock interview completed for ${completed.targetRole}`,
      metadata: { interviewId: completed._id, score: completed.score, targetRole: completed.targetRole },
    });
    persisted = true;
    return res
      .status(200)
      .json(new ApiResponse(200, toClientSession(completed), "Interview session evaluated successfully"));
  } finally {
    if (!persisted) {
      await Interview.updateOne(
        { _id: sessionId, user: userId, status: "active", finalizing: true },
        { $set: { finalizing: false } },
      );
    }
  }
});

export const getActiveInterviewSession = asyncHandler(async (req, res) => {
  const session = await Interview.findOne({ user: req.user._id, status: "active" });
  return res
    .status(200)
    .json(new ApiResponse(200, session ? toClientSession(session) : null, session ? "Active interview retrieved successfully" : "No active interview found"));
});

export const getInterviewSession = asyncHandler(async (req, res) => {
  assertSessionId(req.params.sessionId);
  const session = await Interview.findOne({ _id: req.params.sessionId, user: req.user._id });
  if (!session) throw new ApiError(404, "Interview session not found");
  return res
    .status(200)
    .json(new ApiResponse(200, toClientSession(session), "Interview session retrieved successfully"));
});

export const getInterviewHistory = asyncHandler(async (req, res) => {
  const history = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  return res
    .status(200)
    .json(new ApiResponse(200, history.map(toClientSession), "Interview history retrieved successfully"));
});

export const deleteInterviewSession = asyncHandler(async (req, res) => {
  assertSessionId(req.params.sessionId);
  const deleted = await Interview.findOneAndDelete({
    _id: req.params.sessionId,
    user: req.user._id,
    finalizing: false,
    processingQuestionId: null,
  });
  if (!deleted) {
    const owned = await Interview.exists({ _id: req.params.sessionId, user: req.user._id });
    if (!owned) throw new ApiError(404, "Interview session not found");
    throw new ApiError(409, "Interview session cannot be deleted while processing");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Interview session deleted successfully"));
});

export default {
  startInterviewSession,
  submitInterviewAnswer,
  finishInterviewSession,
  getActiveInterviewSession,
  getInterviewSession,
  getInterviewHistory,
  deleteInterviewSession,
};
