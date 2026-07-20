export const API_MESSAGES = Object.freeze({
  auth: {
    SUCCESS: "Authentication successful",
    REGISTER_SUCCESS: "User registered successfully",
    LOGIN_SUCCESS: "User logged in successfully",
    LOGOUT_SUCCESS: "User logged out successfully",
    UNAUTHORIZED: "Unauthorized access: Token missing or invalid",
    FORBIDDEN: "Forbidden access: Insufficient privileges",
    INVALID_CREDENTIALS: "Invalid email or password",
    EXISTS: "User with this email already exists",
  },
  success: {
    DEFAULT: "Request completed successfully",
    UPDATE: "Resource updated successfully",
    DELETE: "Resource deleted successfully",
  },
  validation: {
    DEFAULT: "Validation failed for request parameters",
    EMAIL_REQUIRED: "Email is required",
    PASSWORD_REQUIRED: "Password is required",
  },
  resume: {
    UPLOAD_SUCCESS: "Resume uploaded successfully",
    PARSE_SUCCESS: "Resume parsed successfully",
    NOT_FOUND: "Resume not found",
  },
  career: {
    SAVE_SUCCESS: "Career profile saved successfully",
    NOT_FOUND: "Career profile not found",
  },
  job: {
    MATCH_SUCCESS: "Job match analysis complete",
    NOT_FOUND: "Job description or comparison not found",
  },
  interview: {
    INIT_SUCCESS: "Mock interview session initialized",
    SESSION_NOT_FOUND: "Interview session not found",
  },
  server: {
    ERROR: "Internal Server Error",
  },
  general: {
    NOT_FOUND: "Resource not found",
    BAD_REQUEST: "Invalid request parameters",
  }
});

export default API_MESSAGES;
