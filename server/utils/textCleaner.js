/**
 * Sanitize raw PDF text by removing non-ASCII noise, layout artifacts, and normalizing line breaks
 * @param {string} rawText - Unsanitized PDF text
 * @returns {string} Cleaned, readable text string
 */
export const sanitizeText = (rawText) => {
  if (!rawText || typeof rawText !== "string") {
    return "";
  }

  let cleaned = rawText;

  // 1. Replace null characters and weird control characters
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ");

  // 2. Normalize non-standard bullet points to standard hyphen
  cleaned = cleaned.replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, "- ");

  // 3. Remove non-printable / non-ASCII noise characters while preserving valid punctuation and symbols
  cleaned = cleaned.replace(/[^\x20-\x7E\s\t\n]/g, "");

  // 4. Remove common PDF header/footer artifacts (e.g. Page 1 of 3)
  cleaned = cleaned.replace(/Page\s+\d+\s+of\s+\d+/gi, "");
  cleaned = cleaned.replace(/Page\s+\d+/gi, "");

  // 5. Replace multiple consecutive spaces with a single space
  cleaned = cleaned.replace(/[ \t]+/g, " ");

  // 6. Normalize multiple newlines to maximum 2 newlines (paragraphs)
  cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, "\n\n");

  // 7. Trim leading and trailing whitespace
  return cleaned.trim();
};

export default {
  sanitizeText,
};
