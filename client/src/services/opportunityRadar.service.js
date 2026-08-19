import { api } from "../utils/api";

export const opportunityRadarService = {
  /**
   * Fetch AI Opportunity Radar career recommendations and role readiness tiers
   * @returns {Promise<object>} Radar payload
   */
  async getLatest() {
    const response = await api.get("/opportunity-radar");
    return response.data;
  },

  /**
   * Force regenerate Opportunity Radar profile
   * @returns {Promise<object>} Fresh Radar payload
   */
  async scan(requestId) {
    const response = await api.post(
      "/opportunity-radar/scan",
      { requestId },
      { timeout: 75000 },
    );
    return response.data;
  },
};

export default opportunityRadarService;
