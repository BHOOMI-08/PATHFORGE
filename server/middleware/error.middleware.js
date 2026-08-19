import ApiError from "../utils/ApiError.js";
import STATUS_CODES from "../constants/statusCodes.js";
import API_MESSAGES from "../constants/apiMessages.js";
import multer from "multer";

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  if (error instanceof multer.MulterError) {
    const isTooLarge = error.code === "LIMIT_FILE_SIZE";
    error = new ApiError(
      isTooLarge ? 413 : STATUS_CODES.BAD_REQUEST,
      isTooLarge ? "Resume PDF cannot exceed 10MB" : "Invalid resume upload",
      [error.message],
    );
  }

  if (error?.name === "CastError") {
    error = new ApiError(STATUS_CODES.BAD_REQUEST, "A request identifier or value is invalid");
  } else if (error?.name === "ValidationError") {
    const errors = Object.values(error.errors || {}).map((item) => item.message);
    error = new ApiError(
      STATUS_CODES.BAD_REQUEST,
      errors[0] || "Request validation failed",
      errors,
    );
  } else if (error?.code === 11000) {
    error = new ApiError(STATUS_CODES.CONFLICT, "A record with those unique fields already exists");
  } else if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    error = new ApiError(STATUS_CODES.BAD_REQUEST, "Request body contains invalid JSON");
  }

  // Convert non-custom errors to ApiError instances
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || STATUS_CODES.INTERNAL_SERVER_ERROR;
    const message = error.message || API_MESSAGES.server.ERROR;
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Standardized JSON response envelope
  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
    // Show stack traces ONLY in development mode
    ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {}),
  };

  // Log detailed error stack in development console
  if (process.env.NODE_ENV !== "production") {
    console.error(`\n[API Error Trace]: ${error.message}\n`, error.stack);
  }

  // Prevent crashing by returning standard response safely
  return res.status(error.statusCode).json(response);
};

export default errorMiddleware;
