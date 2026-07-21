import { Router } from "express";
import {
  uploadAndParseResume,
  getUserResumes,
  getResumeById,
  deleteResume,
} from "../controllers/resume.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// Protect all resume routes
router.use(authMiddleware);

router.post("/upload", upload.single("resume"), uploadAndParseResume);
router.get("/", getUserResumes);
router.get("/:id", getResumeById);
router.delete("/:id", deleteResume);

export default router;
