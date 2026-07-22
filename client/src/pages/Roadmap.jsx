import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Compass,
  Sparkles,
  RefreshCw,
  Target,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  X,
  Wand2,
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import RoadmapTimeline from "../components/navigation/RoadmapTimeline";
import { roadmapService } from "../services/roadmap.service";

export const Roadmap = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Modal form states
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [durationWeeks, setDurationWeeks] = useState(6);

  useEffect(() => {
    fetchActiveRoadmap();
  }, []);

  const fetchActiveRoadmap = async () => {
    setLoading(true);
    try {
      const res = await roadmapService.getUserRoadmap();
      if (res?.data) {
        setRoadmap(res.data);
      }
    } catch (err) {
      console.error("Failed to load active roadmap:", err);
      toast.error("Failed to load learning roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    setGenerating(true);
    const toastId = toast.loading("Generating personalized AI learning roadmap...");

    try {
      const res = await roadmapService.generateRoadmap({
        targetRole,
        durationWeeks: Number(durationWeeks),
      });

      if (res?.data) {
        setRoadmap(res.data);
        setShowGenerateModal(false);
        toast.success("Learning roadmap generated!", { id: toastId });
      }
    } catch (err) {
      console.error("Roadmap generation error:", err);
      toast.error(err.response?.data?.message || "Failed to generate roadmap.", {
        id: toastId,
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    if (togglingTaskId) return; // prevent spamming clicks
    setTogglingTaskId(taskId);

    try {
      const res = await roadmapService.toggleTaskStatus(taskId);
      if (res?.data) {
        setRoadmap(res.data);
      }
    } catch (err) {
      toast.error("Failed to update task completion status.");
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleDeleteRoadmap = async () => {
    if (!window.confirm("Are you sure you want to remove this learning roadmap?")) return;

    try {
      await roadmapService.deleteRoadmap();
      setRoadmap(null);
      toast.success("Roadmap removed.");
    } catch (err) {
      toast.error("Failed to delete roadmap.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner />
        <p className="text-slate-400 text-sm">Loading learning roadmap workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-xs font-semibold text-primary-light flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Improvement Engine
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-100 mt-2 flex items-center gap-3">
            Personalized Career Roadmap
          </h1>
          <p className="text-slate-400 mt-1">
            Phased milestones, weekly target checklists, and curated resources customized for your skill gaps.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-3">
          {roadmap && (
            <button
              onClick={handleDeleteRoadmap}
              className="p-2.5 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl transition-all"
              title="Delete current roadmap"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-primary/20"
          >
            {roadmap ? (
              <>
                <RefreshCw className="w-4 h-4" /> Regenerate Roadmap
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Generate AI Roadmap
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {roadmap ? (
        <div className="space-y-8">
          {/* Progress Banner */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary-light uppercase tracking-wider">
                  <Target className="w-4 h-4" /> Target Role
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-100 mt-1">
                  {roadmap.targetRole}
                </h2>
                <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Total Estimated Duration: {roadmap.totalDurationWeeks} Weeks
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium block">Overall Completion</span>
                  <span className="text-2xl font-display font-extrabold text-emerald-400">
                    {roadmap.overallProgress || 0}%
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Global Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                <motion.div
                  className="bg-gradient-to-r from-primary via-indigo-500 to-accent h-full rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${roadmap.overallProgress || 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Timeline Milestones */}
          <RoadmapTimeline
            milestones={roadmap.milestones}
            onToggleTask={handleToggleTask}
            togglingTaskId={togglingTaskId}
          />
        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-6 backdrop-blur-md">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
            <Compass className="w-8 h-8 text-primary-light" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-semibold text-slate-200">No Learning Roadmap Generated Yet</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Generate a personalized AI learning path based on your target role and identified technical skill gaps.
            </p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25"
          >
            <Wand2 className="w-4 h-4" /> Generate AI Roadmap
          </button>
        </div>
      )}

      {/* Generate Roadmap Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative space-y-6"
            >
              <button
                onClick={() => setShowGenerateModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2">
                  <Wand2 className="w-6 h-6 text-primary-light" /> Configure AI Roadmap
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Specify your target career goal and learning timeline duration.
                </p>
              </div>

              <form onSubmit={handleGenerateRoadmap} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Target Role
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Full Stack Architect"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Target Learning Duration
                  </label>
                  <select
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value={4}>4 Weeks (Intensive Sprint)</option>
                    <option value={6}>6 Weeks (Standard Track)</option>
                    <option value={8}>8 Weeks (Deep Dive)</option>
                    <option value={12}>12 Weeks (Comprehensive Mastery)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={generating}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-primary/20"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Generate Roadmap
                      </>
                    )}
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
