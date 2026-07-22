import { GoogleGenerativeAI } from "@google/generative-ai";
import { cleanAndParseJson } from "../../utils/jsonValidator.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Fallback static AI CEO Mode plan when Gemini API key is missing or fails
 */
const fallbackCEOModePlan = (targetRole = "Google SDE", userContext = {}) => {
  return {
    targetRole,
    currentPosition: "Junior Full Stack MERN Developer",
    careerGapSummary: `You have strong MERN stack fundamentals, but closing the gap for ${targetRole} requires mastering Data Structures & Algorithms, System Design at scale, and Cloud Infrastructure (AWS/Docker).`,
    estimatedTimeline: "6 Months",
    probabilityOfSuccess: 81,
    careerReadiness: 78,
    prioritySkills: [
      "Data Structures & Algorithms (Trees, Graphs, DP)",
      "Distributed System Design (Caching, Sharding, Load Balancing)",
      "Docker Containerization & Kubernetes Orchestration",
      "AWS Infrastructure & Microservices Architecture",
    ],
    recommendedProjects: [
      "Build a High-Concurrency Distributed Rate Limiter & Message Queue using Redis and Node.js",
      "Deploy a Dockerized Microservices SaaS on AWS ECS with Automated CI/CD Pipelines",
      "Construct a Scalable Real-Time Analytics Engine using Kafka/RabbitMQ and WebSockets",
    ],
    resumeImprovements: [
      "Quantify project impact metrics (e.g. 'Reduced API response times by 42% using Redis caching')",
      "Explicitly highlight microservices architecture and cloud deployment badges",
      "Emphasize unit test coverage and automated CI/CD pipeline integration",
    ],
    interviewPreparation: [
      "DSA Topics: Graphs (BFS/DFS), Dynamic Programming, Binary Trees, Sliding Window",
      "System Design Topics: Load Balancers, Consistent Hashing, DB Sharding, CDN Caching",
      "Behavioral Topics: Google/Amazon Leadership Scenarios, Conflict Resolution, Ownership",
      "Technical Deep-Dive: Node.js Event Loop, Mongo Indexing, JWT Token Rotation",
    ],
    learningPlan: [
      "Month 1: DSA Core & System Design Fundamentals",
      "Month 2: Microservices & Cloud Infrastructure",
      "Month 3: Mock Interview Sprints & Optimization",
      "Month 4: Target Company Application Campaign",
    ],
    weeklyExecutionPlan: [
      { week: "Week 1", focus: "DSA Sprints: Graph Algorithms (BFS/DFS) & Dynamic Programming" },
      { week: "Week 2", focus: "System Design: Caching Patterns, Rate Limiting & Load Balancing" },
      { week: "Week 3", focus: "Docker Containerization & Multi-Container Docker Compose Setup" },
      { week: "Week 4", focus: "AWS Cloud Deployment (ECS/Fargate) & GitHub Actions CI/CD" },
    ],
    monthlyMilestones: [
      { month: "Month 1", goal: "Complete LeetCode Top 75 DSA Patterns & System Design Basics" },
      { month: "Month 2", goal: "Deploy Cloud Microservices Project live on AWS" },
      { month: "Month 3", goal: "Complete 5+ AI Mock Interviews reaching 85%+ score" },
      { month: "Month 4", goal: "Apply to Tier-1 Target Product Companies with optimized resume" },
    ],
    recommendedCertifications: [
      "AWS Certified Solutions Architect Associate",
      "Google Cloud Digital Leader",
      "Docker Foundations Professional Certificate",
    ],
    careerRisks: [
      "Limited evidence of high-concurrency production deployments in current portfolio.",
      "Resume bullet points lack quantitative business outcome metrics.",
      "System Design exposure needs expansion for senior technical screens.",
    ],
    careerAdvantages: [
      "Solid full-stack JavaScript and REST API architectural foundation.",
      "High learning velocity and consistent project iteration frequency.",
      "Strong problem-solving mindset with active roadmap progress.",
    ],
    dailyHabits: [
      "1 Hour: DSA Problem Solving (Focus on Medium/Hard LeetCode Patterns)",
      "2 Hours: Cloud & Microservices Project Building",
      "30 Mins: System Design Architecture Reading / High-Scalability Case Studies",
      "15 Mins: Review Tech Articles & Engineering Blogs",
    ],
    motivationalInsight: `You have built a solid baseline across modern web engineering. Consistently executing this CEO plan will make you competitive for ${targetRole} positions!`,
    finalCEOAdvice: `AI Executive Strategic Advice: If you consistently execute this 4-week sprint, master DSA patterns, and deploy your microservices project on AWS, you have an 81% probability of reaching interview readiness for ${targetRole} within 6 months.`,
  };
};

