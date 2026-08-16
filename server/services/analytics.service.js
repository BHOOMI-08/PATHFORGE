import ATSAnalysis from "../models/ATSAnalysis.model.js";
import ActivityLog from "../models/ActivityLog.model.js";
import Interview from "../models/Interview.model.js";
import JobMatch from "../models/JobMatch.model.js";
import Notification from "../models/Notification.model.js";
import RecruiterSimulator from "../models/RecruiterSimulator.model.js";
import Resume from "../models/Resume.model.js";
import Roadmap from "../models/Roadmap.model.js";

export const READINESS_WEIGHTS = Object.freeze({
  ats: 30,
  interview: 25,
  roadmap: 20,
  recruiter: 15,
  jobMatch: 10,
});

export const clampScore = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, Math.round(numeric)));
};

export const calculateCareerReadiness = (scores = {}) => {
  const components = Object.entries(READINESS_WEIGHTS).map(([key, weight]) => {
    const rawScore = scores[key];
    const available = rawScore !== null && rawScore !== undefined && Number.isFinite(Number(rawScore));
    return {
      key,
      weight,
      available,
      score: available ? clampScore(rawScore) : null,
    };
  });
  const available = components.filter((component) => component.available);
  const availableWeight = available.reduce((total, component) => total + component.weight, 0);
  const weightedTotal = available.reduce(
    (total, component) => total + component.score * component.weight,
    0,
  );

  return {
    score: availableWeight ? clampScore(weightedTotal / availableWeight) : null,
    coverage: availableWeight,
    components,
  };
};

export const summarizeRoadmap = (roadmap) => {
  if (!roadmap) {
    return {
      exists: false,
      progress: null,
      completedTasks: 0,
      totalTasks: 0,
      completedMilestones: 0,
      totalMilestones: 0,
    };
  }

  const milestones = Array.isArray(roadmap.milestones) ? roadmap.milestones : [];
  let completedTasks = 0;
  let totalTasks = 0;
  let completedMilestones = 0;

  for (const milestone of milestones) {
    const tasks = Array.isArray(milestone.tasks) ? milestone.tasks : [];
    totalTasks += tasks.length;
    completedTasks += tasks.filter((task) => task?.completed === true).length;
    if (tasks.length > 0 && tasks.every((task) => task?.completed === true)) completedMilestones += 1;
  }

  return {
    exists: true,
    progress: totalTasks ? clampScore((completedTasks / totalTasks) * 100) : 0,
    completedTasks,
    totalTasks,
    completedMilestones,
    totalMilestones: milestones.length,
  };
};

export const buildWeeklyGoals = (roadmap) => {
  if (!roadmap || !Array.isArray(roadmap.milestones) || roadmap.milestones.length === 0) return [];
  const weekly = new Map();

  for (const milestone of roadmap.milestones) {
    const week = Math.max(1, Math.round(Number(milestone.startWeek) || 1));
    const tasks = Array.isArray(milestone.tasks) ? milestone.tasks : [];
    const current = weekly.get(week) || { week, label: `Week ${week}`, target: 0, completed: 0 };
    current.target += tasks.length;
    current.completed += tasks.filter((task) => task?.completed === true).length;
    weekly.set(week, current);
  }

  return [...weekly.values()].sort((left, right) => left.week - right.week);
};

export const buildCompetencyRadar = (latestAts, latestJobMatch) => {
  const dimensions = [];
  const add = (key, label, value, source) => {
    if (value !== null && value !== undefined && Number.isFinite(Number(value))) {
      dimensions.push({ key, label, score: clampScore(value), source });
    }
  };

  add("technicalStack", "Technical Stack", latestJobMatch?.matchBreakdown?.technicalMatch ?? latestAts?.breakdown?.keywordScore, latestJobMatch ? "Job Match" : "ATS");
  add("formatting", "Formatting", latestAts?.breakdown?.formattingScore, "ATS");
  add("impact", "Impact Evidence", latestAts?.breakdown?.impactScore, "ATS");
  add("content", "Resume Content", latestAts?.breakdown?.contentScore, "ATS");
  add("experience", "Experience", latestJobMatch?.matchBreakdown?.experienceMatch, "Job Match");
  add("education", "Education", latestJobMatch?.matchBreakdown?.educationMatch, "Job Match");
  return dimensions;
};

