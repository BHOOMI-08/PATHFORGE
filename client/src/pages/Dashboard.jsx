import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getCareerDNA } from "../services/career.service.js";
import OnboardingWizard from "../components/forms/OnboardingWizard.jsx";
import {
  Sparkles,
  Upload,
  Bot,
  Sliders,
  CheckCircle2,
  TrendingUp,
  FileText,
  Target,
  ArrowRight,
  Loader2,
  Award,
  Zap,
} from "lucide-react";

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [careerDNA, setCareerDNA] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await getCareerDNA();
      if (res.data?.careerDNA) {
        setCareerDNA(res.data.careerDNA);
      }
    } catch (err) {
      console.error("Failed to load Career DNA profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Calculate completeness percentage dynamically
  const calculateCompleteness = () => {
    if (!careerDNA) return 0;
    let score = 0;
    const totalFields = 8;

    if (careerDNA.bio && careerDNA.bio.trim().length > 0) score++;
    if (careerDNA.targetRoles && careerDNA.targetRoles.length > 0) score++;
    if (careerDNA.programmingLanguages && careerDNA.programmingLanguages.length > 0) score++;
    if (careerDNA.frameworks && careerDNA.frameworks.length > 0) score++;
    if (careerDNA.tools && careerDNA.tools.length > 0) score++;
    if (careerDNA.projectsExperience && careerDNA.projectsExperience.trim().length > 0) score++;
    if (careerDNA.careerObjectives && careerDNA.careerObjectives.trim().length > 0) score++;
    if (careerDNA.softSkills && careerDNA.softSkills.length > 0) score++;

    return Math.min(100, Math.round((score / totalFields) * 100));
  };

  const completionPercentage = calculateCompleteness();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-8 shadow-2xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-16 h-48 w-48 rounded-full bg-accent/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-light">
              <Sparkles size={14} />
              <span>Career DNA Engine Active</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-100 tracking-tight">
              Welcome back, {user?.name || "Explorer"} 👋
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              PathForge AI is actively tracking your career telemetry, target role readiness, and AI audit goals.
            </p>

            {/* Profile Completion Bar */}
            <div className="pt-2 max-w-md">
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-400">Career DNA Completeness</span>
                <span className="text-primary-light font-bold">{completionPercentage}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-accent-light transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-semibold text-slate-100 shadow-xl hover:opacity-90 transition-all duration-200"
            >
              <Sliders size={18} />
              <span>{completionPercentage > 0 ? "Update Career DNA" : "Complete Profile"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Panel */}
      <div className="space-y-3">
        <h2 className="text-lg font-display font-semibold text-slate-200 flex items-center space-x-2">
          <Zap size={18} className="text-accent-light" />
          <span>Quick Actions</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/dashboard/resumes")}
            className="flex items-center space-x-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left backdrop-blur-md hover:border-slate-700 hover:bg-slate-800/40 transition-all duration-200 group shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary-light group-hover:scale-105 transition-transform">
              <Upload size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-200 group-hover:text-slate-100 transition-colors">
                Upload Resume
              </h3>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Audit & analyze your resume
              </p>
            </div>
            <ArrowRight size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
          </button>

          <button
            onClick={() => navigate("/dashboard/mentor")}
            className="flex items-center space-x-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left backdrop-blur-md hover:border-slate-700 hover:bg-slate-800/40 transition-all duration-200 group shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 text-accent-light group-hover:scale-105 transition-transform">
              <Bot size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-200 group-hover:text-slate-100 transition-colors">
                Start Mock Interview
              </h3>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Interface with AI mentor agent
              </p>
            </div>
            <ArrowRight size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
          </button>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center space-x-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left backdrop-blur-md hover:border-slate-700 hover:bg-slate-800/40 transition-all duration-200 group shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
              <Sliders size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-200 group-hover:text-slate-100 transition-colors">
                Update Career DNA
              </h3>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Tune target roles & tools
              </p>
            </div>
            <ArrowRight size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
          </button>
        </div>
      </div>

      {/* 3. Telemetry Cards */}
      <div className="space-y-3">
        <h2 className="text-lg font-display font-semibold text-slate-200 flex items-center space-x-2">
          <TrendingUp size={18} className="text-primary-light" />
          <span>Career Telemetry Indicators</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Today's Goal */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Card 1
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary-light border border-primary/20">
                <Target size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-slate-400">Today's Goal</h3>
              <p className="text-lg font-display font-bold text-slate-100 mt-1">
                Complete Resume Analysis
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span>Target: Audit resume for ATS optimization</span>
            </div>
          </div>

          {/* Card 2: Career Progress */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Card 2
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent-light border border-accent/20">
                <Award size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-slate-400">Career Progress</h3>
              <p className="text-2xl font-display font-bold text-slate-100 mt-1">
                Profile {completionPercentage}% Complete
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
              <span>Target Roles:</span>
              <span className="text-slate-200 font-medium truncate max-w-[150px]">
                {careerDNA?.targetRoles?.length > 0
                  ? careerDNA.targetRoles.slice(0, 2).join(", ")
                  : "Not set"}
              </span>
            </div>
          </div>

          {/* Card 3: Latest ATS Indicator */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Card 3
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FileText size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-slate-400">Latest ATS Indicator</h3>
              <p className="text-lg font-display font-bold text-slate-100 mt-1">
                ATS Score: Not Available
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-amber-400/80 border-t border-slate-800/80 pt-3">
              <span>Upload a resume to run your initial ATS audit scan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={(data) => {
          setCareerDNA(data);
          fetchProfile();
        }}
        initialData={careerDNA}
      />
    </div>
  );
};

export default Dashboard;
