import crypto from "node:crypto";
import ATSAnalysis from "../models/ATSAnalysis.model.js";
import CareerDNA from "../models/CareerDNA.model.js";
import JobMatch from "../models/JobMatch.model.js";
import RecruiterSimulator from "../models/RecruiterSimulator.model.js";
import Resume from "../models/Resume.model.js";
import Roadmap from "../models/Roadmap.model.js";
import {
  CERTIFICATION_CATALOG,
  OPPORTUNITY_ANALYSIS_VERSION,
  OPPORTUNITY_THRESHOLDS,
  PROJECT_TEMPLATES,
  ROLE_PROFILES,
} from "../constants/opportunityRoles.js";
import ApiError from "../utils/ApiError.js";
import { enhanceOpportunityNarrative } from "./gemini/opportunityRadar.service.js";

const ALIASES = new Map([
  ["reactjs", "react"], ["react.js", "react"],
  ["nodejs", "node.js"], ["expressjs", "express.js"],
  ["rest api", "rest apis"], ["restful api", "rest apis"], ["restful apis", "rest apis"],
  ["dsa", "data structures"], ["object oriented programming", "oop"],
  ["amazon web services", "aws"], ["google cloud platform", "gcp"],
  ["github actions", "ci/cd"], ["continuous integration", "ci/cd"],
  ["continuous delivery", "ci/cd"], ["continuous deployment", "ci/cd"],
  ["unit testing", "testing"], ["automated testing", "testing"],
  ["powerbi", "power bi"], ["data visualisation", "data visualization"],
]);

const GROUPS = Object.freeze({
  programming: ["javascript", "typescript", "python", "java", "c", "c++", "c#", "go", "rust", "php", "ruby"],
  databases: ["database", "databases", "sql", "mongodb", "mysql", "postgresql", "postgres", "redis", "sqlite"],
  cloud: ["cloud", "aws", "azure", "gcp", "google cloud"],
  "data visualization": ["data visualization", "power bi", "tableau", "matplotlib", "seaborn"],
  testing: ["testing", "jest", "vitest", "mocha", "cypress", "playwright", "junit"],
  "system design": ["system design", "microservices", "distributed systems", "scalability"],
  monitoring: ["monitoring", "prometheus", "grafana", "datadog", "observability"],
  leadership: ["leadership", "mentoring", "team lead", "management"],
});

const text = (value) => typeof value === "string" ? value.normalize("NFKC").trim().replace(/\s+/g, " ") : "";

export const normalizeOpportunitySkill = (value) => {
  const cleaned = text(value).toLowerCase().replace(/[._-]+/g, " ").replace(/\s+/g, " ");
  if (!cleaned) return "";
  const compact = cleaned.replace(/\s+/g, "");
  return ALIASES.get(cleaned) || ALIASES.get(compact) || cleaned;
};

const uniqueText = (values) => {
  const mapped = new Map();
  for (const value of values.flat(Infinity)) {
    const display = text(value);
    const normalized = normalizeOpportunitySkill(display);
    if (display && normalized && !mapped.has(normalized)) mapped.set(normalized, display);
  }
  return mapped;
};

const satisfies = (evidence, requirement) => {
  const normalized = normalizeOpportunitySkill(requirement);
  if (evidence.has(normalized)) return true;
  return (GROUPS[normalized] || []).some((candidate) => evidence.has(candidate));
};

