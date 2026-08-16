import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import STATUS_CODES from "../constants/statusCodes.js";
import OpportunityRadarScan from "../models/OpportunityRadarScan.model.js";
import { recordActivity } from "../services/activity.service.js";
import {
  buildOpportunityEvidence,
  buildOpportunityRadar,
  loadOpportunitySources,
} from "../services/opportunityRadar.service.js";

const requestIdPattern = /^[a-zA-Z0-9][a-zA-Z0-9_-]{7,99}$/;

const formatScan = (scan, currentFingerprint) => ({
  radar: scan?.result || null,
  scan: scan
    ? {
        id: String(scan._id),
        generatedAt: scan.generatedAt,
        analysisVersion: scan.analysisVersion,
        isStale: scan.sourceFingerprint !== currentFingerprint,
      }
    : null,
});

export const getLatestOpportunityRadar = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const [latestScan, sources] = await Promise.all([
    OpportunityRadarScan.findOne({ user: userId }).sort({ generatedAt: -1 }).lean(),
    loadOpportunitySources(userId),
  ]);
  const evidence = buildOpportunityEvidence(sources);

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(
      STATUS_CODES.OK,
      {
        ...formatScan(latestScan, sources.sourceFingerprint),
        canScan: evidence.hasEvidence,
        source: {
          resumeId: evidence.resumeId,
          resumeVersion: evidence.resumeVersion,
          evidenceAvailable: evidence.hasEvidence,
        },
      },
      latestScan ? "Latest Opportunity Radar loaded" : "No saved Opportunity Radar scan found",
    ),
  );
});

export const scanOpportunityRadar = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const requestId = String(req.body?.requestId || "").trim();
  if (!requestIdPattern.test(requestId)) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, "A valid scan request ID is required");
  }

  const existing = await OpportunityRadarScan.findOne({ user: userId, requestId }).lean();
  if (existing) {
    return res.status(STATUS_CODES.OK).json(
      new ApiResponse(
        STATUS_CODES.OK,
        formatScan(existing, existing.sourceFingerprint),
        "Opportunity Radar scan already completed",
      ),
    );
  }

  const sources = await loadOpportunitySources(userId);
  const result = await buildOpportunityRadar(sources);
  const session = await mongoose.startSession();
  let created;

  try {
    await session.withTransaction(async () => {
      [created] = await OpportunityRadarScan.create(
        [{
          user: userId,
          resume: sources.resume?._id || null,
          requestId,
          analysisVersion: result.analysisVersion,
          sourceFingerprint: sources.sourceFingerprint,
          result,
          generatedAt: result.generatedAt,
        }],
        { session },
      );
      await recordActivity({
        user: userId,
        action: "OPPORTUNITY_RADAR_SCANNED",
        sourceId: created._id,
        description: `Opportunity Radar scanned from current profile evidence`,
        metadata: {
          scanId: created._id,
          resumeId: sources.resume?._id || null,
          strongestRole: result.summary.strongestDirection.role,
        },
        session,
      });
    });
  } catch (error) {
    if (error?.code === 11000) {
      created = await OpportunityRadarScan.findOne({ user: userId, requestId });
    } else {
      throw error;
    }
  } finally {
    await session.endSession();
  }

  const payload = created.toObject ? created.toObject() : created;
  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(
      STATUS_CODES.CREATED,
      formatScan(payload, sources.sourceFingerprint),
      "Opportunity Radar scan completed successfully",
    ),
  );
});

export default { getLatestOpportunityRadar, scanOpportunityRadar };
