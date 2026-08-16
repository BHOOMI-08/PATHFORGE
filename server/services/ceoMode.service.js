import crypto from "node:crypto";
import Interview from "../models/Interview.model.js";
import OpportunityRadarScan from "../models/OpportunityRadarScan.model.js";
import { CEO_ANALYSIS_VERSION, CEO_COMPANIES, CEO_PRESETS, CEO_TARGETS } from "../constants/ceoTargets.js";
import ApiError from "../utils/ApiError.js";
import { buildOpportunityEvidence, loadOpportunitySources, normalizeOpportunitySkill } from "./opportunityRadar.service.js";
import { CEO_MODEL_NAME, generateCEOStrategyContent } from "./gemini/ceoMode.service.js";

const SKILL_GROUPS = Object.freeze({
  programming: ["javascript", "typescript", "python", "java", "c", "c++", "c#", "go", "rust", "php", "ruby"],
  databases: ["database", "databases", "sql", "mongodb", "mysql", "postgresql", "postgres", "redis", "sqlite"],
  cloud: ["aws", "azure", "gcp", "google cloud", "cloud"],
  "machine learning": ["machine learning", "ml", "scikit learn", "tensorflow", "pytorch"],
  "deep learning": ["deep learning", "tensorflow", "pytorch", "neural networks"],
  mlops: ["mlops", "model deployment", "model monitoring"],
  llms: ["llm", "llms", "large language models", "gemini", "openai"],
  communication: ["communication", "presentation", "stakeholder management"],
  security: ["security", "authentication", "authorization", "oauth", "jwt"],
});

const clean = (value) => typeof value === "string" ? value.normalize("NFKC").trim().replace(/\s+/g, " ") : "";
const normalizedText = (value) => normalizeOpportunitySkill(clean(value));
const sourceToken = (document) => document
  ? `${document._id}:${new Date(document.updatedAt || document.createdAt || document.generatedAt || 0).toISOString()}`
  : "none";

const targetAliases = CEO_TARGETS.flatMap((target) => target.aliases.map((alias) => ({ alias, target })));

export const resolveCEOTarget = (input) => {
  const targetInput = clean(input);
  if (targetInput.length < 2 || targetInput.length > 120 || /[<>]|https?:\/\/|\b(ignore|system prompt|javascript:)\b/i.test(targetInput)) {
    throw new ApiError(400, "Enter a valid supported career target");
  }
  const lower = targetInput.toLowerCase().replace(/[._]+/g, " ").replace(/\s+/g, " ");
  const company = CEO_COMPANIES.find((item) => new RegExp(`^${item}\\b`, "i").test(targetInput)) || null;
  const roleText = company ? lower.replace(new RegExp(`^${company.toLowerCase()}\\s+`), "") : lower;
  const match = targetAliases
    .sort((left, right) => right.alias.length - left.alias.length)
    .find(({ alias }) => roleText === alias || roleText === alias.replace(/-/g, " "));

  if (!match) {
    throw new ApiError(400, `Unsupported career target. Try: ${CEO_PRESETS.join(", ")}`);
  }
  const label = company ? `${company} ${match.target.role}` : match.target.role;
  return { ...match.target, input: targetInput, company, label };
};

const satisfies = (skillMap, requirement) => {
  const requirementKey = normalizedText(requirement);
  if (skillMap.has(requirementKey)) return true;
  return (SKILL_GROUPS[requirementKey] || []).some((candidate) => skillMap.has(normalizedText(candidate)));
};

const projectSupports = (project, requirement) => {
  if (satisfies(project.skills, requirement)) return true;
  const haystack = normalizedText(`${project.title} ${project.description}`);
  const requirementKey = normalizedText(requirement);
  return haystack.includes(requirementKey) || (SKILL_GROUPS[requirementKey] || []).some((item) => haystack.includes(normalizedText(item)));
};

const interviewMatchesTarget = (interview, target) => {
  const value = normalizedText(interview?.targetRole);
  return target.aliases.some((alias) => value.includes(normalizedText(alias))) || value.includes(normalizedText(target.role));
};

export const fingerprintCEOSources = (sources) => crypto.createHash("sha256").update([
  CEO_ANALYSIS_VERSION,
  sources.opportunity.sourceFingerprint,
  sourceToken(sources.interview),
  sourceToken(sources.latestRadar),
].join("|")).digest("hex");