const parseYears = (value) => {
  const match = text(value).match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const dateYear = (value) => {
  const match = text(value).match(/(?:19|20)\d{2}/);
  return match ? Number(match[0]) : null;
};

const resumeExperienceYears = (entries = []) => entries.reduce((total, entry) => {
  const start = dateYear(entry.startDate);
  const end = entry.isCurrent ? new Date().getFullYear() : dateYear(entry.endDate);
  return start && end && end >= start ? total + Math.min(10, end - start) : total;
}, 0);

const sourceToken = (document) => document
  ? `${document._id}:${new Date(document.updatedAt || document.createdAt || 0).toISOString()}`
  : "none";

export const fingerprintOpportunitySources = (sources) => crypto
  .createHash("sha256")
  .update([
    OPPORTUNITY_ANALYSIS_VERSION,
    sourceToken(sources.resume),
    sourceToken(sources.careerDNA),
    sourceToken(sources.ats),
    sourceToken(sources.jobMatch),
    sourceToken(sources.roadmap),
    sourceToken(sources.recruiter),
  ].join("|"))
  .digest("hex");

export const loadOpportunitySources = async (userId) => {
  const [resume, careerDNA, ats, jobMatch, roadmap, recruiter] = await Promise.all([
    Resume.findOne({ user: userId, status: "parsed" }).sort({ versionNumber: -1, createdAt: -1 }).lean(),
    CareerDNA.findOne({ user: userId }).lean(),
    ATSAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }).select("_id resume atsScore createdAt updatedAt").lean(),
    JobMatch.findOne({ user: userId }).sort({ createdAt: -1 }).select("_id resume matchScore createdAt updatedAt").lean(),
    Roadmap.findOne({ user: userId, activeKey: "active" }).select("_id updatedAt overallProgress milestones").lean(),
    RecruiterSimulator.findOne({ user: userId }).sort({ createdAt: -1 }).select("_id resume overallScore createdAt updatedAt").lean(),
  ]);
  const sources = { resume, careerDNA, ats, jobMatch, roadmap, recruiter };
  return { ...sources, sourceFingerprint: fingerprintOpportunitySources(sources) };
};

export const buildOpportunityEvidence = (sources) => {
  const parsed = sources.resume?.parsedData || {};
  const resumeSkills = uniqueText([
    parsed.skills?.technical || [],
    parsed.skills?.tools || [],
    parsed.skills?.languages || [],
    (parsed.projects || []).flatMap((project) => project.technologies || []),
  ]);
  const profileSkills = uniqueText([
    sources.careerDNA?.technicalSkills || [],
    sources.careerDNA?.programmingLanguages || [],
    sources.careerDNA?.frameworks || [],
    sources.careerDNA?.databases || [],
    sources.careerDNA?.tools || [],
    sources.careerDNA?.softSkills || [],
  ]);
  const combinedSkills = new Map([...profileSkills, ...resumeSkills]);
  const projects = (parsed.projects || []).map((project) => ({
    title: text(project.title),
    description: text(project.description),
    skills: uniqueText(project.technologies || []),
  }));
  const resumeYears = resumeExperienceYears(parsed.experience || []);
  const profileYears = parseYears(sources.careerDNA?.experienceDetails?.years);
  const experienceYears = Math.max(resumeYears, profileYears);
  const certifications = (parsed.certifications || []).map((certification) => ({
    name: text(certification.name),
    issuer: text(certification.issuer),
  })).filter((certification) => certification.name);
  const educationCount = (parsed.education || []).filter((education) =>
    text(education.institution) || text(education.degree) || text(education.fieldOfStudy),
  ).length;
  const targetRoles = uniqueText(sources.careerDNA?.targetRoles || []);
  const roadmapTasks = (sources.roadmap?.milestones || []).flatMap((milestone) => milestone.tasks || []);
  const roadmapProgress = roadmapTasks.length
    ? Math.round((roadmapTasks.filter((task) => task.completed).length / roadmapTasks.length) * 100)
    : null;

  return {
    hasEvidence: Boolean(sources.resume || combinedSkills.size || projects.length || experienceYears),
    resumeSkills,
    profileSkills,
    combinedSkills,
    projects,
    existingProjectTitles: projects.map((project) => project.title.toLowerCase()).filter(Boolean),
    experienceEntries: (parsed.experience || []).length,
    experienceYears,
    certifications,
    educationCount,
    targetRoles: [...targetRoles.values()],
    learningHoursPerDay: Number(sources.careerDNA?.learningPreferences?.hoursPerDay) || 2,
    resumeId: sources.resume?._id ? String(sources.resume._id) : null,
    resumeVersion: sources.resume?.versionNumber || null,
    sourceFingerprint: sources.sourceFingerprint,
    signals: {
      latestAtsScore: sources.ats?.resume && String(sources.ats.resume) === String(sources.resume?._id) ? sources.ats.atsScore : null,
      latestJobMatchScore: sources.jobMatch?.resume && String(sources.jobMatch.resume) === String(sources.resume?._id) ? sources.jobMatch.matchScore : null,
      latestRecruiterScore: sources.recruiter?.resume && String(sources.recruiter.resume) === String(sources.resume?._id) ? sources.recruiter.overallScore : null,
      roadmapProgress,
    },
  };
};

