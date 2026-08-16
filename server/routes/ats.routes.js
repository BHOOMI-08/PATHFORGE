import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { analyzeResume, getLatestATSAnalysis, getATSHistory, getATSAnalysisById } from "../controllers/ats.controller.js";
const router=Router(); router.use(authMiddleware);
router.post("/analyze/:resumeId?",analyzeResume); router.get("/latest",getLatestATSAnalysis); router.get("/history",getATSHistory); router.get("/:id",getATSAnalysisById);
export default router;
