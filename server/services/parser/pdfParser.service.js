import pdfParse from "pdf-parse";

/**
 * Extract plain raw text from PDF buffer
 * @param {Buffer} pdfBuffer - Buffer of uploaded PDF file
 * @returns {Promise<string>} Extracted raw text string
 */
export const extractTextFromPDF = async (pdfBuffer) => {
  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
    throw new Error("Invalid PDF file buffer provided for text extraction");
  }

  try {
    const data = await pdfParse(pdfBuffer);
    return data.text || "";
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

export default {
  extractTextFromPDF,
};
