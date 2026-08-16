import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  simulateRecruiterScreening,
  getRecruiterSimulations,
  getRecruiterSimulationById,
  deleteRecruiterSimulation,
} from "../controllers/recruiter.controller.js";

const router = Router();
const simulationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 10 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many recruiter simulations. Please try again later.",
  },
});

// Require authentication for all Recruiter Simulator endpoints
router.use(authMiddleware);

router.post("/simulate", simulationLimiter, simulateRecruiterScreening);
router.get("/", getRecruiterSimulations);
router.get("/:id", getRecruiterSimulationById);
router.delete("/:id", deleteRecruiterSimulation);

export default router;
