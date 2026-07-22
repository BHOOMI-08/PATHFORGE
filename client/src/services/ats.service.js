import { api } from "../utils/api";

export const atsService = {
  /**
   * Trigger ATS evaluation for a specific resume (or latest user resume if resumeId is omitted)
   * @param {string} [resumeId] 
   * @returns {Promise<object>} ATS analysis response
   */
  async analyzeResume(resumeId) {
    const url = resumeId ? `/ats/analyze/${resumeId}` : "/ats/analyze";
    const response = await api.post(url);
    return response.data;
  },

  /**
   * Fetch the most recent ATS analysis record for the logged-in user
   * @returns {Promise<object>} Latest ATS analysis
   */
  async getLatestATSAnalysis() {
    const response = await api.get("/ats/latest");
    return response.data;
  },

  /**
   * Fetch a specific ATS analysis record by ID
   * @param {string} id 
   * @returns {Promise<object>} ATS analysis record
   */
  async getATSAnalysisById(id) {
    const response = await api.get(`/ats/${id}`);
    return response.data;
  },
};

export default atsService;
