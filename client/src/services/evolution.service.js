import { api } from "../utils/api";

export const evolutionService = {
  /**
   * Fetch aggregated resume evolution timeline and growth metrics
   * @returns {Promise<object>} Evolution payload
   */
  async getResumeEvolution() {
    const response = await api.get("/resume-evolution");
    return response.data;
  },
};

export default evolutionService;
