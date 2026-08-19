import CareerDNA from "../models/CareerDNA.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import STATUS_CODES from "../constants/statusCodes.js";
import { recordActivity } from "../services/activity.service.js";

/**
 * Get authenticated user's Career DNA profile
 * @route GET /api/v1/career-dna
 */
export const getCareerDNA = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  const careerDNA = await CareerDNA.findOne({ user: userId });

  return res
    .status(STATUS_CODES.OK)
    .json(
      new ApiResponse(
        STATUS_CODES.OK,
        { careerDNA },
        "Career DNA profile retrieved successfully"
      )
    );
});

/**
 * Create or update authenticated user's Career DNA profile
 * @route PUT /api/v1/career-dna
 */
export const upsertCareerDNA = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const updateData = { ...req.body, user: userId };
  const allSkills = new Set([
    ...(Array.isArray(updateData.programmingLanguages) ? updateData.programmingLanguages : []),
    ...(Array.isArray(updateData.frameworks) ? updateData.frameworks : []),
    ...(Array.isArray(updateData.databases) ? updateData.databases : []),
    ...(Array.isArray(updateData.technicalSkills) ? updateData.technicalSkills : []),
  ]);
  updateData.technicalSkills = [...allSkills];
  const experienceByProficiency = {
    Beginner: "Entry",
    Intermediate: "Mid",
    Advanced: "Senior",
    Expert: "Lead",
  };
  if (experienceByProficiency[updateData.technicalProficiency]) {
    updateData.experienceLevel = experienceByProficiency[updateData.technicalProficiency];
  }

  const careerDNA = await CareerDNA.findOneAndUpdate(
    { user: userId },
    updateData,
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  await recordActivity({
    user: userId,
    action: "CAREER_DNA_UPDATED",
    sourceId: `${careerDNA._id}:${careerDNA.updatedAt.toISOString()}`,
    description: "Career DNA profile updated",
    metadata: { careerDNAId: careerDNA._id },
  });

  return res
    .status(STATUS_CODES.OK)
    .json(
      new ApiResponse(
        STATUS_CODES.OK,
        { careerDNA },
        "Career DNA profile saved successfully"
      )
    );
});

export default {
  getCareerDNA,
  upsertCareerDNA,
};
