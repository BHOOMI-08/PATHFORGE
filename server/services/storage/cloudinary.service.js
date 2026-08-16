import { v2 as cloudinary } from "cloudinary";
cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET});
const configured=()=>process.env.CLOUDINARY_CLOUD_NAME&&process.env.CLOUDINARY_API_KEY&&process.env.CLOUDINARY_API_SECRET;
export const uploadToCloudinary=(buffer)=>new Promise((resolve,reject)=>{
 if(!configured()) return reject(new Error("Cloudinary storage is not configured"));
 cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET});
 const stream=cloudinary.uploader.upload_stream({folder:"pathforge/resumes",resource_type:"raw",public_id:`resume_${Date.now()}`},(error,result)=>{
  if(error){console.error("Cloudinary upload failed:",error.message);return reject(new Error("Resume storage upload failed"));}
  resolve({secure_url:result.secure_url,public_id:result.public_id});
 }); stream.end(buffer);
});
export const deleteFromCloudinary=async(publicId)=>{if(!publicId)return true;try{await cloudinary.uploader.destroy(publicId,{resource_type:"raw"});return true;}catch(error){console.error("Cloudinary delete failed:",error.message);return false;}};
export default {uploadToCloudinary,deleteFromCloudinary};

