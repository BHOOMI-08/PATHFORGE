import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getUserResumes, deleteResume } from "../services/resume.service.js";
import UploadZone from "../components/forms/UploadZone.jsx";
import ResumeCard from "../components/cards/ResumeCard.jsx";
import {
  FileText,
  Upload,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";

export const ResumeManager = () => {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const response = await getUserResumes();
      if (response.data?.resumes) {
        setResumes(response.data.resumes);
      }
    } catch (error) {
      console.error("Failed to load resumes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDeleteResume = async (id) => {
    try {
      await deleteResume(id);
      toast.success("Resume deleted successfully!");
      setResumes((prev) => prev.filter((r) => r._id !== id));
      if (selectedResume?._id === id) {
        setSelectedResume(null);
      }
    } catch (error) {
      const msg = error.body?.message || error.message || "Failed to delete resume.";
      toast.error(msg);
    }
  };

  // Compute stats metrics
  const totalResumes = resumes.length;
  const allTechnicalSkills = Array.from(
    new Set(
      resumes.flatMap((r) => r.parsedData?.skills?.technical || [])
    )
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-light mb-2">
            <Sparkles size={14} />
            <span>PDF Parsing & AI Structuring Pipeline</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-100 tracking-tight">
            Resume Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload, extract raw text, and audit structured JSON metadata for ATS compatibility.
          </p>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <span className="text-xs font-medium text-slate-400 block">Total Resumes</span>
          <p className="text-2xl font-display font-bold text-slate-100 mt-1">{totalResumes}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <span className="text-xs font-medium text-slate-400 block">Top Extracted Skills</span>
          <p className="text-2xl font-display font-bold text-primary-light mt-1">
            {allTechnicalSkills.length} Detected
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <span className="text-xs font-medium text-slate-400 block">Parser Status</span>
          <p className="text-sm font-semibold text-emerald-400 mt-2 flex items-center space-x-1.5">
            <CheckCircle2 size={16} />
            <span>Gemini AI Pipeline Active</span>
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="space-y-3">
        <h2 className="text-lg font-display font-semibold text-slate-200 flex items-center space-x-2">
          <Upload size={18} className="text-primary-light" />
          <span>Upload PDF Document</span>
        </h2>
        <UploadZone onUploadSuccess={() => fetchResumes()} />
      </div>

      {/* Uploaded Resumes Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-semibold text-slate-200 flex items-center space-x-2">
          <FileText size={18} className="text-accent-light" />
          <span>Your Uploaded Resumes ({totalResumes})</span>
        </h2>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="animate-spin text-primary-light" size={32} />
          </div>
        ) : resumes.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 backdrop-blur-md">
            <FileText size={48} className="mx-auto text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-200">No Resumes Uploaded Yet</h3>
            <p className="text-xs mt-1 text-slate-500 max-w-sm mx-auto">
              Drag and drop your PDF resume above to run the text extraction and AI structuring pipeline.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((r) => (
              <ResumeCard
                key={r._id}
                resume={r}
                onView={(res) => {
                  setSelectedResume(res);
                  setActiveTab("overview");
                }}
                onDelete={handleDeleteResume}
              />
            ))}
          </div>
        )}
      </div>

      {/* Structured Data Viewer Modal */}
      {selectedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-8 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary-light font-bold">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-slate-100 truncate max-w-md">
                    {selectedResume.fileName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Parsed Structured Metadata & Extracted JSON
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResume(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 overflow-x-auto shrink-0 space-x-4 text-xs font-semibold">
              {[
                { id: "overview", label: "Overview & Contact" },
                { id: "education", label: "Education" },
                { id: "experience", label: "Work Experience" },
                { id: "projects", label: "Projects" },
                { id: "skills", label: "Skills & Certifications" },
                { id: "rawText", label: "Sanitized Raw Text" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`py-3 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === t.id
                      ? "border-primary-light text-primary-light font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Tab Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs md:text-sm">
              {/* Tab 1: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-4 animate-scale-in">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                    <h4 className="font-semibold text-slate-100 flex items-center space-x-2">
                      <Sparkles size={16} className="text-primary-light" />
                      <span>Professional Summary</span>
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {selectedResume.parsedData?.summary || "No explicit summary section detected."}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                      <span className="text-slate-400 font-medium block text-xs">Contact Info</span>
                      <p><strong>Name:</strong> {selectedResume.parsedData?.contactInfo?.name || "N/A"}</p>
                      <p><strong>Email:</strong> {selectedResume.parsedData?.contactInfo?.email || "N/A"}</p>
                      <p><strong>Phone:</strong> {selectedResume.parsedData?.contactInfo?.phone || "N/A"}</p>
                      <p><strong>Location:</strong> {selectedResume.parsedData?.contactInfo?.location || "N/A"}</p>
                    </div>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                      <span className="text-slate-400 font-medium block text-xs">Profiles & Links</span>
                      <p><strong>LinkedIn:</strong> {selectedResume.parsedData?.contactInfo?.linkedin || "N/A"}</p>
                      <p><strong>GitHub:</strong> {selectedResume.parsedData?.contactInfo?.github || "N/A"}</p>
                      <p><strong>Portfolio:</strong> {selectedResume.parsedData?.contactInfo?.portfolio || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Education */}
              {activeTab === "education" && (
                <div className="space-y-3 animate-scale-in">
                  {selectedResume.parsedData?.education?.length > 0 ? (
                    selectedResume.parsedData.education.map((edu, idx) => (
                      <div key={idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
                        <h4 className="font-bold text-slate-100">{edu.degree} - {edu.fieldOfStudy}</h4>
                        <p className="text-xs text-primary-light font-medium">{edu.institution}</p>
                        <p className="text-xs text-slate-400">{edu.startDate} {edu.endDate ? `- ${edu.endDate}` : ""}</p>
                        {edu.description && <p className="text-xs text-slate-300 mt-2">{edu.description}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-xs italic">No education entries extracted.</p>
                  )}
                </div>
              )}

              {/* Tab 3: Experience */}
              {activeTab === "experience" && (
                <div className="space-y-3 animate-scale-in">
                  {selectedResume.parsedData?.experience?.length > 0 ? (
                    selectedResume.parsedData.experience.map((exp, idx) => (
                      <div key={idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-100">{exp.position}</h4>
                            <p className="text-xs text-primary-light font-medium">{exp.company}</p>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ""}
                          </span>
                        </div>
                        {exp.highlights?.length > 0 && (
                          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                            {exp.highlights.map((hl, i) => (
                              <li key={i}>{hl}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-xs italic">No work experience entries extracted.</p>
                  )}
                </div>
              )}

              {/* Tab 4: Projects */}
              {activeTab === "projects" && (
                <div className="space-y-3 animate-scale-in">
                  {selectedResume.parsedData?.projects?.length > 0 ? (
                    selectedResume.parsedData.projects.map((proj, idx) => (
                      <div key={idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                        <h4 className="font-bold text-slate-100">{proj.title}</h4>
                        <p className="text-xs text-slate-300">{proj.description}</p>
                        {proj.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {proj.technologies.map((tech, i) => (
                              <span key={i} className="bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] rounded text-slate-300">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-xs italic">No projects extracted.</p>
                  )}
                </div>
              )}

              {/* Tab 5: Skills */}
              {activeTab === "skills" && (
                <div className="space-y-4 animate-scale-in">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                    <span className="text-xs font-semibold text-slate-300 block">Technical Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedResume.parsedData?.skills?.technical?.map((sk, idx) => (
                        <span key={idx} className="bg-primary/20 border border-primary-light/40 px-2.5 py-1 text-xs rounded-lg text-primary-light font-medium">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                    <span className="text-xs font-semibold text-slate-300 block">Tools & Developer Platforms</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedResume.parsedData?.skills?.tools?.map((t, idx) => (
                        <span key={idx} className="bg-accent/20 border border-accent-light/40 px-2.5 py-1 text-xs rounded-lg text-accent-light font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: Raw Text */}
              {activeTab === "rawText" && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap animate-scale-in">
                  {selectedResume.rawText || "No raw text recorded."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeManager;
