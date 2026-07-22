import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Award,
  FileCheck,
  Target,
  MessageSquare,
  Clock,
  Bell,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  FileText,
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ScoreCircle from "../components/ui/ScoreCircle";
import ATSLineChart from "../components/charts/ATSLineChart";
import SkillRadarChart from "../components/charts/SkillRadarChart";
import ActivityBarChart from "../components/charts/ActivityBarChart";
import { dashboardService } from "../services/dashboard.service";

export const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getDashboardStats();
      if (res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to load analytics stats:", err);
      toast.error("Failed to load analytics dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await dashboardService.markNotificationRead(id);
      setStats((prev) => ({
        ...prev,
        notifications: prev.notifications.filter((n) => n._id !== id),
      }));
      toast.success("Notification marked as read");
    } catch (err) {
      toast.error("Failed to update notification");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner />
        <p className="text-slate-400 text-sm">Loading consolidated workspace analytics...</p>
      </div>
    );
  }

  const counts = stats?.counts || { resumes: 0, jobMatches: 0, completedInterviews: 0 };
  const latestScores = stats?.latestScores || { atsScore: 0, jobMatchScore: 0, interviewScore: 0, roadmapProgress: 0 };
  const charts = stats?.charts || { atsTrend: [], skillDimensions: [] };
  const activityLogs = stats?.activityLogs || [];
  const notifications = stats?.notifications || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-accent/10 border border-accent/30 rounded-full text-xs font-semibold text-accent-light flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Workspace Telemetry
          </span>
        </div>
        <h1 className="text-3xl font-display font-extrabold text-slate-100 mt-2 flex items-center gap-3">
          Analytics & Readiness Dashboard
        </h1>
        <p className="text-slate-400 mt-1">
          Consolidated progress metrics, ATS score iterations, mock interview evaluations, and audit logs.
        </p>
      </div>

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Career Readiness Index */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Career Readiness</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-4xl font-display font-black text-slate-100">
              {stats?.careerReadinessIndex || 0}%
            </span>
            <p className="text-xs text-slate-400 mt-1">Weighted Composite Readiness Metric</p>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-accent h-full rounded-full"
              style={{ width: `${stats?.careerReadinessIndex || 0}%` }}
            />
          </div>
        </motion.div>

        {/* Latest ATS Audit Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latest ATS Score</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-4xl font-display font-black text-slate-100">
              {latestScores.atsScore}%
            </span>
            <p className="text-xs text-slate-400 mt-1">{counts.resumes} Resumes Analyzed</p>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-primary to-indigo-500 h-full rounded-full"
              style={{ width: `${latestScores.atsScore}%` }}
            />
          </div>
        </motion.div>

        {/* Mock Interviews Completed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mock Interviews</span>
            <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent-light">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-4xl font-display font-black text-slate-100">
              {counts.completedInterviews}
            </span>
            <p className="text-xs text-slate-400 mt-1">Latest Score: {latestScores.interviewScore}%</p>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full"
              style={{ width: `${latestScores.interviewScore}%` }}
            />
          </div>
        </motion.div>

        {/* Learning Roadmap Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Roadmap Progress</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-4xl font-display font-black text-slate-100">
              {latestScores.roadmapProgress}%
            </span>
            <p className="text-xs text-slate-400 mt-1">{counts.jobMatches} Job Matches Analyzed</p>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full"
              style={{ width: `${latestScores.roadmapProgress}%` }}
            />
          </div>
        </motion.div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ATS Score Historical Trend Line Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-light" /> ATS Score Trajectory
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">Historical ATS audit score progression over time.</p>
            </div>
          </div>
          <ATSLineChart data={charts.atsTrend} />
        </div>

        {/* Skill Dimension Radar Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent-light" /> Competency Radar
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">Multi-dimensional skill coverage analysis.</p>
            </div>
          </div>
          <SkillRadarChart data={charts.skillDimensions} />
        </div>
      </div>

      {/* Weekly Activity Bar Chart & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Goals Bar Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" /> Weekly Target Goals
          </h3>
          <p className="text-slate-400 text-xs">Milestone completion targets vs actual finished items.</p>
          <ActivityBarChart />
        </div>

        {/* Audit Activity Log Stream */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-light" /> Audit Activity Stream
            </h3>
            <span className="text-xs text-slate-500 font-medium">Real-time Telemetry</span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-200 text-xs font-semibold">{log.description}</p>
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{log.action}</span>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
