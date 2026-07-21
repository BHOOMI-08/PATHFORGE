import api from "../utils/api.js";

/**
 * Career DNA Profile service wrapping API requests
 */
export const getCareerDNA = async () => {
  return await api.get("/career-dna");
};

export const saveCareerDNA = async (data) => {
  return await api.put("/career-dna", data);
};

export default {
  getCareerDNA,
  saveCareerDNA,
};
