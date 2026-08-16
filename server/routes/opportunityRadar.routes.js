import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getLatestOpportunityRadar,
  scanOpportunityRadar,
} from "../controllers/opportunityRadar.controller.js";

const router = Router();

// Require authentication for all Opportunity Radar endpoints
router.use(authMiddleware);

router.get("/", getLatestOpportunityRadar);
router.post("/scan", scanOpportunityRadar);

export default router;
