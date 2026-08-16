export const RECRUITER_CATEGORY_KEYS = Object.freeze([
  "technicalSkills",
  "dsa",
  "projects",
  "experience",
  "systemDesign",
  "impact",
  "resumeQuality",
]);

export const RECRUITER_RUBRIC_VERSION = 1;

const rubrics = [
  {
    id: "google",
    name: "Google",
    defaultRole: "Software Development Engineer",
    focusAreas: ["Problem solving", "Data structures and algorithms", "Scalable systems", "Engineering quality"],
    evaluationWeights: { technicalSkills: 18, dsa: 25, projects: 12, experience: 10, systemDesign: 20, impact: 10, resumeQuality: 5 },
  },
  {
    id: "amazon",
    name: "Amazon",
    defaultRole: "Software Development Engineer",
    focusAreas: ["Technical depth", "Ownership", "Customer impact", "Reliable systems"],
    evaluationWeights: { technicalSkills: 18, dsa: 15, projects: 12, experience: 15, systemDesign: 15, impact: 20, resumeQuality: 5 },
  },
  {
    id: "microsoft",
    name: "Microsoft",
    defaultRole: "Software Engineer",
    focusAreas: ["Engineering fundamentals", "Architecture", "Product thinking", "Collaboration"],
    evaluationWeights: { technicalSkills: 20, dsa: 14, projects: 14, experience: 14, systemDesign: 18, impact: 10, resumeQuality: 10 },
  },
  {
    id: "flipkart",
    name: "Flipkart",
    defaultRole: "Software Development Engineer",
    focusAreas: ["Backend depth", "High-concurrency systems", "Performance", "Operational reliability"],
    evaluationWeights: { technicalSkills: 18, dsa: 16, projects: 12, experience: 12, systemDesign: 24, impact: 13, resumeQuality: 5 },
  },
  {
    id: "atlassian",
    name: "Atlassian",
    defaultRole: "Software Engineer",
    focusAreas: ["Product engineering", "Code quality", "Collaboration", "Maintainable design"],
    evaluationWeights: { technicalSkills: 20, dsa: 10, projects: 16, experience: 14, systemDesign: 14, impact: 12, resumeQuality: 14 },
  },
  {
    id: "meta",
    name: "Meta",
    defaultRole: "Software Engineer",
    focusAreas: ["Problem solving", "System performance", "Product impact", "Rapid execution"],
    evaluationWeights: { technicalSkills: 18, dsa: 22, projects: 12, experience: 10, systemDesign: 18, impact: 15, resumeQuality: 5 },
  },
];

export const RECRUITER_RUBRICS = Object.freeze(
  Object.fromEntries(rubrics.map((rubric) => [rubric.id, Object.freeze(rubric)]))
);

export const getRecruiterRubric = (companyId) => RECRUITER_RUBRICS[companyId] || null;

export const getPublicRecruiterRubric = (rubric) => ({
  id: rubric.id,
  name: rubric.name,
  defaultRole: rubric.defaultRole,
  focusAreas: [...rubric.focusAreas],
  evaluationWeights: { ...rubric.evaluationWeights },
  rubricVersion: RECRUITER_RUBRIC_VERSION,
});

export default RECRUITER_RUBRICS;
