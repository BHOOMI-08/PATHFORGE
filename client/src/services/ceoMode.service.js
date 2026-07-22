import { api } from "../utils/api";

export const ceoModeService = {
  /**
   * Fetch AI CEO Mode executive roadmap
   * @returns {Promise<object>} CEO Mode payload
   */
  async getCEORoadmap() {
    const response = await api.get("/ceo-mode");
    return response.data;
  },

  /**
   * Generate AI CEO Mode strategic plan for target role
   * @param {object} payload - { targetRole }
   * @returns {Promise<object>} CEO Mode payload
   */
  async generateCEORoadmap(payload) {
    const response = await api.post("/ceo-mode/generate", payload);
    return response.data;
  },
};

export default ceoModeService;
