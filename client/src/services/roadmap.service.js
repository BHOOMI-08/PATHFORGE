import { api } from "../utils/api";

export const roadmapService = {
  /**
   * Generate a new personalized learning roadmap
   * @param {object} payload - { targetRole, durationWeeks }
   * @returns {Promise<object>} Roadmap object
   */
  async generateRoadmap(payload = {}) {
    const response = await api.post("/roadmap/generate", payload);
    return response.data;
  },

  /**
   * Fetch user's active learning roadmap
   * @returns {Promise<object>} Active roadmap
   */
  async getUserRoadmap() {
    const response = await api.get("/roadmap");
    return response.data;
  },

  /**
   * Toggle task completion status
   * @param {string} taskId 
   * @returns {Promise<object>} Updated roadmap
   */
  async toggleTaskStatus(taskId) {
    const response = await api.patch(`/roadmap/task/${taskId}`);
    return response.data;
  },

  /**
   * Delete user roadmap
   * @returns {Promise<object>} Response
   */
  async deleteRoadmap() {
    const response = await api.delete("/roadmap");
    return response.data;
  },
};

export default roadmapService;
