import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  FolderPlus,
  HelpCircle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
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
const GENERATION_STAGES = [
  "Assessing current profile",
  "Identifying target-role gaps",
  "Building execution strategy",
  "Prioritizing milestones",
];
const normalizeGoal = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
const newRequestId = () => globalThis.crypto?.randomUUID?.() || `ceo_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const EmptyState = ({ canGenerate }) => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center">
    <Target className="w-10 h-10 text-slate-500 mx-auto mb-4" />
    <h2 className="text-lg font-bold text-slate-100">{canGenerate ? "No saved strategy yet" : "Profile evidence required"}</h2>
    <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
      {canGenerate
        ? "Choose a supported career goal and generate your first evidence-based execution plan."
        : "Upload a resume or complete Career DNA before generating an AI CEO strategy."}
    </p>
  </div>
);

export const AICEOMode = () => {
  const [loading, setLoading] = useState(true);
  const [generatingTarget, setGeneratingTarget] = useState("");
  const [generationStage, setGenerationStage] = useState(0);
  const [targetGoal, setTargetGoal] = useState("Google SDE");
  const [plan, setPlan] = useState(null);
  const [savedPlan, setSavedPlan] = useState(null);
  const [canGenerate, setCanGenerate] = useState(false);
  const [loadError, setLoadError] = useState("");
  const requestSequence = useRef(0);
  const activeController = useRef(null);

  const loadLatest = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const payload = await ceoModeService.getLatest();
      setPlan(payload.plan);
      setSavedPlan(payload.savedPlan);
      setCanGenerate(Boolean(payload.canGenerate));
      if (payload.plan?.target?.input) setTargetGoal(payload.plan.target.input);
    } catch (error) {
      setLoadError(error.message || "Unable to load the latest AI CEO strategy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatest();
    return () => {
      requestSequence.current += 1;
      activeController.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!generatingTarget) return undefined;
    setGenerationStage(0);
    const timer = window.setInterval(() => {
      setGenerationStage((value) => Math.min(value + 1, GENERATION_STAGES.length - 1));
    }, 2600);
    return () => window.clearInterval(timer);
  }, [generatingTarget]);

  const displayedPlan = useMemo(() => {
    if (!plan) return null;
    return normalizeGoal(plan.target?.input) === normalizeGoal(targetGoal) ? plan : null;
  }, [plan, targetGoal]);
  const sameTargetGenerating = Boolean(generatingTarget) && normalizeGoal(generatingTarget) === normalizeGoal(targetGoal);

  const handleGenerate = async (selectedGoal) => {
    const goal = String(selectedGoal ?? targetGoal).trim().replace(/\s+/g, " ");
    if (!goal) {
      toast.error("Please enter a target career goal.");
      return;
    }
    if (normalizeGoal(generatingTarget) === normalizeGoal(goal)) return;

    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    const sequence = ++requestSequence.current;
    setTargetGoal(goal);
    setGeneratingTarget(goal);
    setLoadError("");
    const toastId = toast.loading(`Building an evidence-based strategy for ${goal}...`);

    try {
      const payload = await ceoModeService.generate(
        { targetGoal: goal, requestId: newRequestId() },
        { signal: controller.signal },
      );
      if (sequence !== requestSequence.current) return;
      setPlan(payload.plan);
      setSavedPlan(payload.savedPlan);
      setCanGenerate(true);
      toast.success(`Strategic execution plan for ${goal} is ready.`, { id: toastId });
    } catch (error) {
      if (sequence !== requestSequence.current) return;
      const message = error.status === 422
        ? "Upload a resume or complete Career DNA before generating a strategy."
        : error.status === 429
          ? "AI CEO Mode is temporarily rate limited. Please try again shortly."
          : error.status === 401
            ? "Your session has expired. Please sign in again."
            : error.message || "Unable to generate the strategic execution plan.";
      toast.error(message, { id: toastId });
    } finally {
      if (sequence === requestSequence.current) {
        setGeneratingTarget("");
        activeController.current = null;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner />
        <p className="text-slate-400 text-sm">Loading your latest AI CEO strategy...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      <div>
        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-extrabold text-amber-400 inline-flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> AI Chief Executive Strategist
        </span>
        <h1 className="text-3xl font-display font-extrabold text-slate-100 mt-2">AI CEO Mode</h1>
        <p className="text-slate-400 mt-1">Turn your current PathForge evidence and selected target into one practical career operating plan.</p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
        <label htmlFor="ceo-target" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Target career goal</label>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            id="ceo-target"
            value={targetGoal}
            onChange={(event) => setTargetGoal(event.target.value)}
            placeholder="e.g. Google SDE or Machine Learning Engineer"
            maxLength={120}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => handleGenerate(targetGoal)}
            disabled={sameTargetGenerating || !canGenerate}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-primary hover:opacity-90 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20"
          >
            {sameTargetGenerating ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating Strategic Plan...</> : <><Briefcase className="w-4 h-4" /> Generate Strategic Execution Plan</>}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {TARGET_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset}
              onClick={() => handleGenerate(preset)}
              disabled={normalizeGoal(generatingTarget) === normalizeGoal(preset) || !canGenerate}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800/80 hover:border-slate-700 disabled:opacity-50 text-slate-300 hover:text-white text-xs font-medium rounded-xl transition-all"
            >
              {preset}
            </button>
          ))}
        </div>
        {generatingTarget && (
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
            <RefreshCw className="w-4 h-4 animate-spin" /> {GENERATION_STAGES[generationStage]} for {generatingTarget}
          </div>
        )}
      </div>

      {loadError && (
        <div className="bg-rose-950/30 border border-rose-900/50 rounded-2xl p-4 flex items-start gap-3 text-sm text-rose-200">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div><p>{loadError}</p><button type="button" onClick={loadLatest} className="text-rose-300 underline mt-1">Retry loading saved strategy</button></div>
        </div>
      )}

      {plan && !displayedPlan && !generatingTarget && (
        <div className="bg-indigo-950/30 border border-indigo-800/50 rounded-2xl p-4 text-sm text-indigo-200">
          The visible goal differs from your saved {plan.target?.label} plan. Generate a new strategy to avoid showing old advice under a new target.
        </div>
      )}

      {!displayedPlan && !plan && !generatingTarget && <EmptyState canGenerate={canGenerate} />}

      {displayedPlan && (
        <div className="space-y-8 animate-fade-in">
          {savedPlan?.isStale && (
            <div className="bg-amber-950/30 border border-amber-800/50 rounded-2xl p-4 flex gap-3 text-sm text-amber-200">
              <AlertTriangle className="w-5 h-5 shrink-0" /> Your profile has changed since this strategy was generated. Regenerate it to use the latest evidence.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-3">
              <ScoreCircle score={displayedPlan.readiness.score} size={190} strokeWidth={14} label="Strategic Readiness" sublabel={displayedPlan.readiness.label} />
              <p className="text-[11px] text-slate-500 leading-relaxed">{displayedPlan.readiness.disclaimer}</p>
            </motion.div>

            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-5">
              <div className="flex flex-wrap justify-between gap-3">
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Executive strategy alignment</span>
                <span className="px-3.5 py-1 bg-amber-950/40 border border-amber-800 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Estimated preparation horizon: {displayedPlan.timeline.range}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div><span className="text-xs text-slate-400 block">Current position</span><span className="text-lg font-bold text-slate-200">{displayedPlan.currentPosition.label}</span></div>
                <ArrowRight className="w-5 h-5 text-slate-500 hidden sm:block" />
                <div><span className="text-xs text-slate-400 block">Target goal</span><span className="text-xl font-black text-amber-400">{displayedPlan.target.label}</span></div>
              </div>
              <p className="text-xs text-slate-500">{displayedPlan.currentPosition.basis}</p>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800">{displayedPlan.careerGapSummary}</p>
              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-2">Priority skills and evidence gaps</span>
                <div className="flex flex-wrap gap-2">{displayedPlan.priorityGaps.map((gap) => <span key={`${gap.skill}-${gap.type}`} title={gap.evidence} className={`px-3 py-1.5 border text-xs font-semibold rounded-xl ${gap.priority === "high" ? "bg-rose-500/10 border-rose-500/20 text-rose-300" : "bg-primary/10 border-primary/20 text-primary-light"}`}>{gap.skill} · {gap.type.replaceAll("_", " ")}</span>)}</div>
              </div>
              <p className="text-xs text-slate-500">{displayedPlan.readiness.evidenceCoverage}</p>
            </div>
          </div>

          <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div><h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><Calendar className="w-5 h-5 text-amber-400" /> Weekly Execution Sprint Plan</h2><p className="text-slate-400 text-xs mt-1">First 4-week cycle, planned around {displayedPlan.source.learningTime.hoursPerDay} hour(s) per day.</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{displayedPlan.weeklyPlan.map((item) => <div key={item.week} className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3"><span className="text-[11px] font-bold text-amber-400 uppercase">Week {item.week}</span><p className="text-sm font-semibold text-slate-200">{item.focus}</p><ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">{item.objectives.map((value) => <li key={value}>{value}</li>)}</ul><p className="text-[11px] text-emerald-300">Deliverable: {item.deliverables[0]}</p></div>)}</div>
          </section>

          <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div><h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><Target className="w-5 h-5 text-primary-light" /> Monthly Milestones</h2><p className="text-slate-400 text-xs mt-1">{displayedPlan.timeline.planMonths}-month milestone phase within the displayed preparation horizon.</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{displayedPlan.monthlyMilestones.map((item) => <div key={item.month} className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2"><span className="text-[11px] font-bold text-primary-light uppercase">Month {item.month}</span><p className="text-xs font-semibold text-slate-200">{item.objective}</p><p className="text-[11px] text-slate-500">Evidence: {item.successCriteria[0]}</p></div>)}</div>
            {displayedPlan.timeline.seniorityConstraint && <p className="text-xs text-amber-300 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">{displayedPlan.timeline.seniorityConstraint}</p>}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4"><h2 className="text-lg font-bold text-slate-100 flex items-center gap-2"><FolderPlus className="w-5 h-5 text-emerald-400" /> Architectural Projects</h2>{displayedPlan.projects.map((project) => <div key={project.title} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl"><p className="text-sm font-semibold text-slate-200">{project.title}</p><p className="text-xs text-emerald-300 mt-1">{project.skillsTargeted.join(" · ")}</p><p className="text-xs text-slate-400 mt-2">{project.reason}</p></div>)}</section>
            <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4"><h2 className="text-lg font-bold text-slate-100 flex items-center gap-2"><FileText className="w-5 h-5 text-accent-light" /> Resume Directives</h2>{displayedPlan.resumeDirectives.map((directive) => <div key={directive.action} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex gap-3"><CheckCircle2 className="w-4 h-4 text-accent-light shrink-0 mt-0.5" /><div><p className="text-xs font-medium text-slate-200">{directive.action}</p><p className="text-[11px] text-slate-500 mt-1">{directive.reason}</p></div></div>)}</section>
          </div>

          <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4"><h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-amber-400" /> Interview Prep Breakdown</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{displayedPlan.interviewPrep.map((item) => <div key={item.category} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl"><p className="text-xs font-semibold text-amber-300">{item.category}</p><p className="text-xs text-slate-300 mt-2">{item.topics.join(" · ")}</p><p className="text-[11px] text-slate-500 mt-2">{item.actions[0]}</p></div>)}</div></section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4"><h2 className="font-bold text-slate-100 flex items-center gap-2"><Flame className="w-5 h-5 text-amber-400" /> Daily Habits Routine</h2>{displayedPlan.dailyHabits.map((habit) => <div key={habit.activity} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300"><span className="text-amber-300 font-semibold">{habit.durationMinutes} min</span> · {habit.activity}<p className="text-[11px] text-slate-500 mt-1">{habit.daysPerWeek} days/week</p></div>)}</section>
            <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4"><h2 className="font-bold text-slate-100 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Competitive Advantages</h2>{displayedPlan.careerAdvantages.length ? displayedPlan.careerAdvantages.map((item) => <div key={item.advantage} className="p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-xl text-xs text-emerald-300">{item.advantage}<p className="text-[11px] text-emerald-500 mt-1">{item.evidence}</p></div>) : <p className="text-xs text-slate-500">Add more profile evidence to identify defensible advantages.</p>}</section>
            <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4"><h2 className="font-bold text-slate-100 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-rose-400" /> Risk Blockers</h2>{displayedPlan.riskBlockers.map((item) => <div key={item.risk} className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-xl text-xs text-rose-300">{item.risk}<p className="text-[11px] text-rose-500 mt-1">{item.mitigation}</p></div>)}</section>
          </div>

          <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 space-y-3 shadow-2xl"><span className="text-xs text-amber-400 font-extrabold uppercase tracking-wider">Executive Final Advice</span><p className="text-slate-100 text-sm font-semibold leading-relaxed">{displayedPlan.finalAdvice}</p><p className="text-[11px] text-slate-500">Generated from Resume V{displayedPlan.source.resumeVersion || "unversioned"} · {new Date(displayedPlan.generatedAt).toLocaleString()}</p></section>
        </div>
      )}
    </div>
  );
};

export default AICEOMode;
