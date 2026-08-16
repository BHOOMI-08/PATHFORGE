import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  FilePlus2,
  FolderPlus,
  Layers,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import BadgeCard from "../components/ui/BadgeCard";
import { evolutionService } from "../services/evolution.service";

const percent = (value) => (value === null || value === undefined ? "N/A" : `${value}%`);
const signed = (value) => {
  if (value === null || value === undefined) return "N/A";
  return value > 0 ? `+${value}` : String(value);
};

const getErrorMessage = (error) => {
  if (error?.status === 401) return "Your session has expired. Please sign in again.";
  if (error?.status === 403) return "You do not have permission to view resume evolution.";
  if (error?.status >= 500) return "Resume evolution is temporarily unavailable. Please try again.";
  if (/timed out|network|fetch/i.test(error?.message || "")) {
    return "Unable to reach PathForge. Check your connection and try again.";
  }
  return error?.message || "Unable to load resume evolution. Please try again.";
};

const EvolutionTooltip = ({ active, payload, label }) => {
  if (!active) return null;
  const values = Object.fromEntries((payload || []).map((entry) => [entry.dataKey, entry.value]));
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 shadow-xl">
      <p className="mb-2 font-bold text-slate-100">{label}</p>
      <p>ATS Score: {percent(values.atsScore)}</p>
      <p>Latest Job Match: {percent(values.latestJobMatchScore)}</p>
      <p>Linked Interview: {percent(values.linkedInterviewScore)}</p>
    </div>
  );
};

const LoadingState = () => (
  <div className="mx-auto max-w-7xl animate-pulse space-y-8 pb-12" aria-label="Loading resume evolution">
    <div className="h-64 rounded-3xl bg-slate-900/70" />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((item) => <div key={item} className="h-28 rounded-2xl bg-slate-900/70" />)}
    </div>
    <div className="h-96 rounded-3xl bg-slate-900/70" />
  </div>
);

