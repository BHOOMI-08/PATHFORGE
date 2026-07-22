import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  analyzeResume,
  getLatestATSAnalysis,
  getATSAnalysisById,
} from "../controllers/ats.controller.js";

const router = Router();

// Require authentication for all ATS endpoints
router.use(authMiddleware);

router.post("/analyze/:resumeId?", analyzeResume);
router.get("/latest", getLatestATSAnalysis);
router.get("/:id", getATSAnalysisById);

export default router;
