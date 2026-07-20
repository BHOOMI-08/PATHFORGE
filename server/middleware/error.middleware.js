import ApiError from "../utils/ApiError.js";
import STATUS_CODES from "../constants/statusCodes.js";
import API_MESSAGES from "../constants/apiMessages.js";

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // Convert non-custom errors to ApiError instances
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
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
