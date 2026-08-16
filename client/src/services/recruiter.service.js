import { api } from "../utils/api";

const getResponseData = (response) => {
  if (!response || typeof response !== "object" || !Object.prototype.hasOwnProperty.call(response, "data")) {
    throw new Error("The server returned an invalid recruiter response.");
  }
  return response.data;
};

export const recruiterService = {
  /**
   * Run AI Recruiter Screening simulation against target company criteria
   * @param {object} payload - { company, targetRole }
   * @param {object} options - optional Fetch options such as AbortSignal
   * @returns {Promise<object>} Recruiter evaluation record
   */
  async simulateRecruiter(payload, options = {}) {
    const response = await api.post("/recruiter/simulate", payload, { timeout: 75000, ...options });
    return getResponseData(response);
  },

  /**
   * Fetch past recruiter simulation history
   * @returns {Promise<object>} List of simulations
   */
  async getRecruiterSimulations() {
    const response = await api.get("/recruiter");
    return getResponseData(response) || [];
  },

  /**
   * Fetch specific simulation details
   * @param {string} id 
   * @returns {Promise<object>} Simulation record
   */
  async getRecruiterSimulationById(id) {
    const response = await api.get(`/recruiter/${id}`);
    return getResponseData(response);
  },

  /**
   * Delete a recruiter simulation record
   * @param {string} id 
   * @returns {Promise<object>} Response
   */
  async deleteRecruiterSimulation(id) {
    const response = await api.delete(`/recruiter/${id}`);
    return getResponseData(response);
  },
};

export default recruiterService;
