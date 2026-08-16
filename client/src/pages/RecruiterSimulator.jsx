import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ArrowRight,
  FileText,
  History,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  UserCheck,
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import CompanySelector from "../components/recruiter/CompanySelector";
import RecruiterResult from "../components/recruiter/RecruiterResult";
import TARGET_COMPANIES from "../constants/companies";
import { recruiterService } from "../services/recruiter.service";
import { getUserResumes } from "../services/resume.service";

const COMPANY_STORAGE_KEY = "pathforge.recruiter.company";
const EVALUATION_MESSAGES = [
  "Reading resume evidence...",
  "Applying the selected company rubric...",
  "Scoring technical and impact signals...",
  "Building recruiter feedback...",
];

const getInitialCompany = () => {
  try {
    const savedId = window.localStorage.getItem(COMPANY_STORAGE_KEY);
    return TARGET_COMPANIES.find((company) => company.id === savedId) || TARGET_COMPANIES[0];
  } catch {
    return TARGET_COMPANIES[0];
  }
};

const extractMessage = (error, fallback) => {
  if (error?.status === 401) return "Your session has expired. Please sign in again.";
  if (error?.status === 400) return "This company simulation is not available or the request is invalid.";
  if (error?.status === 404) return "Upload a resume before running the recruiter simulation.";
  if (error?.status === 429) return "AI analysis limit reached. Try again shortly.";
  if (error?.status === 502) return "The recruiter simulation returned an invalid response. Please try again.";
  if (error?.status === 503) return "The recruiter simulation service is temporarily unavailable. Please try again.";
  if (error?.status === 500) return "Recruiter analysis could not be generated. Please try again.";
  if (error instanceof TypeError) return "Unable to reach the server. Check your connection and try again.";
  return error?.body?.message || error?.message || fallback;
};
const getResumeLabel = (resume) => {
  if (!resume) return "Unknown resume";
  return `${resume.fileName || "Resume"}${resume.createdAt ? ` - ${new Date(resume.createdAt).toLocaleDateString()}` : ""}`;
};

