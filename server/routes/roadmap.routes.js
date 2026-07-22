import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  generateRoadmap,
  getUserRoadmap,
  toggleTaskStatus,
  deleteRoadmap,
} from "../controllers/roadmap.controller.js";

const router = Router();

// Require authentication for all Roadmap endpoints
router.use(authMiddleware);

router.post("/generate", generateRoadmap);
router.get("/", getUserRoadmap);
router.patch("/task/:taskId", toggleTaskStatus);
router.delete("/", deleteRoadmap);

export default router;
