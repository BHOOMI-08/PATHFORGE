import crypto from "node:crypto";
import ApiError from "../utils/ApiError.js";
import { extractCanonicalSkills } from "./jobMatchScoring.service.js";

export const ROADMAP_PERSONALIZATION_WEIGHTS = Object.freeze({
  careerDNA: 20,
  resume: 20,
  ats: 15,
  jobMatch: 20,
  preferences: 15,
  previousRoadmap: 10,
});

const text = (value, max = 1000) => String(value ?? "").trim().slice(0, max);

const list = (values, maxItems = 40, maxLength = 180) => {
  const seen = new Set();
  const result = [];
  for (const value of Array.isArray(values) ? values : []) {
    const item = text(value, maxLength);
    const key = item.toLowerCase();
    if (!item || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
    if (result.length >= maxItems) break;
  }
  return result;
};

const canonicalSkillKey = (value) =>
  text(value, 180)
    .toLowerCase()
    .replace(/\bjava\s+script\b/g, "javascript")
    .replace(/\breact(?:\.?js)?\b/g, "react")
    .replace(/\bnode(?:\.?js)?\b/g, "nodejs")
    .replace(/\bexpress(?:\.?js)?\b/g, "express")
    .replace(/\bmongo\s*db\b/g, "mongodb")
    .replace(/\brestful?\s+apis?\b/g, "restapi")
    .replace(/\bgithub\b/g, "git")
    .replace(/[^a-z0-9+#]+/g, "");

const mergeSkills = (...groups) => {
  const byCanonicalName = new Map();
  groups.flat().forEach((value) => {
    const display = text(value, 180);
    const key = canonicalSkillKey(display);
    if (display && key && !byCanonicalName.has(key)) byCanonicalName.set(key, display);
  });
  return [...byCanonicalName.values()].slice(0, 80);
};

export const mergePersonalizedSkillGaps = (currentSkills, ...gapGroups) => {
  const currentSkillKeys = new Set((currentSkills || []).map(canonicalSkillKey));
  return mergeSkills(...gapGroups)
    .filter((skill) => !currentSkillKeys.has(canonicalSkillKey(skill)))
    .slice(0, 60);
};
const normalizeWeights = (availability, weights = ROADMAP_PERSONALIZATION_WEIGHTS) => {
  const active = Object.entries(weights).filter(
    ([key]) => availability[key],
  );
  const total = active.reduce((sum, [, weight]) => sum + weight, 0);
  if (!total) return {};
  const normalized = {};
  let assigned = 0;
  active.forEach(([key, weight], index) => {
    const value =
      index === active.length - 1
        ? 100 - assigned
        : Math.round((weight / total) * 100);
    normalized[key] = value;
    assigned += value;
  });
  return normalized;
};

const roleTokens = (value) =>
  new Set(
    text(value, 120)
      .toLowerCase()
      .split(/[^a-z0-9+#]+/)
      .filter(
        (token) =>
          token.length > 1 &&
          !["developer", "engineer", "intern", "senior", "junior", "lead"].includes(token),
      ),
  );

const rolesAreRelevant = (targetRole, analyzedRole) => {
  if (!analyzedRole) return true;
  const target = roleTokens(targetRole);
  const analyzed = roleTokens(analyzedRole);
  return [...target].some((token) => analyzed.has(token));
};
const parsePreferredDuration = (value) => {
  const parsed = Number.parseInt(String(value ?? "").match(/\d+/)?.[0] || "", 10);
  return Number.isInteger(parsed) && parsed >= 4 && parsed <= 24 ? parsed : 8;
};

const resolveDifficulty = (requested, proficiency) => {
  if (requested && requested !== "Adaptive") return requested;
  const normalized = text(proficiency, 40).toLowerCase();
  if (normalized === "advanced" || normalized === "expert") return "Advanced";
  if (normalized === "intermediate") return "Intermediate";
  return "Beginner";
};

const summarizeResume = (resume) => {
  const parsed = resume?.parsedData || {};
  return {
    available: Boolean(resume),
    resumeId: resume?._id ? String(resume._id) : null,
    fileName: text(resume?.fileName, 200),
    summary: text(parsed.summary, 1200),
    skills: {
      technical: list(parsed.skills?.technical),
      tools: list(parsed.skills?.tools),
      soft: list(parsed.skills?.soft),
      languages: list(parsed.skills?.languages),
    },
    projects: (parsed.projects || []).slice(0, 8).map((project) => ({
      title: text(project.title, 180),
      description: text(project.description, 700),
      technologies: list(project.technologies, 20),
    })),
    experience: (parsed.experience || []).slice(0, 8).map((experience) => ({
      position: text(experience.position, 180),
      company: text(experience.company, 180),
      startDate: text(experience.startDate, 60),
      endDate: text(experience.endDate, 60),
      highlights: list(experience.highlights, 12, 300),
    })),
    education: (parsed.education || []).slice(0, 5).map((education) => ({
      degree: text(education.degree, 180),
      fieldOfStudy: text(education.fieldOfStudy, 180),
      institution: text(education.institution, 180),
      endDate: text(education.endDate, 60),
    })),
    certifications: (parsed.certifications || []).slice(0, 12).map((certification) => ({
      name: text(certification.name, 180),
      issuer: text(certification.issuer, 180),
    })),
  };
};

export const buildRoadmapContext = ({
  user,
  careerDNA,
  resume,
  ats,
  jobMatch,
  settings,
  previousRoadmap,
  input,
}) => {
  if (!careerDNA && !resume) {
    throw new ApiError(
      422,
      "Complete Career DNA or upload a parsed resume before generating a personalized roadmap",
    );
  }

  const targetRole = text(
    input.targetRole ||
      careerDNA?.targetRoles?.[0] ||
      jobMatch?.jobTitle ||
      settings?.careerPreferences?.dreamRole,
    120,
  );
  if (targetRole.length < 2) {
    throw new ApiError(400, "Target role is required");
  }

  const durationWeeks =
    input.durationWeeks ||
    parsePreferredDuration(settings?.aiPersonalization?.preferredRoadmapDuration);
  const dailyHours = Math.min(
    12,
    Math.max(
      0.5,
      Number(input.dailyHours || careerDNA?.learningPreferences?.hoursPerDay || 2),
    ),
  );
  const difficulty = resolveDifficulty(input.difficulty, careerDNA?.technicalProficiency);
  const resumeSummary = summarizeResume(resume);
  const jobEvidenceRelevant = rolesAreRelevant(targetRole, jobMatch?.jobTitle);

  const projectSkills = resumeSummary.projects.flatMap((project) => project.technologies);
  const currentSkills = mergeSkills(
    careerDNA?.programmingLanguages,
    careerDNA?.frameworks,
    careerDNA?.databases,
    careerDNA?.technicalSkills,
    careerDNA?.tools,
    resumeSummary.skills.technical,
    resumeSummary.skills.tools,
    projectSkills,
    jobMatch?.matchingSkills,
  );
  const atsSkillGaps = jobEvidenceRelevant
    ? extractCanonicalSkills((ats?.missingKeywords || []).join(" "))
    : [];
  const missingSkills = mergePersonalizedSkillGaps(
    currentSkills,
    atsSkillGaps,
    jobEvidenceRelevant ? jobMatch?.missingSkills : [],
  );

  const availability = {
    careerDNA: Boolean(careerDNA),
    resume: Boolean(resume),
    ats: Boolean(ats),
    jobMatch: Boolean(jobMatch),
    preferences: Boolean(settings || careerDNA?.learningPreferences),
    previousRoadmap: Boolean(previousRoadmap),
  };
  const sourcesUsed = Object.entries(availability)
    .filter(([, available]) => available)
    .map(([source]) => source);
  const weightedSources = jobEvidenceRelevant
    ? ROADMAP_PERSONALIZATION_WEIGHTS
    : { ...ROADMAP_PERSONALIZATION_WEIGHTS, ats: 5, jobMatch: 5 };

  const context = {
    target: {
      role: targetRole,
      durationWeeks,
      dailyHours,
      weeklyHours: Math.round(dailyHours * 7 * 10) / 10,
      difficulty,
      regenerationReason: text(input.regenerationReason, 500),
    },
    userProfile: {
      name: text(user?.name, 120),
      professionalStatus: text(careerDNA?.professionalStatus, 120),
      experienceLevel: text(careerDNA?.experienceLevel, 80),
      opportunityType: text(careerDNA?.opportunityType, 120),
    },
    careerDNA: {
      available: Boolean(careerDNA),
      education: text(careerDNA?.education, 300),
      educationDetails: {
        degree: text(careerDNA?.educationDetails?.degree, 180),
        branch: text(careerDNA?.educationDetails?.branch, 180),
        currentYear: text(careerDNA?.educationDetails?.currentYear, 80),
        graduationYear: text(careerDNA?.educationDetails?.graduationYear, 40),
      },
      technicalProficiency: text(careerDNA?.technicalProficiency, 80),
      experience: {
        years: text(careerDNA?.experienceDetails?.years, 80),
        types: list(careerDNA?.experienceDetails?.types, 12),
        projects: text(careerDNA?.projectsExperience, 1200),
      },
      careerObjectives: text(careerDNA?.careerObjectives, 1200),
      learningGoals: list(careerDNA?.learningGoals, 30, 300),
      challenges: list(careerDNA?.careerChallenges, 30, 300),
      softSkills: list(careerDNA?.softSkills),
      preferredCompanies: list(careerDNA?.preferredCompanies, 20),
    },
    resume: resumeSummary,
    ats: {
      available: Boolean(ats),
      relevanceToTarget: jobEvidenceRelevant ? "high" : "low",
      analysisId: ats?._id ? String(ats._id) : null,
      score: Number(ats?.atsScore || 0),
      summary: text(ats?.summary, 1200),
      missingKeywords: list(ats?.missingKeywords, 50),
      weaknesses: list(ats?.weaknesses, 30, 500),
      recommendations: list(ats?.recommendations, 30, 500),
      skillGapAdvice: list(ats?.skillGapAdvice, 30, 500),
    },
    jobMatch: {
      available: Boolean(jobMatch),
      relevanceToTarget: jobEvidenceRelevant ? "high" : "low",
      analysisId: jobMatch?._id ? String(jobMatch._id) : null,
      jobTitle: text(jobMatch?.jobTitle, 120),
      companyName: text(jobMatch?.companyName, 120),
      score: Number(jobMatch?.matchScore || 0),
      summary: text(jobMatch?.summary, 1200),
      missingSkills: list(jobMatch?.missingSkills, 50),
      weaknesses: list(jobMatch?.weaknesses, 30, 500),
      recommendations: list(jobMatch?.recommendations, 30, 500),
    },
    preferences: {
      learningSpeed: text(
        careerDNA?.learningPreferences?.learningSpeed ||
          settings?.aiPersonalization?.learningPace ||
          "Medium",
        40,
      ),
      learningStyle: text(careerDNA?.learningPreferences?.learningStyle || "Projects", 120),
      explanationStyle: text(settings?.aiPersonalization?.explanationStyle || "Detailed", 40),
      preferredLanguage: text(settings?.aiPersonalization?.preferredLanguage || "English", 60),
      workType: text(settings?.careerPreferences?.preferredWorkType, 60),
      preferredCountry: text(settings?.careerPreferences?.preferredCountry, 80),
    },
    derived: {
      currentSkills,
      missingSkills,
      improvementAdvice: list(
        [...(ats?.recommendations || []), ...(jobMatch?.recommendations || [])],
        40,
        500,
      ),
    },
    previousRoadmap: {
      available: Boolean(previousRoadmap),
      version: Number(previousRoadmap?.version || 0),
      targetRole: text(previousRoadmap?.targetRole, 120),
      progress: Number(previousRoadmap?.overallProgress || 0),
      completedTasks: (previousRoadmap?.milestones || [])
        .flatMap((milestone) => milestone.tasks || [])
        .filter((task) => task.completed)
        .map((task) => text(task.title, 180))
        .filter(Boolean)
        .slice(0, 40),
    },
    sourceAvailability: availability,
    personalizationWeights: normalizeWeights(availability, weightedSources),
  };

  const serialized = JSON.stringify(context);
  return {
    context,
    contextHash: crypto.createHash("sha256").update(serialized).digest("hex"),
    sourceIds: {
      careerDNA: careerDNA?._id ? String(careerDNA._id) : null,
      resume: resume?._id ? String(resume._id) : null,
      ats: ats?._id ? String(ats._id) : null,
      jobMatch: jobMatch?._id ? String(jobMatch._id) : null,
      settings: settings?._id ? String(settings._id) : null,
      previousRoadmap: previousRoadmap?._id ? String(previousRoadmap._id) : null,
    },
    sourcesUsed,
    targetRole,
    durationWeeks,
    dailyHours,
    difficulty,
    currentSkills,
    missingSkills,
    personalizationWeights: context.personalizationWeights,
  };
};

export default { buildRoadmapContext, ROADMAP_PERSONALIZATION_WEIGHTS };