export const RecruiterSimulator = () => {
  const initialCompany = getInitialCompany();
  const simulationRequestRef = useRef(false);
  const requestSequenceRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationStep, setEvaluationStep] = useState(0);
  const [simulationError, setSimulationError] = useState("");
  const [currentResume, setCurrentResume] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompany?.id || "");
  const [targetRole, setTargetRole] = useState(initialCompany?.role || "Software Engineer");
  const [simulation, setSimulation] = useState(null);
  const [history, setHistory] = useState([]);

  const selectedCompany = TARGET_COMPANIES.find((company) => company.id === selectedCompanyId) || null;

  async function fetchInitialData() {
    setLoading(true);
    setLoadError("");
    const [resumesResult, historyResult] = await Promise.allSettled([
      getUserResumes(),
      recruiterService.getRecruiterSimulations(),
    ]);

    if (resumesResult.status === "fulfilled") {
      const userResumes = resumesResult.value?.data?.resumes || [];
      setCurrentResume(Array.isArray(userResumes) ? userResumes[0] || null : null);
    } else {
      setLoadError(extractMessage(resumesResult.reason, "Unable to load your resumes. Please try again."));
    }

    if (historyResult.status === "fulfilled") {
      const records = Array.isArray(historyResult.value) ? historyResult.value : [];
      setHistory(records);
      setSimulation((current) => current || records[0] || null);
    } else if (resumesResult.status === "fulfilled") {
      setLoadError(extractMessage(historyResult.reason, "Unable to load simulation history. You can still run a new simulation."));
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchInitialData();
    return () => {
      requestSequenceRef.current += 1;
      simulationRequestRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!evaluating) {
      setEvaluationStep(0);
      return undefined;
    }
    const interval = window.setInterval(() => {
      setEvaluationStep((current) => (current + 1) % EVALUATION_MESSAGES.length);
    }, 2400);
    return () => window.clearInterval(interval);
  }, [evaluating]);

  const handleSelectCompany = (company) => {
    setSelectedCompanyId(company.id);
    setTargetRole(company.role);
    setSimulation(null);
    setSimulationError("");
    try {
      window.localStorage.setItem(COMPANY_STORAGE_KEY, company.id);
    } catch {
      // Selection persistence is optional when storage is unavailable.
    }
  };

  const handleRunSimulation = async () => {
    if (simulationRequestRef.current) return;
    if (!selectedCompany) {
      setSimulationError("Select a company before running the simulation.");
      return;
    }
    if (!currentResume) {
      setSimulationError("Upload a resume before running the recruiter simulation.");
      return;
    }

    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    simulationRequestRef.current = true;
    setEvaluating(true);
    setSimulationError("");
    try {
      const result = await recruiterService.simulateRecruiter({
        company: selectedCompany.id,
        targetRole: targetRole.trim(),
      });
      if (requestId !== requestSequenceRef.current) return;
      if (!result?._id) throw new Error("The recruiter simulation returned an invalid response. Please try again.");
      setSimulation(result);
      setHistory((current) => [result, ...current.filter((item) => item._id !== result._id)]);
      toast.success(`${selectedCompany.name} recruiter simulation completed.`);
    } catch (error) {
      if (requestId !== requestSequenceRef.current) return;
      setSimulationError(extractMessage(error, "The recruiter simulation could not be completed. Please try again."));
    } finally {
      if (requestId === requestSequenceRef.current) {
        simulationRequestRef.current = false;
        setEvaluating(false);
      }
    }
  };

  const handleDeleteSimulation = async (id) => {
    try {
      await recruiterService.deleteRecruiterSimulation(id);
      setHistory((current) => {
        const next = current.filter((item) => item._id !== id);
        setSimulation((active) => active?._id === id ? next[0] || null : active);
        return next;
      });
      toast.success("Simulation removed.");
    } catch (error) {
      toast.error(extractMessage(error, "Unable to remove the simulation."));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <LoadingSpinner />
        <p className="text-sm text-slate-400">Loading AI Recruiter Simulator...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12 animate-fade-in">
      <header className="border-b border-slate-800 pb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
          <Sparkles className="h-3.5 w-3.5" /> Evidence-based hiring simulation
        </span>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-100">AI Recruiter Simulator</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
          See what a recruiter applying a selected company&apos;s simulated priorities may notice in your current resume, where the evidence is strong, and what to improve before an interview.
        </p>
      </header>

      {loadError && (
        <div className="flex flex-col gap-4 rounded-2xl border border-rose-900/60 bg-rose-950/30 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <p className="flex items-center gap-2 text-sm text-rose-300"><AlertCircle className="h-4 w-4" /> {loadError}</p>
          <button type="button" onClick={fetchInitialData} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-800 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-900/40">
            <RefreshCw className="h-4 w-4" /> Retry loading
          </button>
        </div>
      )}

      <CompanySelector
        companies={TARGET_COMPANIES}
        selectedCompanyId={selectedCompanyId}
        onSelect={handleSelectCompany}
        disabled={evaluating}
      />

      {!currentResume ? (
        <section className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center sm:p-12">
          <FileText className="mx-auto h-12 w-12 text-slate-600" />
          <h2 className="mt-4 font-display text-xl font-bold text-slate-100">No resume found</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-400">
            Upload or analyze your resume first to use the AI Recruiter Simulator.
          </p>
          <Link to="/dashboard/resumes" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:opacity-90">
            Go to Resume Manager <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="grid grid-cols-1 items-end gap-5 lg:grid-cols-[1fr_1fr_auto]">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Target role</span>
              <input
                type="text"
                value={targetRole}
                onChange={(event) => {
                  setTargetRole(event.target.value);
                  setSimulation(null);
                  setSimulationError("");
                }}
                maxLength={120}
                disabled={evaluating}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-primary disabled:opacity-60"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Current resume</span>
              <span className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                {getResumeLabel(currentResume)}
              </span>
            </label>

            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={evaluating || !selectedCompany || !currentResume || targetRole.trim().length < 2}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-accent px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {evaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
              {evaluating ? "Analyzing resume..." : `Run ${selectedCompany?.name || "Recruiter"} Simulation`}
            </button>
          </div>
          {currentResume && (
            <p className="mt-4 text-xs text-slate-500">
              The backend securely selects this latest resume for the authenticated user; resume text is never sent by the browser.
            </p>
          )}
        </section>
      )}

      <AnimatePresence mode="wait">
        {evaluating && (
          <motion.div
            key="evaluating"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-primary/30 bg-primary/10 p-5"
            role="status"
          >
            <p className="flex items-center gap-3 text-sm font-semibold text-primary-light">
              <Loader2 className="h-5 w-5 animate-spin" />
              {evaluationStep === 0
                ? `Analyzing your resume through ${selectedCompany?.name || "the selected company"}'s recruiter simulation...`
                : EVALUATION_MESSAGES[evaluationStep]}
            </p>
            <p className="mt-1 pl-8 text-xs text-slate-400">This may take up to a minute. Duplicate submissions are disabled.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {simulationError && (
        <div className="flex flex-col gap-4 rounded-2xl border border-rose-900/60 bg-rose-950/30 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <p className="flex items-start gap-2 text-sm text-rose-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {simulationError}</p>
          {currentResume && (
            <button type="button" onClick={handleRunSimulation} disabled={evaluating} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-800 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-900/40 disabled:opacity-50">
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          )}
        </div>
      )}

      {simulation && <RecruiterResult simulation={simulation} />}

      {history.length > 0 && (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md sm:p-8" aria-labelledby="simulation-history-title">
          <h2 id="simulation-history-title" className="flex items-center gap-2 font-display text-xl font-bold text-slate-100">
            <History className="h-5 w-5 text-primary-light" /> Simulation history
          </h2>
          <div className="mt-4 space-y-3">
            {history.map((record) => (
              <div key={record._id} className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${simulation?._id === record._id ? "border-primary/60 bg-primary/5" : "border-slate-800 bg-slate-950/50"}`}>
                <button type="button" onClick={() => setSimulation(record)} className="min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light">
                  <span className="block truncate text-sm font-bold text-slate-100">{record.company?.name || "Company"} - {record.targetRole}</span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {record.overallScore}/100 - {record.decision} - {new Date(record.createdAt).toLocaleDateString()}
                  </span>
                </button>
                <button type="button" onClick={() => handleDeleteSimulation(record._id)} aria-label={`Delete ${record.company?.name || "company"} simulation`} className="self-start rounded-lg p-2 text-slate-500 transition hover:bg-rose-950 hover:text-rose-400 sm:self-auto">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default RecruiterSimulator;
