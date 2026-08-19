import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.middleware.js";
import STATUS_CODES from "./constants/statusCodes.js";

const app = express();

// 1. Helmet security headers
app.use(helmet());

// 2. CORS configuration restricted to FRONTEND_URL
const frontendOrigins = String(process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);
app.use(
  cors({
    origin: frontendOrigins,
    credentials: true,
  })
);

// 3. Body parsers with 16kb restrictions
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// 4. Cookie parser
app.use(cookieParser());

// 5. Morgan logger in development mode
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

import rateLimit from "express-rate-limit";

// Rate limiting middleware (1000 requests per 15 minutes in dev, 100 in prod)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

// 6. Base Root Verification Route
app.get("/", (req, res) => {
  res.status(STATUS_CODES.OK).json({
    message: "Hello PathForge AI",
  });
});

// Apply rate limiter to all API endpoints
app.use("/api/v1", limiter);

import authRouter from "./routes/auth.routes.js";
import careerRouter from "./routes/career.routes.js";
import resumeRouter from "./routes/resume.routes.js";
import atsRouter from "./routes/ats.routes.js";
import jobMatchRouter from "./routes/jobMatch.routes.js";
import roadmapRouter from "./routes/roadmap.routes.js";
import mentorRouter from "./routes/mentor.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import recruiterRouter from "./routes/recruiter.routes.js";
import evolutionRouter from "./routes/evolution.routes.js";
import opportunityRadarRouter from "./routes/opportunityRadar.routes.js";
import ceoModeRouter from "./routes/ceoMode.routes.js";
import settingsRouter from "./routes/settings.routes.js";

// 7. Root router placeholder for API routes
const apiRouter = express.Router();
apiRouter.get("/", (req, res) => {
  res.status(STATUS_CODES.OK).json({
    message: "Hello PathForge AI API",
    status: "OK",
  });
});
apiRouter.use("/auth", authRouter);
apiRouter.use("/career-dna", careerRouter);
apiRouter.use("/resumes", resumeRouter);
apiRouter.use("/ats", atsRouter);
apiRouter.use("/job-match", jobMatchRouter);
apiRouter.use("/roadmap", roadmapRouter);
apiRouter.use("/mentor/session", mentorRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/recruiter", recruiterRouter);
apiRouter.use("/resume-evolution", evolutionRouter);
apiRouter.use("/opportunity-radar", opportunityRadarRouter);
apiRouter.use("/ceo-mode", ceoModeRouter);
apiRouter.use("/settings", settingsRouter);
app.use("/api/v1", apiRouter);

// 8. Fallback for route not found
app.use("*", (req, res, next) => {
  res.status(STATUS_CODES.NOT_FOUND).json({
    success: false,
    message: "API endpoint not found",
  });
});

// 9. Global Error Middleware registered LAST
app.use(errorMiddleware);

export { app };
export default app;
