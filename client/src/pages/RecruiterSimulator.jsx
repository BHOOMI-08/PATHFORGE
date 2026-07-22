import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Building2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  History,
  Trash2,
  FileText,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import ScoreCircle from "../components/ui/ScoreCircle";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import TARGET_COMPANIES from "../constants/companies";
import { recruiterService } from "../services/recruiter.service";
import { getUserResumes } from "../services/resume.service";

export const RecruiterSimulator = () => {
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(TARGET_COMPANIES[0]);
  const [targetRole, setTargetRole] = useState(TARGET_COMPANIES[0].role);

  const [simulation, setSimulation] = useState(null);
  const [history, setHistory] = useState([]);
  const [questionTab, setQuestionTab] = useState("technical"); // "hr" | "technical" | "resume"

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resumesRes, historyRes] = await Promise.allSettled([
        getUserResumes(),
        recruiterService.getRecruiterSimulations(),
      ]);

      let userResumes = [];
      if (resumesRes.status === "fulfilled" && resumesRes.value?.data?.data) {
        userResumes = resumesRes.value.data.data;
        setResumes(userResumes);
        if (userResumes.length > 0) {
          setSelectedResumeId(userResumes[0]._id);
        }
      }

      if (historyRes.status === "fulfilled" && historyRes.value?.data) {
        const pastSims = historyRes.value.data;
        setHistory(pastSims);
        if (pastSims.length > 0) {
          setSimulation(pastSims[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load recruiter simulator data:", err);
      toast.error("Failed to load recruiter simulator data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompany = (comp) => {
    setSelectedCompany(comp);
    setTargetRole(comp.role);
  };

  const handleRunSimulation = async () => {
    if (!selectedResumeId && resumes.length === 0) {
      toast.error("Please upload a resume first.");
      return;
    }

    setEvaluating(true);
    const toastId = toast.loading(`Simulating ${selectedCompany.name} Technical Recruiter...`);

    try {
      const res = await recruiterService.simulateRecruiter({
        resumeId: selectedResumeId || (resumes[0] ? resumes[0]._id : undefined),
        company: selectedCompany.name,
        targetRole,
      });

      if (res?.data) {
        setSimulation(res.data);
        setHistory((prev) => [res.data, ...prev]);
        toast.success(`Recruiter screening evaluation for ${selectedCompany.name} complete!`, { id: toastId });
      }
    } catch (err) {
      console.error("Recruiter simulation error:", err);
      toast.error(err.response?.data?.message || "Failed to execute recruiter screening.", { id: toastId });
    } finally {
      setEvaluating(false);
    }
  };

  const handleDeleteSimulation = async (id, e) => {
    e.stopPropagation();
    try {
      await recruiterService.deleteRecruiterSimulation(id);
      setHistory((prev) => prev.filter((s) => s._id !== id));
      if (simulation?._id === id) {
        const remaining = history.filter((s) => s._id !== id);
        setSimulation(remaining.length > 0 ? remaining[0] : null);
      }
      toast.success("Simulation record removed.");
    } catch (err) {
      toast.error("Failed to delete record.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner />
        <p className="text-slate-400 text-sm">Loading AI Recruiter Simulator...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> ⭐ Candidate Simulator #1 Pick
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-100 mt-2 flex items-center gap-3">
            AI Recruiter Simulator
          </h1>
          <p className="text-slate-400 mt-1">
            Simulate real-world recruiter screening bars across top tech companies (Google, Amazon, Microsoft, Flipkart, Atlassian).
          </p>
        </div>
      </div>

      {/* Target Company Preset Selector Grid */}
      <div className="space-y-4">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Select Target Company Hiring Bar
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TARGET_COMPANIES.map((comp) => {
            const isSelected = selectedCompany.id === comp.id;

            return (
              <div
                key={comp.id}
                onClick={() => handleSelectCompany(comp)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 relative overflow-hidden backdrop-blur-md ${
                  isSelected
                    ? `bg-slate-900 border-primary shadow-xl ${comp.glowColor}`
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Building2 className={`w-5 h-5 ${isSelected ? "text-primary-light" : "text-slate-400"}`} />
                    <span className="font-display font-bold text-slate-100 text-lg">{comp.name}</span>
                  </div>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{comp.tagline}</p>

                <div className="pt-1">
                  <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold bg-gradient-to-r ${comp.badgeColor}`}>
                    {comp.focus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Controls: Role & Resume Selection */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Target Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Candidate Resume
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

        <button
          onClick={handleRunSimulation}
          disabled={evaluating || resumes.length === 0}
          className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary via-indigo-600 to-accent hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/25"
        >
          {evaluating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Recruiter Bar...
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4" /> Run Recruiter Simulation
            </>
          )}
        </button>
      </div>

      {/* RESULTS DISPLAY VIEW */}
      {simulation && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Banner: Decision & Probability Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Probability Score Circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 backdrop-blur-md relative overflow-hidden"
            >
              <ScoreCircle
                score={simulation.interviewProbability}
                size={190}
                strokeWidth={14}
                label="Interview Shortlist Probability"
                sublabel={`${selectedCompany.name} SDE Standard`}
              />
            </motion.div>

            {/* Decision Banner Card */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Recruiter Screening Output</span>
                  <span
                    className={`px-4 py-1.5 rounded-xl border text-xs font-extrabold uppercase tracking-wider ${
                      simulation.decision === "Shortlisted"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                        : simulation.decision === "Borderline"
                        ? "bg-amber-950 text-amber-300 border-amber-800"
                        : "bg-rose-950 text-rose-300 border-rose-800"
                    }`}
                  >
                    {simulation.decision === "Shortlisted" && "👤 Recruiter: I WOULD SHORTLIST THIS CANDIDATE"}
                    {simulation.decision === "Borderline" && "👤 Recruiter: CANDIDATE IS BORDERLINE / ON THE FENCE"}
                    {simulation.decision === "Rejected" && "👤 Recruiter: WOULD NOT SHORTLIST AT THIS STAGE"}
                  </span>
                </div>

                <h2 className="text-2xl font-display font-bold text-slate-100">
                  {simulation.company} • {simulation.targetRole}
                </h2>
                <p className="text-slate-400 text-sm">
                  Evaluated candidate resume <span className="text-slate-200 font-semibold">{simulation.resume?.fileName || "Resume"}</span> against {simulation.company}'s real-world hiring criteria.
                </p>
              </div>

              {/* Shortlist Reasons Grid: Positive vs Red Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Positive Highlights */}
                <div className="p-4 bg-emerald-950/30 border border-emerald-900/40 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Strong Highlights (✔)
                  </span>
                  <div className="space-y-1.5">
                    {simulation.reasons?.positive?.map((pos, idx) => (
                      <p key={idx} className="text-xs text-emerald-300 leading-relaxed flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">✔</span> {pos}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Deal Breakers / Red Flags */}
                <div className="p-4 bg-rose-950/30 border border-rose-900/40 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Red Flags & Gaps (✖)
                  </span>
                  <div className="space-y-1.5">
                    {simulation.reasons?.negative?.map((neg, idx) => (
                      <p key={idx} className="text-xs text-rose-300 leading-relaxed flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">✖</span> {neg}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expected Interview Questions & Rejection Risks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Expected Questions (2 cols) */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary-light" /> Expected Interview Questions
                </h3>

                <div className="flex items-center gap-2">
                  {[
                    { id: "technical", label: "Technical & Systems" },
                    { id: "hr", label: "HR & Culture" },
                    { id: "resume", label: "Resume Deep-Dive" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setQuestionTab(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        questionTab === tab.id
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {questionTab === "technical" &&
                  simulation.expectedQuestions?.technical?.map((q, idx) => (
                    <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary-light flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        Q{idx + 1}
                      </span>
                      <p className="text-slate-200 text-sm leading-relaxed">{q}</p>
                    </div>
                  ))}

                {questionTab === "hr" &&
                  simulation.expectedQuestions?.hr?.map((q, idx) => (
                    <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        Q{idx + 1}
                      </span>
                      <p className="text-slate-200 text-sm leading-relaxed">{q}</p>
                    </div>
                  ))}

                {questionTab === "resume" &&
                  simulation.expectedQuestions?.resumeSpecific?.map((q, idx) => (
                    <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-accent/20 text-accent-light flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        Q{idx + 1}
                      </span>
                      <p className="text-slate-200 text-sm leading-relaxed">{q}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Expected Rejection Risks (1 col) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" /> Expected Rejection Risks
                </h3>
                <p className="text-slate-400 text-xs mt-1">Factors that could cause rejection in screening.</p>

                <div className="space-y-3 mt-4">
                  {simulation.rejectionRisks?.map((risk, idx) => (
                    <div key={idx} className="p-3.5 bg-rose-950/30 border border-rose-900/40 rounded-2xl text-xs text-rose-300 leading-relaxed flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md space-y-4">
          <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-primary-light" /> Screening Simulation History
          </h3>

          <div className="space-y-3">
            {history.map((sim) => (
              <div
                key={sim._id}
                onClick={() => setSimulation(sim)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  simulation?._id === sim._id
                    ? "bg-slate-900 border-primary/50"
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div>
                  <h4 className="font-semibold text-slate-100 text-sm">
                    {sim.company} • {sim.targetRole}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Screened on {new Date(sim.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      sim.decision === "Shortlisted"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : sim.decision === "Borderline"
                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                        : "bg-rose-950 text-rose-300 border border-rose-800"
                    }`}
                  >
                    {sim.decision} ({sim.interviewProbability}%)
                  </span>

                  <button
                    onClick={(e) => handleDeleteSimulation(sim._id, e)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-all"
                    title="Delete simulation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterSimulator;
