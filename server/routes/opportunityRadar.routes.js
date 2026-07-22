import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getOpportunityRadar } from "../controllers/opportunityRadar.controller.js";

const router = Router();

// Require authentication for all Opportunity Radar endpoints
router.use(authMiddleware);

router.get("/", getOpportunityRadar);
router.post("/generate", getOpportunityRadar);

export default router;
