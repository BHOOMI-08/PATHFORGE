import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Briefcase,
  CheckCircle2,
  History,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  UserCheck,
} from "lucide-react";
import ScoreCircle from "../components/ui/ScoreCircle";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ChatInterface from "../components/ui/ChatInterface";
import { mentorService } from "../services/mentor.service";

const seniorityOptions = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
];

const FeedbackList = ({ title, icon: Icon, items = [], tone = "emerald" }) => {
  const colors = {
    emerald: "border-emerald-900/40 bg-emerald-950/30 text-emerald-300",
    amber: "border-amber-900/40 bg-amber-950/30 text-amber-300",
    blue: "border-blue-900/40 bg-blue-950/30 text-blue-300",
  };
  return (
    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
      <h4 className="flex items-center gap-2 font-display font-bold text-slate-100"><Icon className="h-5 w-5" /> {title}</h4>
      <div className="space-y-2.5">
        {items.length ? items.map((item) => (
          <div key={item} className={`rounded-xl border p-3 text-xs leading-relaxed ${colors[tone]}`}>{item}</div>
        )) : <p className="text-xs text-slate-500">No items were returned.</p>}
      </div>
    </div>
  );
};

export const AIMentor = () => {
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [history, setHistory] = useState([]);
  const [viewState, setViewState] = useState("setup");
  const [targetRole, setTargetRole] = useState("");
  const [seniorityLevel, setSeniorityLevel] = useState("mid");
  const [formError, setFormError] = useState("");
  const [sessionError, setSessionError] = useState("");

  const replaceHistorySession = (session) => {
    setHistory((previous) => [session, ...previous.filter((item) => item._id !== session._id)]);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [historyList, active] = await Promise.all([
        mentorService.getInterviewHistory(),
        mentorService.getActiveSession(),
      ]);
      setHistory(Array.isArray(historyList) ? historyList : []);
      if (active?._id && !active.isLegacy) {
        setActiveSession(active);
        setViewState("chat");
      }
    } catch (error) {
      toast.error(error.body?.message || error.message || "Failed to load interview workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!activeSession?._id || !activeSession.isProcessing) return undefined;
    const timer = window.setInterval(async () => {
      try {
        const refreshed = await mentorService.getSession(activeSession._id);
        setActiveSession(refreshed);
        replaceHistorySession(refreshed);
      } catch {
        window.clearInterval(timer);
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [activeSession?._id, activeSession?.isProcessing]);

  const handleStartSession = async (event) => {
    event.preventDefault();
    if (starting || activeSession?.status === "active") return;
    const normalizedRole = targetRole.trim();
    if (normalizedRole.length < 2 || normalizedRole.length > 120) {
      setFormError("Enter a target role between 2 and 120 characters.");
      return;
    }
    setStarting(true);
    setFormError("");
    const toastId = toast.loading("Gemini is preparing the first interview question...");
    try {
      const session = await mentorService.startSession({
        targetRole: normalizedRole,
        seniorityLevel,
        interviewType: "technical",
      });
      if (!session?._id || !Array.isArray(session.questions) || !session.questions.length) {
        throw new Error("Interview provider returned an empty session.");
      }
      setActiveSession(session);
      replaceHistorySession(session);
      setViewState("chat");
      toast.success("Interview session ready.", { id: toastId });
    } catch (error) {
      const message = error.body?.message || error.message || "Failed to start interview session.";
      setFormError(message);
      toast.error(message, { id: toastId });
      if (error.status === 409) {
        try {
          const active = await mentorService.getActiveSession();
          if (active?._id) setActiveSession(active);
        } catch {}
      }
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async (questionId, answer) => {
    if (!activeSession?._id || sending) return false;
    setSending(true);
    setSessionError("");
    try {
      const updated = await mentorService.submitAnswer(activeSession._id, questionId, answer);
      setActiveSession(updated);
      replaceHistorySession(updated);
      return true;
    } catch (error) {
      const message = error.body?.message || error.message || "Failed to evaluate the answer.";
      setSessionError(message);
      toast.error(message);
      return false;
    } finally {
      setSending(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!activeSession?._id || finishing || sending) return;
    setFinishing(true);
    setSessionError("");
    const toastId = toast.loading("Generating the persisted final interview report...");
    try {
      const completed = await mentorService.finishSession(activeSession._id);
      setActiveSession(completed);
      replaceHistorySession(completed);
      setViewState("scorecard");
      toast.success("Interview report generated.", { id: toastId });
    } catch (error) {
      const message = error.body?.message || error.message || "Failed to complete the interview.";
      setSessionError(message);
      toast.error(message, { id: toastId });
    } finally {
      setFinishing(false);
    }
  };

  const handleSelectHistorySession = async (summary) => {
    if (summary.isLegacy) {
      toast.error("This legacy session used the previous unvalidated interview format and cannot be trusted or resumed.");
      return;
    }
    try {
      const session = await mentorService.getSession(summary._id);
      setActiveSession(session);
      setSessionError("");
      setViewState(session.status === "completed" ? "scorecard" : "chat");
    } catch (error) {
      toast.error(error.body?.message || error.message || "Failed to load the interview.");
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (deletingId || !window.confirm("Delete this interview session and its stored answers?")) return;
    setDeletingId(sessionId);
    try {
      await mentorService.deleteSession(sessionId);
      setHistory((previous) => previous.filter((session) => session._id !== sessionId));
      if (activeSession?._id === sessionId) {
        setActiveSession(null);
        setViewState("setup");
      }
      toast.success("Interview session deleted.");
    } catch (error) {
      toast.error(error.body?.message || error.message || "Failed to delete the interview.");
    } finally {
      setDeletingId(null);
    }
  };

  const openSetup = () => {
    if (activeSession?.status !== "active") setActiveSession(null);
    setViewState("setup");
    setFormError("");
  };

  if (loading) {
    return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4"><LoadingSpinner /><p className="text-sm text-slate-400">Restoring interview workspace...</p></div>;
  }

  const feedback = activeSession?.feedback || {};
  const breakdown = activeSession?.scoreBreakdown || {};

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-light"><Sparkles className="h-3.5 w-3.5" /> Real Gemini Interview Session</span>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-100">AI Mentor & Mock Interviews</h1>
          <p className="mt-1 text-slate-400">Role-specific questions, answer-level evaluations, contextual follow-ups, and deterministic score aggregation.</p>
        </div>
        {viewState !== "setup" && <button type="button" onClick={openSetup} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300"><RotateCcw className="h-4 w-4" /> Interview Setup</button>}
      </div>

      {sessionError && <div className="flex items-center gap-2 rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 text-sm text-rose-300"><AlertCircle className="h-4 w-4" /> {sessionError}</div>}

      {viewState === "setup" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 lg:col-span-2">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-100"><Play className="h-5 w-5 text-primary-light" /> Configure Mock Interview</h2>
              <p className="mt-1 text-sm text-slate-400">The role is editable and sent exactly as entered after trimming.</p>
            </div>

            {activeSession?.status === "active" && (
              <div className="rounded-2xl border border-amber-800/50 bg-amber-950/20 p-4 text-sm text-amber-200">
                An active {activeSession.targetRole} interview is already saved. Resume or delete it before starting another.
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => setViewState("chat")} className="rounded-lg bg-amber-300 px-3 py-1.5 text-xs font-bold text-slate-950">Resume Interview</button>
                  <button type="button" onClick={() => handleDeleteSession(activeSession._id)} className="rounded-lg border border-amber-700 px-3 py-1.5 text-xs font-bold">Delete</button>
                </div>
              </div>
            )}

            <form onSubmit={handleStartSession} className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Target Technical Role *</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input type="text" required minLength={2} maxLength={120} placeholder="e.g. Full Stack React & Node Engineer" value={targetRole} onChange={(event) => { setTargetRole(event.target.value); setFormError(""); }} disabled={starting || activeSession?.status === "active"} className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-slate-200 focus:border-primary focus:outline-none disabled:opacity-50" />
                </div>
                <p className="mt-1 text-right text-[11px] text-slate-500">{targetRole.length}/120</p>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Seniority Level</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {seniorityOptions.map((option) => (
                    <button key={option.value} type="button" onClick={() => setSeniorityLevel(option.value)} disabled={starting || activeSession?.status === "active"} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition disabled:opacity-50 ${seniorityLevel === option.value ? "border-primary-light bg-primary text-white" : "border-slate-800 bg-slate-950 text-slate-400"}`}><UserCheck className="h-4 w-4" /> {option.label}</button>
                  ))}
                </div>
              </div>
              {formError && <p className="text-sm text-rose-400">{formError}</p>}
              <div className="flex justify-end pt-3">
                <button type="submit" disabled={starting || activeSession?.status === "active" || targetRole.trim().length < 2} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-7 py-3 font-bold text-white disabled:opacity-40">
                  {starting ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating first question...</> : <><Play className="h-4 w-4" /> Start Mock Interview</>}
                </button>
              </div>
            </form>
          </section>

          <aside className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-100"><History className="h-5 w-5 text-primary-light" /> Interview History</h2>
            <div className="mt-4 max-h-[470px] space-y-3 overflow-y-auto pr-1">
              {history.length ? history.map((session) => (
                <div key={session._id} className={`rounded-2xl border p-4 ${session.isLegacy ? "border-amber-900/40 bg-amber-950/10" : "border-slate-800 bg-slate-950/60"}`}>
                  <button type="button" onClick={() => handleSelectHistorySession(session)} className="w-full text-left">
                    <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-slate-200">{session.targetRole}</span><span className="text-[10px] font-bold uppercase text-slate-400">{session.isLegacy ? "Legacy" : session.status}</span></div>
                    <p className="mt-1 text-[11px] text-slate-500">{session.seniorityLevel || session.experienceLevel} / {new Date(session.createdAt).toLocaleDateString()}</p>
                    {session.status === "completed" && !session.isLegacy && <span className="mt-2 inline-block rounded-lg border border-emerald-800 bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300">{session.score}%</span>}
                  </button>
                  <button type="button" onClick={() => handleDeleteSession(session._id)} disabled={deletingId === session._id} className="mt-3 inline-flex items-center gap-1 text-[11px] text-rose-400 disabled:opacity-50"><Trash2 className="h-3 w-3" /> Delete</button>
                </div>
              )) : <p className="py-8 text-center text-xs text-slate-500">No interview sessions yet.</p>}
            </div>
          </aside>
        </div>
      )}

      {viewState === "chat" && activeSession && !activeSession.isLegacy && (
        <ChatInterface session={activeSession} onSubmitAnswer={handleSubmitAnswer} onFinishInterview={handleFinishInterview} sending={sending} finishing={finishing} />
      )}

      {viewState === "scorecard" && activeSession && (
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center">
              <ScoreCircle score={activeSession.score || 0} size={190} strokeWidth={14} label="Deterministic Overall Score" sublabel={feedback.readinessLevel || "Completed"} />
              <p className="mt-4 text-xs text-slate-400">{activeSession.targetRole} / {activeSession.seniorityLevel}</p>
            </motion.div>
            <div className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 lg:col-span-2">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-100"><Award className="h-5 w-5 text-amber-300" /> Final Performance Report</h2>
              <p className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-sm leading-relaxed text-slate-300">{feedback.overallSummary || "No summary was saved."}</p>
              <p className="text-xs leading-relaxed text-slate-400">{feedback.detailedSummary}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Accuracy", breakdown.technicalAccuracy],
                  ["Depth", breakdown.conceptualDepth],
                  ["Communication", breakdown.communication],
                  ["Clarity", breakdown.clarity],
                ].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center"><span className="block text-lg font-black text-primary-light">{value ?? 0}%</span><span className="text-[10px] uppercase text-slate-500">{label}</span></div>)}
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <button type="button" onClick={() => setViewState("chat")} className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300">Review Answers</button>
                <button type="button" onClick={() => handleDeleteSession(activeSession._id)} className="rounded-xl border border-rose-900/60 bg-rose-950/20 px-4 py-2 text-xs font-semibold text-rose-300">Delete Session</button>
                <button type="button" onClick={openSetup} className="rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2 text-xs font-bold text-white">Start New Interview</button>
              </div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <FeedbackList title="Demonstrated Strengths" icon={CheckCircle2} items={feedback.strengths || []} tone="emerald" />
            <FeedbackList title="Observed Weaknesses" icon={AlertTriangle} items={feedback.weaknesses || []} tone="amber" />
            <FeedbackList title="Recommended Practice" icon={Lightbulb} items={feedback.recommendedPractice || feedback.tips || []} tone="blue" />
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="flex items-center gap-2 font-bold text-slate-100"><Target className="h-4 w-4 text-rose-300" /> Topics to revise</h3>
            <div className="mt-3 flex flex-wrap gap-2">{(feedback.topicsToRevise || []).map((topic) => <span key={topic} className="rounded-xl border border-rose-900/50 bg-rose-950/20 px-3 py-1 text-xs text-rose-300">{topic}</span>)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMentor;