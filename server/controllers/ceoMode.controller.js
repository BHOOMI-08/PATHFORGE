import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import STATUS_CODES from "../constants/statusCodes.js";
import CEOStrategyPlan from "../models/CEOStrategyPlan.model.js";
import { recordActivity } from "../services/activity.service.js";
import { buildOpportunityEvidence } from "../services/opportunityRadar.service.js";
import { buildCEOStrategyPlan, loadCEOSources, resolveCEOTarget } from "../services/ceoMode.service.js";

const requestIdPattern = /^[a-zA-Z0-9][a-zA-Z0-9_-]{7,99}$/;

const formatPlan = (document, currentFingerprint) => ({
  plan: document?.result || null,
  savedPlan: document
    ? {
        id: String(document._id),
        generatedAt: document.generatedAt,
        analysisVersion: document.analysisVersion,
        targetInput: document.targetInput,
        isStale: document.sourceFingerprint !== currentFingerprint,
      }
    : null,
});

export const getCEORoadmap = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const [latestPlan, sources] = await Promise.all([
    CEOStrategyPlan.findOne({ user: userId }).sort({ generatedAt: -1 }).lean(),
    loadCEOSources(userId),
  ]);
  const evidence = buildOpportunityEvidence(sources.opportunity);

  return res.status(STATUS_CODES.OK).json(new ApiResponse(
    STATUS_CODES.OK,
    {
      ...formatPlan(latestPlan, sources.sourceFingerprint),
      canGenerate: evidence.hasEvidence,
      source: {
        resumeId: evidence.resumeId,
        resumeVersion: evidence.resumeVersion,
        evidenceAvailable: evidence.hasEvidence,
      },
    },
    latestPlan ? "Latest AI CEO strategy loaded" : "No saved AI CEO strategy found",
  ));
});

export const generateCEORoadmap = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const requestId = String(req.body?.requestId || "").trim();
  if (!requestIdPattern.test(requestId)) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, "A valid strategy request ID is required");
  }
  const target = resolveCEOTarget(req.body?.targetGoal);
  const existing = await CEOStrategyPlan.findOne({ user: userId, requestId }).lean();
  if (existing) {
    if (existing.targetId !== target.id || existing.targetInput.toLowerCase() !== target.input.toLowerCase()) {
      throw new ApiError(409, "This strategy request ID was already used for another target");
    }
    return res.status(STATUS_CODES.OK).json(new ApiResponse(
      STATUS_CODES.OK,
      formatPlan(existing, existing.sourceFingerprint),
      "AI CEO strategy request already completed",
    ));
  }

  const sources = await loadCEOSources(userId);
  const result = await buildCEOStrategyPlan(sources, target);
  const session = await mongoose.startSession();
  let created;
  try {
    await session.withTransaction(async () => {
      [created] = await CEOStrategyPlan.create([{
        user: userId,
        resume: sources.opportunity.resume?._id || null,
        requestId,
        targetId: target.id,
        targetInput: target.input,
        analysisVersion: result.analysisVersion,
        sourceFingerprint: sources.sourceFingerprint,
        result,
        generatedAt: result.generatedAt,
      }], { session });
      await recordActivity({
        user: userId,
        action: "CEO_STRATEGY_GENERATED",
        sourceId: created._id,
        description: `AI CEO strategy generated for ${target.label}`,
        metadata: {
          strategyId: created._id,
          targetId: target.id,
          company: target.company,
          resumeId: sources.opportunity.resume?._id || null,
        },
        session,
      });
    });
  } catch (error) {
    if (error?.code === 11000) {
      created = await CEOStrategyPlan.findOne({ user: userId, requestId });
    } else {
      throw error;
    }
  } finally {
    await session.endSession();
  }

  const payload = created.toObject ? created.toObject() : created;
  return res.status(STATUS_CODES.CREATED).json(new ApiResponse(
    STATUS_CODES.CREATED,
    formatPlan(payload, sources.sourceFingerprint),
    "AI CEO strategic execution plan generated successfully",
  ));
});

export default { generateCEORoadmap, getCEORoadmap };
