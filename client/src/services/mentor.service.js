import { api } from "../utils/api";

export const mentorService = {
  /**
   * Start a new mock interview session
   * @param {object} payload - { targetRole, experienceLevel }
   * @returns {Promise<object>} Initialized session
   */
  async startSession(payload) {
    const response = await api.post("/mentor/session/start", payload);
    return response.data;
  },

  /**
   * Send candidate answer to AI interviewer
   * @param {string} sessionId 
   * @param {string} message 
   * @returns {Promise<object>} Updated session with AI follow-up
   */
  async sendMessage(sessionId, message) {
    const response = await api.post(`/mentor/session/${sessionId}/message`, { message });
    return response.data;
  },

  /**
   * Complete interview session and request AI scorecard evaluation
   * @param {string} sessionId 
   * @returns {Promise<object>} Completed session with score & feedback
   */
  async finishSession(sessionId) {
    const response = await api.post(`/mentor/session/${sessionId}/finish`);
    return response.data;
  },

  /**
   * Fetch specific session details
   * @param {string} sessionId 
   * @returns {Promise<object>} Session record
   */
  async getSession(sessionId) {
    const response = await api.get(`/mentor/session/${sessionId}`);
    return response.data;
  },

  /**
   * Fetch all past interview sessions
   * @returns {Promise<object>} List of sessions
   */
  async getInterviewHistory() {
    const response = await api.get("/mentor/session");
    return response.data;
  },
};

export default mentorService;
