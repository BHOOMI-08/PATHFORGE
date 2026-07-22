import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_PROMPTS } from "../../constants/prompts.js";
import { cleanAndParseJson } from "../../utils/jsonValidator.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Fallback learning roadmap generator when Gemini API key is missing or fails
 */
const fallbackRoadmap = (targetRole = "Full Stack Engineer", durationWeeks = 6) => {
  return {
    targetRole,
    totalDurationWeeks: durationWeeks,
    milestones: [
      {
        title: "Phase 1: Core Fundamentals & Stack Optimization",
        description: "Master modern ECMAScript, TypeScript fundamentals, and React 19 component patterns.",
        durationWeeks: 2,
        weekNumber: 1,
        tasks: [
          {
            taskId: "task-1-1",
            title: "Advanced React 19 State & Custom Hooks",
            description: "Build custom reusable hooks for async data fetching, global state, and persistent storage.",
            completed: false,
            resourceLinks: [{ title: "React Official Docs", url: "https://react.dev" }],
          },
          {
            taskId: "task-1-2",
            title: "TypeScript Strict Mode Integration",
            description: "Refactor dynamic objects to strict interface definitions and generics.",
            completed: false,
            resourceLinks: [{ title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/" }],
          },
        ],
      },
      {
        title: "Phase 2: Backend Microservices & API Architecture",
        description: "Design RESTful APIs, JWT refresh token mechanisms, and MongoDB indexing strategies.",
        durationWeeks: 2,
        weekNumber: 2,
        tasks: [
          {
            taskId: "task-2-1",
            title: "Express Middleware & Rate Limiting",
            description: "Implement security headers (Helmet), CORS policies, and rate limiters.",
            completed: false,
            resourceLinks: [{ title: "Express Security Practices", url: "https://expressjs.com/en/advanced/best-practice-security.html" }],
          },
          {
            taskId: "task-2-2",
            title: "MongoDB Schema & Aggregation Pipelines",
            description: "Optimize Mongoose queries with compound indexes and $lookup aggregations.",
            completed: false,
            resourceLinks: [{ title: "MongoDB Aggregations", url: "https://www.mongodb.com/docs/manual/aggregation/" }],
          },
        ],
      },
      {
        title: "Phase 3: Cloud Deployment & System Architecture",
        description: "Containerize applications with Docker, set up CI/CD pipelines, and configure production hosting.",
        durationWeeks: 2,
        weekNumber: 3,
        tasks: [
          {
            taskId: "task-3-1",
            title: "Dockerization & Multi-stage Builds",
            description: "Create lightweight Dockerfiles for frontend Vite build and backend Node runtime.",
            completed: false,
            resourceLinks: [{ title: "Docker Docs", url: "https://docs.docker.com/" }],
          },
          {
            taskId: "task-3-2",
            title: "System Design & Caching Patterns",
            description: "Integrate Redis caching layer and design scalability mechanisms.",
            completed: false,
            resourceLinks: [{ title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" }],
          },
        ],
      },
    ],
  };
};

/**
 * Generate structured, phased learning roadmap using Gemini API
 * @param {object} params - { targetRole, skillGaps, durationWeeks, userSkills }
 * @returns {Promise<object>} Structured roadmap payload
 */
export const generateLearningRoadmap = async ({
  targetRole = "Full Stack Developer",
  skillGaps = [],
  durationWeeks = 6,
  userSkills = [],
}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY missing in .env. Using fallback learning roadmap generator.");
    return fallbackRoadmap(targetRole, durationWeeks);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const promptTemplate = GEMINI_PROMPTS.LEARNING_ROADMAP || "Generate a structured, phased learning roadmap and weekly goals based on candidate skills and skill gaps.";

    const fullPrompt = `${promptTemplate}

Target Role: ${targetRole}
Target Timeline Duration: ${durationWeeks} Weeks
Known Candidate Skills: ${userSkills.join(", ") || "General Full Stack"}
Identified Skill Gaps to Address: ${skillGaps.join(", ") || "Cloud Architecture, System Design, CI/CD"}

Return ONLY a valid JSON object matching this exact schema:
{
  "targetRole": "${targetRole}",
  "totalDurationWeeks": ${durationWeeks},
  "milestones": [
    {
      "title": "Phase Title",
      "description": "Short phase goal summary",
      "durationWeeks": 2,
      "weekNumber": 1,
      "tasks": [
        {
          "taskId": "task-1-1",
          "title": "Specific Task Name",
          "description": "Clear actionable instruction",
          "completed": false,
          "resourceLinks": [
            {
              "title": "Documentation Name",
              "url": "https://example.com"
            }
          ]
        }
      ]
    }
  ]
}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    const parsed = cleanAndParseJson(responseText);

    // Ensure task IDs exist
    if (Array.isArray(parsed.milestones)) {
      parsed.milestones.forEach((m, mIdx) => {
        if (Array.isArray(m.tasks)) {
          m.tasks.forEach((t, tIdx) => {
            if (!t.taskId) t.taskId = `task-${mIdx + 1}-${tIdx + 1}`;
            t.completed = false;
          });
        }
      });
    }

    return {
      targetRole: parsed.targetRole || targetRole,
      totalDurationWeeks: Number(parsed.totalDurationWeeks || durationWeeks),
      milestones: Array.isArray(parsed.milestones) ? parsed.milestones : fallbackRoadmap(targetRole, durationWeeks).milestones,
    };
  } catch (error) {
    console.error("Gemini Roadmap Service Error:", error.message);
    return fallbackRoadmap(targetRole, durationWeeks);
  }
};

export default {
  generateLearningRoadmap,
};
