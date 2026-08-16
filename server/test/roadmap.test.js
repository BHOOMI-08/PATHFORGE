import test from "node:test";
import assert from "node:assert/strict";
import { buildRoadmapContext } from "../services/roadmapContext.service.js";
import { recalculateRoadmapProgress } from "../services/roadmapProgress.service.js";
import {
  roadmapAiResponseSchema,
  roadmapGenerationRequestSchema,
  validateRoadmapAiResponse,
} from "../validators/roadmap.validator.js";
import {
  generateLearningRoadmap,
  normalizeGeneratedRoadmap,
} from "../services/gemini/roadmap.service.js";
import { cleanAndParseJson } from "../utils/jsonValidator.js";

const resource = { title: "Official documentation", url: "https://developer.mozilla.org/en-US/" };
const tasks = (type = "learn") => [
  {
    title: "Complete focused study",
    description: "Study the role-specific concepts and record concise implementation notes.",
    type,
    estimatedHours: 3,
    outcome: "A reviewed set of implementation notes",
    resourceLinks: [resource],
  },
  {
    title: "Apply the concepts",
    description: "Implement a small production-style exercise and validate its behavior.",
    type: type === "learn" ? "practice" : type,
    estimatedHours: 4,
    outcome: "A tested implementation committed to source control",
    resourceLinks: [resource],
  },
];
const project = {
  title: "Role-specific project",
  description: "Build and document a project that demonstrates the required role capabilities.",
  deliverables: ["Source repository", "Deployment and technical write-up"],
};
const validRoadmap = {
  targetRole: "Full Stack Developer",
  totalDurationWeeks: 4,
  weeklyHours: 14,
  difficulty: "Intermediate",
  overallSummary: "A focused plan that closes verified backend gaps while building on existing frontend skills.",
  identifiedSkillGaps: ["TypeScript", "PostgreSQL", "Docker"],
  revisionWeeks: [
    {
      week: 3,
      focus: "Backend integration and capstone weak areas",
      checkpoint: "Repeat the integration acceptance checks without referring to implementation notes.",
    },
  ],
  milestones: [
    {
      title: "Backend foundations",
      description: "Close verified server-side fundamentals without repeating existing frontend topics.",
      type: "foundation",
      difficulty: "Intermediate",
      startWeek: 1,
      endWeek: 1,
      estimatedHours: 10,
      prerequisites: ["JavaScript"],
      checkpoint: "A tested API passes documented acceptance checks.",
      project: null,
      tasks: tasks(),
    },
    {
      title: "Applied integration project",
      description: "Integrate the missing backend capabilities into a working application.",
      type: "project",
      difficulty: "Intermediate",
      startWeek: 2,
      endWeek: 2,
      estimatedHours: 12,
      prerequisites: ["Backend foundations"],
      checkpoint: "The integrated application is reviewed against the job requirements.",
      project,
      tasks: tasks("project"),
    },
    {
      title: "Capstone and revision",
      description: "Build a capstone and revise weak areas using measurable checkpoints.",
      type: "capstone",
      difficulty: "Advanced",
      startWeek: 3,
      endWeek: 3,
      estimatedHours: 14,
      prerequisites: ["Applied integration project"],
      checkpoint: "The capstone is deployed and all revision checks pass.",
      project,
      tasks: tasks("revision"),
    },
    {
      title: "Interview preparation",
      description: "Practice role-specific technical explanations and project walkthroughs.",
      type: "interview",
      difficulty: "Intermediate",
      startWeek: 4,
      endWeek: 4,
      estimatedHours: 8,
      prerequisites: ["Capstone"],
      checkpoint: "A timed mock interview meets the defined evaluation rubric.",
      project: null,
      tasks: tasks("interview"),
    },
  ],
};

test("roadmap context uses all available real sources and removes skills already present", () => {
  const result = buildRoadmapContext({
    user: { name: "Test User" },
    careerDNA: {
      _id: "career",
      technicalSkills: ["React", "Git"],
      targetRoles: ["Full Stack Developer"],
      learningPreferences: { hoursPerDay: 2, learningSpeed: "Fast", learningStyle: "Projects" },
      learningGoals: ["Build production APIs"],
    },
    resume: {
      _id: "resume",
      fileName: "resume.pdf",
      parsedData: {
        summary: "Frontend developer",
        skills: { technical: ["JavaScript", "React.js"], tools: ["Git"] },
        projects: [{ title: "UI", description: "React app", technologies: ["React"] }],
      },
    },
    ats: { _id: "ats", missingKeywords: ["React", "Node.js", "Docker"], recommendations: [] },
    jobMatch: { _id: "job", missingSkills: ["node", "MongoDB"], matchingSkills: ["Git"] },
    settings: { _id: "settings", aiPersonalization: { preferredRoadmapDuration: "8 Weeks" } },
    previousRoadmap: { _id: "old", version: 2, overallProgress: 25, milestones: [] },
    input: { targetRole: "Full Stack Developer", durationWeeks: 8 },
  });

  assert.ok(result.sourcesUsed.includes("resume"));
  assert.ok(result.sourcesUsed.includes("ats"));
  assert.ok(result.sourcesUsed.includes("jobMatch"));
  assert.equal(result.missingSkills.some((skill) => /react/i.test(skill)), false);
  assert.equal(result.missingSkills.some((skill) => /node/i.test(skill)), true);
  assert.equal(Object.values(result.personalizationWeights).reduce((sum, value) => sum + value, 0), 100);
});

