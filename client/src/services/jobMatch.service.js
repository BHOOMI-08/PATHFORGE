import { api } from "../utils/api";

export const jobMatchService = {
  /**
   * Evaluate a Job Description against user's resume
   * @param {object} payload - { resumeId, jobTitle, companyName, jobDescription }
   * @returns {Promise<object>} Match analysis record
   */
  async createJobMatch(payload) {
    const response = await api.post("/job-match", payload);
    return response.data;
  },

  /**
   * Fetch all past job match evaluations
   * @returns {Promise<object>} List of job match records
   */
  async getJobMatches() {
    const response = await api.get("/job-match");
    return response.data;
  },

  /**
   * Fetch a specific job match record by ID
   * @param {string} id 
   * @returns {Promise<object>} Job match record
   */
  async getJobMatchById(id) {
    const response = await api.get(`/job-match/${id}`);
    return response.data;
  },

  /**
   * Delete a job match evaluation record
   * @param {string} id 
   * @returns {Promise<object>} Delete confirmation
   */
  async deleteJobMatch(id) {
    const response = await api.delete(`/job-match/${id}`);
    return response.data;
  },
};

export default jobMatchService;
