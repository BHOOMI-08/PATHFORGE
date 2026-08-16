import { normalizeScore } from "../utils/jsonValidator.js";

const SKILLS = new Map([
  ["javascript", ["javascript", "java script"]], ["typescript", ["typescript", "type script"]],
  ["react", ["react", "react.js", "reactjs"]], ["node.js", ["node", "node.js", "nodejs", "node js"]],
  ["express", ["express", "express.js", "expressjs"]], ["mongodb", ["mongodb", "mongo db", "mongo"]],
  ["rest api", ["rest api", "rest apis", "restful api", "restful apis"]], ["git", ["git", "github"]],
  ["html", ["html", "html5"]], ["css", ["css", "css3"]], ["tailwind css", ["tailwind", "tailwindcss", "tailwind css"]],
  ["java", ["java"]], ["spring boot", ["spring boot", "springboot"]], ["python", ["python"]],
  ["sql", ["sql"]], ["postgresql", ["postgresql", "postgres"]], ["mysql", ["mysql"]], ["redis", ["redis"]],
  ["aws", ["aws", "amazon web services"]], ["gcp", ["gcp", "google cloud"]], ["azure", ["azure"]],
  ["docker", ["docker"]], ["kubernetes", ["kubernetes", "k8s"]], ["ci/cd", ["ci/cd", "ci cd", "continuous integration"]],
  ["jest", ["jest"]], ["vitest", ["vitest"]], ["unit testing", ["unit testing", "unit tests"]],
  ["jwt", ["jwt", "json web token"]], ["oauth", ["oauth"]], ["microservices", ["microservice", "microservices"]],
  ["system design", ["system design"]], ["machine learning", ["machine learning", "ml"]],
  ["problem solving", ["problem solving", "problem-solving"]], ["agile", ["agile", "scrum"]],
]);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const containsAlias = (text, alias) => {
  const pattern = alias === "java" ? /(^|[^a-z])java([^a-z]|$)/i : new RegExp(`(^|[^a-z0-9])${escapeRegExp(alias)}([^a-z0-9]|$)`, "i");
  return pattern.test(text);
};

export const extractCanonicalSkills = (text) => {
  const value = String(text || "").toLowerCase().replace(/\bjava\s+script\b/g, "javascript");
  return [...SKILLS.entries()].filter(([, aliases]) => aliases.some((alias) => containsAlias(value, alias))).map(([skill]) => skill);
};

export const calculateSkillGap = (resumeText, jobDescription) => {
  const resumeSkills = new Set(extractCanonicalSkills(resumeText));
  const requiredSkills = extractCanonicalSkills(jobDescription);
  const matchingSkills = requiredSkills.filter((skill) => resumeSkills.has(skill));
  const missingSkills = requiredSkills.filter((skill) => !resumeSkills.has(skill));
  return {
    technicalMatch: requiredSkills.length ? normalizeScore((matchingSkills.length / requiredSkills.length) * 100) : 0,
    matchingSkills,
    missingSkills,
    requiredSkills,
  };
};

export const combineJobMatchResult = (deterministic, semantic) => {
  const matchScore = normalizeScore(
    deterministic.technicalMatch * 0.45 + semantic.experienceMatch * 0.25 +
    semantic.projectMatch * 0.20 + semantic.educationMatch * 0.10
  );
  return {
    matchScore,
    matchBreakdown: {
      technicalMatch: deterministic.technicalMatch,
      experienceMatch: semantic.experienceMatch,
      educationMatch: semantic.educationMatch,
      projectMatch: semantic.projectMatch,
    },
    matchingSkills: deterministic.matchingSkills,
    missingSkills: deterministic.missingSkills,
    strengths: semantic.strengths,
    weaknesses: semantic.weaknesses,
    recommendations: semantic.recommendations,
    summary: semantic.summary,
  };
};
