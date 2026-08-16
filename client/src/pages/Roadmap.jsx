import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Compass,
  Gauge,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import RoadmapTimeline from "../components/navigation/RoadmapTimeline";
import { roadmapService } from "../services/roadmap.service";

const sourceLabels = {
  careerDNA: "Career DNA",
  resume: "Parsed Resume",
  ats: "ATS Analysis",
  jobMatch: "Job Match",
  preferences: "Learning Preferences",
  previousRoadmap: "Previous Roadmap",
};

const RoadmapSkeleton = () => (
  <div className="space-y-6 animate-pulse" aria-label="Loading roadmap">
    <div className="h-40 rounded-3xl border border-slate-800 bg-slate-900/60" />
    {[1, 2, 3].map((item) => (
      <div key={item} className="ml-8 h-52 rounded-3xl border border-slate-800 bg-slate-900/40" />
    ))}
  </div>
);

export const Roadmap = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [difficulty, setDifficulty] = useState("Adaptive");
  const [dailyHours, setDailyHours] = useState(2);

  const fetchActiveRoadmap = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await roadmapService.getUserRoadmap();
      const roadmapData = res?.data || res;
      setRoadmap(roadmapData?._id ? roadmapData : null);
    } catch (error) {
      const message = error.body?.message || error.message || "Failed to load learning roadmap.";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRoadmap();
  }, []);

  const openGenerateModal = () => {
    setTargetRole(roadmap?.targetRole || "");
    setDurationWeeks(roadmap?.totalDurationWeeks || 8);
    setDifficulty("Adaptive");
    setDailyHours(roadmap?.personalization?.dailyHours || 2);
    setFormError("");
    setShowGenerateModal(true);
  };

  const handleGenerateRoadmap = async (event) => {
    event.preventDefault();
    if (generating) return;
    if (targetRole.trim().length < 2) {
      setFormError("Enter a valid target role.");
      return;
    }
    if (roadmap?.overallProgress > 0 && !window.confirm("Regeneration creates a new roadmap version and resets current task progress. Continue?")) {
      return;
    }

    setGenerating(true);
    setFormError("");
    const toastId = toast.loading("Generating a personalized roadmap from your career data...");
    try {
      const res = await roadmapService.generateRoadmap({
        targetRole: targetRole.trim(),
        durationWeeks: Number(durationWeeks),
        difficulty,
        dailyHours: Number(dailyHours),
        regenerationReason: roadmap ? "User requested a revised active roadmap" : "",
      });
      const roadmapData = res?.data || res;
      if (!roadmapData?._id) throw new Error("Roadmap provider returned an empty result.");
      setRoadmap(roadmapData);
      setShowGenerateModal(false);
      toast.success(roadmap ? "Roadmap regenerated as a new version." : "Roadmap generated successfully.", { id: toastId });
    } catch (error) {
      const message = error.body?.message || error.message || "Failed to generate roadmap.";
      setFormError(message);
      toast.error(message, { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId, completed) => {
    if (togglingTaskId) return;
    setTogglingTaskId(taskId);
    try {
      const res = await roadmapService.toggleTaskStatus(taskId, completed);
      const updatedRoadmap = res?.data || res;
      if (!updatedRoadmap?._id) throw new Error("Progress update returned an empty result.");
      setRoadmap(updatedRoadmap);
    } catch (error) {
      toast.error(error.body?.message || error.message || "Failed to update task progress.");
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleDeleteRoadmap = async () => {
    if (deleting || !window.confirm("Delete this roadmap and all of its progress?")) return;
    setDeleting(true);
    try {
      await roadmapService.deleteRoadmap();
      setRoadmap(null);
      toast.success("Roadmap removed.");
    } catch (error) {
      toast.error(error.body?.message || error.message || "Failed to delete roadmap.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <RoadmapSkeleton />;

  if (loadError && !roadmap) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-rose-900/60 bg-rose-950/20 p-10 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-400" />
        <h2 className="mt-4 text-xl font-bold text-slate-100">Unable to load your roadmap</h2>
        <p className="mt-2 text-sm text-slate-400">{loadError}</p>
        <button type="button" onClick={fetchActiveRoadmap} className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">Try again</button>
      </div>
    );
  }

  const sourcesUsed = Array.isArray(roadmap?.personalization?.sourcesUsed)
    ? roadmap.personalization.sourcesUsed
    : [];
  const missingSkills = Array.isArray(roadmap?.personalization?.missingSkills)
    ? roadmap.personalization.missingSkills
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-light">
            <Sparkles className="h-3.5 w-3.5" /> Gemini Personalized Learning Plan
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-100">Personalized Career Roadmap</h1>
          <p className="mt-1 text-slate-400">Milestones, projects, revision, and interview preparation grounded in your saved career evidence.</p>
        </div>

        <div className="flex items-center gap-3">
          {roadmap && (
            <button type="button" onClick={handleDeleteRoadmap} disabled={deleting || generating} className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-400 transition hover:bg-rose-950/40 hover:text-rose-400 disabled:opacity-50" title="Delete current roadmap">
              {deleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          )}
          <button type="button" onClick={openGenerateModal} disabled={generating || deleting} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:opacity-90 disabled:opacity-50">
            {roadmap ? <><RefreshCw className="h-4 w-4" /> Regenerate Roadmap</> : <><Plus className="h-4 w-4" /> Generate AI Roadmap</>}
          </button>
        </div>
      </div>

      {roadmap ? (
        <div className="space-y-8">
          {roadmap.isLegacy && (
            <div className="rounded-2xl border border-amber-800/50 bg-amber-950/20 p-5 text-sm text-amber-200">
              This is a legacy roadmap created by the previous unvalidated generator. Regenerate it before relying on its content or tracking progress.
            </div>
          )}
          <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md sm:p-8">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-light">
                  <Target className="h-4 w-4" /> Target Role
                  <span className="rounded-md border border-slate-700 px-2 py-0.5 text-slate-400">Version {roadmap.version || 1}</span>
                </div>
                <h2 className="mt-1 text-2xl font-bold text-slate-100">{roadmap.targetRole}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{roadmap.overallSummary}</p>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-right">
                  <span className="block text-xs font-medium text-slate-400">Overall Completion</span>
                  <span className="text-2xl font-extrabold text-emerald-400">{roadmap.overallProgress || 0}%</span>
                  <span className="block text-[11px] text-slate-500">{roadmap.progress?.completedTasks || 0}/{roadmap.progress?.totalTasks || 0} tasks</span>
                </div>
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300"><Clock className="mb-2 h-4 w-4 text-cyan-400" />{roadmap.totalDurationWeeks} weeks · {roadmap.weeklyHours} hours/week</div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300"><Gauge className="mb-2 h-4 w-4 text-amber-400" />{roadmap.difficulty} difficulty</div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300"><Sparkles className="mb-2 h-4 w-4 text-primary-light" />Generated by {roadmap.generatedBy === "gemini" ? "Gemini" : "AI"}</div>
            </div>

            <div className="h-3 overflow-hidden rounded-full border border-slate-800 bg-slate-950">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-500 to-accent" initial={{ width: 0 }} animate={{ width: `${roadmap.overallProgress || 0}%` }} transition={{ duration: 0.8 }} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personalization sources</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sourcesUsed.map((source) => <span key={source} className="rounded-xl border border-emerald-800/50 bg-emerald-950/30 px-3 py-1 text-xs font-semibold text-emerald-300">{sourceLabels[source] || source}</span>)}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Priority skill gaps</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {missingSkills.length ? missingSkills.slice(0, 12).map((skill) => <span key={skill} className="rounded-xl border border-rose-800/50 bg-rose-950/30 px-3 py-1 text-xs font-semibold text-rose-300">{skill}</span>) : <span className="text-xs text-slate-500">No explicit saved skill gaps were available.</span>}
                </div>
              </div>
            </div>

            {Array.isArray(roadmap.revisionWeeks) && roadmap.revisionWeeks.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scheduled revision checkpoints</h3>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  {roadmap.revisionWeeks.map((revision) => (
                    <div key={`${revision.week}-${revision.focus}`} className="rounded-2xl border border-indigo-800/40 bg-indigo-950/20 p-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Week {revision.week}</span>
                      <p className="mt-1 text-sm font-semibold text-slate-200">{revision.focus}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">{revision.checkpoint}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {!roadmap.isLegacy && <RoadmapTimeline milestones={roadmap.milestones || []} onToggleTask={handleToggleTask} togglingTaskId={togglingTaskId} />}
        </div>
      ) : (
        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center backdrop-blur-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10"><Compass className="h-8 w-8 text-primary-light" /></div>
          <div className="mx-auto max-w-md space-y-2">
            <h3 className="text-xl font-semibold text-slate-200">No active roadmap</h3>
            <p className="text-sm leading-relaxed text-slate-400">Generate a plan after completing Career DNA or uploading a parsed resume. ATS and Job Match evidence will be included when available.</p>
          </div>
          <button type="button" onClick={openGenerateModal} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-semibold text-white shadow-lg shadow-primary/25 transition hover:opacity-90"><Wand2 className="h-4 w-4" /> Generate AI Roadmap</button>
        </div>
      )}

      <AnimatePresence>
        {showGenerateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="roadmap-modal-title">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
              <button type="button" onClick={() => !generating && setShowGenerateModal(false)} disabled={generating} className="absolute right-6 top-6 text-slate-400 hover:text-white disabled:opacity-40"><X className="h-5 w-5" /></button>
              <div>
                <h3 id="roadmap-modal-title" className="flex items-center gap-2 text-2xl font-bold text-slate-100"><Wand2 className="h-6 w-6 text-primary-light" /> Configure Personalized Roadmap</h3>
                <p className="mt-1 text-sm text-slate-400">Your saved Resume, Career DNA, ATS, Job Match, and learning preferences are applied automatically.</p>
              </div>
              {roadmap && <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-3 text-xs text-amber-200">Regeneration replaces the active plan, increments its version, and resets task progress only after the new Gemini response validates successfully.</div>}
              <form onSubmit={handleGenerateRoadmap} className="space-y-4" aria-busy={generating}>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Target Role</label>
                  <input type="text" required minLength={2} maxLength={120} value={targetRole} onChange={(event) => { setTargetRole(event.target.value); setFormError(""); }} disabled={generating} placeholder="e.g. Machine Learning Engineer" className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 focus:border-primary focus:outline-none" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Duration</label>
                    <select value={durationWeeks} onChange={(event) => setDurationWeeks(Number(event.target.value))} disabled={generating} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 focus:border-primary focus:outline-none">
                      {[4, 6, 8, 12, 16, 24].map((weeks) => <option key={weeks} value={weeks}>{weeks} weeks</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Difficulty</label>
                    <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} disabled={generating} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 focus:border-primary focus:outline-none">
                      {['Adaptive', 'Beginner', 'Intermediate', 'Advanced'].map((level) => <option key={level} value={level}>{level}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Hours/day</label>
                    <input type="number" min="0.5" max="12" step="0.5" value={dailyHours} onChange={(event) => setDailyHours(Number(event.target.value))} disabled={generating} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 focus:border-primary focus:outline-none" />
                  </div>
                </div>
                {formError && <p className="text-sm text-rose-400">{formError}</p>}
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowGenerateModal(false)} disabled={generating} className="rounded-xl border border-slate-800 bg-slate-950 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50">Cancel</button>
                  <button type="submit" disabled={generating || targetRole.trim().length < 2} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:opacity-90 disabled:opacity-50">
                    {generating ? <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> {roadmap ? "Regenerate" : "Generate"} Roadmap</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Roadmap;
