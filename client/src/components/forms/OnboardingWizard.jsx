import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { saveCareerDNA, getCareerDNA } from "../../services/career.service.js";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Code,
  Layers,
  Wrench,
  Heart,
  Target,
  DollarSign,
  Building,
  Award,
  Loader2,
  X,
} from "lucide-react";

const OPTIONS = {
  professionalStatus: [
    "Student",
    "Recent Graduate",
    "Intern",
    "Working Professional",
    "Freelancer",
    "Entrepreneur",
  ],
  education: [
    "Computer Science / IT",
    "Engineering Other Branch",
    "Science",
    "Business",
    "Design",
    "Other",
  ],
  programmingLanguages: ["Python", "JavaScript", "Java", "C++", "C", "Go", "SQL", "Other"],
  frameworks: [
    "React",
    "Next.js",
    "Node.js",
    "Express.js",
    "Django",
    "Spring Boot",
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
  ],
  databases: [
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "Firebase",
    "Vector Databases",
    "Other",
  ],
  technicalProficiency: ["Beginner", "Intermediate", "Advanced", "Expert"],
  tools: [
    "Git/GitHub",
    "VS Code",
    "Docker",
    "Postman",
    "AWS",
    "Azure",
    "Linux",
    "Figma",
    "Jira",
  ],
  softSkills: [
    "Communication",
    "Leadership",
    "Problem Solving",
    "Team Collaboration",
    "Creativity",
    "Adaptability",
    "Time Management",
  ],
  targetRoles: [
    "Software Engineer (SDE)",
    "AI/ML Engineer",
    "Data Scientist",
    "Full Stack Developer",
    "Backend Engineer",
    "Frontend Engineer",
    "Research Engineer",
    "Product Engineer",
  ],
  opportunityType: [
    "Internship",
    "Full-Time Job",
    "Freelancing",
    "Startup Opportunity",
    "Research Opportunity",
  ],
  learningGoals: [
    "Data Structures & Algorithms",
    "System Design",
    "Machine Learning",
    "Deep Learning",
    "Generative AI",
    "Cloud Computing",
    "DevOps",
    "Backend Development",
    "Frontend Development",
  ],
  preferredCompanies: [
    "Big Tech",
    "Startups",
    "Product Companies",
    "AI Research Labs",
    "Remote Work",
    "MNCs",
  ],
};