const roleProjectEvidence = (role, projects) => projects.filter((project) => {
  const requirements = [...role.coreSkills, ...role.supportingSkills];
  return requirements.some((requirement) => satisfies(project.skills, requirement));
}).length;

export const scoreOpportunityRole = (role, evidence) => {
  const matchedCore = role.coreSkills.filter((skill) => satisfies(evidence.combinedSkills, skill));
  const missingCore = role.coreSkills.filter((skill) => !satisfies(evidence.combinedSkills, skill));
  const matchedSupporting = role.supportingSkills.filter((skill) => satisfies(evidence.combinedSkills, skill));
  const missingSupporting = role.supportingSkills.filter((skill) => !satisfies(evidence.combinedSkills, skill));
  const relevantProjects = roleProjectEvidence(role, evidence.projects);
  const experienceRatio = role.minimumYears > 0
    ? Math.min(1, evidence.experienceYears / role.minimumYears)
    : Math.min(1, evidence.experienceYears + evidence.experienceEntries * 0.5);
  const coreScore = (matchedCore.length / role.coreSkills.length) * 55;
  const supportingScore = (matchedSupporting.length / role.supportingSkills.length) * 15;
  const projectScore = Math.min(1, relevantProjects / 2) * 15;
  const experienceScore = experienceRatio * 15;
  const score = Math.round(Math.min(100, Math.max(0, coreScore + supportingScore + projectScore + experienceScore)));
  const experienceSatisfied = evidence.experienceYears >= role.minimumYears;

  let bucket = "explore_later";
  if (role.level === "senior" && !experienceSatisfied) bucket = "long_term";
  else if (score >= OPPORTUNITY_THRESHOLDS.readyNow && missingCore.length <= 1 && experienceSatisfied) bucket = "ready_now";
  else if (score >= OPPORTUNITY_THRESHOLDS.almostReady && experienceSatisfied) bucket = "almost_ready";

  return {
    id: role.id,
    title: role.title,
    track: role.track,
    level: role.level,
    score,
    bucket,
    matchedSkills: [...matchedCore, ...matchedSupporting],
    missingCoreSkills: missingCore,
    missingSupportingSkills: missingSupporting,
    missingSkills: [...missingCore, ...missingSupporting],
    relevantProjects,
    experience: {
      requiredYears: role.minimumYears,
      evidencedYears: evidence.experienceYears,
      satisfied: experienceSatisfied,
    },
    evidence: [
      `${matchedCore.length}/${role.coreSkills.length} core skills matched`,
      `${matchedSupporting.length}/${role.supportingSkills.length} supporting skills matched`,
      `${relevantProjects} relevant project${relevantProjects === 1 ? "" : "s"} found`,
      `${evidence.experienceYears} year${evidence.experienceYears === 1 ? "" : "s"} of experience evidence`,
    ],
  };
};

export const calculateEvidenceConfidence = (evidence) => {
  const supportingSignalCount = Object.values(evidence.signals || {}).filter((value) => value !== null).length;
  const score = Math.round(
    (evidence.resumeId ? 20 : 0) +
    Math.min(25, evidence.combinedSkills.size * 2.1) +
    Math.min(20, evidence.projects.length * 7) +
    Math.min(15, (evidence.experienceEntries + evidence.experienceYears) * 5) +
    Math.min(10, (evidence.educationCount + evidence.certifications.length) * 5) +
    (evidence.targetRoles.length ? 5 : 0) +
    Math.min(5, supportingSignalCount * 1.25),
  );
  return {
    score: Math.min(100, score),
    label: score >= 75 ? "Strong evidence" : score >= 45 ? "Moderate evidence" : "Limited evidence",
    basis: `${evidence.combinedSkills.size} skills, ${evidence.projects.length} projects, ${evidence.experienceEntries} experience entries, ${evidence.certifications.length} certifications, and ${supportingSignalCount} linked PathForge signals available.`,
  };
};

