import Resume from "../models/Resume.model.js";
import mongoose from "mongoose";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/storage/cloudinary.service.js";
import { extractTextFromPDF } from "../services/parser/pdfParser.service.js";
import { sanitizeText } from "../utils/textCleaner.js";
import { structureResumeText } from "../services/parser/resumeStructurer.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import STATUS_CODES from "../constants/statusCodes.js";
import { recordActivity } from "../services/activity.service.js";
import { allocateResumeVersionNumber } from "../services/resumeVersion.service.js";

/**
 * Handle multipart PDF resume upload, raw text extraction, sanitization, AI structuring, and persistence
 * @route POST /api/v1/resumes/upload
 */
export const uploadAndParseResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, "Please select a valid PDF file to upload");
  }

  const userId = req.user?._id || req.user?.id;
  const fileBuffer = req.file.buffer;
  const fileName = req.file.originalname;

  // 1. Upload file buffer to Cloudinary (or local fallback)
  const uploadResult = await uploadToCloudinary(fileBuffer, fileName);

  // 2. Extract raw text from PDF
  let rawText;
  try {
    rawText = await extractTextFromPDF(fileBuffer);
  } catch (extractErr) {
    await deleteFromCloudinary(uploadResult.public_id);
    throw new ApiError(422, "The PDF could not be read. It may be corrupted, encrypted, or unsupported.");
  }

  // 3. Sanitize raw text
  const cleanedText = sanitizeText(rawText);
  if (cleanedText.length < 50) {
    await deleteFromCloudinary(uploadResult.public_id);
    throw new ApiError(422, "The PDF contains insufficient selectable text. Image-only resumes require OCR.");
  }
  if (process.env.NODE_ENV !== "production") console.info(`Resume text extracted: ${cleanedText.length} characters`);

  // 4. Translate raw text to structured JSON using AI
  const parsedData = await structureResumeText(cleanedText);

  // 5. Calculate baseline match metrics
  const techSkillsCount = parsedData.skills?.technical?.length || 0;
  const hasEmail = Boolean(parsedData.contactInfo?.email);
  const hasPhone = Boolean(parsedData.contactInfo?.phone);

  let baselineScore = 50;
  if (hasEmail) baselineScore += 15;
  if (hasPhone) baselineScore += 15;
  if (techSkillsCount > 3) baselineScore += 20;

  // 6. Save the resume and its activity as one logical database operation.
  const session = await mongoose.startSession();
  let resume;

  try {
    await session.withTransaction(async () => {
      const versionNumber = await allocateResumeVersionNumber(userId, session);
      [resume] = await Resume.create(
        [
          {
            user: userId,
            versionNumber,
            fileName,
            fileUrl: uploadResult.secure_url,
            cloudinaryPublicId: uploadResult.public_id,
            rawText: cleanedText,
            status: "parsed",
            parsedData,
            matchHistoryMetrics: {
              atsScoreBaseline: Math.min(100, baselineScore),
              topSkillMatches: parsedData.skills?.technical || [],
              missingKeywords: [],
            },
          },
        ],
        { session }
      );

      await recordActivity({
        user: userId,
        action: "RESUME_UPLOADED",
        sourceId: resume._id,
        description: `Resume uploaded and parsed: ${fileName}`,
        metadata: { resumeId: resume._id },
        session,
      });
    });
  } catch (error) {
    await deleteFromCloudinary(uploadResult.public_id);
    throw error;
  } finally {
    await session.endSession();
  }

  return res
    .status(STATUS_CODES.CREATED)
    .json(
      new ApiResponse(
        STATUS_CODES.CREATED,
        { resume },
        "Resume uploaded and parsed successfully"
      )
    );
});

/**
 * Fetch all resumes belonging to authenticated user
 * @route GET /api/v1/resumes
 */
export const getUserResumes = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  const resumes = await Resume.find({ user: userId }).sort({ createdAt: -1 });

  return res
    .status(STATUS_CODES.OK)
    .json(
      new ApiResponse(
        STATUS_CODES.OK,
        { resumes },
        "Resumes fetched successfully"
      )
    );
});

/**
 * Fetch a single resume by ID
 * @route GET /api/v1/resumes/:id
 */
export const getResumeById = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;

  const resume = await Resume.findOne({ _id: id, user: userId });
  if (!resume) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "Resume document not found");
  }

  return res
    .status(STATUS_CODES.OK)
    .json(
      new ApiResponse(
        STATUS_CODES.OK,
        { resume },
        "Resume fetched successfully"
      )
    );
});

/**
 * Delete a resume record and associated Cloudinary asset
 * @route DELETE /api/v1/resumes/:id
 */
export const deleteResume = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { id } = req.params;

  const resume = await Resume.findOne({ _id: id, user: userId });
  if (!resume) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "Resume document not found");
  }

  // Remove Cloudinary asset
  if (resume.cloudinaryPublicId) {
    await deleteFromCloudinary(resume.cloudinaryPublicId);
  }

  // Delete from DB
  await Resume.findByIdAndDelete(id);

  return res
    .status(STATUS_CODES.OK)
    .json(
      new ApiResponse(
        STATUS_CODES.OK,
        null,
        "Resume deleted successfully"
      )
    );
});

export default {
  uploadAndParseResume,
  getUserResumes,
  getResumeById,
  deleteResume,
};
