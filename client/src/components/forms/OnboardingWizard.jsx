import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { saveCareerDNA, getCareerDNA } from "../../services/career.service.js";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  GraduationCap,
  Code,
  Layers,
  Briefcase,
  Target,
  Building,
  DollarSign,
  Clock,
  Heart,
  AlertCircle,
  Check,
  X,
  Loader2,
  Edit3,
} from "lucide-react";

const OPTIONS = {
  degrees: ["B.Tech / B.E.", "M.Tech / M.E.", "BCA / MCA", "B.Sc / M.Sc CS", "Other Degree"],
  branches: ["Computer Science & Engineering", "Information Technology", "AI & Data Science", "Electronics & Comm", "Other Branch"],
  currentYears: ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduated"],
  programmingLanguages: ["C", "C++", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "Other"],
  frameworks: ["React", "Next.js", "Node.js", "Express", "MongoDB", "SQL", "Docker", "Redis", "AWS", "Firebase", "Git", "GitHub", "Linux"],
  experienceTypes: ["Fresher", "Internship", "Freelancing", "Open Source", "Personal Projects", "Hackathons"],
  experienceYears: ["0 Years (Fresher)", "1 Year", "2 Years", "3+ Years"],
  careerGoals: [
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "Machine Learning Engineer",
    "AI Engineer",
    "Software Engineer (SDE)",
    "DevOps Engineer",
    "Data Scientist",
    "Cyber Security",
    "Other",
  ],
  dreamCompanies: ["Google", "Amazon", "Microsoft", "Adobe", "Uber", "Atlassian", "Netflix", "Apple", "Meta", "NVIDIA", "Startup"],
  salaryBands: [
    { label: "5–8 LPA", min: 5, max: 8 },
    { label: "8–12 LPA", min: 8, max: 12 },
    { label: "12–20 LPA", min: 12, max: 20 },
    { label: "20+ LPA", min: 20, max: 40 },
  ],
  learningSpeeds: ["Slow", "Medium", "Fast"],
  learningStyles: ["Videos", "Documentation", "Projects", "Practice"],
  careerChallenges: ["DSA", "Development", "System Design", "Communication", "Resume", "Interviews", "Confidence", "Finding Internships"],
};

