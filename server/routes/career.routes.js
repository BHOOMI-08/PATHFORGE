import { Router } from "express";
import { getCareerDNA, upsertCareerDNA } from "../controllers/career.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Protect all career DNA routes
router.use(authMiddleware);

router.get("/", getCareerDNA);
router.put("/", upsertCareerDNA);
router.post("/", upsertCareerDNA);

export default router;
