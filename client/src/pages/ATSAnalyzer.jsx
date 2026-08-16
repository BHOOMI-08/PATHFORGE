import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Search,
  UploadCloud,
  FileText,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Layers,
  Wand2,
} from "lucide-react";
import { ScoreCircle } from "../components/ui/ScoreCircle";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { atsService } from "../services/ats.service";
import { getUserResumes } from "../services/resume.service";

export const ATSAnalyzer = () => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [keywordQuery, setKeywordQuery] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Load user resumes and latest ATS analysis on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resumesRes, atsRes] = await Promise.allSettled([
        getUserResumes(),
        atsService.getLatestATSAnalysis(),
      ]);

      let userResumes = [];
      if (resumesRes.status === "fulfilled" && resumesRes.value) {
        userResumes = resumesRes.value?.data?.resumes || resumesRes.value?.data || (Array.isArray(resumesRes.value) ? resumesRes.value : []);
        if (!Array.isArray(userResumes)) userResumes = [];
        setResumes(userResumes);
      }

      if (atsRes.status === "fulfilled" && atsRes.value) {
        const latestRecord = atsRes.value?.data || atsRes.value;
        if (latestRecord && typeof latestRecord === "object" && !Array.isArray(latestRecord)) {
          setAtsAnalysis(latestRecord);
          if (latestRecord?.resume?._id) {
            setSelectedResumeId(latestRecord.resume._id);
          } else if (userResumes.length > 0) {
            setSelectedResumeId(userResumes[0]._id);
          }
        } else if (userResumes.length > 0) {
          setSelectedResumeId(userResumes[0]._id);
        }
      } else if (userResumes.length > 0) {
        setSelectedResumeId(userResumes[0]._id);
      }
    } catch (err) {
      console.error("Failed to load ATS analysis data:", err);
      toast.error("Failed to load ATS audit records.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedResumeId) {
      toast.error("Please upload a resume first.");
      return;
    }

    const normalizedJobDescription = jobDescription.trim();
    if (normalizedJobDescription.length < 80) {
      toast.error("Enter a job description of at least 80 characters.");
      return;
    }
    if (analyzing) return;

    setAnalyzing(true);
    const toastId = toast.loading("Running Gemini AI ATS Evaluation...");

    try {
      const res = await atsService.analyzeResume(selectedResumeId, normalizedJobDescription);
      const analysisData = res?.data || res;
      if (analysisData && typeof analysisData === "object" && (analysisData.overallScore !== undefined || analysisData._id)) {
        setAtsAnalysis(analysisData);
        toast.success("ATS Audit completed successfully!", { id: toastId });
      } else {
        toast.error("Analysis completed with empty response", { id: toastId });
      }
    } catch (err) {
      console.error("ATS Evaluation error:", err);
      toast.error(err.body?.message || err.message || "Failed to execute ATS analysis.", {
        id: toastId,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner />
        <p className="text-slate-400 text-sm">Loading ATS Analysis telemetry...</p>
      </div>
    );
  }

  // If user has no uploaded resumes
  if (resumes.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-100 flex items-center gap-3">
              <FileCheck className="w-8 h-8 text-primary-light" />
              ATS Analyzer
            </h1>
            <p className="text-slate-400 mt-1">
              Audit your resume compatibility against enterprise Applicant Tracking Systems.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-6 backdrop-blur-md">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
            <UploadCloud className="w-8 h-8 text-primary-light" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-semibold text-slate-200">No Resume Uploaded Yet</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload your PDF resume to run deep ATS keyword extractions, formatting checks, and structural impact scoring.
            </p>
          </div>
          <Link
            to="/dashboard/resumes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25"
          >
            Upload Resume <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const breakdown = atsAnalysis?.breakdown || {
    formattingScore: 0,
    contentScore: 0,
    keywordScore: 0,
    impactScore: 0,
  };

  const filteredMissingKeywords = (atsAnalysis?.missingKeywords || []).filter((kw) =>
    kw.toLowerCase().includes(keywordQuery.toLowerCase())
  );

  const actionItems = atsAnalysis?.actionItems || [];
  const filteredActionItems = actionItems.filter((item) => {
    if (activeTab === "all") return true;
    return item.category?.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-xs font-semibold text-primary-light flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Engine Active
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-100 mt-2 flex items-center gap-3">
            ATS Compatibility Audit
          </h1>
          <p className="text-slate-400 mt-1">
            Real-time keyword matching, formatting score breakdown, and structural recommendations.
          </p>
        </div>

        {/* Resume Switcher & Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:border-primary cursor-pointer"
            >
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.fileName} ({new Date(r.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-primary/20"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Run ATS Audit
              </>
            )}
          </button>
        </div>
      </div>

      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3">
        <label htmlFor="ats-job-description" className="block text-sm font-semibold text-slate-200">Target job description</label>
        <textarea id="ats-job-description" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} disabled={analyzing}
          rows={8} maxLength={12000} placeholder="Paste the complete job description (minimum 80 characters)..."
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-200 focus:border-primary focus:outline-none disabled:opacity-60" />
        <p className="text-xs text-slate-400">{jobDescription.trim().length}/12000 characters</p>
      </section>
      {/* Main Grid: Telemetry & Score Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Circle Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <ScoreCircle
            score={atsAnalysis?.atsScore || 0}
            size={190}
            strokeWidth={14}
            label="Overall ATS Score"
            sublabel="Industry Standard"
          />

          <div className="w-full pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-left">
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
              <span className="text-xs text-slate-400 font-medium">Status</span>
              <p className="text-sm font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                {(atsAnalysis?.atsScore || 0) >= 75 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Optimized
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Needs Work
                  </>
                )}
              </p>
            </div>
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
              <span className="text-xs text-slate-400 font-medium">Missing Terms</span>
              <p className="text-sm font-semibold text-rose-400 mt-0.5">
                {atsAnalysis?.missingKeywords?.length || 0} Keywords
              </p>
            </div>
          </div>
        </motion.div>

        {/* Detailed Category Progress Gauges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between backdrop-blur-md"
        >
          <div>
            <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent-light" /> Section Analysis Breakdown
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Detailed structural scores evaluating formatting, technical relevance, and impact statements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6">
            {/* Formatting Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-300">Layout & Formatting</span>
                <span className="font-bold text-slate-100">{breakdown.formattingScore}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${breakdown.formattingScore}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">Section headers, font hierarchy & readability.</p>
            </div>

            {/* Content Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-300">Content Completeness</span>
                <span className="font-bold text-slate-100">{breakdown.contentScore}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${breakdown.contentScore}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">Contact info, education & work history data.</p>
            </div>

            {/* Keywords Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-300">Keyword Density</span>
                <span className="font-bold text-slate-100">{breakdown.keywordScore}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${breakdown.keywordScore}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">Target tech stack & domain skill coverage.</p>
            </div>

            {/* Impact Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-300">Measurable Impact</span>
                <span className="font-bold text-slate-100">{breakdown.impactScore}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${breakdown.impactScore}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">Quantifiable metrics & accomplishment verbs.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-slate-300 font-medium">
                Last Analyzed:{" "}
                {atsAnalysis?.createdAt
                  ? new Date(atsAnalysis.createdAt).toLocaleString()
                  : "Never"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Missing Keywords Extraction Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Missing ATS Keywords
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Industry terms missing from your resume that ATS scanners commonly look for.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search missing keywords..."
              value={keywordQuery}
              onChange={(e) => setKeywordQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {filteredMissingKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {filteredMissingKeywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 bg-rose-950/30 border border-rose-800/40 text-rose-300 text-sm font-medium rounded-xl flex items-center gap-2 hover:bg-rose-950/50 transition-all cursor-default"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                {kw}
              </span>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-800/60 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-slate-300 font-medium">No Critical Missing Keywords Found!</p>
            <p className="text-xs text-slate-400 mt-1">
              Your resume demonstrates strong technical term coverage across targeted domain categories.
            </p>
          </div>
        )}
      </div>

      {atsAnalysis && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["Matched Keywords", atsAnalysis.matchedKeywords],
            ["Strengths", atsAnalysis.strengths],
            ["Weaknesses", atsAnalysis.weaknesses],
            ["Recommendations", atsAnalysis.recommendations],
          ].map(([title, items]) => (
            <div key={title} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold text-slate-100 mb-3">{title}</h3>
              {Array.isArray(items) && items.length ? (
                <ul className="space-y-2 text-sm text-slate-300">{items.map((item, index) => <li key={`${title}-${index}`}>• {String(item)}</li>)}</ul>
              ) : <p className="text-sm text-slate-500">No items reported.</p>}
            </div>
          ))}
          {atsAnalysis.summary && <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5"><h3 className="font-semibold text-slate-100 mb-2">Summary</h3><p className="text-sm text-slate-300">{atsAnalysis.summary}</p></div>}
        </section>
      )}
      {/* Categorized Action Items & Recommendations Tabs */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-light" /> Recommended Enhancements
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Prioritized structural and content improvements generated by Gemini AI.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {["all", "formatting", "skills", "impact"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Action Items List */}
        <div className="space-y-4">
          {filteredActionItems.length > 0 ? (
            filteredActionItems.map((item, idx) => {
              const priorityColor =
                item.priority === "high"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : item.priority === "medium"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/30";

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-5 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-2 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="font-semibold text-slate-100 text-base">{item.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-400 capitalize">
                        {item.category}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${priorityColor}`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              No recommendations found for the selected category filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ATSAnalyzer;




