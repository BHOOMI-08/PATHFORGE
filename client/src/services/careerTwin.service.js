import { api } from "../utils/api";

export const careerTwinService = {
  /**
   * Synthesize and retrieve the AI Career Twin digital profile
   * @returns {Promise<object>} Career Twin profile payload
   */
  async getCareerTwin() {
    const response = await api.get("/career-twin");
    return response.data;
  },

  /**
   * Force regenerate Career Twin profile
   * @returns {Promise<object>} Fresh Career Twin profile payload
   */
  async generateCareerTwin() {
    const response = await api.post("/career-twin/generate");
    return response.data;
  },
};

export default careerTwinService;
