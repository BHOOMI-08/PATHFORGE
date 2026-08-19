import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import STATUS_CODES from "../constants/statusCodes.js";
import User from "../models/User.model.js";
import Settings from "../models/Settings.model.js";
import Resume from "../models/Resume.model.js";
import ATSAnalysis from "../models/ATSAnalysis.model.js";
import JobMatch from "../models/JobMatch.model.js";
import Interview from "../models/Interview.model.js";
import Roadmap from "../models/Roadmap.model.js";
import OpportunityRadarScan from "../models/OpportunityRadarScan.model.js";
import CEOStrategyPlan from "../models/CEOStrategyPlan.model.js";
import RecruiterSimulator from "../models/RecruiterSimulator.model.js";
import ActivityLog from "../models/ActivityLog.model.js";
import Notification from "../models/Notification.model.js";
import ResumeVersionCounter from "../models/ResumeVersionCounter.model.js";
import CareerDNA from "../models/CareerDNA.model.js";
import { deleteFromCloudinary } from "../services/storage/cloudinary.service.js";
import { passwordSchema } from "../validators/auth.validator.js";
import { clearAuthCookies } from "../utils/cookie.util.js";

/**
 * Get full User Settings, Account Statistics & Profile Metadata
 * GET /api/v1/settings
 */
export const getUserSettings = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  let userObj = await User.findById(userId).select("-password -refreshToken");
  if (!userObj) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "User account not found");
  }

  let settings = await Settings.findOne({ user: userId });
  if (!settings) {
    settings = await Settings.create({ user: userId });
  }

  // Aggregate user statistics
  const [
    resumesCount,
    atsCount,
    jobMatchesCount,
    interviewsCount,
    roadmapsCount,
    latestAts,
    latestJobMatch,
    latestInterview,
  ] = await Promise.all([
    Resume.countDocuments({ user: userId }),
    ATSAnalysis.countDocuments({ user: userId }),
    JobMatch.countDocuments({ user: userId }),
    Interview.countDocuments({ user: userId }),
    Roadmap.countDocuments({ user: userId }),
    ATSAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }),
    JobMatch.findOne({ user: userId }).sort({ createdAt: -1 }),
    Interview.findOne({ user: userId, status: "completed" }).sort({ createdAt: -1 }),
  ]);

  const payload = {
    user: {
      id: userObj._id,
      name: userObj.name,
      email: userObj.email,
      role: userObj.role,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt,
      lastLogin: userObj.updatedAt,
    },
    settings,
    stats: {
      resumesCount,
      atsCount,
      jobMatchesCount,
      interviewsCount,
      roadmapsCount,
    },
    latestScores: {
      atsScore: latestAts?.atsScore || 0,
      jobMatchScore: latestJobMatch?.matchScore || 0,
      interviewScore: latestInterview?.score || 0,
    },
  };

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, payload, "User settings retrieved successfully")
  );
});

/**
 * Update User Settings, Career Preferences, AI Personalization & Profile Info
 * PUT /api/v1/settings
 */
export const updateUserSettings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    name,
    theme,
    accentColor,
    profileDetails,
    careerPreferences,
    aiPersonalization,
    notifications,
  } = req.body;

  // 1. Update user name if provided
  if (name) {
    await User.findByIdAndUpdate(userId, { name: name.trim() });
  }

  // 2. Update Settings
  let settings = await Settings.findOne({ user: userId });
  if (!settings) {
    settings = new Settings({ user: userId });
  }

  if (theme) settings.theme = theme;
  if (accentColor) settings.accentColor = accentColor;

  if (profileDetails) {
    settings.profileDetails = { ...settings.profileDetails, ...profileDetails };
  }

  if (careerPreferences) {
    settings.careerPreferences = { ...settings.careerPreferences, ...careerPreferences };
  }

  if (aiPersonalization) {
    settings.aiPersonalization = { ...settings.aiPersonalization, ...aiPersonalization };
  }

  if (notifications) {
    settings.notifications = { ...settings.notifications, ...notifications };
  }

  await settings.save();

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, settings, "Settings updated successfully")
  );
});

