import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getUserSettings,
  updateUserSettings,
  changePassword,
  deleteUserData,
  exportUserData,
} from "../controllers/settings.controller.js";

const router = Router();

// Require authentication for all Settings endpoints
router.use(authMiddleware);

router.get("/", getUserSettings);
router.put("/", updateUserSettings);
router.post("/change-password", changePassword);
router.post("/data-cleanup", deleteUserData);
router.get("/export", exportUserData);

export default router;
