import assert from "node:assert/strict";
import test from "node:test";
import Interview from "../models/Interview.model.js";
import Resume from "../models/Resume.model.js";
import {
  buildEvolutionBadges,
  calculateAtsDelta,
  clampPercentage,
  compareResumeSnapshots,
  getResumeSkills,
  normalizeSkill,
} from "../services/resumeEvolution.service.js";

test("percentage normalization preserves missing values and clamps malformed ranges", () => {
  assert.equal(clampPercentage(null), null);
  assert.equal(clampPercentage(undefined), null);
  assert.equal(clampPercentage(""), null);
  assert.equal(clampPercentage("invalid"), null);
  assert.equal(clampPercentage(-8), 0);
  assert.equal(clampPercentage(108), 100);
  assert.equal(clampPercentage(71.6), 72);
});

test("ATS delta is unavailable when either linked resume score is missing", () => {
  assert.equal(calculateAtsDelta(70, null), null);
  assert.equal(calculateAtsDelta(null, 82), null);
  assert.equal(calculateAtsDelta(70, 82), 12);
  assert.equal(calculateAtsDelta(80, 74), -6);
  assert.equal(calculateAtsDelta(70, 70), 0);
});

test("skill normalization deduplicates safe React and Node variants without merging C++", () => {
  assert.equal(normalizeSkill(" React.js "), "react");
  assert.equal(normalizeSkill("ReactJS"), "react");
  assert.equal(normalizeSkill("NodeJS"), "node.js");
  assert.equal(normalizeSkill("C++"), "c++");
  assert.equal(normalizeSkill("C"), "c");

  const skills = getResumeSkills({
    skills: { technical: ["React.js", "react", "C++", "C"], tools: ["NodeJS"], languages: [] },
  });
  assert.deepEqual([...skills.values()], ["React.js", "C++", "C", "NodeJS"]);
});

test("one resume compared with itself reports no evolution", () => {
  const snapshot = {
    skills: { technical: ["React"], tools: ["Git"], languages: [] },
    projects: [{ title: "PathForge" }],
    certifications: [{ name: "AWS", issuer: "Amazon" }],
    experience: [{ company: "Acme", position: "Engineer", startDate: "2024", endDate: "" }],
  };
  const comparison = compareResumeSnapshots(snapshot, snapshot);
  assert.deepEqual(comparison.addedSkills, []);
  assert.deepEqual(comparison.addedProjects, []);
  assert.deepEqual(comparison.addedCertifications, []);
  assert.deepEqual(comparison.addedExperience, []);
});

test("snapshot comparison returns exact new skills, projects, certifications, and experience", () => {
  const baseline = {
    skills: { technical: ["React.js"], tools: ["Git"], languages: [] },
    projects: [{ title: "PathForge" }],
    certifications: [],
    experience: [],
  };
  const latest = {
    skills: { technical: ["ReactJS", "Docker", "Redis"], tools: ["Git"], languages: [] },
    projects: [{ title: "PathForge" }, { title: "ClassIQ" }],
    certifications: [{ name: "Cloud Practitioner", issuer: "AWS" }],
    experience: [{ company: "Acme", position: "Engineer", startDate: "2025", endDate: "" }],
  };
  const comparison = compareResumeSnapshots(baseline, latest);
  assert.deepEqual(comparison.addedSkills, ["Docker", "Redis"]);
  assert.deepEqual(comparison.addedProjects.map((project) => project.title), ["ClassIQ"]);
  assert.equal(comparison.addedCertifications.length, 1);
  assert.equal(comparison.addedExperience.length, 1);
});

test("all badge rules use explicit real-data thresholds", () => {
  const badges = buildEvolutionBadges({
    versionCount: 3,
    atsDelta: 15,
    atsScores: [70, 91],
    interviewScores: [85],
    roadmap: { total: 10, completed: 4, percent: 40 },
  });
  assert.equal(badges.every((badge) => badge.unlocked), true);

  const locked = buildEvolutionBadges({
    versionCount: 2,
    atsDelta: null,
    atsScores: [],
    interviewScores: [],
    roadmap: { total: 0, completed: 0, percent: 0 },
  });
  assert.equal(locked.every((badge) => !badge.unlocked), true);
});

test("resume and interview schemas expose stable version and resume relationships", () => {
  assert.ok(Resume.schema.path("versionNumber"));
  assert.ok(Interview.schema.path("resume"));
  assert.ok(Resume.schema.indexes().some(([fields]) => fields.user === 1 && fields.versionNumber === 1));
  assert.ok(Interview.schema.indexes().some(([fields]) => fields.user === 1 && fields.resume === 1));
});
