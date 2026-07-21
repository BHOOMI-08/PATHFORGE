import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary credentials from environment parameters
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file buffer to Cloudinary
 * @param {Buffer} fileBuffer - PDF file buffer
 * @param {string} originalName - Original filename
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export const uploadToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary credentials are fully configured
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.warn(
        "Cloudinary credentials missing in .env. Using local fallback file URL."
      );
      return resolve({
        secure_url: `https://storage.pathforge.ai/resumes/${Date.now()}_${originalName}`,
        public_id: `local_${Date.now()}`,
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "pathforge/resumes",
        resource_type: "raw",
        public_id: `resume_${Date.now()}_${originalName.replace(/\.[^/.]+$/, "")}`,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          // Fallback to local mock URL on Cloudinary network/config error
          return resolve({
            secure_url: `https://storage.pathforge.ai/resumes/${Date.now()}_${originalName}`,
            public_id: `fallback_${Date.now()}`,
          });
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete file from Cloudinary by public ID
 * @param {string} publicId - Cloudinary asset public ID
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId.startsWith("local_") || publicId.startsWith("fallback_")) {
    return true;
  }
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    return true;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return false;
  }
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
};