export const ResumeEvolution = () => {
  const [state, setState] = useState({ loading: true, data: null, error: null });

  const fetchEvolutionData = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await evolutionService.getResumeEvolution();
      setState({ loading: false, data: response?.data || response, error: null });
    } catch (error) {
      setState({ loading: false, data: null, error: getErrorMessage(error) });
    }
  };

  useEffect(() => {
    fetchEvolutionData();
  }, []);

  if (state.loading) return <LoadingState />;

  if (state.error) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center text-center">
        <Activity className="mb-4 h-10 w-10 text-rose-400" />
        <h1 className="text-2xl font-bold text-slate-100">Unable to load Resume Evolution</h1>
        <p className="mt-2 text-sm text-slate-400">{state.error}</p>
        <button
          type="button"
          onClick={fetchEvolutionData}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  const evolution = state.data;
  const versions = evolution?.versions || [];

  if (versions.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
          <FilePlus2 className="h-8 w-8 text-primary-light" />
        </div>
        <h1 className="mt-5 text-3xl font-display font-black text-slate-100">No resume versions yet</h1>
        <p className="mt-2 text-sm text-slate-400">
          Upload your first resume to start tracking real changes across versions.
        </p>
        <Link
          to="/dashboard/resumes"
          className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
        >
          Upload Resume
        </Link>
      </div>
    );
  }

  const summary = evolution.summary;
  const comparison = evolution.evolution;
  const hasProgression = versions.length > 1;
  const chartData = versions.map((version) => ({
    version: version.label,
    atsScore: version.metrics.atsScore,
    latestJobMatchScore: version.metrics.latestJobMatchScore,
    linkedInterviewScore: version.metrics.linkedInterviewScore,
  }));

  return (
    <div className="mx-auto max-w-7xl animate-fade-in space-y-8 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 shadow-2xl sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-3">
            <span className="flex w-fit items-center gap-1.5 rounded-full border border-primary/40 bg-primary/20 px-3 py-1 text-xs font-bold text-primary-light">
              <Sparkles className="h-3.5 w-3.5" /> Resume progression analytics
            </span>
            <h1 className="text-4xl font-display font-black tracking-tight text-slate-100 sm:text-5xl">AI Resume Evolution</h1>
            <p className="text-base leading-relaxed text-slate-300">
              Compare immutable resume uploads with their linked ATS, Job Match, and interview results.
            </p>
            {!hasProgression && (
              <p className="text-sm font-medium text-amber-300">Upload an updated resume to unlock progression tracking.</p>
            )}
          </div>

          <div className="grid shrink-0 grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-center">
              <span className="text-2xl font-display font-black text-emerald-400 sm:text-3xl">{signed(summary.atsDelta)}</span>
              <span className="mt-1 block text-[11px] font-medium text-slate-400">ATS Points</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-center">
              <span className="text-2xl font-display font-black text-primary-light sm:text-3xl">+{summary.newSkillCount}</span>
              <span className="mt-1 block text-[11px] font-medium text-slate-400">New Skills</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-center">
              <span className="text-2xl font-display font-black text-amber-400 sm:text-3xl">{summary.versionCount}</span>
              <span className="mt-1 block text-[11px] font-medium text-slate-400">Versions</span>
            </div>
          </div>
        </div>
      </section>

      {evolution.insights.length > 0 && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {evolution.insights.map((insight) => (
            <div key={insight} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" />
              <p className="text-xs font-medium leading-relaxed text-slate-300">{insight}</p>
            </div>
          ))}
        </section>
      )}

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-display font-bold text-slate-100">
          <Award className="h-5 w-5 text-amber-400" /> Automatically Unlocked Badges
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {evolution.badges.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md sm:p-8">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="flex items-center gap-2 text-xl font-display font-bold text-slate-100">
            <Activity className="h-5 w-5 text-primary-light" /> Multi-Metric Evolution Graph
          </h2>
          <p className="mt-1 text-xs text-slate-400">Latest linked result for each resume version; missing results are not plotted.</p>
        </div>
        <div className="h-80 w-full overflow-hidden pt-3" role="img" aria-label="Resume score evolution chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="version" stroke="#64748b" tick={{ fontSize: 11 }} minTickGap={18} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip content={<EvolutionTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
              <Line connectNulls={false} type="monotone" dataKey="atsScore" name="ATS Score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
              <Line connectNulls={false} type="monotone" dataKey="latestJobMatchScore" name="Latest Job Match" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              <Line connectNulls={false} type="monotone" dataKey="linkedInterviewScore" name="Linked Interview" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {!hasProgression && <p className="text-center text-xs text-slate-500">One real point is shown. Upload another resume version to start a trajectory.</p>}
      </section>

      <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md sm:p-8">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="flex items-center gap-2 text-xl font-display font-bold text-slate-100">
            <Calendar className="h-5 w-5 text-accent-light" /> Chronological Version Timeline
          </h2>
          <p className="mt-1 text-sm text-slate-400">Oldest to newest, using stable upload version numbers.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {versions.map((version, index) => (
            <motion.article
              key={version.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.3) }}
              className="space-y-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary-light">{version.label}</span>
                <time className="text-xs text-slate-400" dateTime={version.uploadedAt}>
                  {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(version.uploadedAt))}
                </time>
              </div>
              <div>
                <h3 className="truncate text-sm font-semibold text-slate-100" title={version.fileName}>{version.fileName}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {version.profile.skillsCount} Skills · {version.profile.projectsCount} Projects · {version.profile.certificationsCount} Certs · {version.profile.experienceCount} Experience
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3 text-center">
                <Metric label="ATS" value={version.metrics.atsScore} className="text-indigo-400" />
                <Metric label="Match" value={version.metrics.latestJobMatchScore} className="text-emerald-400" />
                <Metric label="Interview" value={version.metrics.linkedInterviewScore} className="text-amber-400" />
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md sm:p-8">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="flex items-center gap-2 text-xl font-display font-bold text-slate-100">
            <Layers className="h-5 w-5 text-emerald-400" /> Skill Evolution Diff (Resume V{summary.baselineVersionNumber} vs Resume V{summary.latestVersionNumber})
          </h2>
          <p className="mt-1 text-sm text-slate-400">Normalized comparison of the earliest and newest remaining resume snapshots.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Newly Added Technical Competencies ({comparison.newSkills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {comparison.newSkills.length > 0 ? comparison.newSkills.map((skill) => (
                <span key={skill} className="flex items-center gap-1.5 rounded-xl border border-emerald-800/50 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {skill}
                </span>
              )) : (
                <span className="text-xs text-slate-500">{hasProgression ? "No new normalized skills in the latest resume." : "No evolution yet—upload another version to compare."}</span>
              )}
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-light"><FolderPlus className="h-4 w-4" /> Resume Section Enhancements</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <Enhancement icon={FolderPlus} count={comparison.newProjects.length} label="New Projects Added" />
              <Enhancement icon={BookOpen} count={comparison.newCertifications.length} label="New Certifications Earned" />
              <Enhancement icon={Briefcase} count={comparison.newExperience.length} label="Work Experience Additions" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const Metric = ({ label, value, className }) => (
  <div className="rounded-xl bg-slate-900 p-2">
    <span className="block text-[11px] font-medium text-slate-400">{label}</span>
    <span className={`text-sm font-bold ${className}`}>{percent(value)}</span>
  </div>
);

const Enhancement = ({ icon: Icon, count, label }) => (
  <p className="flex items-center gap-2">
    <Icon className="h-3.5 w-3.5 text-accent-light" />
    <span className="font-bold text-slate-100">{count}</span> {label}
  </p>
);

export default ResumeEvolution;
