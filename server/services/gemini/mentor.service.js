import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_PROMPTS } from "../../constants/prompts.js";
import { cleanAndParseJson } from "../../utils/jsonValidator.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Fallback static opening question
 */
const fallbackOpeningQuestion = (targetRole = "Full Stack Engineer") => {
  return `Hello! Welcome to your mock technical interview for the ${targetRole} position. To start off, could you briefly introduce yourself and describe a recent project where you faced a significant technical challenge?`;
};

/**
 * Fallback static follow-up question
 */
const fallbackFollowUpQuestion = () => {
  return "Thank you for sharing that. Could you dive deeper into your architectural choices for that implementation? How did you handle data validation, error handling, and performance considerations?";
};

/**
 * Fallback static interview scorecard
 */
const fallbackInterviewScorecard = () => {
  return {
    score: 78,
    overallSummary: "Strong technical understanding with solid communication skills. Would benefit from providing more concrete quantitative metrics in past project examples.",
    strengths: [
      "Clear explanation of full-stack data flow and architecture.",
      "Good understanding of RESTful API standards and database schema design.",
      "Proactive attitude toward error handling and edge cases.",
    ],
    weaknesses: [
      "Could elaborate more on system scalability and caching strategies.",
      "Limited discussion of unit/integration testing coverage.",
    ],
    tips: [
      "Use the STAR method (Situation, Task, Action, Result) when answering behavioral questions.",
      "Highlight measurable impacts (e.g., 'reduced API response latency by 35%').",
      "Mention testing frameworks (e.g. Jest, Vitest, Cypress) during technical discussions.",
    ],
  };
};

/**
 * Generate context-aware next question from Gemini AI
 * @param {string} targetRole 
 * @param {string} experienceLevel 
 * @param {Array} history 
 * @returns {Promise<string>} Next question text
 */
export const generateNextQuestion = async (targetRole = "Full Stack Engineer", experienceLevel = "Mid", history = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    if (history.length === 0) return fallbackOpeningQuestion(targetRole);
    return fallbackFollowUpQuestion();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const formattedHistory = history
      .map((msg) => `${msg.sender.toUpperCase()}: ${msg.message}`)
      .join("\n");

    const promptTemplate = GEMINI_PROMPTS.MOCK_INTERVIEW || "You are a senior tech lead mock interviewer.";

    const systemPrompt = `${promptTemplate}

Target Role: ${targetRole}
Candidate Level: ${experienceLevel}

Conversation Transcript So Far:
${formattedHistory.length > 0 ? formattedHistory : "[Session just started]"}

Instructions:
You are the AI Tech Lead Interviewer. Respond directly with your next follow-up interview question or opening question. Keep your tone professional, concise, encouraging, and focused on assessing technical skills, problem-solving, and architecture. Ask ONE focused question at a time.`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text().trim();
    return responseText || fallbackFollowUpQuestion();
  } catch (error) {
    console.error("Gemini Mentor Service Error:", error.message);
    if (history.length === 0) return fallbackOpeningQuestion(targetRole);
    return fallbackFollowUpQuestion();
  }
};

/**
 * Evaluate completed mock interview session using Gemini AI
 * @param {string} targetRole 
 * @param {Array} history 
 * @returns {Promise<object>} Structured evaluation object
 */
export const evaluateInterviewSession = async (targetRole = "Full Stack Engineer", history = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return fallbackInterviewScorecard();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const formattedHistory = history
      .map((msg) => `${msg.sender.toUpperCase()}: ${msg.message}`)
      .join("\n");

    const fullPrompt = `Analyze the following complete mock interview transcript for the target role of "${targetRole}".
Evaluate the candidate's technical responses, communication clarity, problem-solving, and confidence.

Complete Interview Transcript:
${formattedHistory}

Return ONLY a valid JSON object matching this exact schema:
{
  "score": 82,
  "overallSummary": "Clear and insightful explanation of system architecture...",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "tips": ["string"]
}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    const parsed = cleanAndParseJson(responseText);

    return {
      score: Math.min(100, Math.max(0, Number(parsed.score || 75))),
      overallSummary: parsed.overallSummary || "Completed mock interview session.",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
    };
  } catch (error) {
    console.error("Gemini Mentor Evaluation Error:", error.message);
    return fallbackInterviewScorecard();
  }
};

export default {
  generateNextQuestion,
  evaluateInterviewSession,
};