export const prioritizeSkillGaps = (roles) => {
  const scores = new Map();
  roles.filter((role) => role.level !== "senior").slice(0, 4).forEach((role, index) => {
    const rankWeight = Math.max(0.55, 1 - index * 0.15);
    for (const skill of role.missingCoreSkills) {
      const key = normalizeOpportunitySkill(skill);
      const item = scores.get(key) || { skill, points: 0, relatedRoles: new Set(), coreFor: new Set() };
      item.points += 3 * rankWeight;
      item.relatedRoles.add(role.title);
      item.coreFor.add(role.title);
      scores.set(key, item);
    }
    for (const skill of role.missingSupportingSkills) {
      const key = normalizeOpportunitySkill(skill);
      const item = scores.get(key) || { skill, points: 0, relatedRoles: new Set(), coreFor: new Set() };
      item.points += rankWeight;
      item.relatedRoles.add(role.title);
      scores.set(key, item);
    }
  });

  return [...scores.values()]
    .sort((a, b) => b.points - a.points || a.skill.localeCompare(b.skill))
    .map((gap) => ({
      skill: gap.skill,
      priority: gap.points >= 5 ? "high" : gap.points >= 2.5 ? "medium" : "low",
      impactScore: Math.round(gap.points * 10) / 10,
      relatedRoles: [...gap.relatedRoles],
      impact: gap.coreFor.size
        ? `Core requirement for ${[...gap.coreFor].join(", ")}.`
        : `Supporting requirement across ${[...gap.relatedRoles].join(", ")}.`,
    }));
};

const titleOverlap = (left, right) => {
  const tokens = (value) => new Set(normalizeOpportunitySkill(value).split(" ").filter((token) => token.length > 3));
  const a = tokens(left);
  const b = tokens(right);
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((token) => b.has(token)).length;
  return intersection / Math.min(a.size, b.size);
};

export const recommendProjects = (skillGaps, evidence) => {
  const gaps = new Set(skillGaps.map((gap) => normalizeOpportunitySkill(gap.skill)));
  return PROJECT_TEMPLATES
    .filter((template) => template.triggerSkills.some((skill) => gaps.has(normalizeOpportunitySkill(skill))))
    .filter((template) => !evidence.existingProjectTitles.some((title) => titleOverlap(title, template.title) >= 0.6))
    .slice(0, 3)
    .map((template) => {
      const targetSkills = template.targetSkills.filter((skill) => gaps.has(normalizeOpportunitySkill(skill)));
      const relatedRoles = [...new Set(skillGaps
        .filter((gap) => targetSkills.some((skill) => normalizeOpportunitySkill(skill) === normalizeOpportunitySkill(gap.skill)))
        .flatMap((gap) => gap.relatedRoles))];
      return {
        id: template.id,
        title: template.title,
        targetSkills,
        whyRecommended: `Builds portfolio evidence for ${targetSkills.join(", ")}${relatedRoles.length ? ` across ${relatedRoles.slice(0, 2).join(" and ")}` : ""}.`,
        difficulty: template.difficulty,
      };
    });
};

export const recommendCertifications = (skillGaps, evidence) => {
  const existing = evidence.certifications.map((certification) => normalizeOpportunitySkill(certification.name));
  return CERTIFICATION_CATALOG
    .map((certification) => {
      const matchingGaps = skillGaps.filter((gap) => certification.skills.some((skill) =>
        normalizeOpportunitySkill(skill) === normalizeOpportunitySkill(gap.skill) ||
        (normalizeOpportunitySkill(skill) === "cloud" && ["aws", "azure", "cloud"].includes(normalizeOpportunitySkill(gap.skill))),
      ));
      return { certification, matchingGaps };
    })
    .filter(({ certification, matchingGaps }) => matchingGaps.length && !existing.some((name) => name.includes(normalizeOpportunitySkill(certification.name))))
    .sort((a, b) => Math.max(...b.matchingGaps.map((gap) => gap.impactScore)) - Math.max(...a.matchingGaps.map((gap) => gap.impactScore)))
    .slice(0, 3)
    .map(({ certification, matchingGaps }) => ({
      id: certification.id,
      name: certification.name,
      targetSkills: [...new Set(matchingGaps.map((gap) => gap.skill))],
      whyRecommended: `Optional credential that may strengthen evidence for ${matchingGaps.map((gap) => gap.skill).join(", ")}; it is not a hiring requirement.`,
    }));
};

