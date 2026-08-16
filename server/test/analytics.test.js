import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCompetencyRadar,
  buildWeeklyGoals,
  calculateCareerReadiness,
  clampScore,
  summarizeRoadmap,
} from "../services/analytics.service.js";

test("analytics scores clamp malformed and out-of-range values", () => {
  assert.equal(clampScore(-10), 0);
  assert.equal(clampScore(121), 100);
  assert.equal(clampScore("72.6"), 73);
  assert.equal(clampScore("not-a-number"), 0);
});

test("career readiness normalizes only across completed components and reports coverage", () => {
  const partial = calculateCareerReadiness({ ats: 80, recruiter: 60 });
  assert.equal(partial.coverage, 45);
  assert.equal(partial.score, 73);
  assert.equal(partial.components.find((item) => item.key === "interview").score, null);

  const empty = calculateCareerReadiness({});
  assert.equal(empty.score, null);
  assert.equal(empty.coverage, 0);
});

test("roadmap progress is recalculated from task completion instead of trusting stale totals", () => {
  const roadmap = {
    overallProgress: 99,
    milestones: [
      { startWeek: 1, tasks: [{ completed: true }, { completed: false }] },
      { startWeek: 2, tasks: [{ completed: true }] },
    ],
  };
  assert.deepEqual(summarizeRoadmap(roadmap), {
    exists: true,
    progress: 67,
    completedTasks: 2,
    totalTasks: 3,
    completedMilestones: 1,
    totalMilestones: 2,
  });
  assert.equal(summarizeRoadmap(null).progress, null);
});

test("weekly goals are real roadmap tasks grouped by milestone start week", () => {
  const goals = buildWeeklyGoals({
    milestones: [
      { startWeek: 2, tasks: [{ completed: true }, { completed: false }] },
      { startWeek: 1, tasks: [{ completed: true }] },
      { startWeek: 2, tasks: [{ completed: true }] },
    ],
  });
  assert.deepEqual(goals, [
    { week: 1, label: "Week 1", target: 1, completed: 1 },
    { week: 2, label: "Week 2", target: 3, completed: 2 },
  ]);
  assert.deepEqual(buildWeeklyGoals(null), []);
});

test("competency radar contains only available database-backed dimensions", () => {
  const radar = buildCompetencyRadar(
    { breakdown: { keywordScore: 70, formattingScore: 80, contentScore: 60, impactScore: 50 } },
    null,
  );
  assert.equal(radar.length, 4);
  assert.equal(radar.find((item) => item.key === "technicalStack").score, 70);
  assert.equal(radar.some((item) => item.key === "experience"), false);
  assert.deepEqual(buildCompetencyRadar(null, null), []);
});
