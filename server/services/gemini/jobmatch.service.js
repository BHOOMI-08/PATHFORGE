import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_PROMPTS } from "../../constants/prompts.js";
import { cleanAndParseJson } from "../../utils/jsonValidator.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Fallback static Job Match evaluator when Gemini API key is missing or fails
 */
const fallbackJobMatch = (resumeData = {}, jobDescription = "", jobTitle = "") => {
  const candidateSkills = resumeData.parsedData?.skills?.technical || [];

  // Match candidate skills against job description text
  const matchingSkills = candidateSkills.filter((skill) =>
    new RegExp(`\\b${skill}\\b`, "i").test(jobDescription)
  );

  const missingSkills = [
    "System Design",
    "Microservices",
    "CI/CD Pipelines",
    "Cloud Operations (AWS/GCP)",
  ].filter((skill) => !candidateSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase())));

  const matchedCount = matchingSkills.length;
  const calculatedScore = Math.min(95, Math.max(55, 60 + matchedCount * 5));

  return {
    matchScore: calculatedScore,
    matchBreakdown: {
      technicalMatch: Math.min(100, calculatedScore + 5),
      experienceMatch: Math.max(50, calculatedScore - 5),
      educationMatch: 85,
    },
    matchingSkills: matchingSkills.length > 0 ? matchingSkills : candidateSkills.slice(0, 5),
    missingSkills,
    recommendations: [
      `Highlight your experience with ${matchingSkills.slice(0, 2).join(" and ") || "key technical skills"} prominently in the resume summary.`,
      `Consider acquiring certifications or adding project demos for missing competencies like ${missingSkills[0] || "cloud deployment"}.`,
      `Tailor bullet points under work experience to incorporate keywords from the target "${jobTitle}" job posting.`,
    ],
  };
};

/**
 * Evaluates candidate resume against target Job Description using Gemini API
 * @param {object} resumeData 
 * @param {string} jobDescription 
 * @param {string} jobTitle 
 * @returns {Promise<object>} Match metrics object
 */
export const evaluateJobMatch = async (resumeData, jobDescription, jobTitle = "Target Role") => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY missing in .env. Using fallback Job Match service.");
    return fallbackJobMatch(resumeData, jobDescription, jobTitle);
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
    const promptTemplate = GEMINI_PROMPTS.JOB_MATCHING || "Evaluate the compatibility of the user's resume data against the target Job Description (JD).";

    const fullPrompt = `${promptTemplate}

Target Role Title: ${jobTitle}

Target Job Description (JD):
${jobDescription}

Candidate Parsed Resume JSON:
${resumeJsonString}

Return ONLY a valid JSON object matching this exact schema:
{
  "matchScore": 82,
  "matchBreakdown": {
    "technicalMatch": 85,
    "experienceMatch": 80,
    "educationMatch": 80
  },
  "matchingSkills": ["string"],
  "missingSkills": ["string"],
  "recommendations": ["string"]
}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    const parsed = cleanAndParseJson(responseText);

    return {
      matchScore: Math.min(100, Math.max(0, Number(parsed.matchScore || 75))),
      matchBreakdown: {
        technicalMatch: Math.min(100, Math.max(0, Number(parsed.matchBreakdown?.technicalMatch || 75))),
        experienceMatch: Math.min(100, Math.max(0, Number(parsed.matchBreakdown?.experienceMatch || 70))),
        educationMatch: Math.min(100, Math.max(0, Number(parsed.matchBreakdown?.educationMatch || 80))),
      },
      matchingSkills: Array.isArray(parsed.matchingSkills) ? parsed.matchingSkills : [],
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    };
  } catch (error) {
    console.error("Gemini Job Match Service Error:", error.message);
    return fallbackJobMatch(resumeData, jobDescription, jobTitle);
  }
};

export default {
  evaluateJobMatch,
};
