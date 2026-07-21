import api from "../utils/api.js";

/**
 * Resume Parsing & Management API service
 */
export const uploadResume = async (formData) => {
  return await api.post("/resumes/upload", formData);
};

export const getUserResumes = async () => {
  return await api.get("/resumes");
};

export const getResumeById = async (id) => {
  return await api.get(`/resumes/${id}`);
};

export const deleteResume = async (id) => {
  return await api.delete(`/resumes/${id}`);
};

export default {
  uploadResume,
  getUserResumes,
  getResumeById,
  deleteResume,
};
