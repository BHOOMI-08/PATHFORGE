import api from "../utils/api.js";

/**
 * Authentication service wrapping API requests
 */
export const register = async (name, email, password) => {
  return await api.post("/auth/register", { name, email, password });
};

export const login = async (email, password) => {
  return await api.post("/auth/login", { email, password });
};

export const logout = async () => {
  return await api.post("/auth/logout");
};

export const refresh = async () => {
  return await api.post("/auth/refresh");
};

export const getCurrentUser = async () => {
  return await api.get("/auth/me");
};

export default {
  register,
  login,
  logout,
  refresh,
  getCurrentUser,
};
