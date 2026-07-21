import jwt from "jsonwebtoken";

/**
 * Generate Access Token for a user
 * @param {Object} user - User document/object
 * @returns {string} Signed JWT Access Token
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

/**
 * Generate Refresh Token for a user
 * @param {Object} user - User document/object
 * @returns {string} Signed JWT Refresh Token
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};

/**
 * Verify Access Token
 * @param {string} token - Access token
 * @returns {Object|null} Decoded payload or null if invalid
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verify Refresh Token
 * @param {string} token - Refresh token
 * @returns {Object|null} Decoded payload or null if invalid
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
