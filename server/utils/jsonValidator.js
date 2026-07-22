/**
 * Cleans markdown formatting from AI output (e.g. ```json ... ```) and parses into JSON object.
 * @param {string} text 
 * @returns {object}
 */
export const cleanAndParseJson = (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid text input for JSON parsing");
  }

  let cleaned = text.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    // Attempt fallback extraction if string contains embedded JSON brackets
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const extracted = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(extracted);
    }
    throw new Error(`Failed to parse JSON response: ${error.message}`);
  }
};

/**
 * Validates and normalizes ATS Analysis result payload.
 * Ensures default fields exist so frontend/DB models do not break on unexpected AI formats.
 * @param {object} data 
 * @returns {object}
 */
export const validateATSResult = (data) => {
  if (!data || typeof data !== "object") {
    data = {};
  }

  const rawScore = Number(data.atsScore ?? data.score ?? data.overallScore ?? 70);
  const atsScore = Math.min(100, Math.max(0, isNaN(rawScore) ? 70 : rawScore));

  const breakdown = {
    formattingScore: Math.min(100, Math.max(0, Number(data.breakdown?.formattingScore ?? data.formattingScore ?? 75))),
    contentScore: Math.min(100, Math.max(0, Number(data.breakdown?.contentScore ?? data.contentScore ?? 70))),
    keywordScore: Math.min(100, Math.max(0, Number(data.breakdown?.keywordScore ?? data.keywordScore ?? 65))),
    impactScore: Math.min(100, Math.max(0, Number(data.breakdown?.impactScore ?? data.impactScore ?? 70))),
  };

  const missingKeywords = Array.isArray(data.missingKeywords)
    ? data.missingKeywords.map((k) => String(k).trim()).filter(Boolean)
    : [];

  const parsingFailures = Array.isArray(data.parsingFailures)
    ? data.parsingFailures.map((p) => String(p).trim()).filter(Boolean)
    : [];

  const formattingAdvice = Array.isArray(data.formattingAdvice)
    ? data.formattingAdvice.map((a) => String(a).trim()).filter(Boolean)
    : Array.isArray(data.formattingWarnings)
    ? data.formattingWarnings.map((w) => String(w).trim()).filter(Boolean)
    : [];

  const skillGapAdvice = Array.isArray(data.skillGapAdvice)
    ? data.skillGapAdvice.map((s) => String(s).trim()).filter(Boolean)
    : [];

  const rawActionItems = Array.isArray(data.actionItems)
    ? data.actionItems
    : Array.isArray(data.suggestions)
    ? data.suggestions.map((s) => ({ title: "Suggestion", description: String(s), category: "general", priority: "medium" }))
    : [];

  const actionItems = rawActionItems.map((item) => {
    if (typeof item === "string") {
      return {
        category: "general",
        priority: "medium",
        title: "Recommendation",
        description: item,
      };
    }
    return {
      category: item.category || "general",
      priority: ["high", "medium", "low"].includes(item.priority?.toLowerCase()) ? item.priority.toLowerCase() : "medium",
      title: item.title || "Improvement Item",
      description: item.description || item.details || "",
    };
  });

  return {
    atsScore,
    breakdown,
    missingKeywords,
    parsingFailures,
    formattingAdvice,
    skillGapAdvice,
    actionItems,
  };
};

export default {
  cleanAndParseJson,
  validateATSResult,
};
