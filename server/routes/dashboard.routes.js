import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getDashboardStats,
  getNotifications,
  markNotificationRead,
} from "../controllers/dashboard.controller.js";

const router = Router();

// Require authentication for all Dashboard endpoints
router.use(authMiddleware);

router.get("/stats", getDashboardStats);
router.get("/notifications", getNotifications);
router.patch("/notifications/:id/read", markNotificationRead);

export default router;
