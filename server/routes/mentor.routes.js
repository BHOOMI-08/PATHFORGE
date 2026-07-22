import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  startInterviewSession,
  sendMessage,
  finishInterviewSession,
  getInterviewSession,
  getInterviewHistory,
} from "../controllers/mentor.controller.js";

const router = Router();

// Require authentication for all Mentor endpoints
router.use(authMiddleware);

router.post("/start", startInterviewSession);
router.post("/:sessionId/message", sendMessage);
router.post("/:sessionId/finish", finishInterviewSession);
router.get("/:sessionId", getInterviewSession);
router.get("/", getInterviewHistory);

export default router;
