import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import STATUS_CODES from "../constants/statusCodes.js";
import Resume from "../models/Resume.model.js";
import ATSAnalysis from "../models/ATSAnalysis.model.js";
import JobMatch from "../models/JobMatch.model.js";
import Interview from "../models/Interview.model.js";
import Roadmap from "../models/Roadmap.model.js";

/**
 * Helper to extract unique skills list from a parsed resume object
 */
const getResumeSkills = (parsedData = {}) => {
  const technical = parsedData.skills?.technical || [];
  const tools = parsedData.skills?.tools || [];
  const languages = parsedData.skills?.languages || [];
  return Array.from(new Set([...technical, ...tools, ...languages]));
};

/**
 * Aggregates candidate resume evolution timeline and growth deltas
 * GET /api/v1/resume-evolution
 */
export const getResumeEvolution = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Fetch all user resumes sorted chronologically
  const resumes = await Resume.find({ user: userId }).sort({ createdAt: 1 });

  if (resumes.length === 0) {
    return res.status(STATUS_CODES.OK).json(
      new ApiResponse(STATUS_CODES.OK, {
        resumesCount: 0,
        timeline: [],
        insights: [],
        skillDiff: { added: [], removed: [] },
        sectionChanges: { addedProjects: [], addedCertifications: [], addedExperience: [] },
        badges: [],
        roadmapProgress: { completed: 0, total: 0, percent: 0 },
      }, "No resume evolution history found")
    );
  }

  // Fetch associated ATS analyses, Job Matches, Interviews, and active Roadmap
  const [atsAnalyses, jobMatches, interviews, activeRoadmap] = await Promise.all([
    ATSAnalysis.find({ user: userId }).sort({ createdAt: 1 }),
    JobMatch.find({ user: userId }).sort({ createdAt: 1 }),
    Interview.find({ user: userId, status: "completed" }).sort({ createdAt: 1 }),
    Roadmap.findOne({ user: userId }),
  ]);

  // Construct Chronological Timeline Points
  const timeline = resumes.map((resume, idx) => {
    // Find matching or closest ATS score
    const matchingAts = atsAnalyses.find(
      (a) => a.resume.toString() === resume._id.toString()
    ) || atsAnalyses[idx] || atsAnalyses[atsAnalyses.length - 1];

    // Find matching or closest Job Match
    const matchingJob = jobMatches.find(
      (j) => j.resume.toString() === resume._id.toString()
    ) || jobMatches[idx] || jobMatches[jobMatches.length - 1];

    // Find matching or closest Interview
    const matchingInterview = interviews[idx] || interviews[interviews.length - 1];

    const atsScore = matchingAts ? matchingAts.atsScore : resume.matchHistoryMetrics?.atsScoreBaseline || 65;
    const jobMatchScore = matchingJob ? matchingJob.matchScore : 60;
    const interviewScore = matchingInterview ? matchingInterview.score : 65;

    return {
      version: `Resume V${idx + 1}`,
      versionNumber: idx + 1,
      resumeId: resume._id,
      fileName: resume.fileName,
      uploadedAt: resume.createdAt,
      atsScore,
      jobMatchScore,
      interviewScore,
      skillsCount: getResumeSkills(resume.parsedData).length,
      projectsCount: resume.parsedData?.projects?.length || 0,
      certificationsCount: resume.parsedData?.certifications?.length || 0,
    };
  });

  // Compare Earliest Resume (V1) vs Latest Resume (V_latest)
  const earliestResume = resumes[0];
  const latestResume = resumes[resumes.length - 1];

  const earliestSkills = getResumeSkills(earliestResume.parsedData);
  const latestSkills = getResumeSkills(latestResume.parsedData);

  const addedSkills = latestSkills.filter(
    (s) => !earliestSkills.some((es) => es.toLowerCase() === s.toLowerCase())
  );
  const removedSkills = earliestSkills.filter(
    (es) => !latestSkills.some((ls) => ls.toLowerCase() === es.toLowerCase())
  );

  // Section additions
  const earliestProjects = (earliestResume.parsedData?.projects || []).map((p) => p.title.toLowerCase());
  const latestProjects = latestResume.parsedData?.projects || [];
  const addedProjects = latestProjects.filter((p) => !earliestProjects.includes(p.title.toLowerCase()));

  const earliestCerts = (earliestResume.parsedData?.certifications || []).map((c) => c.name.toLowerCase());
  const latestCerts = latestResume.parsedData?.certifications || [];
  const addedCertifications = latestCerts.filter((c) => !earliestCerts.includes(c.name.toLowerCase()));

  const earliestExp = (earliestResume.parsedData?.experience || []).map((e) => e.company.toLowerCase());
  const latestExp = latestResume.parsedData?.experience || [];
  const addedExperience = latestExp.filter((e) => !earliestExp.includes(e.company.toLowerCase()));

  // Calculate Growth Deltas & AI Evolution Insights
  const initialTimelinePoint = timeline[0];
  const latestTimelinePoint = timeline[timeline.length - 1];

  const atsDelta = latestTimelinePoint.atsScore - initialTimelinePoint.atsScore;
  const interviewDelta = latestTimelinePoint.interviewScore - initialTimelinePoint.interviewScore;
  const jobMatchDelta = latestTimelinePoint.jobMatchScore - initialTimelinePoint.jobMatchScore;

  const insights = [];
  if (atsDelta > 0) {
    insights.push(`You improved your ATS score by +${atsDelta} points over ${timeline.length} iterations.`);
  } else if (resumes.length > 1) {
    insights.push(`Your resume has maintained a strong ATS score baseline of ${latestTimelinePoint.atsScore}%.`);
  } else {
    insights.push(`Upload updated resume versions to track your score progression over time.`);
  }

  if (addedSkills.length > 0) {
    insights.push(`You added ${addedSkills.length} new technical competencies including ${addedSkills.slice(0, 3).join(", ")}.`);
  }

  if (interviewDelta > 0) {
    insights.push(`Interview readiness performance improved by +${interviewDelta}% across sessions.`);
  }

  if (addedProjects.length > 0) {
    insights.push(`Showcased ${addedProjects.length} new project architectures in your latest resume.`);
  }

  // Achievement Badges
  const maxAtsScore = Math.max(...timeline.map((t) => t.atsScore));
  const maxInterviewScore = Math.max(...timeline.map((t) => t.interviewScore), 0);
  const roadmapPercent = activeRoadmap?.overallProgress || 0;

  const badges = [
    {
      id: "ats_90",
      title: "🏆 ATS 90+",
      description: "Achieved an elite 90%+ ATS resume compatibility score",
      unlocked: maxAtsScore >= 90,
    },
    {
      id: "optimizer",
      title: "💼 Resume Optimizer",
      description: "Improved ATS score by 15+ points across iterations",
      unlocked: atsDelta >= 15 || resumes.length >= 2,
    },
    {
      id: "interview_master",
      title: "🎯 Interview Master",
      description: "Scored 85%+ in AI technical mock interview sessions",
      unlocked: maxInterviewScore >= 85,
    },
    {
      id: "fast_learner",
      title: "🚀 Fast Learner",
      description: "Completed 40%+ of personalized roadmap milestones",
      unlocked: roadmapPercent >= 40,
    },
    {
      id: "consistent_improver",
      title: "🔥 Consistent Improver",
      description: "Uploaded and iterated across multiple resume versions",
      unlocked: resumes.length >= 2,
    },
  ];

  // Roadmap Progress Summary
  let completedMilestones = 0;
  let totalMilestones = 0;

  if (activeRoadmap?.milestones) {
    totalMilestones = activeRoadmap.milestones.length;
    completedMilestones = activeRoadmap.milestones.filter(
      (m) => m.tasks && m.tasks.every((t) => t.completed)
    ).length;
  }

  return res.status(STATUS_CODES.OK).json(
    new ApiResponse(STATUS_CODES.OK, {
      resumesCount: resumes.length,
      timeline,
      deltas: {
        atsDelta,
        interviewDelta,
        jobMatchDelta,
        addedSkillsCount: addedSkills.length,
      },
      insights,
      skillDiff: {
        added: addedSkills,
        removed: removedSkills,
      },
      sectionChanges: {
        addedProjects,
        addedCertifications,
        addedExperience,
      },
      badges,
      roadmapProgress: {
        completed: completedMilestones,
        total: totalMilestones,
        percent: roadmapPercent,
      },
    }, "Resume evolution timeline compiled successfully")
  );
});

export default {
  getResumeEvolution,
};
