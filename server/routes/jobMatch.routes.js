import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createJobMatch,
  getJobMatches,
  getJobMatchById,
  deleteJobMatch,
} from "../controllers/jobMatch.controller.js";

const router = Router();

// Require authentication for all Job Match endpoints
router.use(authMiddleware);

router.post("/", createJobMatch);
router.get("/", getJobMatches);
router.get("/:id", getJobMatchById);
router.delete("/:id", deleteJobMatch);

export default router;
