import ATSAnalysis from "../models/ATSAnalysis.model.js";
import Interview from "../models/Interview.model.js";
import JobMatch from "../models/JobMatch.model.js";
import Resume from "../models/Resume.model.js";
import Roadmap from "../models/Roadmap.model.js";
import { ensureResumeVersionNumbers } from "./resumeVersion.service.js";

const SKILL_ALIASES = new Map([
  ["reactjs", "react"],
  ["react.js", "react"],
  ["nodejs", "node.js"],
  ["expressjs", "express.js"],
  ["nextjs", "next.js"],
  ["vuejs", "vue.js"],
]);

export const clampPercentage = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.round(Math.min(100, Math.max(0, number)));
};

const cleanText = (value) =>
  typeof value === "string" ? value.normalize("NFKC").trim().replace(/\s+/g, " ") : "";

export const normalizeSkill = (value) => {
  const cleaned = cleanText(value).toLowerCase();
  if (!cleaned) return "";
  const compact = cleaned.replace(/[\s._-]+/g, "");
  return SKILL_ALIASES.get(cleaned) || SKILL_ALIASES.get(compact) || cleaned;
};

const uniqueDisplayValues = (values, identity = (value) => cleanText(value).toLowerCase()) => {
  const entries = new Map();
  for (const value of values || []) {
    const display = cleanText(value);
    const key = identity(value);
    if (display && key && !entries.has(key)) entries.set(key, display);
  }
  return entries;
};

export const getResumeSkills = (parsedData = {}) => {
  const skills = parsedData.skills || {};
  return uniqueDisplayValues(
    [...(skills.technical || []), ...(skills.tools || []), ...(skills.languages || [])],
    normalizeSkill,
  );
};

const projectIdentity = (project = {}) => cleanText(project.title).toLowerCase();
const certificationIdentity = (certification = {}) =>
  [cleanText(certification.name), cleanText(certification.issuer)].join("|").toLowerCase();
const experienceIdentity = (experience = {}) =>
  [
    cleanText(experience.company),
    cleanText(experience.position),
    cleanText(experience.startDate),
    cleanText(experience.endDate),
  ]
    .join("|")
    .toLowerCase();

const uniqueObjects = (values, identity) => {
  const entries = new Map();
  for (const value of values || []) {
    const key = identity(value);
    if (key && !entries.has(key)) entries.set(key, value);
  }
  return entries;
};

const addedEntries = (baseline, latest) =>
  [...latest.entries()].filter(([key]) => !baseline.has(key)).map(([, value]) => value);

export const compareResumeSnapshots = (baseline = {}, latest = {}) => {
  const baselineSkills = getResumeSkills(baseline);
  const latestSkills = getResumeSkills(latest);
  const baselineProjects = uniqueObjects(baseline.projects, projectIdentity);
  const latestProjects = uniqueObjects(latest.projects, projectIdentity);
  const baselineCertifications = uniqueObjects(baseline.certifications, certificationIdentity);
  const latestCertifications = uniqueObjects(latest.certifications, certificationIdentity);
  const baselineExperience = uniqueObjects(baseline.experience, experienceIdentity);
  const latestExperience = uniqueObjects(latest.experience, experienceIdentity);

  return {
    addedSkills: addedEntries(baselineSkills, latestSkills),
    removedSkills: addedEntries(latestSkills, baselineSkills),
    addedProjects: addedEntries(baselineProjects, latestProjects),
    addedCertifications: addedEntries(baselineCertifications, latestCertifications),
    addedExperience: addedEntries(baselineExperience, latestExperience),
  };
};

const latestByResume = (documents) => {
  const mapped = new Map();
  for (const document of documents) {
    const resumeId = document.resume ? String(document.resume) : null;
    if (resumeId && !mapped.has(resumeId)) mapped.set(resumeId, document);
  }
  return mapped;
};

const interviewResumeId = (interview) =>
  interview.resume ? String(interview.resume) : interview.personalization?.sourceIds?.resume || null;

const latestInterviewByResume = (interviews) => {
  const mapped = new Map();
  for (const interview of interviews) {
    const resumeId = interviewResumeId(interview);
    if (resumeId && !mapped.has(resumeId)) mapped.set(resumeId, interview);
  }
  return mapped;
};

const roadmapProgress = (roadmap) => {
  const tasks = (roadmap?.milestones || []).flatMap((milestone) => milestone.tasks || []);
  const completed = tasks.filter((task) => task.completed).length;
  return {
    completed,
    total: tasks.length,
    percent: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
  };
};

const toProject = (project) => ({ title: cleanText(project.title) });
const toCertification = (certification) => ({
  name: cleanText(certification.name),
  issuer: cleanText(certification.issuer),
});
const toExperience = (experience) => ({
  company: cleanText(experience.company),
  position: cleanText(experience.position),
});

export const calculateAtsDelta = (baselineScore, latestScore) => {
  const baseline = clampPercentage(baselineScore);
  const latest = clampPercentage(latestScore);
  return baseline !== null && latest !== null ? latest - baseline : null;
};

export const buildEvolutionBadges = ({
  versionCount,
  atsDelta,
  atsScores,
  interviewScores,
  roadmap,
}) => [
  {
    id: "ats_90",
    icon: "trophy",
    title: "ATS 90+",
    description: "Achieved a real ATS score of 90 or higher on a resume version.",
    unlocked: atsScores.some((score) => score >= 90),
  },
  {
    id: "optimizer",
    icon: "trending-up",
    title: "Resume Optimizer",
    description: "Improved the latest resume ATS score by at least 15 points from the baseline.",
    unlocked: atsDelta !== null && atsDelta >= 15,
  },
  {
    id: "interview_master",
    icon: "mic",
    title: "Interview Master",
    description: "Scored 85 or higher in a completed AI technical mock interview.",
    unlocked: interviewScores.some((score) => score >= 85),
  },
  {
    id: "fast_learner",
    icon: "zap",
    title: "Fast Learner",
    description: "Completed at least 40% of tasks in the active personalized roadmap.",
    unlocked: roadmap.total > 0 && roadmap.percent >= 40,
  },
  {
    id: "consistent_improver",
    icon: "layers",
    title: "Consistent Improver",
    description: "Uploaded at least three valid resume versions.",
    unlocked: versionCount >= 3,
  },
];