export const loadCEOSources = async (userId) => {
  const [opportunity, interview, latestRadar] = await Promise.all([
    loadOpportunitySources(userId),
    Interview.findOne({ user: userId, status: "completed" }).sort({ completedAt: -1, createdAt: -1 }).lean(),
    OpportunityRadarScan.findOne({ user: userId }).sort({ generatedAt: -1 }).lean(),
  ]);
  const sources = { opportunity, interview, latestRadar };
  return { ...sources, sourceFingerprint: fingerprintCEOSources(sources) };
};

const currentPositionFromEvidence = (sources) => {
  const experience = sources.opportunity.resume?.parsedData?.experience || [];
  const current = experience.find((entry) => entry.isCurrent && clean(entry.position));
  if (current) {
    return {
      label: clean(current.position),
      basis: `Current position in resume${clean(current.company) ? ` at ${clean(current.company)}` : ""}.`,
    };
  }
  const recent = [...experience].reverse().find((entry) => clean(entry.position));
  if (recent) return { label: clean(recent.position), basis: "Most recent position found in the resume." };
  const radar = sources.latestRadar;
  if (radar && radar.sourceFingerprint === sources.opportunity.sourceFingerprint && radar.result?.summary?.strongestDirection?.role) {
    return {
      label: radar.result.summary.strongestDirection.role,
      basis: "Strongest current direction from the latest non-stale Opportunity Radar scan.",
    };
  }
  const professionalStatus = clean(sources.opportunity.careerDNA?.professionalStatus);
  return {
    label: professionalStatus || "Profile baseline",
    basis: professionalStatus ? "Professional status from Career DNA." : "No current role evidence is available yet.",
  };
};

export const calculateCEOTargetReadiness = (target, evidence, interview) => {
  const matchedCore = target.coreSkills.filter((skill) => satisfies(evidence.combinedSkills, skill));
  const matchedSupporting = target.supportingSkills.filter((skill) => satisfies(evidence.combinedSkills, skill));
  const missingCore = target.coreSkills.filter((skill) => !satisfies(evidence.combinedSkills, skill));
  const missingSupporting = target.supportingSkills.filter((skill) => !satisfies(evidence.combinedSkills, skill));
  const relevantProjects = evidence.projects.filter((project) =>
    [...target.coreSkills, ...target.supportingSkills].some((skill) => projectSupports(project, skill)),
  );
  const experienceRatio = target.minimumYears
    ? Math.min(1, evidence.experienceYears / target.minimumYears)
    : Math.min(1, evidence.experienceEntries * 0.5 + evidence.experienceYears);

  const components = [
    { key: "coreSkills", label: "Core skills", weight: 30, score: (matchedCore.length / target.coreSkills.length) * 100, measured: true },
    { key: "supportingSkills", label: "Supporting skills", weight: 10, score: (matchedSupporting.length / target.supportingSkills.length) * 100, measured: true },
    { key: "projects", label: "Relevant project evidence", weight: 20, score: Math.min(100, relevantProjects.length * 50), measured: true },
    { key: "experience", label: "Experience evidence", weight: 20, score: experienceRatio * 100, measured: true },
    { key: "resume", label: "Linked resume/ATS evidence", weight: 10, score: evidence.signals.latestAtsScore, measured: evidence.signals.latestAtsScore !== null },
    { key: "interview", label: "Target-specific interview evidence", weight: 10, score: interview?.score ?? null, measured: Boolean(interview) },
  ];
  const availableWeight = components.filter((item) => item.measured).reduce((sum, item) => sum + item.weight, 0);
  let score = Math.round(components.filter((item) => item.measured).reduce(
    (sum, item) => sum + (item.score * item.weight), 0,
  ) / availableWeight);
  const experienceSatisfied = evidence.experienceYears >= target.minimumYears;
  if (target.level === "senior" && !experienceSatisfied) score = Math.min(score, 69);

  const gaps = [
    ...missingCore.map((skill) => ({ skill, type: "missing_skill", priority: "high", evidence: "Not found in the current Career DNA or resume skill evidence." })),
    ...missingSupporting.map((skill) => ({ skill, type: "missing_skill", priority: "medium", evidence: "Not found in the current Career DNA or resume skill evidence." })),
  ];
  for (const skill of [...matchedCore, ...matchedSupporting]) {
    if (!evidence.projects.some((project) => projectSupports(project, skill))) {
      gaps.push({
        skill,
        type: "limited_evidence",
        priority: matchedCore.includes(skill) ? "medium" : "low",
        evidence: "Listed in profile or resume skills, but no project evidence currently demonstrates its application.",
      });
    }
  }
  if (!experienceSatisfied) {
    gaps.push({
      skill: `${target.minimumYears}+ years relevant experience`,
      type: "experience_constraint",
      priority: "high",
      evidence: `${evidence.experienceYears} evidenced year${evidence.experienceYears === 1 ? "" : "s"}; this requirement cannot be replaced by a short learning sprint.`,
    });
  }

  return {
    score,
    label: score >= 80 ? "Strong alignment" : score >= 65 ? "Developing alignment" : "Foundation stage",
    metricLabel: "Evidence-based target readiness",
    availableWeight,
    evidenceCoverage: `${availableWeight}% of the readiness rubric is currently measurable. Unavailable ATS or target interview signals are excluded, not scored as zero.`,
    disclaimer: "Readiness is an evidence-based preparation metric, not a hiring probability or employment guarantee.",
    breakdown: components.map((item) => ({
      key: item.key,
      label: item.label,
      weight: item.weight,
      measured: item.measured,
      score: item.measured ? Math.round(item.score) : null,
    })),
    matchedSkills: [...matchedCore, ...matchedSupporting],
    relevantProjects: relevantProjects.length,
    experience: { requiredYears: target.minimumYears, evidencedYears: evidence.experienceYears, satisfied: experienceSatisfied },
    gaps: gaps.slice(0, 10),
  };
};

