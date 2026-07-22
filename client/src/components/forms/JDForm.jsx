import React, { useState } from "react";
import { Briefcase, Building, FileText, Sparkles, Send, RefreshCw } from "lucide-react";

const SAMPLE_JDS = [
  {
    title: "Senior Full Stack React & Node Engineer",
    company: "TechForge Innovations",
    jd: `We are looking for a Senior Full Stack Engineer proficient in React 19, Node.js, Express, and MongoDB. 
Key Responsibilities:
- Build high-performance RESTful APIs and real-time backend services.
- Architect responsive React web interfaces with TailwindCSS and TypeScript.
- Implement CI/CD pipelines, Docker containerization, and AWS Cloud deployments.
- Write clean, modular code with unit tests (Jest/Vitest).
Requirements:
- 3+ years experience with JavaScript/TypeScript stack.
- Solid understanding of database indexing, caching (Redis), and security practices (JWT/OAuth).`,
  },
  {
    title: "AI Solutions & Cloud Backend Developer",
    company: "Aether AI Labs",
    jd: `Seeking a Backend Engineer to integrate Gemini API LLM workflows into enterprise web services.
Requirements:
- Strong knowledge of Node.js, Express, Python, and MongoDB.
- Experience with LLM prompt engineering, vector embeddings, and JSON schema validation.
- Familiarity with System Design, Microservices, and Redis.`,
  },
];

export const JDForm = ({ resumes = [], onSubmit, loading = false }) => {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?._id || "");
  const [jobDescription, setJobDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDescription.trim()) return;

    onSubmit({
      resumeId: selectedResumeId || (resumes.length > 0 ? resumes[0]._id : undefined),
      jobTitle: jobTitle.trim(),
      companyName: companyName.trim(),
      jobDescription: jobDescription.trim(),
    });
  };

  const handleApplySample = (sample) => {
    setJobTitle(sample.title);
    setCompanyName(sample.company);
    setJobDescription(sample.jd);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary-light" /> Target Job Details
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Paste the target Job Description to compare against your parsed resume skills.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Quick Samples:</span>
          {SAMPLE_JDS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplySample(sample)}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-primary-light transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Sample {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Job Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Target Job Title <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="text"
              required
              placeholder="e.g. Senior Full Stack Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Company Name (Optional)
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="e.g. Google / Microsoft"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Resume Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Target Candidate Resume
          </label>
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary cursor-pointer"
          >
            {resumes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.fileName} ({new Date(r.createdAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Job Description Textarea */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Full Job Description (JD) <span className="text-rose-400">*</span>
        </label>
        <textarea
          required
          rows={6}
          placeholder="Paste requirements, responsibilities, and key tech stack details from the job posting..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-4 focus:outline-none focus:border-primary leading-relaxed"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !jobTitle.trim() || !jobDescription.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Match...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Compare & Analyze Match
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default JDForm;
