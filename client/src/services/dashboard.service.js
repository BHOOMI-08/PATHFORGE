import { api } from "../utils/api";

export const dashboardService = {
  /**
   * Fetch aggregated workspace statistics and analytics telemetry
   * @returns {Promise<object>} Dashboard stats
   */
  async getDashboardStats() {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },

  /**
   * Fetch user notifications
   * @returns {Promise<object>} Notifications list
   */
  async getNotifications() {
    const response = await api.get("/dashboard/notifications");
    return response.data;
  },

  /**
   * Mark notification as read
   * @param {string} id 
   * @returns {Promise<object>} Response
   */
  async markNotificationRead(id) {
    const response = await api.patch(`/dashboard/notifications/${id}/read`);
    return response.data;
  },
};

export default dashboardService;