const buildTimeline = (target, readiness, hoursPerDay) => {
  const highGaps = readiness.gaps.filter((gap) => gap.priority === "high" && gap.type !== "experience_constraint").length;
  const mediumGaps = readiness.gaps.filter((gap) => gap.priority === "medium").length;
  const learningLoad = highGaps * 2 + mediumGaps;
  const capacityFactor = Math.max(0.75, Math.min(2, 2 / hoursPerDay));
  const technicalMonths = Math.max(2, Math.min(6, Math.ceil((2 + learningLoad / 2) * capacityFactor)));
  const seniorityConstraint = target.level === "senior" && !readiness.experience.satisfied
    ? `${target.minimumYears}+ years of relevant experience is expected for this senior target; the execution plan can strengthen technical evidence but cannot compress that career progression.`
    : null;
  return {
    range: seniorityConstraint ? `${technicalMonths}-month technical preparation phase; seniority progression remains longer-term` : `${technicalMonths}-${technicalMonths + 2} months`,
    planMonths: technicalMonths,
    seniorityConstraint,
    explanation: `The estimate reflects ${highGaps} high-priority and ${mediumGaps} medium-priority evidence gaps at ${hoursPerDay} hour${hoursPerDay === 1 ? "" : "s"} per day.`,
    disclaimer: "This is a preparation estimate based on current evidence and available study time; actual outcomes and employer timelines vary.",
  };
};

const buildEvidenceSections = (evidence, readiness) => {
  const careerAdvantages = [];
  if (readiness.matchedSkills.length) careerAdvantages.push({
    advantage: `${readiness.matchedSkills.slice(0, 3).join(", ")} are already represented in current evidence.`,
    evidence: "Matched Career DNA or resume skills.",
  });
  if (evidence.projects.length) careerAdvantages.push({
    advantage: `${evidence.projects.length} project${evidence.projects.length === 1 ? " is" : "s are"} available as a portfolio foundation.`,
    evidence: "Parsed resume project entries.",
  });
  if (readiness.experience.evidencedYears) careerAdvantages.push({
    advantage: `${readiness.experience.evidencedYears} year${readiness.experience.evidencedYears === 1 ? "" : "s"} of experience evidence can support role narratives.`,
    evidence: "Resume or Career DNA experience dates.",
  });
  const riskBlockers = readiness.gaps.slice(0, 4).map((gap) => ({
    risk: gap.type === "limited_evidence" ? `Limited demonstrable depth in ${gap.skill}.` : `Missing current evidence for ${gap.skill}.`,
    severity: gap.priority,
    evidence: gap.evidence,
    mitigation: gap.type === "experience_constraint" ? "Pursue progressive ownership and relevant experience over time." : `Use the execution plan to create verifiable evidence for ${gap.skill}.`,
  }));
  return { careerAdvantages, riskBlockers };
};

const companyEmphasis = (target) => {
  if (target.company === "Google") return "PathForge public-style simulation: problem solving, technical clarity, engineering fundamentals, and scalable design. This is not an official Google rubric.";
  if (target.company === "Amazon") return "PathForge public-style simulation: technical depth, ownership examples, reliability, and behavioral evidence. This is not an official Amazon rubric.";
  return "Role-specific preparation only; no company hiring process is assumed.";
};

