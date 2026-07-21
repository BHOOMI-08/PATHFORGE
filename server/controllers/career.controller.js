import CareerDNA from "../models/CareerDNA.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import STATUS_CODES from "../constants/statusCodes.js";

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
