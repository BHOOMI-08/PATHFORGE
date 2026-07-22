import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  MessageSquare,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Play,
  History,
  RotateCcw,
  Briefcase,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import ScoreCircle from "../components/ui/ScoreCircle";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ChatInterface from "../components/ui/ChatInterface";
import { mentorService } from "../services/mentor.service";

export const AIMentor = () => {
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const [activeSession, setActiveSession] = useState(null);
  const [history, setHistory] = useState([]);
  const [viewState, setViewState] = useState("setup"); // "setup" | "chat" | "scorecard"

  // Setup form states
  const [targetRole, setTargetRole] = useState("Full Stack React & Node Engineer");
  const [experienceLevel, setExperienceLevel] = useState("Mid");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const res = await mentorService.getInterviewHistory();
      if (res?.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error("Failed to load interview history:", err);
      toast.error("Failed to load interview history.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (e) => {
    if (e) e.preventDefault();
    setStarting(true);
    const toastId = toast.loading("Initializing AI Mock Interviewer...");

    try {
      const res = await mentorService.startSession({
        targetRole,
        experienceLevel,
      });

      if (res?.data) {
        setActiveSession(res.data);
        setViewState("chat");
        toast.success("Interview session ready!", { id: toastId });
      }
    } catch (err) {
      console.error("Start session error:", err);
      toast.error(err.response?.data?.message || "Failed to start interview session.", { id: toastId });
    } finally {
      setStarting(false);
    }
  };

  const handleSendMessage = async (userMessage) => {
    if (!activeSession) return;
    setSending(true);

    try {
      const res = await mentorService.sendMessage(activeSession._id, userMessage);
      if (res?.data) {
        setActiveSession(res.data);
      }
    } catch (err) {
      console.error("Send message error:", err);
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!activeSession) return;
    setFinishing(true);
    const toastId = toast.loading("Generating AI Interview Scorecard & Feedback...");

    try {
      const res = await mentorService.finishSession(activeSession._id);
      if (res?.data) {
        setActiveSession(res.data);
        setHistory((prev) => [res.data, ...prev.filter((h) => h._id !== res.data._id)]);
        setViewState("scorecard");
        toast.success("Interview scorecard generated!", { id: toastId });
      }
    } catch (err) {
      console.error("Finish interview error:", err);
      toast.error("Failed to evaluate interview session.", { id: toastId });
    } finally {
      setFinishing(false);
    }
  };

  const handleSelectHistorySession = (session) => {
    setActiveSession(session);
    if (session.status === "completed") {
      setViewState("scorecard");
    } else {
      setViewState("chat");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner />
        <p className="text-slate-400 text-sm">Loading AI Mentor workspace...</p>
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
              <Sparkles className="w-3.5 h-3.5" /> Conversational AI Agent
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-100 mt-2 flex items-center gap-3">
            AI Mentor & Mock Interview Sessions
          </h1>
          <p className="text-slate-400 mt-1">
            Practice context-aware technical interviews with real-time AI evaluation, follow-up questions, and feedback metrics.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {viewState !== "setup" && (
            <button
              onClick={() => setViewState("setup")}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> New Setup
            </button>
          )}
        </div>
      </div>

      {/* SETUP VIEW */}
      {viewState === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Setup Form */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
                <Play className="w-5 h-5 text-primary-light" /> Configure Mock Interview
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Set your target role and seniority level to start an interactive technical interview.
              </p>
            </div>

            <form onSubmit={handleStartSession} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Target Technical Role <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Full Stack React & Node Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Experience / Seniority Level
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {["Entry", "Mid", "Senior"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setExperienceLevel(level)}
                      className={`p-3 rounded-xl border text-sm font-semibold capitalize transition-all flex items-center justify-center gap-2 ${
                        experienceLevel === level
                          ? "bg-primary text-white border-primary-light shadow-md shadow-primary/20"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <UserCheck className="w-4 h-4" /> {level} Level
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={starting || !targetRole.trim()}
                  className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/25"
                >
                  {starting ? (
                    <>
                      <LoadingSpinner /> Initializing Session...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" /> Start Mock Interview
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Previous History Side Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
                <History className="w-5 h-5 text-primary-light" /> Past Interviews
              </h3>
              <p className="text-slate-400 text-xs mt-1">Review past scores and feedback history.</p>

              <div className="space-y-3 mt-4 max-h-[360px] overflow-y-auto pr-1">
                {history.length > 0 ? (
                  history.map((h) => (
                    <div
                      key={h._id}
                      onClick={() => handleSelectHistorySession(h)}
                      className="p-4 bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-2xl transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 text-sm">{h.targetRole}</span>
                        {h.status === "completed" ? (
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold rounded-lg">
                            {h.score}%
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold rounded-lg">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        {new Date(h.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs text-center py-6">No previous mock interview sessions found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE CHAT VIEW */}
      {viewState === "chat" && activeSession && (
        <ChatInterface
          history={activeSession.history}
          onSendMessage={handleSendMessage}
          onFinishInterview={handleFinishInterview}
          sending={sending}
          finishing={finishing}
          targetRole={activeSession.targetRole}
        />
      )}

      {/* SCORECARD VIEW */}
      {viewState === "scorecard" && activeSession && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Circle Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 backdrop-blur-md"
            >
              <ScoreCircle
                score={activeSession.score || 0}
                size={190}
                strokeWidth={14}
                label="Overall Interview Score"
                sublabel="Gemini Evaluation"
              />

              <div className="w-full pt-4 border-t border-slate-800/80">
                <span className="text-xs text-slate-400 font-medium block">Target Role</span>
                <span className="text-sm font-semibold text-slate-200">{activeSession.targetRole}</span>
              </div>
            </motion.div>

            {/* Overall Summary Card */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent-light" /> Performance Evaluation Summary
                </h3>
                <p className="text-slate-300 text-sm mt-3 leading-relaxed bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                  {activeSession.feedback?.overallSummary || "Evaluation completed."}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setViewState("chat")}
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-all"
                >
                  Review Chat Transcript
                </button>
                <button
                  onClick={() => setViewState("setup")}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20"
                >
                  Start New Interview Session
                </button>
              </div>
            </div>
          </div>

          {/* Feedback Categorized Lists */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strengths */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
              <h4 className="font-display font-bold text-slate-100 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Key Strengths
              </h4>
              <div className="space-y-2.5">
                {activeSession.feedback?.strengths?.map((str, idx) => (
                  <div key={idx} className="p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-xl text-xs text-emerald-300 leading-relaxed flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    {str}
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
              <h4 className="font-display font-bold text-slate-100 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Areas for Improvement
              </h4>
              <div className="space-y-2.5">
                {activeSession.feedback?.weaknesses?.map((wk, idx) => (
                  <div key={idx} className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl text-xs text-amber-300 leading-relaxed flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    {wk}
                  </div>
                ))}
              </div>
            </div>

            {/* Preparation Tips */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
              <h4 className="font-display font-bold text-slate-100 text-base flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary-light" /> Preparation Tips
              </h4>
              <div className="space-y-2.5">
                {activeSession.feedback?.tips?.map((tip, idx) => (
                  <div key={idx} className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-slate-200 leading-relaxed flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-light mt-1.5 shrink-0" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMentor;
