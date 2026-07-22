import { GoogleGenerativeAI } from "@google/generative-ai";
import { cleanAndParseJson } from "../../utils/jsonValidator.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Fallback static Career Twin profile when Gemini API key is missing or fails
 */
const fallbackCareerTwin = (userContext = {}) => {
  return {
    currentLevel: "Junior Full Stack MERN Developer",
    careerIdentity: "Emerging Full Stack Engineer & Cloud Optimist",
    careerSummary: "You possess strong backend API fundamentals and React frontend component capabilities. Your primary growth opportunity lies in acquiring cloud containerization (Docker, AWS) and deep system design skills to unlock senior SDE opportunities.",
    strongestSkill: "MERN Stack Architecture & REST API Design",
    weakestSkill: "Cloud Containerization & Distributed Caching",
    topStrengths: [
      "Full-stack MERN component and service development",
      "RESTful API design & JWT security architecture",
      "Clean code organization and schema validation",
    ],
    topWeaknesses: [
      "Docker & Kubernetes container orchestration",
      "AWS Cloud infrastructure deployment",
      "System Design & scalable microservices",
    ],
    potentialRole6Months: "Full Stack Engineer (Mid-Level)",
    potentialRole12Months: "Senior MERN Developer / AI Platform Lead",
    estimatedSalaryRange: "₹8–12 LPA",
    careerReadiness: 82,
    confidenceScore: 91,
    nextMilestone: "Complete Docker containerization and AWS deployment roadmap to unlock Tier-1 SDE roles.",
    riskFactors: [
      "Limited evidence of production cloud deployments in current resume.",
      "Resume bullet points lack quantitative business outcome metrics.",
      "System design exposure needs expansion for senior technical screens.",
    ],
    superpowers: [
      "Fast Learner & Adaptive Developer",
      "Strong Full-Stack Project Builder",
      "Proactive Error Handling & Security Awareness",
    ],
    focusAreas: [
      "Docker Containerization",
      "AWS Cloud Architecture",
      "System Design Practices",
    ],
    motivationalInsight: "You have built a solid foundation across modern web architectures. Stay consistent with your learning roadmap, and you'll be ready for top product-based engineering roles!",
    careerPrediction: "AI Prediction: If your current project iteration and learning consistency continues, you are projected to reach interview readiness for top product SDE roles within 6–8 months.",
  };
};

/**
 * Synthesizes a digital Career Twin profile using Gemini AI by aggregating all user context
 * @param {object} userContext - Aggregated data from CareerDNA, Resume, ATS, JobMatch, Roadmap, Interview
 * @returns {Promise<object>} Structured Career Twin profile JSON
 */
export const generateCareerTwinProfile = async (userContext = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY missing in .env. Using fallback Career Twin service.");
    return fallbackCareerTwin(userContext);
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

    const fullPrompt = `You are PathForge AI's Principal Career Architect. Synthesize a comprehensive digital "Career Twin" profile for the user based on all available project context.

User Aggregated Project Context:
${contextJsonString}

Return ONLY a valid JSON object matching this exact schema:
{
  "currentLevel": "Junior MERN Developer | Mid Full Stack | etc",
  "careerIdentity": "Emerging Full Stack Engineer | Backend Specialist | etc",
  "careerSummary": "Concise 2-3 sentence AI summary of candidate trajectory...",
  "strongestSkill": "string",
  "weakestSkill": "string",
  "topStrengths": ["string"],
  "topWeaknesses": ["string"],
  "potentialRole6Months": "string",
  "potentialRole12Months": "string",
  "estimatedSalaryRange": "₹8–12 LPA | ₹12–18 LPA | etc",
  "careerReadiness": 84,
  "confidenceScore": 92,
  "nextMilestone": "string",
  "riskFactors": ["string"],
  "superpowers": ["string"],
  "focusAreas": ["string"],
  "motivationalInsight": "Personalized encouragement message...",
  "careerPrediction": "AI Prediction statement..."
}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    const parsed = cleanAndParseJson(responseText);

    return {
      currentLevel: parsed.currentLevel || "Full Stack Developer",
      careerIdentity: parsed.careerIdentity || "MERN Stack Engineer",
      careerSummary: parsed.careerSummary || "Strong technical foundation with consistent growth.",
      strongestSkill: parsed.strongestSkill || "Full Stack Web Development",
      weakestSkill: parsed.weakestSkill || "Cloud Architecture",
      topStrengths: Array.isArray(parsed.topStrengths) ? parsed.topStrengths : [],
      topWeaknesses: Array.isArray(parsed.topWeaknesses) ? parsed.topWeaknesses : [],
      potentialRole6Months: parsed.potentialRole6Months || "Full Stack Engineer",
      potentialRole12Months: parsed.potentialRole12Months || "Senior Software Engineer",
      estimatedSalaryRange: parsed.estimatedSalaryRange || "₹8–12 LPA",
      careerReadiness: Math.min(100, Math.max(0, Number(parsed.careerReadiness || 80))),
      confidenceScore: Math.min(100, Math.max(0, Number(parsed.confidenceScore || 90))),
      nextMilestone: parsed.nextMilestone || "Complete cloud deployment roadmap.",
      riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors : [],
      superpowers: Array.isArray(parsed.superpowers) ? parsed.superpowers : [],
      focusAreas: Array.isArray(parsed.focusAreas) ? parsed.focusAreas : [],
      motivationalInsight: parsed.motivationalInsight || "Keep building and learning consistently!",
      careerPrediction: parsed.careerPrediction || "On track for accelerated career growth.",
    };
  } catch (error) {
    console.error("Gemini Career Twin Service Error:", error.message);
    return fallbackCareerTwin(userContext);
  }
};

export default {
  generateCareerTwinProfile,
};
