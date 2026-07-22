import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getCareerTwin } from "../controllers/careerTwin.controller.js";

const router = Router();

// Require authentication for all Career Twin endpoints
router.use(authMiddleware);

router.get("/", getCareerTwin);
router.post("/generate", getCareerTwin);

export default router;
