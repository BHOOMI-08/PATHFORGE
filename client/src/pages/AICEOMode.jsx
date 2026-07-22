import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Briefcase,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  FolderPlus,
  FileText,
  HelpCircle,
  ShieldAlert,
  Flame,
  RefreshCw,
  Compass,
  ArrowRight,
} from "lucide-react";
import ScoreCircle from "../components/ui/ScoreCircle";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { ceoModeService } from "../services/ceoMode.service";

const TARGET_PRESETS = [
  "Google SDE",
  "Amazon SDE",
  "Senior Backend Engineer",
  "Full Stack Engineer",
  "Machine Learning Engineer",
  "AI Engineer",
  "Solutions Architect",
];

export const AICEOMode = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [targetRoleInput, setTargetRoleInput] = useState("Google SDE");
  const [ceoPlan, setCeoPlan] = useState(null);

  useEffect(() => {
    fetchInitialPlan();
  }, []);

  const fetchInitialPlan = async () => {
    setLoading(true);
    try {
      const res = await ceoModeService.getCEORoadmap();
      const plan = res?.data || res;
      if (plan && typeof plan === "object") {
        setCeoPlan(plan);
        if (plan.targetRole) {
          setTargetRoleInput(plan.targetRole);
        }
      }
    } catch (err) {
      console.error("Failed to load AI CEO Mode plan:", err);
      toast.error("Failed to load AI CEO Mode plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async (selectedRole) => {
    const roleToUse = selectedRole || targetRoleInput;
    if (!roleToUse.trim()) {
      toast.error("Please enter a target career role.");
      return;
    }

    setGenerating(true);
    const toastId = toast.loading(`AI CEO synthesizing strategic plan for ${roleToUse}...`);

    try {
      const res = await ceoModeService.generateCEORoadmap({ targetRole: roleToUse.trim() });
      const plan = res?.data || res;
      if (plan && typeof plan === "object") {
        setCeoPlan(plan);
        toast.success(`Executive plan for ${roleToUse} generated!`, { id: toastId });
      }
    } catch (err) {
      console.error("Generate CEO plan error:", err);
      toast.error(err.response?.data?.message || "Failed to generate AI CEO plan.", { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner />
        <p className="text-slate-400 text-sm">Initializing AI CEO Mode Executive Strategist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-extrabold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> AI Chief Executive Strategist
          </span>
        </div>
        <h1 className="text-3xl font-display font-extrabold text-slate-100 mt-2 flex items-center gap-3">
          AI CEO Mode
        </h1>
        <p className="text-slate-400 mt-1">
          Chief Executive Officer of Your Career. Synthesizes executive execution plans, weekly sprints, and monthly milestones.
        </p>
      </div>

      {/* Target Goal Input & Presets Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Target Career Goal ("I Want to Become")
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            value={targetRoleInput}
            onChange={(e) => setTargetRoleInput(e.target.value)}
            placeholder="e.g. Google SDE, Amazon SDE, Senior Backend Engineer"
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
          />
          <button
            onClick={() => handleGeneratePlan(targetRoleInput)}
            disabled={generating}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-primary hover:opacity-90 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing Strategy...
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4" /> Generate Strategic Execution Plan
              </>
            )}
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2 pt-1">
          {TARGET_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setTargetRoleInput(preset);
                handleGeneratePlan(preset);
              }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl transition-all"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {ceoPlan && (
        <div className="space-y-8 animate-fade-in">
          {/* Section 1 & 2: Target Career, Current Position & Probability Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Probability Score Circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 backdrop-blur-md relative overflow-hidden"
            >
              <ScoreCircle
                score={ceoPlan.probabilityOfSuccess || 81}
                size={190}
                strokeWidth={14}
                label="Probability of Success"
                sublabel="AI Strategic Estimate"
              />
            </motion.div>

            {/* Target Alignment Banner (Section 1 & 3) */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    Executive Strategy Alignment
                  </span>
                  <span className="px-3.5 py-1 bg-amber-950/40 border border-amber-800 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Estimated Timeline: {ceoPlan.estimatedTimeline}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Current Position</span>
                    <span className="text-lg font-display font-bold text-slate-200">
                      {ceoPlan.currentPosition}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 hidden sm:block" />
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">🎯 Target Goal</span>
                    <span className="text-xl font-display font-black text-amber-400">
                      {ceoPlan.targetRole}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  {ceoPlan.careerGapSummary}
                </p>
              </div>

              {/* Priority Skills Badges (Section 4) */}
              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-2">
                  Priority Skills Matrix
                </span>
                <div className="flex flex-wrap gap-2">
                  {ceoPlan.prioritySkills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary-light text-xs font-semibold rounded-xl"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Weekly Execution Plan (4-Week Sprint Timeline) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" /> Weekly Execution Sprint Plan (Section 8)
              </h3>
              <p className="text-slate-400 text-xs mt-1">4-week high-impact engineering sprints.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ceoPlan.weeklyExecutionPlan?.map((item, idx) => (
                <div key={idx} className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold rounded-lg uppercase">
                    {item.week}
                  </span>
                  <p className="text-slate-200 text-xs font-semibold pt-1 leading-relaxed">{item.focus}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 9: Monthly Milestones */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-light" /> Monthly Milestones (Section 9)
              </h3>
              <p className="text-slate-400 text-xs mt-1">Strategic 4-month career milestones.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ceoPlan.monthlyMilestones?.map((item, idx) => (
                <div key={idx} className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                  <span className="px-2.5 py-1 bg-primary/10 text-primary-light border border-primary/20 text-[11px] font-bold rounded-lg uppercase">
                    {item.month}
                  </span>
                  <p className="text-slate-200 text-xs font-semibold pt-1 leading-relaxed">{item.goal}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5 & 6: Recommended Projects & Resume Improvements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommended Projects (Section 5) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
              <h3 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-emerald-400" /> Architectural Projects (Section 5)
              </h3>
              <div className="space-y-3 pt-1">
                {ceoPlan.recommendedProjects?.map((proj, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-slate-200 text-xs font-medium leading-relaxed">{proj}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Resume Improvements (Section 6) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
              <h3 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent-light" /> Resume Directives (Section 6)
              </h3>
              <div className="space-y-3 pt-1">
                {ceoPlan.resumeImprovements?.map((imp, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-accent-light shrink-0 mt-0.5" />
                    <p className="text-slate-200 text-xs font-medium leading-relaxed">{imp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 7: Interview Preparation Breakdown */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
            <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" /> Interview Prep Breakdown (Section 7)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {ceoPlan.interviewPreparation?.map((prep, idx) => (
                <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs text-slate-200 font-medium leading-relaxed flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  {prep}
                </div>
              ))}
            </div>
          </div>

          {/* Section 10, 11, 12: Daily Habits, Advantages & Risks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Habits Routine (Section 12) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
              <h4 className="font-display font-bold text-slate-100 text-base flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" /> Daily Habits Routine (Section 12)
              </h4>
              <div className="space-y-2">
                {ceoPlan.dailyHabits?.map((habit, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 font-medium leading-relaxed">
                    ⚡ {habit}
                  </div>
                ))}
              </div>
            </div>

            {/* Career Advantages (Section 11) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
              <h4 className="font-display font-bold text-slate-100 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Competitive Advantages (Section 11)
              </h4>
              <div className="space-y-2">
                {ceoPlan.careerAdvantages?.map((adv, idx) => (
                  <div key={idx} className="p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-xl text-xs text-emerald-300 leading-relaxed">
                    ✔ {adv}
                  </div>
                ))}
              </div>
            </div>

            {/* Career Risks (Section 10) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
              <h4 className="font-display font-bold text-slate-100 text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" /> Risk Blockers (Section 10)
              </h4>
              <div className="space-y-2">
                {ceoPlan.careerRisks?.map((risk, idx) => (
                  <div key={idx} className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-xl text-xs text-rose-300 leading-relaxed">
                    ✖ {risk}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 13: Executive CEO Advice Summary Card */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 backdrop-blur-md space-y-3 shadow-2xl">
            <span className="text-xs text-amber-400 font-extrabold uppercase tracking-wider block">
              🏆 Section 13: Executive CEO Final Advice
            </span>
            <p className="text-slate-100 text-sm font-semibold leading-relaxed">
              {ceoPlan.finalCEOAdvice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICEOMode;
