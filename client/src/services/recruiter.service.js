import { api } from "../utils/api";

export const recruiterService = {
  /**
   * Run AI Recruiter Screening simulation against target company criteria
   * @param {object} payload - { resumeId, company, targetRole }
   * @returns {Promise<object>} Recruiter evaluation record
   */
  async simulateRecruiter(payload) {
    const response = await api.post("/recruiter/simulate", payload);
    return response.data;
  },

  /**
   * Fetch past recruiter simulation history
   * @returns {Promise<object>} List of simulations
   */
  async getRecruiterSimulations() {
    const response = await api.get("/recruiter");
    return response.data;
  },

  /**
   * Fetch specific simulation details
   * @param {string} id 
   * @returns {Promise<object>} Simulation record
   */
  async getRecruiterSimulationById(id) {
    const response = await api.get(`/recruiter/${id}`);
    return response.data;
  },

  /**
   * Delete a recruiter simulation record
   * @param {string} id 
   * @returns {Promise<object>} Response
   */
  async deleteRecruiterSimulation(id) {
    const response = await api.delete(`/recruiter/${id}`);
    return response.data;
  },
};

export default recruiterService;
