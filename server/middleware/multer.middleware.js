import multer from "multer";
import ApiError from "../utils/ApiError.js";
import STATUS_CODES from "../constants/statusCodes.js";

// Use Memory Storage for processing buffer directly
const storage = multer.memoryStorage();

// File filter to restrict uploads strictly to PDF documents
const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === "application/pdf";
  const isPdfExt = file.originalname.toLowerCase().endsWith(".pdf");

  if (isPdfMime && isPdfExt) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        STATUS_CODES.BAD_REQUEST,
        "Only PDF documents (.pdf) are allowed for resume parsing"
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
});

export default upload;

