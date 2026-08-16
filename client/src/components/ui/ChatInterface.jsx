import React, { useEffect, useRef, useState } from "react";
import {
  Award,
  Bot,
  CheckCircle2,
  Clock,
  Loader2,
  Send,
  Target,
  User,
} from "lucide-react";

export const ChatInterface = ({
  session,
  onSubmitAnswer,
  onFinishInterview,
  sending = false,
  finishing = false,
}) => {
  const [answer, setAnswer] = useState("");
  const [inputError, setInputError] = useState("");
  const chatEndRef = useRef(null);
  const questions = Array.isArray(session?.questions) ? session.questions : [];
  const answeredCount = questions.filter((question) => question.answer).length;
  const maxQuestions = Number(session?.maxQuestions || 5);
  const progress = Math.round((answeredCount / maxQuestions) * 100);
  const currentQuestion = questions[Number(session?.currentQuestionIndex || 0)] || null;
  const canAnswer =
    session?.status === "active" && currentQuestion && !currentQuestion.answer && !session?.isProcessing;

  const visibleQuestions = questions.slice(0, maxQuestions);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [questions.length, sending]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = answer.trim();
    if (!trimmed) {
      setInputError("Enter an answer before submitting.");
      return;
    }
    if (trimmed.length > 8000 || !canAnswer || sending) return;
    setInputError("");
    const saved = await onSubmitAnswer?.(currentQuestion.questionId, trimmed);
    if (saved !== false) setAnswer("");
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#10263D]/80 shadow-2xl backdrop-blur-xl">
      <header className="space-y-4 border-b border-white/10 bg-[#041220]/90 p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-200">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-extrabold text-slate-100">Gemini Technical Interviewer</h3>
              <p className="text-xs text-slate-400">
                {session.targetRole} / {session.seniorityLevel} level
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onFinishInterview}
            disabled={finishing || sending || answeredCount < 1 || session?.status !== "active"}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-5 py-2.5 text-xs font-black text-slate-950 transition hover:opacity-90 disabled:opacity-40"
          >
            {finishing ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating report...</> : <><Award className="h-4 w-4" /> Finish & Evaluate</>}
          </button>
        </div>
        <div>
          <div className="mb-1.5 flex justify-between text-[11px] font-semibold text-slate-400">
            <span>{answeredCount}/{maxQuestions} questions evaluated</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-950">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <div className="max-h-[58vh] space-y-5 overflow-y-auto p-4 sm:p-6">
        {visibleQuestions.map((question, index) => (
          <article key={question.questionId} className="space-y-3 rounded-2xl border border-white/10 bg-[#041220] p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
              <span className="rounded-lg bg-blue-500/15 px-2 py-1 text-blue-300">Question {index + 1}</span>
              <span className="rounded-lg border border-slate-700 px-2 py-1 text-slate-300">{question.category}</span>
              <span className="rounded-lg border border-amber-800/50 bg-amber-950/20 px-2 py-1 text-amber-300">{question.difficulty}</span>
              <span className="rounded-lg border border-violet-800/50 bg-violet-950/20 px-2 py-1 text-violet-300">{question.type?.replace("_", " ")}</span>
              <span className="ml-auto inline-flex items-center gap-1 text-slate-500"><Clock className="h-3 w-3" /> {question.timeLimitSeconds}s suggested</span>
            </div>
            <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-100">{question.question}</p>

            {question.answer && (
              <div className="space-y-3 border-t border-white/10 pt-3">
                <div className="flex items-start gap-2 rounded-xl border border-blue-900/50 bg-blue-950/20 p-3 text-xs text-slate-300">
                  <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-300" />
                  <p className="whitespace-pre-wrap">{question.answer.text}</p>
                </div>
                <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Answer evaluation</span>
                    <span className="text-lg font-black text-emerald-300">{question.answer.evaluation?.score ?? 0}%</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">{question.answer.evaluation?.feedback}</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500">Strengths</span>
                      {(question.answer.evaluation?.strengths || []).map((item) => <p key={item} className="mt-1 text-[11px] text-emerald-300">+ {item}</p>)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500">Improvements</span>
                      {(question.answer.evaluation?.improvements || []).map((item) => <p key={item} className="mt-1 text-[11px] text-amber-300">- {item}</p>)}
                    </div>
                  </div>
                  <details className="mt-3 text-xs text-slate-400">
                    <summary className="cursor-pointer font-semibold text-slate-300">Review reference answer</summary>
                    <p className="mt-2 whitespace-pre-wrap leading-relaxed">{question.answer.evaluation?.idealAnswer}</p>
                  </details>
                  {question.answer.evaluation?.nextQuestionReason && (
                    <p className="mt-3 flex items-start gap-1.5 text-[11px] text-violet-300"><Target className="mt-0.5 h-3 w-3 shrink-0" /> {question.answer.evaluation.nextQuestionReason}</p>
                  )}
                </div>
              </div>
            )}
          </article>
        ))}

        {sending && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4 text-xs text-emerald-200">
            <Loader2 className="h-4 w-4 animate-spin" /> Gemini is evaluating this answer and generating the contextual next question...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {canAnswer ? (
        <form onSubmit={handleSubmit} className="space-y-2 border-t border-white/10 bg-[#041220]/90 p-4">
          <textarea
            rows={4}
            required
            maxLength={8000}
            placeholder="Write your answer to the current question..."
            value={answer}
            onChange={(event) => { setAnswer(event.target.value); setInputError(""); }}
            disabled={sending || finishing}
            className="w-full resize-none rounded-2xl border border-white/10 bg-[#0B2238] p-3.5 text-sm leading-relaxed text-slate-100 focus:border-emerald-300 focus:outline-none disabled:opacity-60"
          />
          <div className="flex items-center justify-between gap-3">
            <span className={`text-[11px] ${inputError ? "text-rose-400" : "text-slate-500"}`}>{inputError || `${answer.length}/8000 characters`}</span>
            <button type="submit" disabled={sending || finishing || !answer.trim()} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-40">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit Answer
            </button>
          </div>
        </form>
      ) : session?.status === "active" && currentQuestion?.answer ? (
        <div className="border-t border-white/10 bg-[#041220]/90 p-4 text-center text-xs text-slate-400">All generated questions are evaluated. Finish the interview to create the persisted scorecard.</div>
      ) : null}
    </section>
  );
};

export default ChatInterface;