const estimateTimeline = (strongestRole, hoursPerDay) => {
  if (strongestRole.bucket === "ready_now") {
    return {
      label: "Ready to apply now",
      target: `Continue strengthening portfolio evidence for ${strongestRole.title} roles.`,
      disclaimer: "Role alignment is not an employment guarantee; employer requirements vary.",
    };
  }
  const weightedGaps = strongestRole.missingCoreSkills.length * 3 + strongestRole.missingSupportingSkills.length;
  const studyFactor = Math.max(0.6, Math.min(1.5, 2 / Math.max(0.5, hoursPerDay)));
  const estimatedWeeks = Math.ceil(weightedGaps * studyFactor);
  const label = estimatedWeeks <= 6 ? "1–2 months" : estimatedWeeks <= 12 ? "2–3 months" : "3–6 months";
  return {
    label,
    target: `Estimated time to close current technical evidence gaps for stronger ${strongestRole.title} alignment.`,
    disclaimer: "Estimate is based on current evidence and typical learning scope; actual timelines vary. It does not estimate promotion or seniority.",
  };
};

export const buildOpportunityRadar = async (sources) => {
  const evidence = buildOpportunityEvidence(sources);
  if (!evidence.hasEvidence) {
    throw new ApiError(422, "Complete your Career DNA or upload a parsed resume before scanning Opportunity Radar");
  }

  const scoredRoles = ROLE_PROFILES.map((role) => scoreOpportunityRole(role, evidence))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  const strongestRole = scoredRoles.find((role) => role.level !== "senior") || scoredRoles[0];
  for (const role of scoredRoles) {
    if (role.level === "senior" && role.track !== strongestRole.track && !(strongestRole.track === "full-stack" && role.track === "software-engineering")) {
      role.bucket = "explore_later";
    }
  }
  const candidateRoles = scoredRoles.filter((role) => role.level !== "senior").slice(0, 3);
  const overallReadiness = Math.round(candidateRoles.reduce((sum, role) => sum + role.score, 0) / candidateRoles.length);
  const skillGaps = prioritizeSkillGaps(scoredRoles);
  const projects = recommendProjects(skillGaps, evidence);
  const certifications = recommendCertifications(skillGaps, evidence);
  const confidence = calculateEvidenceConfidence(evidence);
  const deterministicNarrative = {
    careerDirectionSummary: `${strongestRole.title} is the strongest current direction at ${strongestRole.score}% role alignment, based on matched skills, projects, and experience evidence.`,
    careerAdvice: strongestRole.bucket === "ready_now"
      ? `Your evidence currently supports applying to relevant ${strongestRole.title} roles while continuing to close the highest-priority gaps.`
      : `Focus first on ${skillGaps.slice(0, 3).map((gap) => gap.skill).join(", ") || "additional portfolio evidence"} to improve alignment with ${strongestRole.title} roles.`,
  };
  const ai = await enhanceOpportunityNarrative({ strongestRole, roles: scoredRoles, skillGaps });
  const narrative = ai.narrative || deterministicNarrative;
  const generatedAt = new Date();

  return {
    summary: {
      overallReadiness,
      metricLabel: "Top-role alignment readiness",
      evidenceConfidence: confidence,
      strongestDirection: {
        roleId: strongestRole.id,
        role: strongestRole.title,
        score: strongestRole.score,
        summary: narrative.careerDirectionSummary,
      },
      estimatedTimeline: estimateTimeline(strongestRole, evidence.learningHoursPerDay),
      careerAdvice: narrative.careerAdvice,
    },
    roles: scoredRoles,
    buckets: {
      readyNow: scoredRoles.filter((role) => role.bucket === "ready_now"),
      almostReady: scoredRoles.filter((role) => role.bucket === "almost_ready"),
      longTerm: scoredRoles.filter((role) => role.bucket === "long_term"),
    },
    skillGaps,
    recommendedProjects: projects,
    recommendedCertifications: certifications,
    source: {
      resumeId: evidence.resumeId,
      resumeVersion: evidence.resumeVersion,
      fingerprint: evidence.sourceFingerprint,
      signals: evidence.signals,
    },
    generatedAt,
    analysisVersion: OPPORTUNITY_ANALYSIS_VERSION,
    aiEnhancement: { status: ai.status, affectsScores: false },
  };
};

export default {
  buildOpportunityEvidence,
  buildOpportunityRadar,
  loadOpportunitySources,
  normalizeOpportunitySkill,
  scoreOpportunityRole,
};
