import { z } from "zod";
import ApiError from "../utils/ApiError.js";
import STATUS_CODES from "../constants/statusCodes.js";

export const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password cannot exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Invalid email address"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Invalid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

export const validateRegister = (req, res, next) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((err) => err.message);
    return next(
      new ApiError(
        STATUS_CODES.BAD_REQUEST,
        errors[0] || "Validation failed for request parameters",
        errors
      )
    );
  }
  req.body = result.data;
  next();
};

export const validateLogin = (req, res, next) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((err) => err.message);
    return next(
      new ApiError(
        STATUS_CODES.BAD_REQUEST,
        errors[0] || "Validation failed for request parameters",
        errors
      )
    );
  }
  req.body = result.data;
  next();
};
