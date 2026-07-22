import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Compass,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Target,
  BookOpen,
  Award,
  Layers,
  RefreshCw,
  FolderPlus,
  Zap,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ScoreCircle from "../components/ui/ScoreCircle";
import { opportunityRadarService } from "../services/opportunityRadar.service";

export const OpportunityRadar = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [radar, setRadar] = useState(null);

  useEffect(() => {
    fetchOpportunityRadar();
  }, []);

  const fetchOpportunityRadar = async () => {
    setLoading(true);
    try {
      const res = await opportunityRadarService.getOpportunityRadar();
      const payload = res?.data || res;
      if (payload && typeof payload === "object") {
        setRadar(payload);
      }
    } catch (err) {
      console.error("Failed to load Opportunity Radar:", err);
      toast.error("Failed to load Opportunity Radar.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateRadar = async () => {
    setRefreshing(true);
    const toastId = toast.loading("Analyzing career opportunity radar...");

    try {
      const res = await opportunityRadarService.generateOpportunityRadar();
      const payload = res?.data || res;
      if (payload && typeof payload === "object") {
        setRadar(payload);
        toast.success("Opportunity Radar updated!", { id: toastId });
      }
    } catch (err) {
      console.error("Regenerate radar error:", err);
      toast.error("Failed to update Opportunity Radar.", { id: toastId });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner />
        <p className="text-slate-400 text-sm">Evaluating proactive career opportunity radar...</p>
      </div>
    );
  }

  if (!radar) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center space-y-6 backdrop-blur-md">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
            <Compass className="w-8 h-8 text-primary-light" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-semibold text-slate-200">Opportunity Radar Locked</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload your resume and complete a few ATS or job matching audits to unlock proactive opportunity recommendations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-xs font-semibold text-primary-light flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Proactive Guidance (No JD Required)
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-100 mt-2 flex items-center gap-3">
            AI Opportunity Radar
          </h1>
          <p className="text-slate-400 mt-1">
            Proactively predicts role eligibility, skill gap priorities, and career trajectories based on your profile context.
          </p>
        </div>

        <button
          onClick={handleRegenerateRadar}
          disabled={refreshing}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary via-indigo-600 to-accent hover:opacity-90 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-primary/20"
        >
          {refreshing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Scanning Radar...
            </>
          ) : (
            <>
              <Compass className="w-4 h-4" /> Re-Scan Opportunity Radar
            </>
          )}
        </button>
      </div>

      {/* Hero Guidance Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl p-8 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-xl">
              Overall Readiness: {radar.overallReadiness}%
            </span>
            <span className="px-3 py-1 bg-amber-950/50 border border-amber-800 text-amber-300 text-xs font-bold rounded-xl">
              AI Confidence: {radar.confidence}%
            </span>
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-100">
            {radar.careerDirection}
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            {radar.careerAdvice}
          </p>
        </div>

        <div className="shrink-0 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
          <span className="text-xs text-slate-400 block font-medium">Estimated Timeline</span>
          <span className="text-lg font-display font-black text-amber-400 mt-1 block">
            {radar.estimatedTimeline}
          </span>
        </div>
      </motion.div>

      {/* 3-Tier Opportunity Eligibility Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier 1: Ready Now */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-display font-bold text-slate-100 text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> ✅ Ready Now
            </h3>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold rounded-lg border border-emerald-500/20">
              Immediate Eligibility
            </span>
          </div>

          <div className="space-y-2.5">
            {radar.readyRoles?.map((role, idx) => (
              <div key={idx} className="p-3.5 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl flex items-center justify-between gap-2">
                <span className="text-slate-200 text-xs font-semibold">{role}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Tier 2: Almost Ready */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-display font-bold text-slate-100 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" /> 🟡 Almost Ready
            </h3>
            <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-[11px] font-bold rounded-lg border border-amber-500/20">
              2–4 Months Target
            </span>
          </div>

          <div className="space-y-3">
            {radar.nearReadyRoles?.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-100 text-xs font-bold">{item.role}</span>
                  <span className="text-amber-400 text-xs font-bold">{item.readiness}%</span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full" style={{ width: `${item.readiness}%` }} />
                </div>

                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block font-semibold">Missing:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.missing?.map((m, mIdx) => (
                      <span key={mIdx} className="px-2 py-0.5 bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[10px] font-medium rounded-lg">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 3: Long-Term Goals */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-display font-bold text-slate-100 text-base flex items-center gap-2">
              <Target className="w-5 h-5 text-rose-400" /> 🔴 Long-Term Goals
            </h3>
            <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-400 text-[11px] font-bold rounded-lg border border-rose-500/20">
              Future Trajectories
            </span>
          </div>

          <div className="space-y-3">
            {radar.futureRoles?.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-100 text-xs font-bold">{item.role}</span>
                  <span className="text-slate-400 text-[11px] font-semibold">{item.timeline}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.why}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Readiness Trajectory Cards & Skill Gap Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Readiness Progress Trajectory */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
          <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-light" /> Role Readiness Trajectory
          </h3>
          <p className="text-slate-400 text-xs">Calculated compatibility percentage for target tech roles.</p>

          <div className="space-y-4 pt-2">
            {radar.roleReadiness?.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-semibold">{item.role}</span>
                  <span className="text-slate-400 font-bold">{item.percentage}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-primary to-emerald-400 h-full rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Gap Priority Matrix */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
          <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" /> Skill Gap Priority Matrix
          </h3>
          <p className="text-slate-400 text-xs">Key technical skills prioritized by impact on role eligibility.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {radar.topSkillGaps?.map((gap, idx) => (
              <div key={idx} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                <span className="text-slate-200 text-xs font-semibold">{gap.skill}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${
                    gap.priority === "High"
                      ? "bg-rose-950 text-rose-300 border border-rose-800"
                      : gap.priority === "Medium"
                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                      : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}
                >
                  {gap.priority} Priority
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Projects & Certifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Projects */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-emerald-400" /> AI Recommended Projects
          </h3>
          <p className="text-slate-400 text-xs">Custom portfolio projects designed to bridge identified skill gaps.</p>

          <div className="space-y-3 pt-2">
            {radar.recommendedProjects?.map((proj, idx) => (
              <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-slate-200 text-xs font-medium leading-relaxed">{proj}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Certifications */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> AI Recommended Certifications
          </h3>
          <p className="text-slate-400 text-xs">Recognized industry certifications to validate candidate competency.</p>

          <div className="space-y-3 pt-2">
            {radar.recommendedCertifications?.map((cert, idx) => (
              <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-start gap-3">
                <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-slate-200 text-xs font-medium leading-relaxed">{cert}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityRadar;
