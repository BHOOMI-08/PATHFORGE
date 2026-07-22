import { api } from "../utils/api";

export const settingsService = {
  /**
   * Fetch user settings, profile info, and account statistics
   * @returns {Promise<object>} User settings payload
   */
  async getUserSettings() {
    const response = await api.get("/settings");
    return response.data || response;
  },

  /**
   * Update settings, career preferences, AI personalization, and profile details
   * @param {object} payload 
   * @returns {Promise<object>} Updated settings payload
   */
  async updateUserSettings(payload) {
    const response = await api.put("/settings", payload);
    return response.data || response;
  },

  /**
   * Change user password
   * @param {object} payload - { currentPassword, newPassword }
   * @returns {Promise<object>} Response
   */
  async changePassword(payload) {
    const response = await api.post("/settings/change-password", payload);
    return response.data || response;
  },

  /**
   * Delete specific history or entire account
   * @param {object} payload - { target: "resumes" | "ats" | "interviews" | "roadmaps" | "all" }
   * @returns {Promise<object>} Response
   */
  async deleteUserData(payload) {
    const response = await api.post("/settings/data-cleanup", payload);
    return response.data || response;
  },

  /**
   * Download / Export full user history JSON
   * @returns {Promise<object>} Export JSON
   */
  async exportUserData() {
    const response = await api.get("/settings/export");
    return response.data || response;
  },
};

export default settingsService;