export const buildAnalyticsDashboard = async (userId) => {
  const [
    resumesCount,
    atsCount,
    atsDescending,
    jobMatchesCount,
    latestJobMatch,
    interviewsCount,
    latestInterview,
    recruiterCount,
    latestRecruiter,
    activeRoadmap,
    activityLogs,
    unreadNotifications,
  ] = await Promise.all([
    Resume.countDocuments({ user: userId }),
    ATSAnalysis.countDocuments({ user: userId }),
    ATSAnalysis.find({ user: userId }).sort({ createdAt: -1 }).limit(50).select("atsScore breakdown resume createdAt").lean(),
    JobMatch.countDocuments({ user: userId }),
    JobMatch.findOne({ user: userId }).sort({ createdAt: -1 }).select("matchScore matchBreakdown createdAt").lean(),
    Interview.countDocuments({ user: userId, status: "completed" }),
    Interview.findOne({ user: userId, status: "completed" }).sort({ completedAt: -1, createdAt: -1 }).select("score completedAt createdAt").lean(),
    RecruiterSimulator.countDocuments({ user: userId }),
    RecruiterSimulator.findOne({ user: userId }).sort({ createdAt: -1 }).select("overallScore company companyId createdAt").lean(),
    Roadmap.findOne({ user: userId }).select("overallProgress progress milestones totalDurationWeeks updatedAt").lean(),
    ActivityLog.find({ user: userId }).sort({ createdAt: -1 }).limit(15).select("action description metadata createdAt").lean(),
    Notification.find({ user: userId, read: false }).sort({ createdAt: -1 }).limit(25).lean(),
  ]);

  const latestAts = atsDescending[0] || null;
  const roadmap = summarizeRoadmap(activeRoadmap);
  const readiness = calculateCareerReadiness({
    ats: latestAts?.atsScore,
    interview: latestInterview?.score,
    roadmap: roadmap.exists ? roadmap.progress : null,
    recruiter: latestRecruiter?.overallScore,
    jobMatch: latestJobMatch?.matchScore,
  });
  const atsChronological = [...atsDescending].reverse();

  return {
    summary: {
      careerReadiness: readiness,
      resumes: { total: resumesCount },
      ats: { latestScore: latestAts ? clampScore(latestAts.atsScore) : null, totalAnalyses: atsCount },
      interviews: { latestScore: latestInterview ? clampScore(latestInterview.score) : null, totalCompleted: interviewsCount },
      roadmap,
      jobMatches: { latestScore: latestJobMatch ? clampScore(latestJobMatch.matchScore) : null, totalAnalyzed: jobMatchesCount },
      recruiter: {
        latestScore: latestRecruiter ? clampScore(latestRecruiter.overallScore) : null,
        totalSimulations: recruiterCount,
        latestCompany: latestRecruiter?.company || null,
      },
    },
    atsTrajectory: atsChronological.map((analysis, index) => ({
      score: clampScore(analysis.atsScore),
      createdAt: analysis.createdAt,
      label: `Audit #${Math.max(1, atsCount - atsChronological.length + index + 1)}`,
    })),
    competencyRadar: buildCompetencyRadar(latestAts, latestJobMatch),
    weeklyGoals: buildWeeklyGoals(activeRoadmap),
    activities: activityLogs.map((log) => ({
      id: log._id,
      action: log.action,
      description: log.description,
      metadata: log.metadata || {},
      createdAt: log.createdAt,
    })),
    notifications: unreadNotifications,
  };
};

export default {
  buildAnalyticsDashboard,
  buildCompetencyRadar,
  buildWeeklyGoals,
  calculateCareerReadiness,
  clampScore,
  summarizeRoadmap,
};
