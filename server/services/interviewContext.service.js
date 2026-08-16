import crypto from "node:crypto";

const text = (value, max = 800) => String(value ?? "").trim().slice(0, max);

const list = (values, maxItems = 30, maxLength = 160) => {
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

const mergeLists = (...groups) => list(groups.flat(), 60, 160);
const difficultyMap = Object.freeze({ Easy: "easy", Medium: "medium", Hard: "hard" });

export const buildInterviewContext = ({
  targetRole,
  seniorityLevel,
  interviewType,
  careerDNA,
  resume,
  settings,
}) => {
  const parsedResume = resume?.parsedData || {};
  const currentSkills = mergeLists(
    careerDNA?.programmingLanguages,
    careerDNA?.frameworks,
    careerDNA?.databases,
    careerDNA?.technicalSkills,
    careerDNA?.tools,
    parsedResume.skills?.technical,
    parsedResume.skills?.tools,
    (parsedResume.projects || []).flatMap((project) => project.technologies || []),
  );
  const sourcesUsed = [careerDNA && "careerDNA", resume && "resume", settings && "preferences"].filter(Boolean);

  const context = {
    target: {
      role: text(targetRole, 120),
      seniorityLevel,
      interviewType,
      desiredDifficulty:
        seniorityLevel === "entry"
          ? "easy"
          : seniorityLevel === "senior"
            ? "hard"
            : difficultyMap[settings?.aiPersonalization?.interviewDifficulty] || "medium",
    },
    candidateEvidence: {
      currentSkills,
      professionalStatus: text(careerDNA?.professionalStatus, 100),
      experienceLevel: text(careerDNA?.experienceLevel, 80),
      experienceYears: text(careerDNA?.experienceDetails?.years, 60),
      projectSummary: text(careerDNA?.projectsExperience, 1000),
      careerObjectives: text(careerDNA?.careerObjectives, 800),
      learningGoals: list(careerDNA?.learningGoals, 15, 220),
      resumeSummary: text(parsedResume.summary, 1000),
      resumeProjects: (parsedResume.projects || []).slice(0, 6).map((project) => ({
        title: text(project.title, 160),
        description: text(project.description, 500),
        technologies: list(project.technologies, 15, 120),
      })),
      resumeExperience: (parsedResume.experience || []).slice(0, 6).map((experience) => ({
        position: text(experience.position, 160),
        highlights: list(experience.highlights, 10, 260),
      })),
    },
    preferences: {
      explanationStyle: text(settings?.aiPersonalization?.explanationStyle || "Detailed", 30),
      preferredLanguage: text(settings?.aiPersonalization?.preferredLanguage || "English", 60),
    },
    sourceAvailability: {
      careerDNA: Boolean(careerDNA),
      resume: Boolean(resume),
      preferences: Boolean(settings),
    },
  };

  const serialized = JSON.stringify(context);
  return {
    context,
    contextHash: crypto.createHash("sha256").update(serialized).digest("hex"),
    sourcesUsed,
    currentSkills,
    desiredDifficulty: context.target.desiredDifficulty,
    sourceIds: {
      careerDNA: careerDNA?._id ? String(careerDNA._id) : null,
      resume: resume?._id ? String(resume._id) : null,
      settings: settings?._id ? String(settings._id) : null,
    },
  };
};

export default { buildInterviewContext };