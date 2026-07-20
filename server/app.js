import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.middleware.js";
import STATUS_CODES from "./constants/statusCodes.js";

const app = express();

// Load environmental parameters (if server.js hasn't loaded them yet)
// in production app.js doesn't run config, but we make it safe
import dotenv from "dotenv";
dotenv.config();

// 1. Helmet security headers
app.use(helmet());

// 2. CORS configuration restricted to FRONTEND_URL
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
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

// 6. Base Root Verification Route
app.get("/", (req, res) => {
  res.status(STATUS_CODES.OK).json({
    message: "Hello PathForge AI",
    status: "OK",
  });
});

// 7. Root router placeholder for future API routes
const apiRouter = express.Router();
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
