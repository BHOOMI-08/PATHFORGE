import User from "../models/User.model.js";
import Settings from "../models/Settings.model.js";
import ApiError from "../utils/ApiError.js";
import STATUS_CODES from "../constants/statusCodes.js";
import API_MESSAGES from "../constants/apiMessages.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token.util.js";

/**
 * Register a new user and generate default settings
 * @param {Object} userData - User registration details
 * @returns {Promise<Object>} The sanitized user object
 */
export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(STATUS_CODES.CONFLICT, API_MESSAGES.auth.EXISTS);
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  // Automatically create linked Settings document
  await Settings.create({
    user: user._id,
  });

  // Convert to object and strip sensitive fields
  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;
  delete sanitizedUser.refreshToken;

  return sanitizedUser;
};

/**
 * Log in an existing user, verify credentials, generate tokens, and save refresh token to database
 * @param {Object} credentials - User credentials
 * @returns {Promise<Object>} Object containing sanitized user, accessToken, and refreshToken
 */
export const loginUser = async ({ email, password }) => {
  // Select password explicitly as select: false is set in schema
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, API_MESSAGES.auth.INVALID_CREDENTIALS);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, API_MESSAGES.auth.INVALID_CREDENTIALS);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store active refresh token inside User document
  user.refreshToken = refreshToken;
  await user.save();

  // Convert to object and sanitize
  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;
  delete sanitizedUser.refreshToken;

  return {
    user: sanitizedUser,
    accessToken,
    refreshToken,
  };
};

/**
 * Log out a user by removing their active refresh token from the database
 * @param {string} userId - ID of the user to log out
 * @returns {Promise<boolean>} Success status
 */
export const logoutUser = async (userId) => {
  if (userId) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }
  return true;
};

/**
 * Refresh the access token using a valid refresh token.
 * Incorporates Refresh Token Rotation (RTR) as recommended for production-grade security.
 * @param {string} incomingRefreshToken - Refresh Token from request cookie
 * @returns {Promise<Object>} Mapped user, new accessToken, and new rotated refreshToken
 */
export const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, "Refresh token is missing");
  }

  const decoded = verifyRefreshToken(incomingRefreshToken);
  if (!decoded) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, "Refresh token is invalid or expired");
  }

  // Retrieve user with stored refresh token for comparative verification
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, "User account not found");
  }

  // Compare stored token with incoming token to prevent replay attacks
  if (user.refreshToken !== incomingRefreshToken) {
    // Reject a stale/replayed token without revoking a newer token that may have
    // just been issued by a concurrent refresh request.
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, "Refresh token mismatch or re-used");
  }

  // Generate the replacement pair, then atomically exchange the incoming token.
  // Only one concurrent request can match the stored token and win the rotation.
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  const rotatedUser = await User.findOneAndUpdate(
    { _id: user._id, refreshToken: incomingRefreshToken },
    { $set: { refreshToken: newRefreshToken } },
    { new: true },
  ).select("+refreshToken");

  if (!rotatedUser) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, "Refresh token mismatch or re-used");
  }

  const sanitizedUser = rotatedUser.toObject();
  delete sanitizedUser.password;
  delete sanitizedUser.refreshToken;

  return {
    user: sanitizedUser,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Get details of current authenticated user
 * @param {string} userId - User identifier
 * @returns {Promise<Object>} Sanitized user details
 */
export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "User profile not found");
  }

  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;
  delete sanitizedUser.refreshToken;

  return sanitizedUser;
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
};
