/**
 * Helper options matching secure cookie specifications
 */
const getCookieOptions = (maxAge) => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    // The production frontend and API are hosted on different sites
    // (Vercel -> Railway), so cross-site credentialed fetches require None.
    sameSite: isProduction ? "none" : "strict",
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
};

/**
 * Set Access Token cookie on the response object
 * @param {Object} res - Express response object
 * @param {string} token - Signed Access Token
 */
export const setAccessCookie = (res, token) => {
  const maxAge = 15 * 60 * 1000; // 15 minutes in milliseconds
  res.cookie("accessToken", token, getCookieOptions(maxAge));
};

/**
 * Set Refresh Token cookie on the response object
 * @param {Object} res - Express response object
 * @param {string} token - Signed Refresh Token
 */
export const setRefreshCookie = (res, token) => {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  res.cookie("refreshToken", token, getCookieOptions(maxAge));
};

/**
 * Clear both auth cookies
 * @param {Object} res - Express response object
 */
export const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", getCookieOptions());
  res.clearCookie("refreshToken", getCookieOptions());
};

export default {
  setAccessCookie,
  setRefreshCookie,
  clearAuthCookies,
};
