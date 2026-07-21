import ApiError from "../utils/ApiError.js";
import STATUS_CODES from "../constants/statusCodes.js";
import API_MESSAGES from "../constants/apiMessages.js";
import { verifyAccessToken } from "../utils/token.util.js";
import User from "../models/User.model.js";

/**
 * Middleware to verify user access token from cookies
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(
        STATUS_CODES.UNAUTHORIZED,
        API_MESSAGES.auth.UNAUTHORIZED || "Access token is missing"
      );
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      throw new ApiError(
        STATUS_CODES.UNAUTHORIZED,
        "Access token is invalid or expired"
      );
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(
        STATUS_CODES.UNAUTHORIZED,
        "User account has been deleted"
      );
    }

    // Convert mongoose document to plain object and remove sensitive fields
    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;
    delete sanitizedUser.refreshToken;

    req.user = sanitizedUser;
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
