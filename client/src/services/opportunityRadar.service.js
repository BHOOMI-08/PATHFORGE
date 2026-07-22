import { api } from "../utils/api";

export const opportunityRadarService = {
  /**
   * Fetch AI Opportunity Radar career recommendations and role readiness tiers
   * @returns {Promise<object>} Radar payload
   */
  async getOpportunityRadar() {
    const response = await api.get("/opportunity-radar");
    return response.data;
  },

  /**
   * Force regenerate Opportunity Radar profile
   * @returns {Promise<object>} Fresh Radar payload
   */
  async generateOpportunityRadar() {
    const response = await api.post("/opportunity-radar/generate");
    return response.data;
  },
};

export default opportunityRadarService;
