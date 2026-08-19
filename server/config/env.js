const PLACEHOLDER_PATTERN = /^(?:your[_-]|replace[_-]?me|change[_-]?me|example|x{3,})/i;

const isMissingOrPlaceholder = (name) => {
  const value = String(process.env[name] || "").trim();
  return !value || PLACEHOLDER_PATTERN.test(value);
};

export const validateEnvironment = () => {
  const errors = [];
  if (!process.env.MONGO_URI || !/^mongodb(?:\+srv)?:\/\//.test(process.env.MONGO_URI)) {
    errors.push("MONGO_URI must be a valid MongoDB connection URI");
  }

  const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!accessSecret) errors.push("JWT_ACCESS_SECRET is required");
  if (!refreshSecret) errors.push("JWT_REFRESH_SECRET is required");

  if (process.env.NODE_ENV === "production") {
    const productionVariables = [
      "FRONTEND_URL",
      "JWT_ACCESS_SECRET",
      "JWT_REFRESH_SECRET",
      "GEMINI_API_KEY",
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ];
    productionVariables.forEach((name) => {
      if (isMissingOrPlaceholder(name)) errors.push(`${name} must be configured for production`);
    });
    if (String(accessSecret || "").length < 32) {
      errors.push("JWT_ACCESS_SECRET must contain at least 32 characters");
    }
    if (String(refreshSecret || "").length < 32) {
      errors.push("JWT_REFRESH_SECRET must contain at least 32 characters");
    }
    if (accessSecret && refreshSecret && accessSecret === refreshSecret) {
      errors.push("JWT access and refresh secrets must be different");
    }
  }

  const frontendUrls = String(process.env.FRONTEND_URL || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (frontendUrls.some((value) => {
    try {
      return !["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return true;
    }
  })) {
    errors.push("FRONTEND_URL must contain valid comma-separated HTTP(S) origins");
  }
  if (
    process.env.NODE_ENV === "production" &&
    frontendUrls.some((value) => /localhost|127\.0\.0\.1|\[::1\]/i.test(value))
  ) {
    errors.push("FRONTEND_URL cannot use a local origin in production");
  }

  if (errors.length) {
    throw new Error(`Environment validation failed:\n- ${errors.join("\n- ")}`);
  }
};

export default validateEnvironment;
