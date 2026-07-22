import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_PROMPTS } from "../../constants/prompts.js";
import { cleanAndParseJson, validateATSResult } from "../../utils/jsonValidator.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Fallback static ATS analysis evaluation when API key is unavailable or request fails
 * @param {object} resumeData 
 * @returns {object} Normalized ATS analysis payload
 */
const fallbackATSParser = (resumeData = {}) => {
  const technicalSkills = resumeData.parsedData?.skills?.technical || [];
  const experience = resumeData.parsedData?.experience || [];
  const contact = resumeData.parsedData?.contactInfo || {};

  const missingKeywords = [
    "CI/CD Pipelines",
    "Unit Testing",
    "Cloud Architecture (AWS/GCP)",
    "System Design",
    "Performance Optimization",
  ].filter((kw) => !technicalSkills.some((s) => s.toLowerCase().includes(kw.toLowerCase())));

  const formattingAdvice = [];
  if (!contact.linkedin) formattingAdvice.push("Add a direct LinkedIn profile link to improve recruiter contact scores.");
  if (!contact.github) formattingAdvice.push("Include a GitHub profile link demonstrating active project repositories.");
  if (experience.length === 0) formattingAdvice.push("Expand relevant work experience or internship details.");

  return validateATSResult({
    atsScore: 72,
    breakdown: {
      formattingScore: 80,
      contentScore: 75,
      keywordScore: 65,
      impactScore: 68,
    },
    missingKeywords,
    parsingFailures: [],
    formattingAdvice,
    skillGapAdvice: [
      "Incorporate measurable outcomes (e.g. 'Improved API performance by 30%') in project highlights.",
      "List modern containerization and orchestration tools like Docker or Kubernetes.",
    ],
    actionItems: [
      {
        category: "impact",
        priority: "high",
        title: "Quantify Accomplishments",
        description: "Replace generic job descriptions with bullet points containing clear metrics and business results.",
      },
      {
        category: "keywords",
        priority: "high",
        title: "Add Core Technical Keywords",
        description: `Consider integrating missing industry terms such as: ${missingKeywords.slice(0, 3).join(", ")}.`,
      },
      {
        category: "formatting",
        priority: "medium",
        title: "Standardize Section Headings",
        description: "Ensure conventional headings like 'Work Experience', 'Technical Skills', and 'Education' are used.",
      },
    ],
  });
};

/**
 * Evaluates parsed resume JSON against industry ATS guidelines using Gemini API
 * @param {object} resumeData - Structured resume database object
 * @returns {Promise<object>} ATS analysis output validated against standard schema
 */
export const evaluateResumeATS = async (resumeData) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY missing in .env. Using fallback ATS evaluation handler.");
    return fallbackATSParser(resumeData);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const resumeJsonString = JSON.stringify(resumeData.parsedData || resumeData, null, 2);
    const promptTemplate = GEMINI_PROMPTS.ATS_ANALYSIS || "Analyze the parsed resume JSON data and compute an ATS score, formatting warnings, missing keywords, and general restructuring suggestions.";

    const fullPrompt = `${promptTemplate}

Target Structured Resume JSON:
${resumeJsonString}

Return ONLY a valid JSON object matching this exact schema:
{
  "atsScore": 85,
  "breakdown": {
    "formattingScore": 88,
    "contentScore": 82,
    "keywordScore": 80,
    "impactScore": 90
  },
  "missingKeywords": ["string"],
  "parsingFailures": ["string"],
  "formattingAdvice": ["string"],
  "skillGapAdvice": ["string"],
  "actionItems": [
    {
      "category": "formatting | skills | impact | general",
      "priority": "high | medium | low",
      "title": "string",
      "description": "string"
    }
  ]
}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    const rawParsed = cleanAndParseJson(responseText);

    return validateATSResult(rawParsed);
  } catch (error) {
    console.error("Gemini ATS Service Error:", error.message);
    return fallbackATSParser(resumeData);
  }
};

export default {
  evaluateResumeATS,
};