/**
 * Change Password
 * POST /api/v1/settings/change-password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, "Current password and new password are required");
  }

  const validation = passwordSchema.safeParse(newPassword);
  if (!validation.success) {
    throw new ApiError(
      STATUS_CODES.BAD_REQUEST,
      validation.error.errors[0]?.message || "New password is invalid",
      validation.error.errors.map((error) => error.message),
    );
  }
  if (currentPassword === newPassword) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, "New password must be different from the current password");
  }

  const user = await User.findById(userId).select("+password +refreshToken");
  if (!user) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "User not found");
  }

  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, "Invalid current password");
  }

  user.password = validation.data;
  user.refreshToken = undefined;
  await user.save();
  clearAuthCookies(res);

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, null, "Password updated successfully")
  );
});

/**
 * Data Cleanup & Privacy Controls
 * POST /api/v1/settings/data-cleanup
 */
export const deleteUserData = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { target } = req.body; // "resumes" | "ats" | "interviews" | "roadmaps" | "all"

  const deleteResumeHistory = async () => {
    const resumes = await Resume.find({ user: userId }).select("cloudinaryPublicId").lean();
    await Promise.allSettled(
      resumes
        .map((resume) => resume.cloudinaryPublicId)
        .filter(Boolean)
        .map((publicId) => deleteFromCloudinary(publicId)),
    );
    await Promise.all([
      Resume.deleteMany({ user: userId }),
      ATSAnalysis.deleteMany({ user: userId }),
      JobMatch.deleteMany({ user: userId }),
      RecruiterSimulator.deleteMany({ user: userId }),
      ResumeVersionCounter.deleteMany({ user: userId }),
    ]);
    await Interview.updateMany({ user: userId }, { $set: { resume: null } });
  };

  if (target === "resumes") {
    await deleteResumeHistory();
  } else if (target === "ats") {
    await ATSAnalysis.deleteMany({ user: userId });
  } else if (target === "interviews") {
    await Interview.deleteMany({ user: userId });
  } else if (target === "roadmaps") {
    await Roadmap.deleteMany({ user: userId });
  } else if (target === "all") {
    await deleteResumeHistory();
    await Promise.all([
      Interview.deleteMany({ user: userId }),
      Roadmap.deleteMany({ user: userId }),
      OpportunityRadarScan.deleteMany({ user: userId }),
      CEOStrategyPlan.deleteMany({ user: userId }),
      ActivityLog.deleteMany({ user: userId }),
      Notification.deleteMany({ user: userId }),
    ]);
  } else {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid deletion target specified");
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, null, `Data cleanup for target '${target}' completed successfully`)
  );
});

/**
 * Export User Data
 * GET /api/v1/settings/export
 */
export const exportUserData = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [
    userObj,
    settings,
    resumes,
    atsAnalyses,
    jobMatches,
    interviews,
    roadmap,
    opportunityRadarScans,
    ceoStrategyPlans,
  ] = await Promise.all([
    User.findById(userId).select("-password -refreshToken"),
    Settings.findOne({ user: userId }),
    Resume.find({ user: userId }),
    ATSAnalysis.find({ user: userId }),
    JobMatch.find({ user: userId }),
    Interview.find({ user: userId }),
    Roadmap.findOne({ user: userId }),
    OpportunityRadarScan.find({ user: userId }).sort({ generatedAt: -1 }),
    CEOStrategyPlan.find({ user: userId }).sort({ generatedAt: -1 }),
  ]);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    user: userObj,
    settings,
    resumes,
    atsAnalyses,
    jobMatches,
    interviews,
    roadmap,
    opportunityRadarScans,
    ceoStrategyPlans,
  };

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, exportPayload, "User data compiled for export successfully")
  );
});

export default {
  getUserSettings,
  updateUserSettings,
  changePassword,
  deleteUserData,
  exportUserData,
};