export const buildResumeEvolution = async (userId) => {
  await ensureResumeVersionNumbers(userId);

  const resumes = await Resume.find({ user: userId, status: "parsed" })
    .sort({ versionNumber: 1, createdAt: 1, _id: 1 })
    .select("versionNumber fileName parsedData createdAt")
    .lean();

  if (resumes.length === 0) {
    return {
      summary: {
        versionCount: 0,
        baselineVersionNumber: null,
        latestVersionNumber: null,
        atsDelta: null,
        newSkillCount: 0,
      },
      badges: [],
      versions: [],
      evolution: {
        newSkills: [],
        removedSkills: [],
        newProjects: [],
        newCertifications: [],
        newExperience: [],
      },
      insights: [],
      roadmapProgress: { completed: 0, total: 0, percent: 0 },
    };
  }

  const resumeIds = resumes.map((resume) => resume._id);
  const [atsAnalyses, jobMatches, interviews, activeRoadmap] = await Promise.all([
    ATSAnalysis.find({ user: userId, resume: { $in: resumeIds } })
      .sort({ createdAt: -1 })
      .select("resume atsScore createdAt")
      .lean(),
    JobMatch.find({ user: userId, resume: { $in: resumeIds } })
      .sort({ createdAt: -1 })
      .select("resume matchScore createdAt")
      .lean(),
    Interview.find({ user: userId, status: "completed" })
      .sort({ completedAt: -1, createdAt: -1 })
      .select("resume score completedAt createdAt personalization.sourceIds.resume")
      .lean(),
    Roadmap.findOne({ user: userId, activeKey: "active" }).select("milestones").lean(),
  ]);

  const atsByResume = latestByResume(atsAnalyses);
  const jobMatchByResume = latestByResume(jobMatches);
  const interviewByResume = latestInterviewByResume(interviews);

  const versions = resumes.map((resume) => {
    const resumeId = String(resume._id);
    const parsedData = resume.parsedData || {};
    const ats = atsByResume.get(resumeId);
    const jobMatch = jobMatchByResume.get(resumeId);
    const interview = interviewByResume.get(resumeId);

    return {
      id: resumeId,
      versionNumber: resume.versionNumber,
      label: `Resume V${resume.versionNumber}`,
      fileName: resume.fileName,
      uploadedAt: resume.createdAt,
      profile: {
        skillsCount: getResumeSkills(parsedData).size,
        projectsCount: uniqueObjects(parsedData.projects, projectIdentity).size,
        certificationsCount: uniqueObjects(parsedData.certifications, certificationIdentity).size,
        experienceCount: uniqueObjects(parsedData.experience, experienceIdentity).size,
      },
      metrics: {
        atsScore: clampPercentage(ats?.atsScore),
        latestJobMatchScore: clampPercentage(jobMatch?.matchScore),
        linkedInterviewScore: clampPercentage(interview?.score),
      },
    };
  });

  const baseline = resumes[0];
  const latest = resumes[resumes.length - 1];
  const comparison = compareResumeSnapshots(baseline.parsedData, latest.parsedData);
  const baselineAts = versions[0].metrics.atsScore;
  const latestAts = versions[versions.length - 1].metrics.atsScore;
  const atsDelta = calculateAtsDelta(baselineAts, latestAts);
  const progress = roadmapProgress(activeRoadmap);
  const validAtsScores = versions.map((version) => version.metrics.atsScore).filter((score) => score !== null);
  const validInterviewScores = interviews.map((interview) => clampPercentage(interview.score)).filter((score) => score !== null);

  const badges = buildEvolutionBadges({
    versionCount: versions.length,
    atsDelta,
    atsScores: validAtsScores,
    interviewScores: validInterviewScores,
    roadmap: progress,
  });

  const insights = [];
  if (versions.length === 1) {
    insights.push("Upload an updated resume version to start tracking progression.");
  } else if (atsDelta === null) {
    insights.push("Analyze both the baseline and latest resume to calculate ATS improvement.");
  } else if (atsDelta > 0) {
    insights.push(`Your latest resume ATS score improved by ${atsDelta} points from the baseline.`);
  } else if (atsDelta < 0) {
    insights.push(`Your latest resume ATS score is ${Math.abs(atsDelta)} points below the baseline.`);
  } else {
    insights.push("Your latest and baseline resumes currently have the same ATS score.");
  }
  if (comparison.addedSkills.length > 0) {
    insights.push(`Your latest resume adds ${comparison.addedSkills.length} unique skills.`);
  }

  return {
    summary: {
      versionCount: versions.length,
      baselineVersionNumber: versions[0].versionNumber,
      latestVersionNumber: versions[versions.length - 1].versionNumber,
      atsDelta,
      newSkillCount: comparison.addedSkills.length,
    },
    badges,
    versions,
    evolution: {
      newSkills: comparison.addedSkills,
      removedSkills: comparison.removedSkills,
      newProjects: comparison.addedProjects.map(toProject),
      newCertifications: comparison.addedCertifications.map(toCertification),
      newExperience: comparison.addedExperience.map(toExperience),
    },
    insights,
    roadmapProgress: progress,
  };
};

export default { buildResumeEvolution };
