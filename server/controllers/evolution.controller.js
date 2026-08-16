import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import STATUS_CODES from "../constants/statusCodes.js";
import { buildResumeEvolution } from "../services/resumeEvolution.service.js";

export const getResumeEvolution = asyncHandler(async (req, res) => {
  const evolution = await buildResumeEvolution(req.user._id);
  const message =
    evolution.summary.versionCount === 0
      ? "No resume versions found"
      : "Resume evolution compiled successfully";

  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, evolution, message));
});

export default { getResumeEvolution };