test("very large Career DNA is bounded before entering the prompt", () => {
  const huge = "x".repeat(50_000);
  const result = buildRoadmapContext({
    user: { name: "Test" },
    careerDNA: {
      _id: "career",
      targetRoles: ["Machine Learning Engineer"],
      careerObjectives: huge,
      projectsExperience: huge,
      learningGoals: Array.from({ length: 500 }, (_, index) => `Goal ${index} ${huge}`),
    },
    resume: null,
    ats: null,
    jobMatch: null,
    settings: null,
    previousRoadmap: null,
    input: { targetRole: "Machine Learning Engineer", durationWeeks: 12 },
  });
  assert.ok(JSON.stringify(result.context).length < 15_000);
});

test("unrelated Job Match evidence is down-weighted and excluded from deterministic target gaps", () => {
  const result = buildRoadmapContext({
    user: { name: "Test User" },
    careerDNA: {
      _id: "career",
      technicalSkills: ["Python"],
      targetRoles: ["Machine Learning Engineer"],
      learningPreferences: { hoursPerDay: 2 },
    },
    resume: {
      _id: "resume",
      parsedData: { skills: { technical: ["Python"] }, projects: [] },
    },
    ats: { _id: "ats", missingKeywords: ["Docker", "AWS"] },
    jobMatch: {
      _id: "job",
      jobTitle: "Full Stack Developer",
      missingSkills: ["Node.js", "MongoDB"],
    },
    settings: null,
    previousRoadmap: null,
    input: { targetRole: "Machine Learning Engineer", durationWeeks: 12 },
  });

  assert.deepEqual(result.missingSkills, []);
  assert.equal(result.context.jobMatch.relevanceToTarget, "low");
  assert.ok(result.personalizationWeights.jobMatch < result.personalizationWeights.resume);
});
test("strict roadmap schema accepts complete plans and rejects unsafe resources or extra fields", () => {
  assert.equal(validateRoadmapAiResponse(validRoadmap).milestones.length, 4);
  assert.throws(() =>
    roadmapAiResponseSchema.parse({
      ...validRoadmap,
      milestones: validRoadmap.milestones.map((milestone, index) =>
        index
          ? milestone
          : {
              ...milestone,
              tasks: [{ ...milestone.tasks[0], resourceLinks: [{ title: "Bad", url: "http://example.com" }] }, milestone.tasks[1]],
            },
      ),
    }),
  );
  assert.throws(() => validateRoadmapAiResponse({ ...validRoadmap, unexpected: true }));
  assert.throws(() => validateRoadmapAiResponse(cleanAndParseJson("not json")));
});

test("generation request blocks NoSQL objects and invalid ranges", () => {
  assert.equal(
    roadmapGenerationRequestSchema.safeParse({ targetRole: { $ne: "" }, durationWeeks: 8 }).success,
    false,
  );
  assert.equal(
    roadmapGenerationRequestSchema.safeParse({ targetRole: "Developer", durationWeeks: 100 }).success,
    false,
  );
});

test("server normalization owns task identifiers and initial completion state", () => {
  const normalized = normalizeGeneratedRoadmap(validRoadmap, {
    target: { role: "Full Stack Developer", durationWeeks: 4 },
  });
  assert.equal(normalized.milestones[0].milestoneId, "phase-1");
  assert.equal(normalized.milestones[0].tasks[0].taskId, "phase-1-task-1");
  assert.equal(normalized.milestones[0].tasks[0].completed, false);
});

test("progress recalculation persists task and milestone completion accurately", () => {
  const roadmap = {
    milestones: [
      { tasks: [{ completed: true }, { completed: false }] },
      { tasks: [{ completed: false }, { completed: false }] },
    ],
  };
  recalculateRoadmapProgress(roadmap);
  assert.equal(roadmap.overallProgress, 25);
  assert.equal(roadmap.milestones[0].progress, 50);
  assert.deepEqual(roadmap.progress, { completedTasks: 1, totalTasks: 4 });
});

test("missing Gemini configuration returns a provider error and never a fallback roadmap", async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "";
  try {
    await assert.rejects(
      () => generateLearningRoadmap({ context: { target: { role: "Developer", durationWeeks: 8 } } }),
      (error) => error.statusCode === 502 && /not configured/i.test(error.message),
    );
  } finally {
    process.env.GEMINI_API_KEY = originalKey;
  }
});
