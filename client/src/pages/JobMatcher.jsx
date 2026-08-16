import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  History,
  Trash2,
  ArrowRight,
  UploadCloud,
  Briefcase,
  Layers,
  Award,
  BookOpen,
} from "lucide-react";
import { ScoreCircle } from "../components/ui/ScoreCircle";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import JDForm from "../components/forms/JDForm";
import { jobMatchService } from "../services/jobMatch.service";
import { getUserResumes } from "../services/resume.service";

export const JobMatcher = () => {
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [activeTab, setActiveTab] = useState("new"); // "new" | "history"
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [resumesRes, matchesRes] = await Promise.allSettled([
        getUserResumes(),
        jobMatchService.getJobMatches(),
      ]);

      if (resumesRes.status === "fulfilled" && resumesRes.value) {
        const resumeList = resumesRes.value?.data?.resumes || resumesRes.value?.data || (Array.isArray(resumesRes.value) ? resumesRes.value : []);
        setResumes(Array.isArray(resumeList) ? resumeList : []);
      }

      if (matchesRes.status === "fulfilled" && matchesRes.value) {
        const history = Array.isArray(matchesRes.value) ? matchesRes.value : (matchesRes.value?.data || []);
        setMatchHistory(Array.isArray(history) ? history : []);
        if (Array.isArray(history) && history.length > 0) {
          setCurrentMatch(history[0]);
        }
      }

      const failures = [resumesRes, matchesRes].filter((result) => result.status === "rejected");
      if (failures.length) {
        const message = failures[0].reason?.body?.message || failures[0].reason?.message || "Some Job Matcher data could not be loaded.";
        setLoadError(message);
        toast.error(message);
      }
    } catch (err) {
      console.error("Failed to load Job Matcher data:", err);
      toast.error("Failed to load job matching records.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async (formData) => {
    if (evaluating) return;
    setEvaluating(true);
    const toastId = toast.loading("Analyzing candidate resume against target Job Description...");

    try {
      const res = await jobMatchService.createJobMatch(formData);
      const matchResult = res?.data || res;
      if (matchResult && typeof matchResult === "object") {
        setCurrentMatch(matchResult);
        setMatchHistory((prev) => [matchResult, ...prev]);
        toast.success("Job Match analysis complete!", { id: toastId });
      } else {
        throw new Error("The Job Matcher returned an empty response.");
      }
    } catch (err) {
      console.error("Job Match error:", err);
      toast.error(err.body?.message || err.message || "Failed to execute job match comparison.", {
        id: toastId,
      });
    } finally {
      setEvaluating(false);
    }
  };

  const handleDeleteMatch = async (id, e) => {
    e.stopPropagation();
    try {
      await jobMatchService.deleteJobMatch(id);
      setMatchHistory((prev) => prev.filter((m) => m._id !== id));
      if (currentMatch?._id === id) {
        const remaining = matchHistory.filter((m) => m._id !== id);
        setCurrentMatch(remaining.length > 0 ? remaining[0] : null);
      }
      toast.success("Job match record removed.");
    } catch (err) {
      toast.error("Failed to delete record.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner />
        <p className="text-slate-400 text-sm">Loading Job Matcher workspace...</p>
      </div>
    );
  }

  if (loadError && resumes.length === 0) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl border border-rose-900/60 bg-rose-950/20 p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-400" />
        <h2 className="mt-4 text-xl font-semibold text-slate-100">Unable to load Job Matcher</h2>
        <p className="mt-2 text-sm text-slate-400">{loadError}</p>
        <button type="button" onClick={fetchInitialData} className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
          Try again
        </button>
      </div>
    );
  }

  // If user has no uploaded resumes
  if (resumes.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-100 flex items-center gap-3">
            <Target className="w-8 h-8 text-primary-light" />
            AI Job Matcher
          </h1>
          <p className="text-slate-400 mt-1">
            Evaluate compatibility, skill gaps, and custom recommendations against target Job Descriptions.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-6 backdrop-blur-md">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
            <UploadCloud className="w-8 h-8 text-primary-light" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-semibold text-slate-200">No Resume Found</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload your resume first to run AI-powered Job Description comparisons and skill gap analysis.
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

  const matchBreakdown = {
    technicalMatch: 0,
    experienceMatch: 0,
    educationMatch: 0,
    projectMatch: 0,
    ...(currentMatch?.matchBreakdown || {}),
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-accent/10 border border-accent/30 rounded-full text-xs font-semibold text-accent-light flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Compatibility Engine
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-100 mt-2 flex items-center gap-3">
            AI Job Matcher & Skill Gap Analysis
          </h1>
          <p className="text-slate-400 mt-1">
            Compare target Job Descriptions against candidate resume parameters to detect skill gaps and fit metrics.
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab("new")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "new"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Analyze New JD
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "history"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" /> Match History ({matchHistory.length})
          </button>
        </div>
      </div>

      {/* Form Input Tab */}
      {activeTab === "new" && (
        <JDForm resumes={resumes} onSubmit={handleCreateMatch} loading={evaluating} />
      )}

      {/* Main Results View (If a match evaluation exists) */}
      {activeTab === "new" && currentMatch && (
        <div className="space-y-8">
          {/* Overview Banner */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary-light border border-primary/20 rounded-md text-xs font-medium">
                  {currentMatch.companyName || "Target Company"}
                </span>
                <span className="text-xs text-slate-500">
                  Compared on {new Date(currentMatch.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-100 mt-1">
                {currentMatch.jobTitle}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Evaluated Resume</span>
              <span className="text-sm font-semibold text-slate-200">
                {currentMatch.resume?.fileName || "User Resume"}
              </span>
            </div>
          </div>

          {/* Score & Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Circle Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 backdrop-blur-md"
            >
              <ScoreCircle
                score={currentMatch.matchScore}
                size={190}
                strokeWidth={14}
                label="Overall JD Compatibility"
                sublabel="Job Match Index"
              />

              <div className="w-full pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
                  <span className="text-xs text-slate-400 font-medium">Matched Skills</span>
                  <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                    {currentMatch.matchingSkills?.length || 0} Found
                  </p>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
                  <span className="text-xs text-slate-400 font-medium">Skill Gaps</span>
                  <p className="text-sm font-semibold text-rose-400 mt-0.5">
                    {currentMatch.missingSkills?.length || 0} Missing
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Breakdown Gauges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between backdrop-blur-md space-y-6"
            >
              <div>
                <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-accent-light" /> Alignment Breakdown
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Specific compatibility index across tech stack, work experience depth, and educational backgrounds.
                </p>
              </div>

              <div className="space-y-5">
                {/* Tech Stack Match */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-300 flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-400" /> Technical Skills Match
                    </span>
                    <span className="font-bold text-slate-100">{matchBreakdown.technicalMatch}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-1000"
                      style={{ width: `${matchBreakdown.technicalMatch}%` }}
                    />
                  </div>
                </div>

                {/* Experience Match */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-300 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-400" /> Work Experience Relevance
                    </span>
                    <span className="font-bold text-slate-100">{matchBreakdown.experienceMatch}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${matchBreakdown.experienceMatch}%` }}
                    />
                  </div>
                </div>

                {/* Project Match */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="font-semibold text-slate-300 flex items-center gap-2"><Layers className="w-4 h-4 text-cyan-400" /> Project Relevance</span><span className="font-bold text-slate-100">{matchBreakdown.projectMatch}%</span></div>
                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800"><div className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full transition-all duration-1000" style={{ width: `${matchBreakdown.projectMatch}%` }} /></div>
                </div>
                {/* Education Match */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-300 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-400" /> Education & Credentials
                    </span>
                    <span className="font-bold text-slate-100">{matchBreakdown.educationMatch}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${matchBreakdown.educationMatch}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Categorized Skills: Found vs Missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching / Found Skills */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
              <h3 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Matching Required Skills
              </h3>
              <p className="text-slate-400 text-xs">
                Competencies present in your resume that fulfill target JD criteria.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {currentMatch.matchingSkills?.length > 0 ? (
                  currentMatch.matchingSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-xs">No direct technical skill overlaps detected.</span>
                )}
              </div>
            </div>

            {/* Missing / Skill Gaps */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
              <h3 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" /> Identified Skill Gaps
              </h3>
              <p className="text-slate-400 text-xs">
                Key qualifications listed in the JD missing from your candidate profile.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {currentMatch.missingSkills?.length > 0 ? (
                  currentMatch.missingSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-emerald-400 text-xs font-medium">No major skill gaps identified!</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6"><h3 className="text-lg font-bold text-slate-100 mb-3">Strengths</h3>{Array.isArray(currentMatch.strengths) && currentMatch.strengths.length ? <ul className="space-y-2 text-sm text-slate-300">{currentMatch.strengths.map((item, index) => <li key={`strength-${index}`}>• {item}</li>)}</ul> : <p className="text-sm text-slate-500">No strengths reported.</p>}</div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6"><h3 className="text-lg font-bold text-slate-100 mb-3">Weaknesses</h3>{Array.isArray(currentMatch.weaknesses) && currentMatch.weaknesses.length ? <ul className="space-y-2 text-sm text-slate-300">{currentMatch.weaknesses.map((item, index) => <li key={`weakness-${index}`}>• {item}</li>)}</ul> : <p className="text-sm text-slate-500">No weaknesses reported.</p>}</div>
            <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6"><h3 className="text-lg font-bold text-slate-100 mb-3">Overall Summary</h3><p className="text-sm text-slate-300 leading-relaxed">{currentMatch.summary || "No summary available."}</p></div>
          </div>
          {/* Action Recommendations */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md space-y-6">
            <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-light" /> Tailoring & Optimization Advice
            </h3>
            <div className="space-y-3">
              {Array.isArray(currentMatch.recommendations) && currentMatch.recommendations.length > 0 ? currentMatch.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary-light flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-slate-300 text-sm leading-relaxed">{rec}</p>
                </div>
              )) : <p className="text-sm text-slate-500">No recommendations reported.</p>}            </div>
          </div>
        </div>
      )}

      {/* History Tab View */}
      {activeTab === "history" && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md space-y-6">
          <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-primary-light" /> Comparison History
          </h3>

          {matchHistory.length > 0 ? (
            <div className="space-y-3">
              {matchHistory.map((m) => (
                <div
                  key={m._id}
                  onClick={() => {
                    setCurrentMatch(m);
                    setActiveTab("new");
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    currentMatch?._id === m._id
                      ? "bg-slate-900 border-primary/50 shadow-md"
                      : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <h4 className="font-semibold text-slate-100 text-base">{m.jobTitle}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {m.companyName || "Target Company"} • Evaluated on{" "}
                      {new Date(m.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        m.matchScore >= 75
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : m.matchScore >= 50
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {m.matchScore}% Match
                    </span>

                    <button
                      onClick={(e) => handleDeleteMatch(m._id, e)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-all"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              No previous job match comparisons found. Run your first comparison above!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobMatcher;
