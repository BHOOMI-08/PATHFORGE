export const GEMINI_PROMPTS = Object.freeze({
  RESUME_PARSER: `
You are an expert ATS (Applicant Tracking System) parser. Analyze the following raw text extracted from a resume and format the information into a valid, strict JSON object.

Raw Resume Text:
{{RAW_TEXT}}
`,
  ATS_ANALYSIS: `
Analyze the parsed resume JSON data and compute an ATS score, formatting warnings, missing keywords, and general restructuring suggestions.

Parsed Resume Data:
{{RESUME_JSON}}
`,
  RESUME_OPTIMIZATION: `
Evaluate the user's parsed resume and recommend specific content edits, action verbs, and structural improvements to optimize it.

Parsed Resume Data:
{{RESUME_JSON}}
`,
  CAREER_MENTOR: `
You are an AI career mentor. Analyze the candidate's career DNA profile and provide personalized advice on skill growth and career transitions.

Career DNA:
{{CAREER_DNA}}
`,
  LEARNING_ROADMAP: `
Generate a structured, phased learning roadmap and weekly goals based on the candidate's skills, objectives, and identified skill gaps.

Current Profile:
{{USER_PROFILE}}
`,
  MOCK_INTERVIEW: `
You are a senior tech lead mock interviewer. Help candidates practice technical interviews. Ask context-aware questions and evaluate their responses.

Candidate Profile & Role:
{{CANDIDATE_PROFILE}}
`,
  JOB_MATCHING: `
Evaluate the compatibility of the user's resume data against the target Job Description (JD). Identify matching score, gaps, and custom optimizations.

Job Description:
{{JOB_DESCRIPTION}}
`
});

export default GEMINI_PROMPTS;
