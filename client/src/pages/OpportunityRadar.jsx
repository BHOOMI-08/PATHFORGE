import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  FolderPlus,
  Layers,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { opportunityRadarService } from "../services/opportunityRadar.service";

const makeRequestId = () =>
  globalThis.crypto?.randomUUID?.() || `scan_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const errorMessage = (error) => {
  if (error?.status === 401) return "Your session has expired. Please sign in again.";
  if (error?.status === 404) return "No saved Opportunity Radar scan was found.";
  if (error?.status === 422) return error.message || "Add profile or resume evidence before scanning.";
  if (error?.status === 429) return "The scan limit was reached. Please wait and try again.";
  if (error?.status >= 500) return "Opportunity Radar is temporarily unavailable. Your previous scan is unchanged.";
  if (/network|fetch|timed out/i.test(error?.message || "")) return "Unable to reach PathForge. Check your connection and try again.";
  return error?.message || "Unable to load Opportunity Radar.";
};

const EmptyCollection = ({ children }) => <p className="py-6 text-center text-xs text-slate-500">{children}</p>;

const LoadingState = () => (
  <div className="mx-auto max-w-7xl animate-pulse space-y-6 pb-12" aria-label="Loading Opportunity Radar">
    <div className="h-24 rounded-3xl bg-slate-900/70" />
    <div className="h-48 rounded-3xl bg-slate-900/70" />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {[0, 1, 2].map((item) => <div key={item} className="h-72 rounded-3xl bg-slate-900/70" />)}
    </div>
  </div>
);

export const OpportunityRadar = () => {
  const [state, setState] = useState({ loading: true, payload: null, error: null });
  const [scanning, setScanning] = useState(false);
  const scanInFlight = useRef(false);

  const loadLatest = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await opportunityRadarService.getLatest();
      setState({ loading: false, payload: response?.data || response, error: null });
    } catch (error) {
      setState({ loading: false, payload: null, error: errorMessage(error) });
    }
  };

  useEffect(() => {
    loadLatest();
  }, []);

  const runScan = async () => {
    if (scanInFlight.current) return;
    scanInFlight.current = true;
    setScanning(true);
    const toastId = toast.loading("Re-analyzing your current profile evidence...");
    try {
      const response = await opportunityRadarService.scan(makeRequestId());
      const payload = response?.data || response;
      setState({ loading: false, payload: { ...state.payload, ...payload, canScan: true }, error: null });
      toast.success("Opportunity Radar updated", { id: toastId });
    } catch (error) {
      const message = errorMessage(error);
      setState((current) => ({ ...current, error: current.payload?.radar ? null : message }));
      toast.error(message, { id: toastId });
    } finally {
      scanInFlight.current = false;
      setScanning(false);
    }
  };

  if (state.loading) return <LoadingState />;

  if (state.error) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center text-center">
        <AlertTriangle className="h-10 w-10 text-rose-400" />
        <h1 className="mt-4 text-2xl font-bold text-slate-100">Unable to load Opportunity Radar</h1>
        <p className="mt-2 text-sm text-slate-400">{state.error}</p>
        <button type="button" onClick={loadLatest} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  const payload = state.payload || {};
  const radar = payload.radar;

  if (!radar) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
          <Compass className="h-8 w-8 text-primary-light" />
        </div>
        <h1 className="mt-5 text-3xl font-display font-black text-slate-100">
          {payload.canScan ? "Opportunity Radar is ready to scan" : "Profile evidence required"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          {payload.canScan
            ? "Run your first scan to compare current evidence against PathForge’s controlled role requirements."
            : "Complete your Career DNA or upload a parsed resume before generating role-readiness analysis."}
        </p>
        {payload.canScan ? (
          <button type="button" onClick={runScan} disabled={scanning} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            <Compass className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`} /> {scanning ? "Scanning current evidence..." : "Scan Opportunity Radar"}
          </button>
        ) : (
          <Link to="/dashboard/resumes" className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">Upload Resume</Link>
        )}
      </div>
    );
  }

  const { summary, buckets, roles, skillGaps, recommendedProjects, recommendedCertifications } = radar;
  const scan = payload.scan;

  return (
    <div className="mx-auto max-w-7xl animate-fade-in space-y-8 pb-12">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-light">
            <Sparkles className="h-3.5 w-3.5" /> Evidence-based guidance · No job description required
          </span>
          <h1 className="mt-2 text-3xl font-display font-extrabold text-slate-100">AI Opportunity Radar</h1>
          <p className="mt-1 text-slate-400">Explainable role alignment, skill priorities, and portfolio next steps from your current profile.</p>
        </div>
        <button type="button" onClick={runScan} disabled={scanning} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`} />
          {scanning ? "Re-analyzing current evidence..." : "Re-Scan Opportunity Radar"}
        </button>
      </header>

      {scan?.isStale && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-700/50 bg-amber-950/20 p-4 sm:flex-row sm:items-center">
          <p className="flex items-center gap-2 text-sm text-amber-200"><AlertTriangle className="h-4 w-4" /> Your profile changed after this scan. Re-scan to use the latest evidence.</p>
        </div>
      )}

      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 p-7 shadow-2xl md:flex-row md:items-center">
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-xl border border-emerald-800 bg-emerald-950/50 px-3 py-1 text-xs font-bold text-emerald-300">{summary.metricLabel}: {summary.overallReadiness}%</span>
            <span className="rounded-xl border border-amber-800 bg-amber-950/50 px-3 py-1 text-xs font-bold text-amber-300">Profile Evidence Confidence: {summary.evidenceConfidence.score}%</span>
            {radar.source.resumeVersion && <span className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-bold text-slate-300">Based on Resume V{radar.source.resumeVersion}</span>}
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-100">{summary.strongestDirection.summary}</h2>
          <p className="text-sm leading-relaxed text-slate-300">{summary.careerAdvice}</p>
          <p className="text-xs text-slate-500">{summary.evidenceConfidence.label}: {summary.evidenceConfidence.basis}</p>
        </div>
        <div className="shrink-0 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-center md:max-w-xs">
          <span className="block text-xs font-medium text-slate-400">Technical-gap estimate</span>
          <span className="mt-1 block text-lg font-display font-black text-amber-400">{summary.estimatedTimeline.label}</span>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{summary.estimatedTimeline.target}</p>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-600">{summary.estimatedTimeline.disclaimer}</p>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RoleBucket title="Ready Now" subtitle="Strong current alignment" icon={CheckCircle2} accent="emerald" roles={buckets.readyNow} />
        <RoleBucket title="Almost Ready" subtitle="Closeable evidence gaps" icon={Clock} accent="amber" roles={buckets.almostReady} />
        <RoleBucket title="Long-Term Goals" subtitle="Experience-dependent progression" icon={Target} accent="rose" roles={buckets.longTerm} longTerm />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-display font-bold text-slate-100"><TrendingUp className="h-5 w-5 text-primary-light" /> Role Readiness Trajectory</h2>
          <p className="text-xs text-slate-400">Every bar uses the same deterministic role-scoring engine as the readiness buckets.</p>
          <div className="space-y-4 pt-2">
            {roles.map((role) => (
              <div key={role.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs"><span className="font-semibold text-slate-200">{role.title}</span><span className="font-bold text-slate-400">{role.score}%</span></div>
                <div className="h-2 overflow-hidden rounded-full border border-slate-800 bg-slate-950"><div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400" style={{ width: `${role.score}%` }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-display font-bold text-slate-100"><Layers className="h-5 w-5 text-amber-400" /> Skill Gap Priority Matrix</h2>
          <p className="text-xs text-slate-400">Priority combines requirement importance, role rank, and cross-role frequency.</p>
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            {skillGaps.length ? skillGaps.slice(0, 10).map((gap) => <GapCard key={gap.skill} gap={gap} />) : <EmptyCollection>No missing requirements were detected in the analyzed role set.</EmptyCollection>}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-display font-bold text-slate-100"><FolderPlus className="h-5 w-5 text-emerald-400" /> Recommended Portfolio Projects</h2>
          <p className="text-xs text-slate-400">Controlled project templates selected only when they address a detected gap.</p>
          <div className="space-y-3 pt-2">
            {recommendedProjects.length ? recommendedProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />) : <EmptyCollection>No additional project template is currently needed.</EmptyCollection>}
          </div>
        </section>
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-display font-bold text-slate-100"><Award className="h-5 w-5 text-amber-400" /> Recommended Certifications</h2>
          <p className="text-xs text-slate-400">Optional, curated credentials tied to identified gaps—not hiring requirements.</p>
          <div className="space-y-3 pt-2">
            {recommendedCertifications.length ? recommendedCertifications.map((certification) => <CertificationCard key={certification.id} certification={certification} />) : <EmptyCollection>No relevant credential from the curated catalog is recommended.</EmptyCollection>}
          </div>
        </section>
      </div>

      <p className="text-center text-[11px] text-slate-600">
        Last scanned {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(scan.generatedAt))}. AI wording status: {radar.aiEnhancement.status}; numeric scores are always deterministic.
      </p>
    </div>
  );
};

const RoleBucket = ({ title, subtitle, icon: Icon, accent, roles, longTerm = false }) => {
  const colors = {
    emerald: "text-emerald-400 border-emerald-900/40 bg-emerald-950/20",
    amber: "text-amber-400 border-amber-900/40 bg-amber-950/20",
    rose: "text-rose-400 border-rose-900/40 bg-rose-950/20",
  };
  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3"><h2 className="flex items-center gap-2 text-base font-display font-bold text-slate-100"><Icon className={`h-5 w-5 ${colors[accent].split(" ")[0]}`} /> {title}</h2><span className="text-[10px] font-bold uppercase text-slate-500">{subtitle}</span></div>
      <div className="space-y-3">
        {roles.length ? roles.map((role) => (
          <div key={role.id} className={`space-y-2 rounded-2xl border p-4 ${colors[accent]}`}>
            <div className="flex items-center justify-between gap-3"><span className="text-xs font-bold text-slate-100">{role.title}</span><span className="text-xs font-bold">{role.score}%</span></div>
            {longTerm ? <p className="text-[11px] leading-relaxed text-slate-400">Requires {role.experience.requiredYears}+ years of experience evidence; currently {role.experience.evidencedYears} years evidenced.</p> : role.missingSkills.length > 0 && <div className="flex flex-wrap gap-1">{role.missingSkills.slice(0, 4).map((skill) => <span key={skill} className="rounded-lg border border-slate-700 bg-slate-950/50 px-2 py-0.5 text-[10px] text-slate-300">{skill}</span>)}</div>}
          </div>
        )) : <EmptyCollection>No roles currently fall in this group.</EmptyCollection>}
      </div>
    </section>
  );
};

const GapCard = ({ gap }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
    <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-slate-200">{gap.skill}</span><span className={`rounded-lg border px-2 py-0.5 text-[10px] font-extrabold uppercase ${gap.priority === "high" ? "border-rose-800 bg-rose-950 text-rose-300" : gap.priority === "medium" ? "border-amber-800 bg-amber-950 text-amber-300" : "border-slate-700 bg-slate-900 text-slate-400"}`}>{gap.priority}</span></div>
    <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{gap.impact}</p>
  </div>
);

const ProjectCard = ({ project, index }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">{index + 1}</span>
    <div><p className="text-xs font-bold text-slate-200">{project.title}</p><p className="mt-1 text-[11px] text-slate-400">{project.whyRecommended}</p><p className="mt-2 text-[10px] font-semibold text-emerald-400">{project.difficulty} · {project.targetSkills.join(" · ")}</p></div>
  </div>
);

const CertificationCard = ({ certification }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
    <Award className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
    <div><p className="text-xs font-bold text-slate-200">{certification.name}</p><p className="mt-1 text-[11px] leading-relaxed text-slate-400">{certification.whyRecommended}</p></div>
  </div>
);

export default OpportunityRadar;
