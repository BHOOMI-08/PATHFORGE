import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { generateCEORoadmap, getCEORoadmap } from "../controllers/ceoMode.controller.js";

const router = Router();

// Require authentication for all AI CEO Mode endpoints
router.use(authMiddleware);

router.get("/", getCEORoadmap);
router.post("/generate", generateCEORoadmap);

export default router;
