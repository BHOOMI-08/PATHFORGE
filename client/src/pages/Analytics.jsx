import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Award,
  BarChart3,
  Clock,
  FileCheck,
  Layers,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import ActivityBarChart from "../components/charts/ActivityBarChart";
import ATSLineChart from "../components/charts/ATSLineChart";
import SkillRadarChart from "../components/charts/SkillRadarChart";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { dashboardService } from "../services/dashboard.service";

const READINESS_LABELS = {
  ats: "ATS",
  interview: "Interview",
  roadmap: "Roadmap",
  recruiter: "Recruiter",
  jobMatch: "Job Match",
};

const getErrorMessage = (error) => {
  if (error?.status === 401) return "Your session has expired. Please sign in again.";
  if (error?.status === 403) return "You do not have access to these analytics.";
  if (error?.status >= 500) return "PathForge analytics are temporarily unavailable. Please try again.";
  if (error instanceof TypeError) return "Unable to reach PathForge services. Check your connection and try again.";
  return error?.body?.message || error?.message || "Unable to load analytics.";
};

const ScoreValue = ({ value }) => (
  <span className="font-display text-4xl font-black text-slate-100">
    {value === null || value === undefined ? "—" : `${value}%`}
  </span>
);

const ProgressBar = ({ value, color }) => (
  <div className="h-2 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-950">
    <div className={`h-full rounded-full ${color}`} style={{ width: `${value ?? 0}%` }} />
  </div>
);

const formatActivityDate = (value) => new Date(value).toLocaleDateString(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await dashboardService.getDashboardStats();
      if (!payload?.summary) throw new Error("The analytics response was invalid.");
      setStats(payload);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <LoadingSpinner />
        <p className="text-sm text-slate-400">Loading consolidated workspace analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <Activity className="h-10 w-10 text-rose-400" />
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-100">Analytics unavailable</h1>
        <p className="mt-2 text-sm text-slate-400">{error}</p>
        <button type="button" onClick={fetchAnalyticsData} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800">
          <RefreshCw className="h-4 w-4" /> Retry analytics
        </button>
      </div>
    );
  }

  const summary = stats.summary;
  const readiness = summary.careerReadiness;
  const activities = stats.activities || [];

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12 animate-fade-in">
      <header>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-light">
          <Sparkles className="h-3.5 w-3.5" /> Workspace intelligence
        </span>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-slate-100">Analytics & Readiness Dashboard</h1>
        <p className="mt-1 text-slate-400">Database-derived progress metrics, completed evaluations, roadmap execution, and recent activity.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Career Readiness</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"><Award className="h-4 w-4" /></span>
          </div>
          <div className="my-3">
            <ScoreValue value={readiness.score} />
            <p className="mt-1 text-xs text-slate-400">
              {readiness.score === null ? "Complete an evaluation to establish readiness." : `${readiness.coverage}% of readiness inputs completed`}
            </p>
          </div>
          <ProgressBar value={readiness.score} color="bg-gradient-to-r from-emerald-500 to-accent" />
        </motion.article>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Latest ATS Score</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary-light"><FileCheck className="h-4 w-4" /></span>
          </div>
          <div className="my-3">
            <ScoreValue value={summary.ats.latestScore} />
            <p className="mt-1 text-xs text-slate-400">{summary.ats.totalAnalyses ? `${summary.ats.totalAnalyses} completed ATS ${summary.ats.totalAnalyses === 1 ? "analysis" : "analyses"}` : "No ATS analyses yet."}</p>
          </div>
          <ProgressBar value={summary.ats.latestScore} color="bg-gradient-to-r from-primary to-indigo-500" />
        </motion.article>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mock Interviews</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent-light"><MessageSquare className="h-4 w-4" /></span>
          </div>
          <div className="my-3">
            <span className="font-display text-4xl font-black text-slate-100">{summary.interviews.totalCompleted}</span>
            <p className="mt-1 text-xs text-slate-400">{summary.interviews.latestScore === null ? "No interviews completed yet." : `Latest score: ${summary.interviews.latestScore}%`}</p>
          </div>
          <ProgressBar value={summary.interviews.latestScore} color="bg-gradient-to-r from-teal-500 to-emerald-400" />
        </motion.article>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Roadmap Progress</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400"><Target className="h-4 w-4" /></span>
          </div>
          <div className="my-3">
            <ScoreValue value={summary.roadmap.progress} />
            <p className="mt-1 text-xs text-slate-400">{summary.roadmap.exists ? `${summary.roadmap.completedTasks} of ${summary.roadmap.totalTasks} tasks completed` : "No active roadmap."}</p>
          </div>
          <ProgressBar value={summary.roadmap.progress} color="bg-gradient-to-r from-amber-500 to-orange-400" />
        </motion.article>
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5" aria-labelledby="readiness-inputs-title">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="readiness-inputs-title" className="font-display font-bold text-slate-100">Readiness inputs</h2>
            <p className="text-xs text-slate-500">The score normalizes across completed inputs; coverage shows how much of the full model is represented.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {readiness.components.map((component) => (
              <span key={component.key} className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${component.available ? "border-emerald-800 bg-emerald-950/30 text-emerald-300" : "border-slate-800 bg-slate-950 text-slate-500"}`}>
                {READINESS_LABELS[component.key]} · {component.available ? `${component.score}%` : "Not completed"} · {component.weight}% weight
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md sm:p-8">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-100"><TrendingUp className="h-5 w-5 text-primary-light" /> ATS Score Trajectory</h2>
            <p className="mt-0.5 text-xs text-slate-400">Latest {stats.atsTrajectory.length} completed analyses in chronological order.</p>
          </div>
          <ATSLineChart data={stats.atsTrajectory} />
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md sm:p-8">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-100"><Layers className="h-5 w-5 text-accent-light" /> Competency Radar</h2>
            <p className="mt-0.5 text-xs text-slate-400">Dimensions from the latest ATS and Job Match records only.</p>
          </div>
          <SkillRadarChart data={stats.competencyRadar} />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md sm:p-8">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-100"><BarChart3 className="h-5 w-5 text-amber-400" /> Roadmap Weekly Plan</h2>
          <p className="text-xs text-slate-400">Scheduled and completed tasks grouped by milestone start week.</p>
          <ActivityBarChart data={stats.weeklyGoals} />
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md sm:p-8 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-100"><Activity className="h-5 w-5 text-primary-light" /> Audit Activity Stream</h2>
            <span className="text-xs font-medium text-slate-500">Recent Activity</span>
          </div>
          {activities.length ? (
            <div className="max-h-[320px] space-y-3 overflow-y-auto pr-2">
              {activities.map((log) => (
                <article key={log.id} className="flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary-light"><Clock className="h-4 w-4" /></span>
                    <div className="min-w-0">
                      <p className="break-words text-xs font-semibold text-slate-200">{log.description}</p>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">{log.action}</span>
                    </div>
                  </div>
                  <time className="whitespace-nowrap text-[11px] text-slate-400" dateTime={log.createdAt}>{formatActivityDate(log.createdAt)}</time>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-48 items-center justify-center text-center text-sm text-slate-500">Your successful PathForge activities will appear here.</div>
          )}
        </section>
      </div>

      <p className="text-center text-xs text-slate-600">
        Job Matches: {summary.jobMatches.totalAnalyzed} · Recruiter Simulations: {summary.recruiter.totalSimulations} · Resumes: {summary.resumes.total}
      </p>
    </div>
  );
};

export default Analytics;
