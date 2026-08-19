import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  User,
  Shield,
  Briefcase,
  Bot,
  Bell,
  Palette,
  Download,
  Trash2,
  Lock,
  Save,
  Sparkles,
  BarChart2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import OnboardingWizard from "../components/forms/OnboardingWizard";
import { settingsService } from "../services/settings.service";
import { useAuth } from "../context/useAuth.js";

export const ProfileSettings = () => {
  const { user: authUser, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "security" | "career" | "ai" | "notifications" | "appearance" | "data"

  // Section 1: Account Info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("India");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Section 2: Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  // Section 3: Career Preferences
  const [dreamCompany, setDreamCompany] = useState("Google");
  const [dreamRole, setDreamRole] = useState("Software Development Engineer");
  const [expectedSalary, setExpectedSalary] = useState("₹12–18 LPA");
  const [preferredWorkType, setPreferredWorkType] = useState("Hybrid");
  const [preferredCountry, setPreferredCountry] = useState("India");
  const [preferredExperienceLevel, setPreferredExperienceLevel] = useState("Fresher");

  // Section 4: AI Personalization
  const [preferredRoadmapDuration, setPreferredRoadmapDuration] = useState("8 Weeks");
  const [learningPace, setLearningPace] = useState("Medium");
  const [explanationStyle, setExplanationStyle] = useState("Detailed");
  const [interviewDifficulty, setInterviewDifficulty] = useState("Medium");
  const [preferredLanguage, setPreferredLanguage] = useState("English");

  // Section 5: Notifications
  const [notifications, setNotifications] = useState({
    resumeAnalysis: true,
    interviewResults: true,
    weeklyProgress: true,
    roadmapReminder: true,
    achievementAlerts: true,
    emailNotifications: true,
    pushNotifications: false,
  });

  // Section 6: Theme & Appearance
  const [theme, setTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("blue");

  // Section 10 & 11: Stats & Meta
  const [stats, setStats] = useState({ resumesCount: 0, atsCount: 0, jobMatchesCount: 0, interviewsCount: 0, roadmapsCount: 0 });
  const [latestScores, setLatestScores] = useState({ atsScore: 0, jobMatchScore: 0, interviewScore: 0 });

  // Confirmation Modal
  const [modalTarget, setModalTarget] = useState(null); // null | "resumes" | "ats" | "interviews" | "roadmaps" | "all" | "account"

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsService.getUserSettings();
      const payload = res?.data || res;

      if (payload) {
        const u = payload.user || {};
        setName(u.name || authUser?.name || "");
        setEmail(u.email || authUser?.email || "");

        const s = payload.settings || {};
        setTheme(s.theme || "dark");
        setAccentColor(s.accentColor || "blue");

        const prof = s.profileDetails || {};
        setUsername(prof.username || "");
        setBio(prof.bio || "");
        setLocation(prof.location || "India");
        setLinkedin(prof.linkedin || "");
        setGithub(prof.github || "");
        setPortfolio(prof.portfolio || "");
        setAvatarUrl(prof.avatarUrl || "");

        const car = s.careerPreferences || {};
        setDreamCompany(car.dreamCompany || "Google");
        setDreamRole(car.dreamRole || "Software Development Engineer");
        setExpectedSalary(car.expectedSalary || "₹12–18 LPA");
        setPreferredWorkType(car.preferredWorkType || "Hybrid");
        setPreferredCountry(car.preferredCountry || "India");
        setPreferredExperienceLevel(car.preferredExperienceLevel || "Fresher");

        const ai = s.aiPersonalization || {};
        setPreferredRoadmapDuration(ai.preferredRoadmapDuration || "8 Weeks");
        setLearningPace(ai.learningPace || "Medium");
        setExplanationStyle(ai.explanationStyle || "Detailed");
        setInterviewDifficulty(ai.interviewDifficulty || "Medium");
        setPreferredLanguage(ai.preferredLanguage || "English");

        if (s.notifications) {
          setNotifications(s.notifications);
        }

        if (payload.stats) setStats(payload.stats);
        if (payload.latestScores) setLatestScores(payload.latestScores);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, [authUser?.email, authUser?.name]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveAllSettings = async () => {
    setSaving(true);
    const toastId = toast.loading("Saving settings & profile preferences...");

    try {
      await settingsService.updateUserSettings({
        name,
        theme,
        accentColor,
        profileDetails: { username, bio, location, linkedin, github, portfolio, avatarUrl },
        careerPreferences: { dreamCompany, dreamRole, expectedSalary, preferredWorkType, preferredCountry, preferredExperienceLevel },
        aiPersonalization: { preferredRoadmapDuration, learningPace, explanationStyle, interviewDifficulty, preferredLanguage },
        notifications,
      });

      toast.success("Settings & profile preferences saved successfully!", { id: toastId });
    } catch (err) {
      console.error("Save settings error:", err);
      toast.error("Failed to save settings.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      toast.error("Use 8+ characters with uppercase, lowercase, number, and special character.");
      return;
    }

    setChangingPass(true);
    const toastId = toast.loading("Updating password...");

    try {
      await settingsService.changePassword({ currentPassword, newPassword });
      toast.success("Password updated. Please sign in again.", { id: toastId });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await logout();
    } catch (err) {
      console.error("Change password error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to update password.", { id: toastId });
    } finally {
      setChangingPass(false);
    }
  };

  const handleExportData = async () => {
    const toastId = toast.loading("Compiling user data export...");
    try {
      const res = await settingsService.exportUserData();
      const payload = res?.data || res;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `pathforge_user_export_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("Data export downloaded cleanly!", { id: toastId });
    } catch {
      toast.error("Failed to export user data.", { id: toastId });
    }
  };

  const handleConfirmDataDelete = async () => {
    if (!modalTarget) return;

    const toastId = toast.loading(`Deleting ${modalTarget} history...`);
    try {
      if (modalTarget === "account") {
        await settingsService.deleteUserData({ target: "all" });
        toast.success("Account data cleared.", { id: toastId });
        logout();
      } else {
        await settingsService.deleteUserData({ target: modalTarget });
        toast.success(`Data cleanup for '${modalTarget}' complete!`, { id: toastId });
        fetchSettings();
      }
    } catch {
      toast.error("Failed to execute data cleanup.", { id: toastId });
    } finally {
      setModalTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner />
        <p className="text-slate-400 text-sm">Loading user profile & settings workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 animate-fade-in relative">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-xs font-semibold text-primary-light flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> User Profile & Configuration
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-100 mt-2 flex items-center gap-3">
            Profile & Settings Center
          </h1>
          <p className="text-slate-400 mt-1">
            Manage account information, career preferences, AI personalization parameters, appearance, and privacy controls.
          </p>
        </div>

        <button
          onClick={handleSaveAllSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: "profile", label: "Account Info", icon: User },
          { id: "career", label: "Career Preferences", icon: Briefcase },
          { id: "ai", label: "AI Personalization", icon: Bot },
          { id: "security", label: "Security & Login", icon: Shield },
          { id: "notifications", label: "Notifications & Theme", icon: Bell },
          { id: "data", label: "Data & Privacy", icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isSelected
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}

      {/* TAB 1: Account Information */}
      {activeTab === "profile" && (
        <div className="space-y-6 animate-fade-in">
          {/* AI Summary Card & Account Stats Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Summary Card (Section 11) */}
            <div className="lg:col-span-2 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> AI Profile Summary (Section 11)
                </span>
                <span className="px-3 py-1 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-xl">
                  Active Candidate Profile
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
                  <span className="text-xs text-slate-400 block">Latest ATS Score</span>
                  <span className="text-lg font-bold text-indigo-400 mt-1 block">{latestScores.atsScore}%</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
                  <span className="text-xs text-slate-400 block">Latest Job Match</span>
                  <span className="text-lg font-bold text-emerald-400 mt-1 block">{latestScores.jobMatchScore}%</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
                  <span className="text-xs text-slate-400 block">Mock Interview</span>
                  <span className="text-lg font-bold text-amber-400 mt-1 block">{latestScores.interviewScore}%</span>
                </div>
              </div>
            </div>

            {/* Account Statistics (Section 10) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-3">
              <h4 className="font-display font-bold text-slate-100 text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary-light" /> Account Statistics (Section 10)
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-xl">
                  <span className="text-slate-400">Resumes Uploaded</span>
                  <span className="font-bold text-slate-100">{stats.resumesCount}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-xl">
                  <span className="text-slate-400">ATS Audits Completed</span>
                  <span className="font-bold text-slate-100">{stats.atsCount}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-xl">
                  <span className="text-slate-400">Mock Interviews</span>
                  <span className="font-bold text-slate-100">{stats.interviewsCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Account Information Form */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <h3 className="text-xl font-display font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-light" /> Account Information (Section 1)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-slate-950/50 border border-slate-800/60 text-slate-400 text-sm rounded-xl px-4 py-3 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. bhoomi_sde"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Current Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bangalore, India"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Professional Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short 2-3 sentence introduction about your technical expertise..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-4 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Career Preferences */}
      {activeTab === "career" && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" /> Career Preferences & DNA (Section 3)
            </h3>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-all shrink-0"
            >
              <Sparkles className="w-4 h-4" /> Edit Career DNA Profile
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Dream Company
              </label>
              <input
                type="text"
                value={dreamCompany}
                onChange={(e) => setDreamCompany(e.target.value)}
                placeholder="e.g. Google, Amazon, Microsoft, Uber"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Dream Target Role
              </label>
              <input
                type="text"
                value={dreamRole}
                onChange={(e) => setDreamRole(e.target.value)}
                placeholder="e.g. Software Development Engineer"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Expected Salary Band
              </label>
              <input
                type="text"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                placeholder="e.g. ₹12–18 LPA"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Preferred Work Arrangement
              </label>
              <select
                value={preferredWorkType}
                onChange={(e) => setPreferredWorkType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Preferred Country / Region
              </label>
              <input
                type="text"
                value={preferredCountry}
                onChange={(e) => setPreferredCountry(e.target.value)}
                placeholder="e.g. India, USA, Canada, Germany"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Experience Level
              </label>
              <select
                value={preferredExperienceLevel}
                onChange={(e) => setPreferredExperienceLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="Intern">Internship</option>
                <option value="Fresher">Fresher / Entry-Level</option>
                <option value="1–3 Years">1–3 Years Experience</option>
                <option value="3–5 Years">3–5 Years Experience</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI Personalization */}
      {activeTab === "ai" && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6 animate-fade-in">
          <h3 className="text-xl font-display font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary-light" /> AI Personalization & Behavior (Section 4)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Preferred Roadmap Duration
              </label>
              <select
                value={preferredRoadmapDuration}
                onChange={(e) => setPreferredRoadmapDuration(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="4 Weeks">4 Weeks Sprint</option>
                <option value="8 Weeks">8 Weeks Standard</option>
                <option value="12 Weeks">12 Weeks In-Depth</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Learning Pace
              </label>
              <select
                value={learningPace}
                onChange={(e) => setLearningPace(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="Slow">Slow & Thorough</option>
                <option value="Medium">Medium Balanced</option>
                <option value="Fast">Fast Intensive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Explanation Style
              </label>
              <select
                value={explanationStyle}
                onChange={(e) => setExplanationStyle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="Short">Short Concise Directives</option>
                <option value="Detailed">Detailed Step-by-Step Rationale</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                AI Interview Difficulty
              </label>
              <select
                value={interviewDifficulty}
                onChange={(e) => setInterviewDifficulty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="Easy">Easy Standard Questions</option>
                <option value="Medium">Medium Engineering Standard</option>
                <option value="Hard">Hard Tier-1 FAANG Standards</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Security & Login */}
      {activeTab === "security" && (
        <div className="space-y-6 animate-fade-in">
          {/* Change Password Form (Section 2) */}
          <form onSubmit={handleChangePassword} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <h3 className="text-xl font-display font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" /> Change Password (Section 2)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={changingPass}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20"
              >
                {changingPass ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          </form>

          {/* Session Metadata & Connected Accounts (Section 2 & 9) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
            <h3 className="text-lg font-display font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary-light" /> Session & Connected Accounts (Section 9)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Current Active Session</span>
                  <span className="text-slate-500">Logged in via secure HTTP-only JWT cookies</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold rounded-lg uppercase">
                  Active
                </span>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Third-party sign-in</span>
                  <span className="text-slate-500">No OAuth provider is configured</span>
                </div>
                <span className="px-2.5 py-1 bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-bold rounded-lg uppercase">
                  Not connected
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Notifications & Theme */}
      {activeTab === "notifications" && (
        <div className="space-y-6 animate-fade-in">
          {/* Notification Toggles (Section 5) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
            <h3 className="text-xl font-display font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" /> Notification Settings (Section 5)
            </h3>

            <div className="space-y-3">
              {[
                { key: "resumeAnalysis", label: "Resume Analysis Completed Alerts", sub: "Get notified when ATS audits finish processing." },
                { key: "interviewResults", label: "Mock Interview Result Alerts", sub: "Receive feedback notifications post-interview." },
                { key: "weeklyProgress", label: "Weekly Progress Reminders", sub: "Automated summary of roadmap milestones." },
                { key: "achievementAlerts", label: "Achievement & Badge Unlocks", sub: "Instant notifications for unlocked badges." },
                { key: "emailNotifications", label: "Email Digest Notifications", sub: "Receive updates directly in your inbox." },
              ].map((item) => (
                <div key={item.key} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{item.label}</span>
                    <span className="text-[11px] text-slate-500">{item.sub}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                      notifications[item.key] ? "bg-primary" : "bg-slate-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        notifications[item.key] ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Theme & Accent Settings (Section 6) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
            <h3 className="text-xl font-display font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Palette className="w-5 h-5 text-accent-light" /> Theme & Accent Appearance (Section 6)
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  UI Theme Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["dark", "light", "system"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={`p-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                        theme === t
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      {t} Mode
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Accent Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { id: "blue", label: "Indigo Blue", color: "bg-indigo-500" },
                    { id: "purple", label: "Violet Purple", color: "bg-purple-500" },
                    { id: "emerald", label: "Emerald Green", color: "bg-emerald-500" },
                    { id: "cyan", label: "Cyan Blue", color: "bg-cyan-500" },
                  ].map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setAccentColor(acc.id)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        accentColor === acc.id
                          ? "bg-slate-900 border-primary text-white"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${acc.color}`} /> {acc.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Data & Privacy Controls */}
      {activeTab === "data" && (
        <div className="space-y-6 animate-fade-in">
          {/* Data Export Center (Section 8) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
            <h3 className="text-xl font-display font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Download className="w-5 h-5 text-primary-light" /> Data Export Center (Section 8)
            </h3>
            <p className="text-slate-400 text-xs">Download your candidate profile, resume structures, ATS reports, and interview history in JSON format.</p>

            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-primary/20"
            >
              <Download className="w-4 h-4" /> Download Complete Account Export (JSON)
            </button>
          </div>

          {/* Danger Zone & Privacy Cleanup (Section 7 & 12) */}
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
            <h3 className="text-xl font-display font-bold text-rose-400 border-b border-rose-900/40 pb-3 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" /> Danger Zone & Data Cleanup (Section 7 & 12)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setModalTarget("resumes")}
                className="p-4 bg-slate-950/60 border border-slate-800/80 hover:border-rose-900 rounded-2xl text-left transition-all space-y-1"
              >
                <span className="text-xs font-bold text-slate-200 block">Delete Resume History</span>
                <span className="text-[11px] text-slate-500 block">Clear stored resume upload documents.</span>
              </button>

              <button
                onClick={() => setModalTarget("ats")}
                className="p-4 bg-slate-950/60 border border-slate-800/80 hover:border-rose-900 rounded-2xl text-left transition-all space-y-1"
              >
                <span className="text-xs font-bold text-slate-200 block">Delete ATS History</span>
                <span className="text-[11px] text-slate-500 block">Clear past ATS compatibility records.</span>
              </button>

              <button
                onClick={() => setModalTarget("interviews")}
                className="p-4 bg-slate-950/60 border border-slate-800/80 hover:border-rose-900 rounded-2xl text-left transition-all space-y-1"
              >
                <span className="text-xs font-bold text-slate-200 block">Delete Mock Interview Logs</span>
                <span className="text-[11px] text-slate-500 block">Clear mock interview session transcripts.</span>
              </button>

              <button
                onClick={() => setModalTarget("all")}
                className="p-4 bg-rose-950/40 border border-rose-900/60 hover:border-rose-800 rounded-2xl text-left transition-all space-y-1"
              >
                <span className="text-xs font-bold text-rose-300 block">Clear All AI History</span>
                <span className="text-[11px] text-rose-400/80 block">Factory reset all historical telemetry data.</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      <AnimatePresence>
        {modalTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-100 text-lg">Confirm Action</h3>
                  <p className="text-xs text-slate-400 mt-0.5">This operation cannot be undone.</p>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                Are you sure you want to execute data cleanup for <strong className="text-rose-400 uppercase">{modalTarget}</strong>?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setModalTarget(null)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDataDelete}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/20"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding Wizard Modal for Editing Career DNA */}
      <OnboardingWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={() => {
          setIsWizardOpen(false);
          fetchSettings();
        }}
      />
    </div>
  );
};

export default ProfileSettings;
