import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Focus,
  Lightbulb,
  ShieldCheck,
  Target,
} from "lucide-react";
import ScoreCircle from "../ui/ScoreCircle";

const CATEGORY_LABELS = {
  technicalSkills: "Technical Skills",
  dsa: "DSA & Problem Solving",
  projects: "Projects",
  experience: "Experience",
  systemDesign: "System Design",
  impact: "Impact",
  resumeQuality: "Resume Quality",
};

const scoreColor = (score) => {
  if (score >= 75) return "bg-emerald-400";
  if (score >= 55) return "bg-amber-400";
  return "bg-rose-400";
};

const decisionClasses = (decision) => {
  if (decision === "Strong Interview Potential" || decision === "Potential Interview") {
    return "border-emerald-800 bg-emerald-950/60 text-emerald-300";
  }
  if (decision === "Borderline") return "border-amber-800 bg-amber-950/60 text-amber-300";
  return "border-rose-800 bg-rose-950/60 text-rose-300";
};

const EmptyList = ({ children = "No items were identified." }) => (
  <p className="text-sm text-slate-500">{children}</p>
);

const RecruiterResult = ({ simulation }) => {
  const company = simulation.company || {};
  const strengths = simulation.strengths || [];
  const concerns = simulation.concerns || [];
  const categoryScores = simulation.categoryScores || {};
  const expectedQuestions = simulation.expectedQuestions || {};

  return (
    <section className="space-y-6" aria-live="polite" aria-labelledby="simulation-result-title">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-7 text-center backdrop-blur-md">
          <ScoreCircle
            score={simulation.overallScore}
            size={178}
            strokeWidth={13}
            label="Overall recruiter score"
            sublabel={`${company.name || "Company"} simulation`}
          />
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
            <span className={`rounded-xl border px-3 py-1.5 font-bold ${decisionClasses(simulation.decision)}`}>
              {simulation.decision}
            </span>
            <span className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 font-semibold text-slate-300">
              {simulation.confidence || "Low"} confidence
            </span>
          </div>
        </div>

        <div className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/60 p-7 backdrop-blur-md lg:col-span-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary-light">Recruiter simulation</p>
            <h2 id="simulation-result-title" className="mt-2 font-display text-2xl font-bold text-slate-100">
              {company.name || "Company"} - {simulation.targetRole}
            </h2>
            {simulation.resume?.fileName && (
              <p className="mt-1 text-xs text-slate-500">
                Resume version: {simulation.resume.fileName}
                {simulation.resume.createdAt ? ` · uploaded ${new Date(simulation.resume.createdAt).toLocaleDateString()}` : ""}
              </p>
            )}
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{simulation.summary}</p>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Target className="h-4 w-4 text-primary-light" /> Company fit
              </span>
              <span className="font-display text-xl font-bold text-primary-light">
                {simulation.companyFit?.score ?? simulation.overallScore}/100
              </span>
            </div>
            {company.focusAreas?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {company.focusAreas.map((area) => (
                  <span key={area} className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[11px] text-slate-300">
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            {simulation.disclaimer}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md sm:p-8">
        <h3 className="font-display text-lg font-bold text-slate-100">Category scores</h3>
        <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const score = Number(categoryScores[key] || 0);
            return (
              <div key={key}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-300">
                    {label}
                    {Number.isFinite(Number(company.evaluationWeights?.[key])) && (
                      <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        {company.evaluationWeights[key]}% weight
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-slate-100">{score}/100</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800" role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={score}>
                  <div className={`h-full rounded-full ${scoreColor(score)}`} style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-emerald-900/50 bg-emerald-950/20 p-6">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-emerald-300">
            <CheckCircle2 className="h-5 w-5" /> Evidence-backed strengths
          </h3>
          <div className="mt-4 space-y-3">
            {strengths.length ? strengths.map((item, index) => (
              <article key={`${item.title}-${index}`} className="rounded-2xl border border-emerald-900/50 bg-slate-950/40 p-4">
                <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.evidence}</p>
              </article>
            )) : <EmptyList />}
          </div>
        </div>

        <div className="rounded-3xl border border-rose-900/50 bg-rose-950/20 p-6">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-rose-300">
            <AlertTriangle className="h-5 w-5" /> Concerns and risk signals
          </h3>
          <div className="mt-4 space-y-3">
            {concerns.length ? concerns.map((item, index) => (
              <article key={`${item.title}-${index}`} className="rounded-2xl border border-rose-900/50 bg-slate-950/40 p-4">
                <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.reason}</p>
              </article>
            )) : <EmptyList>No major concerns were identified.</EmptyList>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="flex items-center gap-2 font-display font-bold text-slate-100">
            <Focus className="h-5 w-5 text-amber-400" /> Missing signals
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {(simulation.missingSignals || []).map((item, index) => <li key={`${item}-${index}`} className="rounded-xl bg-slate-950/60 p-3">{item}</li>)}
          </ul>
          {!(simulation.missingSignals || []).length && <div className="mt-4"><EmptyList /></div>}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="flex items-center gap-2 font-display font-bold text-slate-100">
            <Target className="h-5 w-5 text-primary-light" /> Interview focus
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {(simulation.interviewFocus || []).map((item, index) => <li key={`${item}-${index}`} className="rounded-xl bg-slate-950/60 p-3">{item}</li>)}
          </ul>
          {!(simulation.interviewFocus || []).length && <div className="mt-4"><EmptyList /></div>}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="flex items-center gap-2 font-display font-bold text-slate-100">
            <FileWarning className="h-5 w-5 text-rose-400" /> Company-fit gaps
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {(simulation.companyFit?.gaps || []).map((item, index) => <li key={`${item}-${index}`} className="rounded-xl bg-slate-950/60 p-3">{item}</li>)}
          </ul>
          {!(simulation.companyFit?.gaps || []).length && <div className="mt-4"><EmptyList /></div>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-slate-100">
            <FileWarning className="h-5 w-5 text-amber-400" /> Resume issues
          </h3>
          <div className="mt-4 space-y-3">
            {(simulation.resumeIssues || []).map((item, index) => (
              <article key={`${item.section}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">{item.section}</span>
                <p className="mt-1 text-sm font-semibold text-slate-200">{item.issue}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.suggestion}</p>
              </article>
            ))}
            {!(simulation.resumeIssues || []).length && <EmptyList>No specific resume presentation issues were identified.</EmptyList>}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-slate-100">
            <Lightbulb className="h-5 w-5 text-emerald-400" /> Recommended actions
          </h3>
          <div className="mt-4 space-y-3">
            {(simulation.recommendedActions || []).map((item, index) => (
              <article key={`${item.action}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${item.priority === "high" ? "text-rose-400" : item.priority === "medium" ? "text-amber-400" : "text-emerald-400"}`}>
                  {item.priority} priority
                </span>
                <p className="mt-1 text-sm font-semibold text-slate-200">{item.action}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.reason}</p>
              </article>
            ))}
            {!(simulation.recommendedActions || []).length && <EmptyList />}
          </div>
        </div>
      </div>

      {Object.values(expectedQuestions).some((items) => items?.length) && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
          <h3 className="font-display text-lg font-bold text-slate-100">Likely interview questions</h3>
          <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {[
              ["technical", "Technical"],
              ["behavioral", "Behavioral"],
              ["resumeSpecific", "Resume deep-dive"],
            ].map(([key, label]) => (
              <div key={key}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary-light">{label}</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {(expectedQuestions[key] || []).map((question, index) => (
                    <li key={`${question}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">{question}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default RecruiterResult;
