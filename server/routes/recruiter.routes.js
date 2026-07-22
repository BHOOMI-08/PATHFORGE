import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  simulateRecruiterScreening,
  getRecruiterSimulations,
  getRecruiterSimulationById,
  deleteRecruiterSimulation,
} from "../controllers/recruiter.controller.js";

const router = Router();

// Require authentication for all Recruiter Simulator endpoints
router.use(authMiddleware);

router.post("/simulate", simulateRecruiterScreening);
router.get("/", getRecruiterSimulations);
router.get("/:id", getRecruiterSimulationById);
router.delete("/:id", deleteRecruiterSimulation);

export default router;
