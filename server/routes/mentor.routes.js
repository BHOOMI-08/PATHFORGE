import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  startInterviewSession,
  submitInterviewAnswer,
  finishInterviewSession,
  getActiveInterviewSession,
  getInterviewSession,
  getInterviewHistory,
  deleteInterviewSession,
} from "../controllers/mentor.controller.js";

const router = Router();
router.use(authMiddleware);

router.post("/start", startInterviewSession);
router.get("/active", getActiveInterviewSession);
router.post("/:sessionId/answer", submitInterviewAnswer);
router.post("/:sessionId/finish", finishInterviewSession);
router.get("/:sessionId", getInterviewSession);
router.delete("/:sessionId", deleteInterviewSession);
router.get("/", getInterviewHistory);

export default router;