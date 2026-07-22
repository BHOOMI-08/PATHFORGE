import { GoogleGenerativeAI } from "@google/generative-ai";
import { cleanAndParseJson } from "../../utils/jsonValidator.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Fallback static recruiter screening simulation
 */
const fallbackRecruiterSimulation = (companyName = "Google", targetRole = "Software Development Engineer") => {
  return {
    decision: "Shortlisted",
    interviewProbability: 76,
    reasons: {
      positive: [
        "Strong full-stack project portfolio demonstrating end-to-end MERN architecture.",
        "Solid ATS keyword density across core languages (JavaScript, Node.js, React).",
        "Demonstrated understanding of RESTful API standards and database schema modeling.",
      ],
      negative: [
        "Limited explicit evidence of large-scale distributed system design or microservices.",
        "Could expand on cloud deployment experience (AWS/GCP/Docker containerization).",
      ],
    },
    expectedQuestions: {
      hr: [
        `Why do you specifically want to join ${companyName} at this stage in your career?`,
        "Tell me about a time you had to handle conflicting priorities under tight deadlines.",
      ],
      technical: [
        "How would you design a rate limiter to protect microservices from traffic spikes?",
        "Explain how MongoDB handles indexing and how you would optimize a slow query.",
      ],
      resumeSpecific: [
        "In your resume project, how did you handle user authentication token rotation securely?",
        "What performance bottlenecks did you encounter while building your React application?",
      ],
    },
    rejectionRisks: [
      "Potential weakness in deep System Design questions during technical screen rounds.",
      "Lack of quantitative business metrics (e.g. latency reduction percentages) in resume bullet points.",
    ],
  };
};

/**
 * Evaluates candidate resume against specific tech company hiring standards
 * @param {object} resumeData 
 * @param {string} companyName 
 * @param {string} targetRole 
 * @returns {Promise<object>} Recruiter evaluation JSON
 */
export const simulateRecruiterScreening = async (resumeData, companyName = "Google", targetRole = "Software Engineer") => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY missing in .env. Using fallback recruiter simulator.");
    return fallbackRecruiterSimulation(companyName, targetRole);
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

    const fullPrompt = `You are a Senior Principal Technical Recruiter at ${companyName} evaluating a candidate for the "${targetRole}" position.
Analyze the candidate's parsed resume and evaluate them strictly against ${companyName}'s real-world hiring bar and engineering culture.

Candidate Resume Data:
${resumeJsonString}

Return ONLY a valid JSON object matching this exact schema:
{
  "decision": "Shortlisted | Borderline | Rejected",
  "interviewProbability": 76,
  "reasons": {
    "positive": [
      "✔ Reason 1",
      "✔ Reason 2"
    ],
    "negative": [
      "✖ Reason 1",
      "✖ Reason 2"
    ]
  },
  "expectedQuestions": {
    "hr": ["string"],
    "technical": ["string"],
    "resumeSpecific": ["string"]
  },
  "rejectionRisks": ["string"]
}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    const parsed = cleanAndParseJson(responseText);

    const probability = Number(parsed.interviewProbability || 75);

    return {
      decision: ["Shortlisted", "Borderline", "Rejected"].includes(parsed.decision)
        ? parsed.decision
        : probability >= 75
        ? "Shortlisted"
        : probability >= 50
        ? "Borderline"
        : "Rejected",
      interviewProbability: Math.min(100, Math.max(0, probability)),
      reasons: {
        positive: Array.isArray(parsed.reasons?.positive) ? parsed.reasons.positive : [],
        negative: Array.isArray(parsed.reasons?.negative) ? parsed.reasons.negative : [],
      },
      expectedQuestions: {
        hr: Array.isArray(parsed.expectedQuestions?.hr) ? parsed.expectedQuestions.hr : [],
        technical: Array.isArray(parsed.expectedQuestions?.technical) ? parsed.expectedQuestions.technical : [],
        resumeSpecific: Array.isArray(parsed.expectedQuestions?.resumeSpecific) ? parsed.expectedQuestions.resumeSpecific : [],
      },
      rejectionRisks: Array.isArray(parsed.rejectionRisks) ? parsed.rejectionRisks : [],
    };
  } catch (error) {
    console.error("Gemini Recruiter Service Error:", error.message);
    return fallbackRecruiterSimulation(companyName, targetRole);
  }
};

export default {
  simulateRecruiterScreening,
};