/**
 * Generates an executive AI CEO Mode plan using Gemini AI
 * @param {string} targetRole 
 * @param {object} userContext 
 * @returns {Promise<object>} Structured AI CEO Mode JSON
 */
export const generateCEOModePlan = async (targetRole = "Google SDE", userContext = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY missing in .env. Using fallback AI CEO Mode service.");
    return fallbackCEOModePlan(targetRole, userContext);
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

    const fullPrompt = `You are PathForge AI's Chief Executive Officer of Career Strategy.
The user wants to achieve their dream role: "${targetRole}".
Analyze their aggregated context and synthesize a 13-section executive strategic execution roadmap.

User Context:
${contextJsonString}

Return ONLY a valid JSON object matching this exact schema:
{
  "targetRole": "${targetRole}",
  "currentPosition": "string",
  "careerGapSummary": "string",
  "estimatedTimeline": "6 Months",
  "probabilityOfSuccess": 81,
  "careerReadiness": 78,
  "prioritySkills": ["string"],
  "recommendedProjects": ["string"],
  "resumeImprovements": ["string"],
  "interviewPreparation": ["string"],
  "learningPlan": ["string"],
  "weeklyExecutionPlan": [
    {
      "week": "Week 1",
      "focus": "string"
    }
  ],
  "monthlyMilestones": [
    {
      "month": "Month 1",
      "goal": "string"
    }
  ],
  "recommendedCertifications": ["string"],
  "careerRisks": ["string"],
  "careerAdvantages": ["string"],
  "dailyHabits": ["string"],
  "motivationalInsight": "string",
  "finalCEOAdvice": "string"
}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    const parsed = cleanAndParseJson(responseText);

    return {
      targetRole: parsed.targetRole || targetRole,
      currentPosition: parsed.currentPosition || "Junior Full Stack Developer",
      careerGapSummary: parsed.careerGapSummary || "Closing skill gaps in System Design and Cloud infrastructure.",
      estimatedTimeline: parsed.estimatedTimeline || "6 Months",
      probabilityOfSuccess: Math.min(100, Math.max(0, Number(parsed.probabilityOfSuccess || 80))),
      careerReadiness: Math.min(100, Math.max(0, Number(parsed.careerReadiness || 75))),
      prioritySkills: Array.isArray(parsed.prioritySkills) ? parsed.prioritySkills : [],
      recommendedProjects: Array.isArray(parsed.recommendedProjects) ? parsed.recommendedProjects : [],
      resumeImprovements: Array.isArray(parsed.resumeImprovements) ? parsed.resumeImprovements : [],
      interviewPreparation: Array.isArray(parsed.interviewPreparation) ? parsed.interviewPreparation : [],
      learningPlan: Array.isArray(parsed.learningPlan) ? parsed.learningPlan : [],
      weeklyExecutionPlan: Array.isArray(parsed.weeklyExecutionPlan) ? parsed.weeklyExecutionPlan : [],
      monthlyMilestones: Array.isArray(parsed.monthlyMilestones) ? parsed.monthlyMilestones : [],
      recommendedCertifications: Array.isArray(parsed.recommendedCertifications) ? parsed.recommendedCertifications : [],
      careerRisks: Array.isArray(parsed.careerRisks) ? parsed.careerRisks : [],
      careerAdvantages: Array.isArray(parsed.careerAdvantages) ? parsed.careerAdvantages : [],
      dailyHabits: Array.isArray(parsed.dailyHabits) ? parsed.dailyHabits : [],
      motivationalInsight: parsed.motivationalInsight || "Stay committed to daily execution!",
      finalCEOAdvice: parsed.finalCEOAdvice || "Consistent execution will unlock your target career role.",
    };
  } catch (error) {
    console.error("Gemini CEO Mode Service Error:", error.message);
    return fallbackCEOModePlan(targetRole, userContext);
  }
};

export default {
  generateCEOModePlan,
};