export const OnboardingWizard = ({ isOpen, onClose, onComplete, initialData }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    bio: "",
    professionalStatus: "Student",
    education: "Computer Science / IT",
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    technicalProficiency: "Intermediate",
    projectsExperience: "",
    skillsDescription: "",
    tools: [],
    softSkills: [],
    targetRoles: [],
    opportunityType: "Full-Time Job",
    careerObjectives: "",
    learningGoals: [],
    targetSalary: {
      min: 5,
      max: 30,
      currency: "INR",
    },
    preferredCompanies: [],
    additionalNotes: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        targetSalary: {
          min: initialData.targetSalary?.min ?? 5,
          max: initialData.targetSalary?.max ?? 30,
          currency: initialData.targetSalary?.currency || "INR",
        },
      }));
    } else if (isOpen) {
      setIsLoading(true);
      getCareerDNA()
        .then((res) => {
          if (res.data?.careerDNA) {
            const data = res.data.careerDNA;
            setFormData((prev) => ({
              ...prev,
              ...data,
              targetSalary: {
                min: data.targetSalary?.min ?? 5,
                max: data.targetSalary?.max ?? 30,
                currency: data.targetSalary?.currency || "INR",
              },
            }));
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const toggleArrayItem = (field, item) => {
    setFormData((prev) => {
      const currentArr = prev[field] || [];
      if (currentArr.includes(item)) {
        return { ...prev, [field]: currentArr.filter((i) => i !== item) };
      } else {
        return { ...prev, [field]: [...currentArr, item] };
      }
    });
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await saveCareerDNA(formData);
      toast.success("Career DNA Profile saved successfully!");
      if (onComplete) onComplete(res.data?.careerDNA || formData);
      if (onClose) onClose();
    } catch (error) {
      const msg = error.body?.message || error.message || "Failed to save profile.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent text-slate-100 shadow-lg font-bold">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-slate-100">
                Career DNA Profile Wizard
              </h2>
              <p className="text-xs text-slate-400">
                Step {step} of 4 • Customize your AI mentoring experience
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Step Progress Bar */}
        <div className="bg-slate-950/60 px-6 py-3 border-b border-slate-800/80">
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 1, title: "Goals & Background" },
              { id: 2, idTitle: "Step 2", title: "Experience & Salary" },
              { id: 3, idTitle: "Step 3", title: "Skills & Tools" },
              { id: 4, idTitle: "Step 4", title: "Review & Submit" },
            ].map((s) => (
              <div key={s.id} className="flex flex-col space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step >= s.id ? "bg-gradient-to-r from-primary to-accent" : "bg-slate-800"
                  }`}
                />
                <span
                  className={`text-[11px] font-medium truncate ${
                    step === s.id
                      ? "text-primary-light"
                      : step > s.id
                      ? "text-slate-300"
                      : "text-slate-500"
                  }`}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="animate-spin text-primary-light" size={36} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 max-h-[70vh] overflow-y-auto space-y-6">
            {/* ==================== STEP 1 ==================== */}
            {step === 1 && (
              <div className="space-y-6 animate-scale-in">
                {/* Q1: Bio */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1">
                    Q1. Tell us about yourself and your current career journey.
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Example: I am a Computer Science student interested in AI, full-stack development, and software engineering."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-light text-sm"
                  />
                </div>

                {/* Q2 & Q3: Status & Education */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Q2. Current Professional Status
                    </label>
                    <select
                      value={formData.professionalStatus}
                      onChange={(e) => setFormData({ ...formData, professionalStatus: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-light text-sm"
                    >
                      {OPTIONS.professionalStatus.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-slate-200">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Q3. Educational Background
                    </label>
                    <select
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-light text-sm"
                    >
                      {OPTIONS.education.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-slate-200">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Q12: Target Roles */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Q12. What career path are you targeting? (Multi-select)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {OPTIONS.targetRoles.map((role) => {
                      const selected = formData.targetRoles.includes(role);
                      return (
                        <button
                          type="button"
                          key={role}
                          onClick={() => toggleArrayItem("targetRoles", role)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                            selected
                              ? "bg-primary/20 border-primary-light text-primary-light font-semibold shadow"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Q13: Opportunity Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Q13. What type of opportunity are you currently seeking?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {OPTIONS.opportunityType.map((type) => {
                      const selected = formData.opportunityType === type;
                      return (
                        <button
                          type="button"
                          key={type}
                          onClick={() => setFormData({ ...formData, opportunityType: type })}
                          className={`rounded-xl p-3 text-xs text-left font-medium border transition-all ${
                            selected
                              ? "bg-primary/20 border-primary-light text-primary-light font-semibold shadow-md"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Q14: 12 Month Goals */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1">
                    Q14. What are your career goals for the next 12 months?
                  </label>
                  <textarea
                    rows={2}
                    value={formData.careerObjectives}
                    onChange={(e) => setFormData({ ...formData, careerObjectives: e.target.value })}
                    placeholder="Example: Get an AI internship, improve DSA skills, build production-level projects."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-light text-sm"
                  />
                </div>
              </div>
            )}

            {/* ==================== STEP 2 ==================== */}
            {step === 2 && (
              <div className="space-y-6 animate-scale-in">
                {/* Q7: Technical Proficiency */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Q7. Rate your overall technical proficiency.
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {OPTIONS.technicalProficiency.map((level) => {
                      const selected = formData.technicalProficiency === level;
                      return (
                        <button
                          type="button"
                          key={level}
                          onClick={() => setFormData({ ...formData, technicalProficiency: level })}
                          className={`rounded-xl p-3 text-center text-xs font-semibold border transition-all ${
                            selected
                              ? "bg-primary/20 border-primary-light text-primary-light shadow-md"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Q8: Projects & Experience */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1">
                    Q8. What projects or practical experience have you completed?
                  </label>
                  <textarea
                    rows={3}
                    value={formData.projectsExperience}
                    onChange={(e) => setFormData({ ...formData, projectsExperience: e.target.value })}
                    placeholder="Describe your projects, internships, hackathons, research, or real-world experience."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-light text-sm"
                  />
                </div>

                {/* Q9: Strongest Skills Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1">
                    Q9. Describe your strongest technical skills.
                  </label>
                  <textarea
                    rows={2}
                    value={formData.skillsDescription}
                    onChange={(e) => setFormData({ ...formData, skillsDescription: e.target.value })}
                    placeholder="Example: Strong in backend development, APIs, databases, and machine learning."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-light text-sm"
                  />
                </div>

                {/* Q16: Salary Expectation Slider / Fields */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                  <label className="block text-sm font-semibold text-slate-200">
                    Q16. What salary range are you targeting?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Minimum (LPA / $k)</span>
                      <input
                        type="number"
                        value={formData.targetSalary.min}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            targetSalary: { ...formData.targetSalary, min: Number(e.target.value) },
                          })
                        }
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Maximum (LPA / $k)</span>
                      <input
                        type="number"
                        value={formData.targetSalary.max}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            targetSalary: { ...formData.targetSalary, max: Number(e.target.value) },
                          })
                        }
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Currency</span>
                      <select
                        value={formData.targetSalary.currency}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            targetSalary: { ...formData.targetSalary, currency: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                      >
                        <option value="INR">INR (₹ LPA)</option>
                        <option value="USD">USD ($k)</option>
                        <option value="EUR">EUR (€k)</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-primary-light font-medium">
                    Target: {formData.targetSalary.currency === "INR" ? "₹" : "$"}
                    {formData.targetSalary.min} LPA - {formData.targetSalary.currency === "INR" ? "₹" : "$"}
                    {formData.targetSalary.max} LPA
                  </p>
                </div>

                {/* Q17: Preferred Work Environments */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Q17. What type of companies or work environment do you prefer?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {OPTIONS.preferredCompanies.map((comp) => {
                      const selected = formData.preferredCompanies.includes(comp);
                      return (
                        <button
                          type="button"
                          key={comp}
                          onClick={() => toggleArrayItem("preferredCompanies", comp)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                            selected
                              ? "bg-accent/20 border-accent-light text-accent-light font-semibold shadow"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {comp}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== STEP 3 ==================== */}
            {step === 3 && (
              <div className="space-y-6 animate-scale-in">
                {/* Q4: Programming Languages */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Q4. Programming Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {OPTIONS.programmingLanguages.map((lang) => {
                      const selected = formData.programmingLanguages.includes(lang);
                      return (
                        <button
                          type="button"
                          key={lang}
                          onClick={() => toggleArrayItem("programmingLanguages", lang)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                            selected
                              ? "bg-primary/20 border-primary-light text-primary-light font-semibold shadow"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Q5: Frameworks */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Q5. Frameworks & Libraries
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {OPTIONS.frameworks.map((fw) => {
                      const selected = formData.frameworks.includes(fw);
                      return (
                        <button
                          type="button"
                          key={fw}
                          onClick={() => toggleArrayItem("frameworks", fw)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                            selected
                              ? "bg-accent/20 border-accent-light text-accent-light font-semibold shadow"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {fw}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Q6: Databases */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Q6. Databases & Data Technologies
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {OPTIONS.databases.map((db) => {
                      const selected = formData.databases.includes(db);
                      return (
                        <button
                          type="button"
                          key={db}
                          onClick={() => toggleArrayItem("databases", db)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                            selected
                              ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-semibold shadow"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {db}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Q10: Tools */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Q10. Tools & Developer Platforms
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {OPTIONS.tools.map((t) => {
                      const selected = formData.tools.includes(t);
                      return (
                        <button
                          type="button"
                          key={t}
                          onClick={() => toggleArrayItem("tools", t)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                            selected
                              ? "bg-amber-500/20 border-amber-400 text-amber-300 font-semibold shadow"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Q11: Soft Skills */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Q11. Strongest Soft Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {OPTIONS.softSkills.map((ss) => {
                      const selected = formData.softSkills.includes(ss);
                      return (
                        <button
                          type="button"
                          key={ss}
                          onClick={() => toggleArrayItem("softSkills", ss)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                            selected
                              ? "bg-purple-500/20 border-purple-400 text-purple-300 font-semibold shadow"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {ss}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Q15: Learning Goals */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Q15. Skills to Learn / Improve Next
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {OPTIONS.learningGoals.map((lg) => {
                      const selected = formData.learningGoals.includes(lg);
                      return (
                        <button
                          type="button"
                          key={lg}
                          onClick={() => toggleArrayItem("learningGoals", lg)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                            selected
                              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-semibold shadow"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {lg}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== STEP 4 ==================== */}
            {step === 4 && (
              <div className="space-y-6 animate-scale-in">
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-base font-display font-bold text-slate-100 flex items-center space-x-2">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <span>Review Your Career DNA Profile</span>
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-500 font-medium block">Target Roles</span>
                      <p className="text-slate-200 font-semibold">
                        {formData.targetRoles.length > 0 ? formData.targetRoles.join(", ") : "Not specified"}
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-500 font-medium block">Status & Education</span>
                      <p className="text-slate-200 font-semibold">
                        {formData.professionalStatus} ({formData.education})
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-500 font-medium block">Technical Skills</span>
                      <p className="text-slate-200 font-semibold truncate">
                        {[...formData.programmingLanguages, ...formData.frameworks].join(", ") || "None selected"}
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-500 font-medium block">Target Salary Range</span>
                      <p className="text-slate-200 font-semibold">
                        {formData.targetSalary.currency === "INR" ? "₹" : "$"}
                        {formData.targetSalary.min} - {formData.targetSalary.currency === "INR" ? "₹" : "$"}
                        {formData.targetSalary.max} LPA
                      </p>
                    </div>
                  </div>
                </div>

                {/* Q18: Additional Notes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1">
                    Q18. Anything else you want PathForge AI to know about your career aspirations?
                  </label>
                  <textarea
                    rows={3}
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    placeholder="Share your ambitions, interests, or specific goals."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-light text-sm"
                  />
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-100 bg-primary hover:bg-primary-light transition-all shadow-md"
                >
                  <span>Next Step</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-100 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Complete & Save Career DNA</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
