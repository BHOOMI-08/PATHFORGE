import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import { getCareerDNA } from "../services/career.service.js";
import OnboardingWizard from "../components/forms/OnboardingWizard.jsx";
import {
  Sparkles,
  Upload,
  Bot,
  Sliders,
  FileText,
  ArrowRight,
  Zap,
} from "lucide-react";

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [careerDNA, setCareerDNA] = useState(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await getCareerDNA();
      if (res.data?.careerDNA) {
        setCareerDNA(res.data.careerDNA);
      }
    } catch (err) {
      console.error("Failed to load Career DNA profile:", err);
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
      {/* 1. Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#041220] via-[#071A2C] to-[#10263D] p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[#34D399]/15 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-16 h-48 w-48 rounded-full bg-[#3B82F6]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-full border border-[#34D399]/30 bg-[#34D399]/10 px-3 py-1 text-xs font-bold text-[#A7F3D0]">
              <Sparkles size={14} />
              <span>Career DNA Engine Active</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-black text-slate-100 tracking-tight">
              Good Evening, {user?.name || "Explorer"} 👋
            </h1>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              PathForge AI is actively tracking your career telemetry, target role readiness, and AI audit goals.
            </p>

            {/* Profile Completion Bar */}
            <div className="pt-2 max-w-md">
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span className="text-slate-400">Career DNA Completeness</span>
                <span className="text-[#A7F3D0] font-black">{completionPercentage}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#020817] border border-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] via-[#34D399] to-[#A7F3D0] transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#34D399] px-6 py-3.5 text-xs font-black text-slate-950 shadow-xl hover:opacity-90 transition-all shadow-[#34D399]/20"
            >
              <Sliders size={16} />
              <span>{completionPercentage > 0 ? "Update Career DNA" : "Complete Profile"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Panel */}
      <div className="space-y-3">
        <h2 className="text-xs font-display font-extrabold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <Zap size={16} className="text-[#34D399]" />
          <span>Quick Actions</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/dashboard/resumes")}
            className="flex items-center space-x-4 rounded-3xl border border-white/10 bg-[#10263D]/60 p-5 text-left backdrop-blur-xl hover:border-[#34D399]/40 hover:bg-[#132D47] transition-all duration-200 group shadow-lg"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#34D399]/10 border border-[#34D399]/20 text-[#A7F3D0] group-hover:scale-105 transition-transform">
              <Upload size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-slate-100 group-hover:text-white transition-colors">
                Upload Resume
              </h3>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Audit & analyze your resume
              </p>
            </div>
            <ArrowRight size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
          </button>

          <button
            onClick={() => navigate("/dashboard/ats")}
            className="flex items-center space-x-4 rounded-3xl border border-white/10 bg-[#10263D]/60 p-5 text-left backdrop-blur-xl hover:border-[#34D399]/40 hover:bg-[#132D47] transition-all duration-200 group shadow-lg"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#60A5FA] group-hover:scale-105 transition-transform">
              <FileText size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-slate-100 group-hover:text-white transition-colors">
                ATS Analyzer
              </h3>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Evaluate score & keyword density
              </p>
            </div>
            <ArrowRight size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
          </button>

          <button
            onClick={() => navigate("/dashboard/mentor")}
            className="flex items-center space-x-4 rounded-3xl border border-white/10 bg-[#10263D]/60 p-5 text-left backdrop-blur-xl hover:border-[#34D399]/40 hover:bg-[#132D47] transition-all duration-200 group shadow-lg"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 group-hover:scale-105 transition-transform">
              <Bot size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-slate-100 group-hover:text-white transition-colors">
                AI Mock Interview
              </h3>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Practice technical Q&A sessions
              </p>
            </div>
            <ArrowRight size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
          </button>
        </div>
      </div>

      {/* Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={() => {
          setIsWizardOpen(false);
          fetchProfile();
        }}
      />
    </div>
  );
};

export default Dashboard;
