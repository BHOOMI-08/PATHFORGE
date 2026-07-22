import { GoogleGenerativeAI } from "@google/generative-ai";
import { cleanAndParseJson } from "../../utils/jsonValidator.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Fallback static Opportunity Radar when Gemini API key is missing or fails
 */
const fallbackOpportunityRadar = (userContext = {}) => {
  return {
    readyRoles: [
      "Backend Developer Intern",
      "MERN Stack Intern",
      "Junior Node.js Developer",
      "Frontend React Intern",
    ],
    nearReadyRoles: [
      {
        role: "Full Stack Engineer (SDE I)",
        readiness: 82,
        missing: ["Docker Containerization", "AWS ECS Deployment"],
        timeline: "2 Months",
      },
      {
        role: "Junior Software Development Engineer",
        readiness: 76,
        missing: ["Distributed Caching (Redis)", "CI/CD Pipelines"],
        timeline: "3 Months",
      },
    ],
    futureRoles: [
      {
        role: "Senior Software Engineer (Google L4 / Meta E4)",
        readiness: 42,
        why: "Requires 3+ years production experience, large-scale microservices architecture, and deep System Design.",
        timeline: "12+ Months",
      },
      {
        role: "Cloud & Solutions Architect",
        readiness: 35,
        why: "Requires extensive enterprise cloud infrastructure management (AWS/GCP) and multi-region failover design.",
        timeline: "18+ Months",
      },
    ],
    careerDirection: "Based on your current strengths and project portfolio, Backend & MERN Stack Development is your strongest career direction.",
    roleReadiness: [
      { role: "Backend Developer Intern", percentage: 95 },
      { role: "Full Stack Engineer", percentage: 82 },
      { role: "Software Engineer", percentage: 76 },
      { role: "Cloud Engineer", percentage: 40 },
      { role: "Machine Learning Engineer", percentage: 28 },
    ],
    overallReadiness: 84,
    topSkillGaps: [
      { skill: "Docker Containerization", priority: "High" },
      { skill: "AWS Cloud Deployment", priority: "High" },
      { skill: "Redis Distributed Caching", priority: "Medium" },
      { skill: "System Design Patterns", priority: "Medium" },
      { skill: "CI/CD Pipeline Automation", priority: "Low" },
    ],
    prioritySkills: ["Docker", "AWS", "Redis", "System Design"],
    recommendedProjects: [
      "Build a Dockerized Microservices Backend with Redis Caching and JWT Auth",
      "Deploy a Scalable Node.js API on AWS ECS using GitHub Actions CI/CD",
      "Construct a Distributed Rate Limiter and Task Queue with RabbitMQ/Redis",
    ],
    recommendedCertifications: [
      "AWS Certified Cloud Practitioner",
      "Docker Foundations Professional Certificate",
      "MongoDB Certified Associate Developer",
    ],
    careerAdvice: "You are already competitive for Backend Internship roles today. Acquiring Docker and AWS skills will significantly increase your eligibility for Full Stack SDE positions at top product companies.",
    estimatedTimeline: "2-4 Months to Full Stack SDE Readiness",
    confidence: 92,
  };
};

/**
 * Generates an AI Opportunity Radar profile using Gemini AI by analyzing user context
 * @param {object} userContext - Aggregated data from CareerDNA, Resume, ATS, JobMatch, Roadmap, Interview
 * @returns {Promise<object>} Structured Opportunity Radar JSON
 */
export const generateOpportunityRadarProfile = async (userContext = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY missing in .env. Using fallback Opportunity Radar service.");
    return fallbackOpportunityRadar(userContext);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const contextJsonString = JSON.stringify(userContext, null, 2);

    const fullPrompt = `You are PathForge AI's Strategic Career Opportunity Intelligence Engine.
Analyze the user's aggregated career context and predict candidate role eligibility across 3 tiers (Ready Now, Almost Ready, Long-Term Goals), role readiness percentages, skill gaps with priorities, recommended projects, certifications, and strategic career advice.
NOTE: Do NOT require any job description. Proactively analyze the candidate's data.

User Context:
${contextJsonString}

Return ONLY a valid JSON object matching this exact schema:
{
  "readyRoles": ["string"],
  "nearReadyRoles": [
    {
      "role": "string",
      "readiness": 82,
      "missing": ["string"],
      "timeline": "2 Months"
    }
  ],
  "futureRoles": [
    {
      "role": "string",
      "readiness": 42,
      "why": "string",
      "timeline": "12+ Months"
    }
  ],
  "careerDirection": "string",
  "roleReadiness": [
    {
      "role": "string",
      "percentage": 95
    }
  ],
  "overallReadiness": 84,
  "topSkillGaps": [
    {
      "skill": "string",
      "priority": "High | Medium | Low"
    }
  ],
  "prioritySkills": ["string"],
  "recommendedProjects": ["string"],
  "recommendedCertifications": ["string"],
  "careerAdvice": "string",
  "estimatedTimeline": "string",
  "confidence": 92
}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    const parsed = cleanAndParseJson(responseText);

    return {
      readyRoles: Array.isArray(parsed.readyRoles) ? parsed.readyRoles : [],
      nearReadyRoles: Array.isArray(parsed.nearReadyRoles) ? parsed.nearReadyRoles : [],
      futureRoles: Array.isArray(parsed.futureRoles) ? parsed.futureRoles : [],
      careerDirection: parsed.careerDirection || "Backend Development is your strongest career direction.",
      roleReadiness: Array.isArray(parsed.roleReadiness) ? parsed.roleReadiness : [],
      overallReadiness: Math.min(100, Math.max(0, Number(parsed.overallReadiness || 80))),
      topSkillGaps: Array.isArray(parsed.topSkillGaps) ? parsed.topSkillGaps : [],
      prioritySkills: Array.isArray(parsed.prioritySkills) ? parsed.prioritySkills : [],
      recommendedProjects: Array.isArray(parsed.recommendedProjects) ? parsed.recommendedProjects : [],
      recommendedCertifications: Array.isArray(parsed.recommendedCertifications) ? parsed.recommendedCertifications : [],
      careerAdvice: parsed.careerAdvice || "Focus on cloud deployment to expand your role eligibility.",
      estimatedTimeline: parsed.estimatedTimeline || "2-4 Months to Full Stack Readiness",
      confidence: Math.min(100, Math.max(0, Number(parsed.confidence || 90))),
    };
  } catch (error) {
    console.error("Gemini Opportunity Radar Service Error:", error.message);
    return fallbackOpportunityRadar(userContext);
  }
};

export default {
  generateOpportunityRadarProfile,
};
