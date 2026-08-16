import assert from "node:assert/strict";
import test from "node:test";
import OpportunityRadarScan from "../models/OpportunityRadarScan.model.js";
import { CERTIFICATION_CATALOG, ROLE_PROFILES } from "../constants/opportunityRoles.js";
import {
  buildOpportunityEvidence,
  buildOpportunityRadar,
  calculateEvidenceConfidence,
  fingerprintOpportunitySources,
  normalizeOpportunitySkill,
  prioritizeSkillGaps,
  recommendCertifications,
  recommendProjects,
  scoreOpportunityRole,
} from "../services/opportunityRadar.service.js";

const objectId = (suffix) => ({
  toString: () => `66b8c8e2a7d631b9cc93${suffix}`,
  valueOf: () => `66b8c8e2a7d631b9cc93${suffix}`,
});

const strongMernSources = () => ({
  resume: {
    _id: objectId("c101"),
    versionNumber: 2,
    updatedAt: new Date("2026-08-14T00:00:00Z"),
    parsedData: {
      skills: {
        technical: ["JavaScript", "ReactJS", "Node.js", "REST APIs", "MongoDB", "HTML", "CSS", "TypeScript"],
        tools: ["Git", "Docker"],
        languages: [],
      },
      projects: [{
        title: "PathForge",
        technologies: ["React", "NodeJS", "MongoDB", "Docker"],
      }],
      experience: [],
      education: [{ institution: "Example University", degree: "B.Tech" }],
      certifications: [],
    },
  },
  careerDNA: {
    _id: objectId("c102"),
    updatedAt: new Date("2026-08-14T00:00:00Z"),
    technicalSkills: [],
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    tools: [],
    softSkills: [],
    targetRoles: ["Full Stack Developer"],
    experienceDetails: { years: "0 Years" },
    learningPreferences: { hoursPerDay: 2 },
  },
  ats: null,
  jobMatch: null,
  roadmap: null,
  recruiter: null,
  sourceFingerprint: "fingerprint",
});

test("skill normalization conservatively merges common aliases", () => {
  assert.equal(normalizeOpportunitySkill("React.js"), "react");
  assert.equal(normalizeOpportunitySkill("ReactJS"), "react");
  assert.equal(normalizeOpportunitySkill("NodeJS"), "node.js");
  assert.equal(normalizeOpportunitySkill("Amazon Web Services"), "aws");
  assert.equal(normalizeOpportunitySkill("C++"), "c++");
  assert.notEqual(normalizeOpportunitySkill("C++"), normalizeOpportunitySkill("C"));
});

test("strong MERN evidence favors full-stack and does not report Docker missing", () => {
  const evidence = buildOpportunityEvidence(strongMernSources());
  const fullStack = scoreOpportunityRole(ROLE_PROFILES.find((role) => role.id === "full-stack-developer"), evidence);
  const devops = scoreOpportunityRole(ROLE_PROFILES.find((role) => role.id === "devops-engineer"), evidence);

  assert.ok(fullStack.score >= 75);
  assert.ok(fullStack.score > devops.score);
  assert.equal(fullStack.bucket, "ready_now");
  assert.equal(fullStack.missingSkills.includes("Docker"), false);
});

test("senior roles remain long-term without required experience evidence", () => {
  const evidence = buildOpportunityEvidence(strongMernSources());
  const senior = scoreOpportunityRole(ROLE_PROFILES.find((role) => role.id === "senior-full-stack-developer"), evidence);
  assert.equal(senior.experience.satisfied, false);
  assert.equal(senior.bucket, "long_term");
});

test("evidence confidence rises from sparse to complete profiles", () => {
  const sparse = {
    resumeId: null,
    combinedSkills: new Map([["javascript", "JavaScript"]]),
    projects: [],
    experienceEntries: 0,
    experienceYears: 0,
    educationCount: 0,
    certifications: [],
    targetRoles: [],
    signals: {},
  };
  const strong = buildOpportunityEvidence(strongMernSources());
  assert.ok(calculateEvidenceConfidence(strong).score > calculateEvidenceConfidence(sparse).score);
  assert.equal(calculateEvidenceConfidence(sparse).label, "Limited evidence");
});

test("skill priorities and recommendations originate from actual missing requirements", () => {
  const evidence = buildOpportunityEvidence(strongMernSources());
  const roles = ROLE_PROFILES.map((role) => scoreOpportunityRole(role, evidence)).sort((a, b) => b.score - a.score);
  const gaps = prioritizeSkillGaps(roles);
  assert.equal(gaps.some((gap) => gap.skill === "Docker"), false);

  const projects = recommendProjects(gaps, evidence);
  for (const project of projects) {
    assert.ok(project.targetSkills.length > 0);
    assert.ok(project.targetSkills.every((skill) => gaps.some((gap) => normalizeOpportunitySkill(gap.skill) === normalizeOpportunitySkill(skill))));
  }

  const certifications = recommendCertifications(gaps, evidence);
  const catalogIds = new Set(CERTIFICATION_CATALOG.map((item) => item.id));
  assert.ok(certifications.every((certification) => catalogIds.has(certification.id)));
  assert.ok(certifications.every((certification) => certification.targetSkills.length > 0));
});

test("source fingerprints change when current profile evidence changes", () => {
  const sources = strongMernSources();
  const first = fingerprintOpportunitySources(sources);
  const second = fingerprintOpportunitySources({
    ...sources,
    resume: { ...sources.resume, updatedAt: new Date("2026-08-15T00:00:00Z") },
  });
  assert.notEqual(first, second);
});

test("complete radar uses one scoring source for trajectory and buckets", async () => {
  const priorKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    const result = await buildOpportunityRadar(strongMernSources());
    assert.equal(result.summary.strongestDirection.role, "Full Stack Developer");
    assert.equal(result.summary.metricLabel, "Top-role alignment readiness");
    assert.equal(result.aiEnhancement.affectsScores, false);
    const rolesById = new Map(result.roles.map((role) => [role.id, role]));
    for (const role of [...result.buckets.readyNow, ...result.buckets.almostReady, ...result.buckets.longTerm]) {
      assert.equal(rolesById.get(role.id).score, role.score);
      assert.equal(rolesById.get(role.id).bucket, role.bucket);
    }
    assert.equal(result.skillGaps.some((gap) => gap.skill === "Docker"), false);
  } finally {
    if (priorKey) process.env.GEMINI_API_KEY = priorKey;
  }
});

test("empty evidence refuses to generate a fake radar", async () => {
  await assert.rejects(
    () => buildOpportunityRadar({
      resume: null,
      careerDNA: null,
      ats: null,
      jobMatch: null,
      roadmap: null,
      recruiter: null,
      sourceFingerprint: "empty",
    }),
    (error) => error.statusCode === 422,
  );
});

test("scan schema enforces per-user request idempotency and latest-scan lookup", () => {
  const indexes = OpportunityRadarScan.schema.indexes();
  assert.ok(indexes.some(([fields, options]) => fields.user === 1 && fields.requestId === 1 && options.unique));
  assert.ok(indexes.some(([fields]) => fields.user === 1 && fields.generatedAt === -1));
});
