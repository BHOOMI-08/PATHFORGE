import { api } from "../utils/api";

const AI_TIMEOUT_MS = 135000;

export const mentorService = {
  async startSession(payload) {
    const response = await api.post("/mentor/session/start", payload, { timeout: AI_TIMEOUT_MS });
    return response.data;
  },

  async getActiveSession() {
    const response = await api.get("/mentor/session/active");
    return response.data;
  },

  async submitAnswer(sessionId, questionId, answer) {
    const response = await api.post(
      `/mentor/session/${encodeURIComponent(sessionId)}/answer`,
      { questionId, answer },
      { timeout: AI_TIMEOUT_MS },
    );
    return response.data;
  },

  async finishSession(sessionId) {
    const response = await api.post(
      `/mentor/session/${encodeURIComponent(sessionId)}/finish`,
      undefined,
      { timeout: AI_TIMEOUT_MS },
    );
    return response.data;
  },

  async getSession(sessionId) {
    const response = await api.get(`/mentor/session/${encodeURIComponent(sessionId)}`);
    return response.data;
  },

  async getInterviewHistory() {
    const response = await api.get("/mentor/session");
    return response.data;
  },

  async deleteSession(sessionId) {
    const response = await api.delete(`/mentor/session/${encodeURIComponent(sessionId)}`);
    return response.data;
  },
};

export default mentorService;