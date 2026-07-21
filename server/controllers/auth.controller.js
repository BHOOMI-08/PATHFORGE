import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../services/auth.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import STATUS_CODES from "../constants/statusCodes.js";
import API_MESSAGES from "../constants/apiMessages.js";
import { setAccessCookie, setRefreshCookie, clearAuthCookies } from "../utils/cookie.util.js";
import { verifyAccessToken, verifyRefreshToken } from "../utils/token.util.js";

/**
 * Controller to handle user registration
 * @route POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await registerUser({ name, email, password });

  return res
    .status(STATUS_CODES.CREATED)
    .json(
      new ApiResponse(
        STATUS_CODES.CREATED,
        { user },
        API_MESSAGES.auth.REGISTER_SUCCESS
      )
    );
});

/**
 * Controller to handle user login and assign secure HTTP-only cookies
 * @route POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUser({ email, password });

  // Assign JWTs via secure cookies
  setAccessCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);

  return res
    .status(STATUS_CODES.OK)
    .json(
      new ApiResponse(
        STATUS_CODES.OK,
        { user },
        API_MESSAGES.auth.LOGIN_SUCCESS
      )
    );
});

/**
 * Controller to handle user logout and clear secure cookies
 * @route POST /api/v1/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  let userId = req.user?._id || req.user?.id;

  if (!userId) {
    try {
      const accessToken = req.cookies?.accessToken;
      if (accessToken) {
        const decodedAcc = verifyAccessToken(accessToken);
        if (decodedAcc) userId = decodedAcc.id;
      }
    } catch (error) {}
  }

  if (!userId) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        const decodedRef = verifyRefreshToken(refreshToken);
        if (decodedRef) userId = decodedRef.id;
      }
    } catch (error) {}
  }

  // Revoke session on backend DB
  if (userId) {
    await logoutUser(userId);
  }

  // Clear HTTP-only cookies
  clearAuthCookies(res);

  return res
    .status(STATUS_CODES.OK)
    .json(
      new ApiResponse(
        STATUS_CODES.OK,
        null,
        API_MESSAGES.auth.LOGOUT_SUCCESS
      )
    );
});

/**
 * Controller to handle access token silent refreshment
 * @route POST /api/v1/auth/refresh
 */
export const refresh = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  const { user, accessToken, refreshToken } = await refreshAccessToken(incomingRefreshToken);

  // Set new rotated token cookies
  setAccessCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);

  return res
    .status(STATUS_CODES.OK)
    .json(
      new ApiResponse(
        STATUS_CODES.OK,
        { user },
        "Tokens refreshed successfully"
      )
    );
});

/**
 * Controller to retrieve authenticated user information
 * @route GET /api/v1/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  // Attached to request by authMiddleware
  const user = req.user;

  return res
    .status(STATUS_CODES.OK)
    .json(
      new ApiResponse(
        STATUS_CODES.OK,
        { user },
        "Current user fetched successfully"
      )
    );
});

export default {
  register,
  login,
  logout,
  refresh,
  getMe,
};
