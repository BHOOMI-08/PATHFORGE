import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_PROMPTS } from "../../constants/prompts.js";
import dotenv from "dotenv";
import { z } from "zod";
import ApiError from "../../utils/ApiError.js";
import { cleanAndParseJson } from "../../utils/jsonValidator.js";

dotenv.config();

const text = (max = 2000) => z.preprocess(
  (value) => value === null || value === undefined ? "" : value,
  z.string().trim().max(max),
);
const resumeSchema = z.object({
  contactInfo: z.object({
    name: text(120), email: text(320), phone: text(80), location: text(200),
    linkedin: text(500), github: text(500), portfolio: text(500),
  }).strict(),
  summary: text(3000),
  education: z.array(z.object({
    institution: text(300), degree: text(200), fieldOfStudy: text(200),
    startDate: text(80), endDate: text(80), grade: text(80), description: text(1500),
  }).strict()).max(30),
  experience: z.array(z.object({
    company: text(300), position: text(300), location: text(200),
    startDate: text(80), endDate: text(80), isCurrent: z.boolean().default(false),
    highlights: z.array(text(800)).max(40),
  }).strict()).max(40),
  projects: z.array(z.object({
    title: text(300), description: text(2000), technologies: z.array(text(120)).max(50), link: text(500),
  }).strict()).max(40),
  skills: z.object({
    technical: z.array(text(120)).max(100), soft: z.array(text(120)).max(100),
    tools: z.array(text(120)).max(100), languages: z.array(text(120)).max(100),
  }).strict(),
  certifications: z.array(z.object({
    name: text(300), issuer: text(300), issueDate: text(80),
  }).strict()).max(40),
}).strict();

const withTimeout = async (promise, timeoutMs = 60_000) => {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Gemini request timed out")), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Fallback heuristic parser extracting basic resume fields using regex & keywords
 */
const fallbackHeuristicParser = (cleanedText) => {
  const emailMatch = cleanedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = cleanedText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = cleanedText.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = cleanedText.match(/github\.com\/[a-zA-Z0-9_-]+/i);

  const lines = cleanedText.split("\n").filter((l) => l.trim().length > 0);
  const detectedName = lines.length > 0 ? lines[0].slice(0, 50) : "";

  // Common skill keywords scanner
  const skillKeywords = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "React",
    "Next.js", "Node.js", "Express.js", "Django", "Flask", "Spring Boot", "SQL", "PostgreSQL",
    "MongoDB", "MySQL", "Redis", "Docker", "Kubernetes", "AWS", "Git", "HTML", "CSS", "TailwindCSS"
  ];

  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const foundSkills = skillKeywords.filter((sk) =>
    new RegExp(escapeRegExp(sk), "i").test(cleanedText)
  );

  return {
    contactInfo: {
      name: detectedName,
      email: emailMatch ? emailMatch[0] : "",
      phone: phoneMatch ? phoneMatch[0] : "",
      location: "",
      linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : "",
      github: githubMatch ? `https://${githubMatch[0]}` : "",
      portfolio: "",
    },
    summary: lines.slice(1, 4).join(" ").slice(0, 300),
    education: [
      {
        institution: "Extracted Degree / Institution",
        degree: "Bachelor / Master",
        fieldOfStudy: "Computer Science / Engineering",
        startDate: "",
        endDate: "",
        grade: "",
        description: "",
      },
    ],
    experience: [],
    projects: [],
    skills: {
      technical: foundSkills,
      soft: ["Communication", "Problem Solving", "Teamwork"],
      tools: ["Git", "VS Code"],
      languages: ["English"],
    },
    certifications: [],
  };
};

/**
 * Translate raw cleaned text into structured JSON schema using Gemini API
 * @param {string} cleanedText - Sanitized plain text
 * @returns {Promise<Object>} Structured JSON object
 */
export const structureResumeText = async (cleanedText) => {
  if (!cleanedText || cleanedText.trim().length === 0) {
    throw new Error("Resume text is empty");
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new ApiError(503, "Gemini resume parser is not configured");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
      generationConfig: { responseMimeType: "application/json", temperature: 0 },
    });

    const systemPrompt = `${GEMINI_PROMPTS.RESUME_PARSER}

Return ONLY valid JSON matching this exact structure without markdown code fence or extra text:
{
  "contactInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "portfolio": "string"
  },
  "summary": "string",
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "string",
      "endDate": "string",
      "grade": "string",
      "description": "string"
    }
  ],
  "experience": [
    {
      "company": "string",
      "position": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "isCurrent": false,
      "highlights": ["string"]
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "technologies": ["string"],
      "link": "string"
    }
  ],
  "skills": {
    "technical": ["string"],
    "soft": ["string"],
    "tools": ["string"],
    "languages": ["string"]
  },
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "issueDate": "string"
    }
  ]
}

Raw Resume Text:
${cleanedText}`;

    const result = await withTimeout(model.generateContent(systemPrompt));
    const responseText = result.response.text();
    return resumeSchema.parse(cleanAndParseJson(responseText));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Gemini resume structuring failed:", error.message);
    if (error?.status === 429 || /quota|rate.?limit|resource exhausted|\b429\b/i.test(error?.message || "")) {
      throw new ApiError(429, "Gemini resume parser quota is temporarily unavailable");
    }
    if (/timed out/i.test(error?.message || "")) {
      throw new ApiError(503, "Gemini resume parser timed out. Please try again.");
    }
    throw new ApiError(502, "Gemini resume parser returned an invalid response");
  }
};

export default {
  structureResumeText,
};






