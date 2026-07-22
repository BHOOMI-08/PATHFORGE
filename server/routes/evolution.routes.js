import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getResumeEvolution } from "../controllers/evolution.controller.js";

const router = Router();

// Require authentication for all Resume Evolution endpoints
router.use(authMiddleware);

router.get("/", getResumeEvolution);

export default router;
