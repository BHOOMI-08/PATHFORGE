import { api } from "../utils/api";

export const ceoModeService = {
  /**
   * Fetch AI CEO Mode executive roadmap
   * @returns {Promise<object>} CEO Mode payload
   */
  async getLatest(options = {}) {
    const response = await api.get("/ceo-mode", options);
    return response.data;
  },

  /**
   * Generate AI CEO Mode strategic plan for target role
   * @param {object} payload - { targetGoal, requestId }
   * @returns {Promise<object>} CEO Mode payload
   */
  async generate(payload, options = {}) {
    const response = await api.post("/ceo-mode/generate", payload, { timeout: 75000, ...options });
    return response.data;
  },
};

export default ceoModeService;