export const OnboardingWizard = ({ isOpen, onClose, onComplete, initialData, isMandatory = false }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    bio: "",
    educationDetails: {
      degree: "B.Tech / B.E.",
      branch: "Computer Science & Engineering",
      collegeName: "",
      currentYear: "3rd Year",
      graduationYear: "2026",
    },
    programmingLanguages: ["JavaScript", "Python"],
    frameworks: ["React", "Node.js", "Express", "MongoDB", "Git", "GitHub"],
    experienceDetails: {
      types: ["Personal Projects"],
      years: "0 Years (Fresher)",
    },
    targetRoles: ["Full Stack Developer"],
    preferredCompanies: ["Google", "Amazon", "Microsoft"],
    targetSalary: {
      min: 8,
      max: 12,
      currency: "INR",
      bandLabel: "8–12 LPA",
    },
    learningPreferences: {
      hoursPerDay: 3,
      learningSpeed: "Medium",
      learningStyle: "Projects",
    },
    softSkillRatings: {
      communication: 4,
      leadership: 3,
      problemSolving: 4,
      teamwork: 4,
      confidence: 3,
      timeManagement: 4,
    },
    careerChallenges: ["DSA", "System Design"],
    additionalNotes: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    } else if (isOpen) {
      setIsLoading(true);
      getCareerDNA()
        .then((res) => {
          if (res.data?.careerDNA) {
            setFormData((prev) => ({ ...prev, ...res.data.careerDNA }));
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const toggleArrayItem = (field, item) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter((i) => i !== item) };
      } else {
        return { ...prev, [field]: [...current, item] };
      }
    });
  };

  const toggleNestedArrayItem = (parentField, childField, item) => {
    setFormData((prev) => {
      const parent = prev[parentField] || {};
      const current = parent[childField] || [];
      const updated = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      return { ...prev, [parentField]: { ...parent, [childField]: updated } };
    });
  };

  const handleNext = () => {
    if (step < 12) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await saveCareerDNA({
        ...formData,
        professionalStatus: formData.experienceDetails?.types?.join(", ") || "Student",
        education: `${formData.educationDetails?.degree} - ${formData.educationDetails?.branch}`,
        projectsExperience: `Experience Types: ${formData.experienceDetails?.types?.join(", ") || "None"}`,
      });

      toast.success("🎉 Career DNA Created Successfully!");
      if (onComplete) onComplete(res.data?.careerDNA || formData);
      if (onClose) onClose();
    } catch (error) {
      console.error("Save Career DNA error:", error);
      toast.error(error.message || "Failed to save Career DNA.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Top Progress Bar & Header */}
        <div className="border-b border-slate-800 bg-slate-950/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-lg font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-display font-extrabold text-slate-100">
                  Career DNA Wizard
                </h2>
                <p className="text-xs text-slate-400">
                  Step {step} of 12 • Personalizing PathForge AI Engine
                </p>
              </div>
            </div>

            {!isMandatory && onClose && (
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary via-accent to-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 12) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Form Step Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* STEP 1: Welcome */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center space-y-6 py-6"
                >
                  <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center mx-auto text-primary-light">
                    <Sparkles className="w-10 h-10" />
                  </div>

                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-2xl font-display font-bold text-slate-100">
                      Welcome to PathForge AI 👋
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      We'll ask a few quick questions to personalize your AI career assistant, mentor, ATS auditor, and roadmap builder.
                    </p>
                  </div>

                  <button
                    onClick={handleNext}
                    className="px-8 py-3.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20"
                  >
                    Start Career DNA Setup
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Education */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 text-primary-light font-semibold text-xs uppercase tracking-wider">
                    <GraduationCap className="w-4 h-4" /> Step 2 • Education
                  </div>

                  <h3 className="text-xl font-display font-bold text-slate-100">
                    What is your educational background?
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Current Degree
                      </label>
                      <select
                        value={formData.educationDetails.degree}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            educationDetails: { ...formData.educationDetails, degree: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:border-primary"
                      >
                        {OPTIONS.degrees.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Branch / Specialization
                      </label>
                      <select
                        value={formData.educationDetails.branch}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            educationDetails: { ...formData.educationDetails, branch: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:border-primary"
                      >
                        {OPTIONS.branches.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        College / University Name
                      </label>
                      <input
                        type="text"
                        value={formData.educationDetails.collegeName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            educationDetails: { ...formData.educationDetails, collegeName: e.target.value },
                          })
                        }
                        placeholder="e.g. Indian Institute of Technology"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Current Year of Study
                      </label>
                      <select
                        value={formData.educationDetails.currentYear}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            educationDetails: { ...formData.educationDetails, currentYear: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:border-primary"
                      >
                        {OPTIONS.currentYears.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Programming Languages */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                    <Code className="w-4 h-4" /> Step 3 • Programming Languages
                  </div>

                  <h3 className="text-xl font-display font-bold text-slate-100">
                    Which programming languages do you know?
                  </h3>

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {OPTIONS.programmingLanguages.map((lang) => {
                      const selected = formData.programmingLanguages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleArrayItem("programmingLanguages", lang)}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                            selected
                              ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Frameworks & Tech */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                    <Layers className="w-4 h-4" /> Step 4 • Frameworks & Technologies
                  </div>

                  <h3 className="text-xl font-display font-bold text-slate-100">
                    Select the frameworks and tools you work with:
                  </h3>

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {OPTIONS.frameworks.map((fw) => {
                      const selected = formData.frameworks.includes(fw);
                      return (
                        <button
                          key={fw}
                          type="button"
                          onClick={() => toggleArrayItem("frameworks", fw)}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                            selected
                              ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20"
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {fw}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 5: Experience */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                    <Briefcase className="w-4 h-4" /> Step 5 • Experience
                  </div>

                  <h3 className="text-xl font-display font-bold text-slate-100">
                    What is your practical experience?
                  </h3>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Experience Types (Multi-select)
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {OPTIONS.experienceTypes.map((type) => {
                          const selected = formData.experienceDetails?.types?.includes(type);
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => toggleNestedArrayItem("experienceDetails", "types", type)}
                              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                selected
                                  ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold"
                                  : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                              }`}
                            >
                              {selected ? "✓ " : "+ "}
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Years of Experience
                      </label>
                      <select
                        value={formData.experienceDetails.years}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            experienceDetails: { ...formData.experienceDetails, years: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:border-primary"
                      >
                        {OPTIONS.experienceYears.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: Career Goal */}
              {step === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
                    <Target className="w-4 h-4" /> Step 6 • Career Goal
                  </div>

                  <h3 className="text-xl font-display font-bold text-slate-100">
                    What is your target career role?
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {OPTIONS.careerGoals.map((role) => {
                      const selected = formData.targetRoles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setFormData({ ...formData, targetRoles: [role] })}
                          className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all ${
                            selected
                              ? "bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/40"
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <span className="block text-sm text-slate-100">{role}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 7: Dream Companies */}
              {step === 7 && (
                <motion.div
                  key="step7"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
                    <Building className="w-4 h-4" /> Step 7 • Dream Companies
                  </div>

                  <h3 className="text-xl font-display font-bold text-slate-100">
                    Which target companies are you aiming for?
                  </h3>

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {OPTIONS.dreamCompanies.map((company) => {
                      const selected = formData.preferredCompanies.includes(company);
                      return (
                        <button
                          key={company}
                          type="button"
                          onClick={() => toggleArrayItem("preferredCompanies", company)}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                            selected
                              ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20"
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {company}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 8: Target Salary */}
              {step === 8 && (
                <motion.div
                  key="step8"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                    <DollarSign className="w-4 h-4" /> Step 8 • Target Salary Band
                  </div>

                  <h3 className="text-xl font-display font-bold text-slate-100">
                    What is your target salary expectation?
                  </h3>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {OPTIONS.salaryBands.map((band) => {
                      const selected = formData.targetSalary?.bandLabel === band.label;
                      return (
                        <button
                          key={band.label}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              targetSalary: { min: band.min, max: band.max, currency: "INR", bandLabel: band.label },
                            })
                          }
                          className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all ${
                            selected
                              ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {band.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 9: Learning Preferences */}
              {step === 9 && (
                <motion.div
                  key="step9"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                    <Clock className="w-4 h-4" /> Step 9 • Learning Preferences
                  </div>

                  <h3 className="text-xl font-display font-bold text-slate-100">
                    How do you prefer to learn and build?
                  </h3>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Hours Available Per Day: <span className="text-primary-light font-bold">{formData.learningPreferences.hoursPerDay} Hours</span>
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={formData.learningPreferences.hoursPerDay}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            learningPreferences: { ...formData.learningPreferences, hoursPerDay: Number(e.target.value) },
                          })
                        }
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Learning Speed
                        </label>
                        <select
                          value={formData.learningPreferences.learningSpeed}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              learningPreferences: { ...formData.learningPreferences, learningSpeed: e.target.value },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-3"
                        >
                          {OPTIONS.learningSpeeds.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Preferred Learning Style
                        </label>
                        <select
                          value={formData.learningPreferences.learningStyle}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              learningPreferences: { ...formData.learningPreferences, learningStyle: e.target.value },
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-3"
                        >
                          {OPTIONS.learningStyles.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 10: Soft Skills */}
              {step === 10 && (
                <motion.div
                  key="step10"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
                    <Heart className="w-4 h-4" /> Step 10 • Soft Skills Rating
                  </div>

                  <h3 className="text-xl font-display font-bold text-slate-100">
                    Rate your key soft skills (1 to 5):
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {["communication", "leadership", "problemSolving", "teamwork", "confidence", "timeManagement"].map((skillKey) => (
                      <div key={skillKey} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-200 capitalize">
                          <span>{skillKey.replace(/([A-Z])/g, " $1")}</span>
                          <span className="text-amber-400 font-bold">{formData.softSkillRatings?.[skillKey] || 4}/5</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          value={formData.softSkillRatings?.[skillKey] || 4}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              softSkillRatings: { ...formData.softSkillRatings, [skillKey]: Number(e.target.value) },
                            })
                          }
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 11: Career Challenges */}
              {step === 11 && (
                <motion.div
                  key="step11"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" /> Step 11 • Career Challenges
                  </div>

                  <h3 className="text-xl font-display font-bold text-slate-100">
                    Which areas would you like AI to help you improve?
                  </h3>

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {OPTIONS.careerChallenges.map((ch) => {
                      const selected = formData.careerChallenges.includes(ch);
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => toggleArrayItem("careerChallenges", ch)}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                            selected
                              ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/20"
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {ch}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 12: Review & Submit */}
              {step === 12 && (
                <motion.div
                  key="step12"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Step 12 • Final Review
                  </div>

                  <h3 className="text-xl font-display font-bold text-slate-100">
                    Review your Career DNA Profile
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-slate-500 block">Education</span>
                      <p className="font-bold text-slate-200">{formData.educationDetails?.degree} ({formData.educationDetails?.branch})</p>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-slate-500 block">Target Role</span>
                      <p className="font-bold text-cyan-300">{formData.targetRoles?.join(", ") || "Software Engineer"}</p>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-slate-500 block">Languages & Tech</span>
                      <p className="font-bold text-slate-200 truncate">{[...formData.programmingLanguages, ...formData.frameworks].join(", ")}</p>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-slate-500 block">Target Salary</span>
                      <p className="font-bold text-emerald-300">₹{formData.targetSalary?.min}–{formData.targetSalary?.max} LPA</p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-center">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-primary hover:opacity-90 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      Create My Career DNA
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="border-t border-slate-800 bg-slate-950/60 p-4 px-6 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 12 && step > 1 && (
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all shadow-md shadow-primary/20"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
