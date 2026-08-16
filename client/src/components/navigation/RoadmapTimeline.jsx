import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  ExternalLink,
  Flag,
  Hammer,
  Loader2,
  Square,
} from "lucide-react";

export const RoadmapTimeline = ({ milestones = [], onToggleTask, togglingTaskId = null }) => {
  if (!Array.isArray(milestones) || milestones.length === 0) {
    return <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">The saved roadmap contains no milestones.</div>;
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-y-0 before:left-6 before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:via-blue-500 before:to-white/5 sm:before:left-8">
      {milestones.map((milestone, index) => {
        const tasks = Array.isArray(milestone.tasks) ? milestone.tasks : [];
        const completedTasks = tasks.filter((task) => task.completed).length;
        const phaseProgress = Number.isFinite(milestone.progress)
          ? milestone.progress
          : tasks.length
            ? Math.round((completedTasks / tasks.length) * 100)
            : 0;
        const phaseComplete = tasks.length > 0 && completedTasks === tasks.length;
        const weekLabel = milestone.startWeek === milestone.endWeek
          ? `Week ${milestone.startWeek}`
          : `Weeks ${milestone.startWeek}–${milestone.endWeek}`;

        return (
          <motion.section
            key={milestone.milestoneId || milestone._id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="relative pl-12 sm:pl-16"
          >
            <div className={`absolute left-2 top-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold shadow-lg sm:left-4 ${phaseComplete ? "border-emerald-400 bg-emerald-950 text-emerald-200" : "border-blue-500 bg-[#10263D] text-blue-300"}`}>
              {phaseComplete ? "✓" : index + 1}
            </div>

            <div className="space-y-6 rounded-3xl border border-white/10 bg-[#10263D]/70 p-6 backdrop-blur-xl transition hover:border-emerald-400/30 sm:p-8">
              <div className="space-y-4 border-b border-white/10 pb-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200"><Calendar className="h-3 w-3" /> {weekLabel}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400"><Clock className="h-3 w-3" /> {milestone.estimatedHours || 0} hours</span>
                      <span className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">{milestone.type || "phase"}</span>
                      <span className="rounded-lg border border-amber-900/50 bg-amber-950/20 px-2 py-1 text-[10px] font-bold text-amber-300">{milestone.difficulty || "Adaptive"}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-extrabold text-slate-100">{milestone.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">{milestone.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Phase completion</span>
                    <span className="text-sm font-extrabold text-slate-200">{phaseProgress}% · {completedTasks}/{tasks.length}</span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-950"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 transition-all" style={{ width: `${phaseProgress}%` }} /></div>
              </div>

              {Array.isArray(milestone.prerequisites) && milestone.prerequisites.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Prerequisites</h4>
                  <div className="mt-2 flex flex-wrap gap-2">{milestone.prerequisites.map((item) => <span key={item} className="rounded-lg border border-slate-700 bg-slate-950/40 px-2.5 py-1 text-xs text-slate-300">{item}</span>)}</div>
                </div>
              )}

              {milestone.project && (
                <div className="rounded-2xl border border-cyan-800/50 bg-cyan-950/20 p-5">
                  <h4 className="flex items-center gap-2 font-bold text-cyan-200"><Hammer className="h-4 w-4" /> {milestone.project.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">{milestone.project.description}</p>
                  <ul className="mt-3 space-y-1 text-xs text-slate-400">{(milestone.project.deliverables || []).map((item) => <li key={item}>• {item}</li>)}</ul>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Milestone action items</h4>
                {tasks.map((task) => {
                  const taskId = task.taskId || task._id;
                  const isToggling = togglingTaskId === taskId;
                  return (
                    <div key={taskId} className={`flex items-start gap-3 rounded-2xl border p-4 transition ${task.completed ? "border-emerald-500/30 bg-slate-950/70" : "border-white/10 bg-[#041220] hover:border-emerald-400/40"}`}>
                      <button type="button" onClick={() => onToggleTask?.(taskId, !task.completed)} disabled={isToggling} className="mt-0.5 shrink-0 text-emerald-400 disabled:opacity-50" aria-label={`${task.completed ? "Mark incomplete" : "Mark complete"}: ${task.title}`}>
                        {isToggling ? <Loader2 className="h-4 w-4 animate-spin" /> : task.completed ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-slate-500" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs font-bold leading-snug ${task.completed ? "text-slate-400 line-through" : "text-slate-200"}`}>{task.title}</span>
                          <span className="rounded-md border border-slate-700 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-400">{task.type}</span>
                          <span className="text-[10px] text-slate-500">{task.estimatedHours}h</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{task.description}</p>
                        {task.outcome && <p className="mt-2 flex items-start gap-1.5 text-[11px] text-emerald-300"><Flag className="mt-0.5 h-3 w-3 shrink-0" /> Outcome: {task.outcome}</p>}
                        {Array.isArray(task.resourceLinks) && task.resourceLinks.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {task.resourceLinks.map((link) => (
                              <a key={`${taskId}-${link.url}`} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:border-emerald-500/50 hover:underline">
                                <BookOpen className="h-3 w-3" /> {link.title} <ExternalLink className="h-3 w-3" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-violet-800/40 bg-violet-950/20 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300">Completion checkpoint</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{milestone.checkpoint}</p>
              </div>
            </div>
          </motion.section>
        );
      })}
    </div>
  );
};

export default RoadmapTimeline;