export const buildCEOStrategyPlan = async (sources, target) => {
  const evidence = buildOpportunityEvidence(sources.opportunity);
  if (!evidence.hasEvidence) {
    throw new ApiError(422, "Complete Career DNA or upload a parsed resume before generating an AI CEO strategy");
  }
  const linkedInterview = sources.interview
    && (!sources.interview.resume || String(sources.interview.resume) === evidence.resumeId)
    && interviewMatchesTarget(sources.interview, target)
    ? sources.interview
    : null;
  const readiness = calculateCEOTargetReadiness(target, evidence, linkedInterview);
  const timeline = buildTimeline(target, readiness, evidence.learningHoursPerDay);
  const currentPosition = currentPositionFromEvidence(sources);
  const dailyTimeBudgetMinutes = Math.max(30, Math.round(evidence.learningHoursPerDay * 60));
  const strategy = await generateCEOStrategyContent({
    context: {
      target: { id: target.id, role: target.role, company: target.company, label: target.label, level: target.level },
      targetRequirements: { coreSkills: target.coreSkills, supportingSkills: target.supportingSkills, interviewFocus: target.interviewFocus },
      companyEmphasis: companyEmphasis(target),
      currentPosition,
      readiness: { score: readiness.score, label: readiness.label, matchedSkills: readiness.matchedSkills },
      gaps: readiness.gaps,
      timeline,
      experience: readiness.experience,
      availableSignals: {
        ats: evidence.signals.latestAtsScore,
        jobMatch: evidence.signals.latestJobMatchScore,
        recruiterSimulation: evidence.signals.latestRecruiterScore,
        roadmapProgress: evidence.signals.roadmapProgress,
        targetInterview: linkedInterview?.score ?? "unmeasured",
        relevantProjects: readiness.relevantProjects,
        opportunityRadarDirection: sources.latestRadar?.sourceFingerprint === sources.opportunity.sourceFingerprint
          ? sources.latestRadar?.result?.summary?.strongestDirection || null
          : null,
      },
      allowedSkills: [...target.coreSkills, ...target.supportingSkills],
      existingProjects: evidence.existingProjectTitles,
      dailyTimeBudgetMinutes,
      weeklyTimeBudgetHours: evidence.learningHoursPerDay * 5,
    },
  });
  const evidenceSections = buildEvidenceSections(evidence, readiness);
  const generatedAt = new Date();

  return {
    target: { id: target.id, input: target.input, role: target.role, company: target.company, label: target.label, level: target.level },
    currentPosition,
    executiveSummary: strategy.executiveSummary,
    careerGapSummary: strategy.careerGapSummary,
    readiness,
    priorityGaps: readiness.gaps,
    timeline,
    weeklyPlan: strategy.weeklyPlan.map((week) => ({ ...week, hours: evidence.learningHoursPerDay * 5 })),
    monthlyMilestones: strategy.monthlyMilestones,
    projects: strategy.projects,
    resumeDirectives: strategy.resumeDirectives,
    interviewPrep: strategy.interviewPrep,
    dailyHabits: strategy.dailyHabits,
    dailyTimeBudgetMinutes,
    ...evidenceSections,
    finalAdvice: strategy.finalAdvice,
    source: {
      resumeId: evidence.resumeId,
      resumeVersion: evidence.resumeVersion,
      fingerprint: sources.sourceFingerprint,
      signals: {
        atsMeasured: evidence.signals.latestAtsScore !== null,
        jobMatchMeasured: evidence.signals.latestJobMatchScore !== null,
        recruiterMeasured: evidence.signals.latestRecruiterScore !== null,
        roadmapMeasured: evidence.signals.roadmapProgress !== null,
        interviewMeasured: Boolean(linkedInterview),
        opportunityRadarUsed: currentPosition.basis.includes("Opportunity Radar"),
      },
      learningTime: {
        hoursPerDay: evidence.learningHoursPerDay,
        assumed: !Number(sources.opportunity.careerDNA?.learningPreferences?.hoursPerDay),
      },
    },
    generatedAt,
    analysisVersion: CEO_ANALYSIS_VERSION,
    ai: { provider: "gemini", model: CEO_MODEL_NAME, affectsReadinessScore: false },
  };
};

export default { buildCEOStrategyPlan, loadCEOSources, resolveCEOTarget };
