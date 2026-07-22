import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  TrendingUp,
  Sparkles,
  Award,
  Calendar,
  FileCheck,
  CheckCircle2,
  XCircle,
  FolderPlus,
  BookOpen,
  Briefcase,
  Layers,
  ArrowUpRight,
  Zap,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import BadgeCard from "../components/ui/BadgeCard";
import { evolutionService } from "../services/evolution.service";

export const ResumeEvolution = () => {
  const [loading, setLoading] = useState(true);
  const [evolution, setEvolution] = useState(null);

  useEffect(() => {
    fetchEvolutionData();
  }, []);

  const fetchEvolutionData = async () => {
    setLoading(true);
    try {
      const res = await evolutionService.getResumeEvolution();
      const payload = res?.data || res;
      if (payload && typeof payload === "object") {
        setEvolution(payload);
      }
    } catch (err) {
      console.error("Failed to load resume evolution data:", err);
      toast.error("Failed to load resume evolution data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner />
        <p className="text-slate-400 text-sm">Aggregating candidate evolution trajectory...</p>
      </div>
    );
  }

  const timeline = evolution?.timeline || [];
  const deltas = evolution?.deltas || { atsDelta: 0, interviewDelta: 0, addedSkillsCount: 0 };
  const insights = evolution?.insights || [];
  const skillDiff = evolution?.skillDiff || { added: [], removed: [] };
  const sectionChanges = evolution?.sectionChanges || { addedProjects: [], addedCertifications: [], addedExperience: [] };
  const badges = evolution?.badges || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Spotify-Wrapped Style Growth Hero Banner */}
      <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-xs font-bold text-primary-light flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3.5 h-3.5" /> Spotify Wrapped + LinkedIn Analytics Style
            </span>

            <h1 className="text-4xl sm:text-5xl font-display font-black text-slate-100 tracking-tight">
              AI Resume Evolution
            </h1>

            <p className="text-slate-300 text-base leading-relaxed">
              Track how your candidate profile, ATS keyword density, technical skill portfolio, and mock interview performance have evolved across iterations.
            </p>
          </div>

          {/* Highlights Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4 shrink-0">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
              <span className="text-2xl sm:text-3xl font-display font-black text-emerald-400">
                +{deltas.atsDelta > 0 ? deltas.atsDelta : 0}
              </span>
              <span className="block text-[11px] text-slate-400 mt-1 font-medium">ATS Points</span>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
              <span className="text-2xl sm:text-3xl font-display font-black text-primary-light">
                +{deltas.addedSkillsCount}
              </span>
              <span className="block text-[11px] text-slate-400 mt-1 font-medium">New Skills</span>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
              <span className="text-2xl sm:text-3xl font-display font-black text-amber-400">
                {evolution?.resumesCount || 1}
              </span>
              <span className="block text-[11px] text-slate-400 mt-1 font-medium">Versions</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Evolution Insights Summary Cards */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-start gap-3 backdrop-blur-md"
            >
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">{insight}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Achievement Badges Ribbon */}
      <div className="space-y-4">
        <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> Automatically Unlocked Badges
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {badges.map((b) => (
            <BadgeCard key={b.id} badge={b} />
          ))}
        </div>
      </div>

      {/* Recharts Trajectory Graph */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-light" /> Multi-Metric Evolution Graph
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Trajectory comparing ATS Score, Job Match %, and Mock Interview scores across resume versions.
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="version" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Line type="monotone" dataKey="atsScore" name="ATS Score" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="jobMatchScore" name="Job Match %" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="interviewScore" name="Interview Score" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chronological Resume Versions Timeline */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent-light" /> Chronological Version Timeline
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Every uploaded version of your resume tracked with metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {timeline.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary-light font-bold text-xs rounded-xl">
                  {item.version}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(item.uploadedAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-slate-100 text-sm truncate">{item.fileName}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {item.skillsCount} Skills • {item.projectsCount} Projects • {item.certificationsCount} Certs
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-900 rounded-xl">
                  <span className="text-xs text-slate-400 block font-medium">ATS</span>
                  <span className="text-sm font-bold text-indigo-400">{item.atsScore}%</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl">
                  <span className="text-xs text-slate-400 block font-medium">Match</span>
                  <span className="text-sm font-bold text-emerald-400">{item.jobMatchScore}%</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl">
                  <span className="text-xs text-slate-400 block font-medium">Interview</span>
                  <span className="text-sm font-bold text-amber-400">{item.interviewScore}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Skill Evolution Diff Grid */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" /> Skill Evolution Diff (Resume V1 vs Latest)
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Technologies and tools acquired since your initial resume baseline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Newly Added Skills */}
          <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
            <h4 className="font-semibold text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Newly Added Technical Competencies ({skillDiff.added.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {skillDiff.added.length > 0 ? (
                skillDiff.added.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {skill}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-xs">All current skills were present in initial version baseline.</span>
              )}
            </div>
          </div>

          {/* Section Changes */}
          <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
            <h4 className="font-semibold text-primary-light text-sm flex items-center gap-2">
              <FolderPlus className="w-4 h-4" /> Resume Section Enhancements
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <FolderPlus className="w-3.5 h-3.5 text-accent-light" />
                <span className="font-bold text-slate-100">{sectionChanges.addedProjects.length}</span> New Projects Added
              </p>
              <p className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-slate-100">{sectionChanges.addedCertifications.length}</span> New Certifications Earned
              </p>
              <p className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-bold text-slate-100">{sectionChanges.addedExperience.length}</span> Work Experience Additions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEvolution;
