import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import STATUS_CODES from "../constants/statusCodes.js";
import Notification from "../models/Notification.model.js";
import { buildAnalyticsDashboard } from "../services/analytics.service.js";

/**
 * Get aggregated analytics, telemetry metrics, and activity logs
 * GET /api/v1/dashboard/stats
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const dashboard = await buildAnalyticsDashboard(req.user._id);

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, dashboard, "Analytics statistics compiled successfully")
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
