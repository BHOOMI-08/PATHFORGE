import React from "react";
import { motion } from "framer-motion";
import { CheckSquare, Square, ExternalLink, Calendar, Clock, Loader2 } from "lucide-react";

export const RoadmapTimeline = ({ milestones = [], onToggleTask, togglingTaskId = null }) => {
  if (!milestones || milestones.length === 0) {
    return null;
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:left-6 sm:before:left-8 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#34D399] before:via-[#3B82F6] before:to-white/5">
      {milestones.map((milestone, idx) => {
        const completedTasksCount = milestone.tasks?.filter((t) => t.completed).length || 0;
        const totalTasksCount = milestone.tasks?.length || 0;
        const isPhaseComplete = totalTasksCount > 0 && completedTasksCount === totalTasksCount;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative pl-12 sm:pl-16 group"
          >
            {/* Timeline Node Icon Circle */}
            <div
              className={`absolute left-2 sm:left-4 top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all shadow-lg ${
                isPhaseComplete
                  ? "bg-emerald-950 border-[#34D399] text-[#A7F3D0] shadow-[#34D399]/30"
                  : "bg-[#10263D] border-[#3B82F6] text-[#60A5FA] shadow-[#3B82F6]/30"
              }`}
            >
              {idx + 1}
            </div>

            {/* Milestone Content Card */}
            <div className="bg-[#10263D]/70 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6 hover:border-[#34D399]/30 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#34D399]/10 border border-[#34D399]/30 text-[#A7F3D0] rounded-full text-xs font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Week {milestone.weekNumber || idx + 1}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" /> {milestone.durationWeeks || 2} Weeks Est.
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-extrabold text-slate-100 mt-2">
                    {milestone.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                    {milestone.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Phase Tasks</span>
                  <span className="text-sm font-extrabold text-slate-200">
                    {completedTasksCount} / {totalTasksCount} Done
                  </span>
                </div>
              </div>

              {/* Weekly Task Checklist */}
              {milestone.tasks && milestone.tasks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Milestone Action Items
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {milestone.tasks.map((task) => {
                      const taskId = task.taskId || task._id;
                      const isToggling = togglingTaskId === taskId;

                      return (
                        <button
                          key={taskId}
                          type="button"
                          onClick={() => onToggleTask && onToggleTask(taskId, !task.completed)}
                          disabled={isToggling}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                            task.completed
                              ? "bg-[#020817]/80 border-emerald-500/30 text-slate-400 line-through"
                              : "bg-[#041220] border-white/10 hover:border-[#34D399]/40 text-slate-200"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0 text-[#34D399]">
                            {isToggling ? (
                              <Loader2 className="w-4 h-4 animate-spin text-[#34D399]" />
                            ) : task.completed ? (
                              <CheckSquare className="w-4 h-4 text-[#34D399]" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500" />
                            )}
                          </div>
                          <span className="text-xs font-medium leading-relaxed">{task.taskText}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Learning References */}
              {milestone.referenceLinks && milestone.referenceLinks.length > 0 && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Resources:</span>
                  {milestone.referenceLinks.map((link, lIdx) => (
                    <a
                      key={lIdx}
                      href={link.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-[#071A2C] border border-white/10 hover:border-[#34D399]/40 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      {link.title || "Reference Material"} <ExternalLink className="w-3 h-3 text-[#34D399]" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default RoadmapTimeline;
