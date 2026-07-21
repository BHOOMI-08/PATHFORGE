import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { uploadResume } from "../../services/resume.service.js";
import { UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export const UploadZone = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (file) => {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Please select a valid PDF file (.pdf)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds maximum 10MB limit");
      return;
    }

    setSelectedFile(file);
    processUpload(file);
  };

  const processUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(25);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setUploadProgress(60);
      const response = await uploadResume(formData);
      setUploadProgress(100);
      toast.success(response.message || "Resume uploaded and parsed successfully!");
      setSelectedFile(null);
      if (onUploadSuccess) {
        onUploadSuccess(response.data?.resume);
      }
    } catch (error) {
      const msg = error.body?.message || error.message || "Failed to upload and parse resume.";
      toast.error(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf,application/pdf"
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 md:p-10 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer text-center ${
          isDragging
            ? "border-primary-light bg-primary/10 scale-[1.01]"
            : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
        } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/20 to-accent/20 border border-primary/30 text-primary-light shadow-xl mb-4 group-hover:scale-110 transition-transform">
          {isUploading ? (
            <Loader2 className="animate-spin text-primary-light" size={32} />
          ) : (
            <UploadCloud size={32} />
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-display font-semibold text-slate-100">
            {isUploading
              ? "Extracting PDF & Structuring JSON..."
              : "Drag & drop your PDF resume here"}
          </h3>
          <p className="text-xs text-slate-400">
            Supports PDF files up to 10MB • AI-powered raw text extraction
          </p>
        </div>

        {/* Selected file preview during upload */}
        {selectedFile && isUploading && (
          <div className="mt-4 w-full max-w-xs bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
            <FileText size={20} className="text-primary-light shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}

        {/* Upload progress indicator bar */}
        {isUploading && (
          <div className="w-full max-w-md mt-4">
            <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-primary via-accent to-accent-light transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {!isUploading && (
          <button
            type="button"
            className="mt-5 px-5 py-2 rounded-xl text-xs font-semibold text-slate-100 bg-primary hover:bg-primary-light transition-all shadow-md"
          >
            Browse PDF File
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadZone;
