import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import STATUS_CODES from "../constants/statusCodes.js";
import Resume from "../models/Resume.model.js";
import ATSAnalysis from "../models/ATSAnalysis.model.js";
import JobMatch from "../models/JobMatch.model.js";
import Roadmap from "../models/Roadmap.model.js";
import Interview from "../models/Interview.model.js";
import CareerDNA from "../models/CareerDNA.model.js";
import ActivityLog from "../models/ActivityLog.model.js";
import Notification from "../models/Notification.model.js";

/**
 * Get aggregated analytics, telemetry metrics, and activity logs
 * GET /api/v1/dashboard/stats
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [
    resumesCount,
    latestAts,
    atsHistory,
    jobMatchesCount,
    latestMatch,
    interviewsCount,
    latestInterview,
    activeRoadmap,
    careerDna,
    activityLogs,
    unreadNotifications,
  ] = await Promise.all([
    Resume.countDocuments({ user: userId }),
    ATSAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }),
    ATSAnalysis.find({ user: userId }).sort({ createdAt: 1 }).limit(10),
    JobMatch.countDocuments({ user: userId }),
    JobMatch.findOne({ user: userId }).sort({ createdAt: -1 }),
    Interview.countDocuments({ user: userId, status: "completed" }),
    Interview.findOne({ user: userId, status: "completed" }).sort({ createdAt: -1 }),
    Roadmap.findOne({ user: userId }),
    CareerDNA.findOne({ user: userId }),
    ActivityLog.find({ user: userId }).sort({ createdAt: -1 }).limit(15),
    Notification.find({ user: userId, read: false }).sort({ createdAt: -1 }),
  ]);

  const latestAtsScore = latestAts?.atsScore || 70;
  const roadmapProgress = activeRoadmap?.overallProgress || 0;
  const latestInterviewScore = latestInterview?.score || 75;
  const hasCareerDna = !!careerDna;

  // Calculate weighted Career Readiness Index %
  const careerReadinessIndex = Math.min(
    100,
    Math.round(
      latestAtsScore * 0.35 +
        roadmapProgress * 0.25 +
        latestInterviewScore * 0.25 +
        (hasCareerDna ? 15 : 0)
    )
  );

  // ATS Trend data for Line Chart
  const atsTrendData = atsHistory.map((item, idx) => ({
    date: new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }),
    score: item.atsScore,
    attempt: `Audit #${idx + 1}`,
  }));

  if (atsTrendData.length === 0) {
    atsTrendData.push({ date: "Initial", score: latestAtsScore, attempt: "Audit #1" });
  }

  // Skill Parameter dimensions for Radar Chart
  const skillDimensions = [
    { subject: "Technical Stack", A: latestAts?.breakdown?.keywordScore || 75, fullMark: 100 },
    { subject: "Formatting", A: latestAts?.breakdown?.formattingScore || 80, fullMark: 100 },
    { subject: "Impact Verbs", A: latestAts?.breakdown?.impactScore || 70, fullMark: 100 },
    { subject: "Experience", A: latestMatch?.matchBreakdown?.experienceMatch || 75, fullMark: 100 },
    { subject: "Education", A: latestMatch?.matchBreakdown?.educationMatch || 85, fullMark: 100 },
  ];

  // Activity Log Fallback if empty
  let formattedActivity = activityLogs.map((log) => ({
    id: log._id,
    action: log.action,
    description: log.description,
    timestamp: log.createdAt,
  }));

  if (formattedActivity.length === 0) {
    formattedActivity = [
      {
        id: "log-1",
        action: "ACCOUNT_CREATED",
        description: "Authenticated workspace initialized successfully",
        timestamp: req.user.createdAt || new Date(),
      },
    ];
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, {
      careerReadinessIndex,
      counts: {
        resumes: resumesCount,
        jobMatches: jobMatchesCount,
        completedInterviews: interviewsCount,
      },
      latestScores: {
        atsScore: latestAtsScore,
        jobMatchScore: latestMatch?.matchScore || 0,
        interviewScore: latestInterviewScore,
        roadmapProgress,
      },
      charts: {
        atsTrend: atsTrendData,
        skillDimensions,
      },
      activityLogs: formattedActivity,
      notifications: unreadNotifications,
    }, "Analytics statistics compiled successfully")
  );
});

/**
 * Get user notifications
 * GET /api/v1/dashboard/notifications
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, notifications, "Notifications retrieved successfully")
  );
});

/**
 * Mark notification as read
 * PATCH /api/v1/dashboard/notifications/:id/read
 */
export const markNotificationRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { read: true },
    { new: true }
  );

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, notification, "Notification marked as read")
  );
});

export default {
  getDashboardStats,
  getNotifications,
  markNotificationRead,
};
