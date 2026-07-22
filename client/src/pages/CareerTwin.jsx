import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Bot,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  RefreshCw,
  Compass,
  ArrowRight,
  Flame,
  Target,
} from "lucide-react";
import ScoreCircle from "../components/ui/ScoreCircle";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { careerTwinService } from "../services/careerTwin.service";

export const CareerTwin = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [twin, setTwin] = useState(null);

  useEffect(() => {
    fetchTwinProfile();
  }, []);

  const fetchTwinProfile = async () => {
    setLoading(true);
    try {
      const res = await careerTwinService.getCareerTwin();
      const profile = res?.data || res;
      if (profile && typeof profile === "object") {
        setTwin(profile);
      }
    } catch (err) {
      console.error("Failed to load Career Twin profile:", err);
      toast.error("Failed to load Career Twin profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateTwin = async () => {
    setRefreshing(true);
    const toastId = toast.loading("Synthesizing updated AI Career Twin persona...");

    try {
      const res = await careerTwinService.generateCareerTwin();
      const profile = res?.data || res;
      if (profile && typeof profile === "object") {
        setTwin(profile);
        toast.success("Career Twin profile updated!", { id: toastId });
      }
    } catch (err) {
      console.error("Regenerate twin error:", err);
      toast.error("Failed to regenerate Career Twin.", { id: toastId });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <LoadingSpinner />
          <p className="text-slate-400 text-sm">Synthesizing digital Career Twin profile...</p>
        </div>
      </div>
    );
  }

  if (!twin) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center space-y-6 backdrop-blur-md">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
            <Bot className="w-8 h-8 text-primary-light" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-semibold text-slate-200">Career Twin Locked</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload your resume and complete a few ATS audits or mock interviews to synthesize your digital Career Twin profile.
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
            <span className="px-3 py-1 bg-accent/10 border border-accent/30 rounded-full text-xs font-semibold text-accent-light flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Digital Career Twin Persona
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-100 mt-2 flex items-center gap-3">
            AI Career Twin
          </h1>
          <p className="text-slate-400 mt-1">
            Your personalized, AI-synthesized digital career identity evolving dynamically as you use PathForge AI.
          </p>
        </div>

        <button
          onClick={handleRegenerateTwin}
          disabled={refreshing}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-primary/20"
        >
          {refreshing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing...
            </>
          ) : (
            <>
              <Bot className="w-4 h-4" /> Re-Synthesize Profile
            </>
          )}
        </button>
      </div>

      {/* Hero Identity Banner: 🤖 Meet Your Career Twin */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary-light">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-primary-light font-bold uppercase tracking-wider block">
                  🤖 Meet Your Digital Twin
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-100 mt-0.5">
                  {twin.careerIdentity}
                </h2>
              </div>
            </div>

            <span className="px-4 py-1.5 bg-slate-950/80 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl">
              Current Level: <span className="text-emerald-400 font-bold">{twin.currentLevel}</span>
            </span>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
            {twin.careerSummary}
          </p>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-start gap-3 text-xs text-slate-200 leading-relaxed">
            <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Motivational Insight: </span>
              {twin.motivationalInsight}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Projections Ribbon: Readiness, Salary & Trajectories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Circular Progress Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 backdrop-blur-md"
        >
          <ScoreCircle
            score={twin.careerReadiness || 0}
            size={180}
            strokeWidth={14}
            label="Overall Career Readiness"
            sublabel={`AI Confidence: ${twin.confidenceScore || 90}%`}
          />
        </motion.div>

        {/* Salary & Role Potential Cards */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Career Growth Projections
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                AI-estimated compensation bands & potential role promotion trajectories.
              </p>
            </div>

            <div className="px-3 py-1 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5" /> {twin.estimatedSalaryRange || "₹8–12 LPA"}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 6 Months Potential */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400 font-medium block">Potential Target (6 Months)</span>
              <h4 className="font-display font-bold text-slate-100 text-lg flex items-center gap-2">
                <Target className="w-4 h-4 text-primary-light" /> {twin.potentialRole6Months}
              </h4>
              <p className="text-xs text-slate-500">Achievable with current learning consistency.</p>
            </div>

            {/* 12 Months Potential */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400 font-medium block">Potential Target (12 Months)</span>
              <h4 className="font-display font-bold text-slate-100 text-lg flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> {twin.potentialRole12Months}
              </h4>
              <p className="text-xs text-slate-500">Targeting senior engineering & platform roles.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl text-xs text-slate-400 flex items-center justify-between">
            <span>Strongest Skill: <strong className="text-slate-200">{twin.strongestSkill}</strong></span>
            <span>Weakest Skill: <strong className="text-rose-400">{twin.weakestSkill}</strong></span>
          </div>
        </div>
      </div>

      {/* AI Superpowers & Next Milestone Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Superpowers */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> AI Superpowers & Strengths
          </h3>
          <p className="text-slate-400 text-xs">Core technical advantages identified across your resume and mock interviews.</p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {twin.superpowers?.map((power, idx) => (
              <span
                key={idx}
                className="px-3.5 py-2 bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs font-semibold rounded-xl flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" /> {power}
              </span>
            ))}
          </div>
        </div>

        {/* Next Highlighted Milestone */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary-light" /> Recommended Next Milestone
            </h3>
            <p className="text-slate-400 text-xs mt-1">High-priority action step to unlock higher compensation bands.</p>

            <p className="text-sm font-semibold text-slate-200 mt-4 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              {twin.nextMilestone}
            </p>
          </div>
        </div>
      </div>

      {/* Strengths, Weaknesses & Risk Blockers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Strengths */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <h4 className="font-display font-bold text-slate-100 text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Top Strengths
          </h4>
          <div className="space-y-2">
            {twin.topStrengths?.map((str, idx) => (
              <div key={idx} className="p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-xl text-xs text-emerald-300 leading-relaxed flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                {str}
              </div>
            ))}
          </div>
        </div>

        {/* Weakest Areas */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <h4 className="font-display font-bold text-slate-100 text-base flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" /> Focus Improvement Areas
          </h4>
          <div className="space-y-2">
            {twin.topWeaknesses?.map((wk, idx) => (
              <div key={idx} className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl text-xs text-amber-300 leading-relaxed flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                {wk}
              </div>
            ))}
          </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <h4 className="font-display font-bold text-slate-100 text-base flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> Career Risk Blockers
          </h4>
          <div className="space-y-2">
            {twin.riskFactors?.map((risk, idx) => (
              <div key={idx} className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-xl text-xs text-rose-300 leading-relaxed flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                {risk}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Career Prediction Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md space-y-3">
        <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-light" /> AI Futuristic Career Prediction
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
          {twin.careerPrediction}
        </p>
        <span className="text-[11px] text-slate-500 italic block">
          * Career Twin projections are generated dynamically based on candidate data aggregation and Gemini AI models.
        </span>
      </div>
    </div>
  );
};

export default CareerTwin;
