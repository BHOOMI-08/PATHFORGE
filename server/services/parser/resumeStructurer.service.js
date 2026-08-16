import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_PROMPTS } from "../../constants/prompts.js";
import dotenv from "dotenv";

dotenv.config();

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
    throw new Error("Gemini resume parser is not configured");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

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

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    // Clean JSON response (strip markdown ```json ... ``` tags if present)
    const jsonString = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsedJson = JSON.parse(jsonString);
    return parsedJson;
  } catch (error) {
    console.error("Gemini resume structuring failed:", error.message);
    throw new Error("Gemini resume parser returned an invalid response");
  }
};

export default {
  structureResumeText,
};






