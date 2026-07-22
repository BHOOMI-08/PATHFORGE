import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { register as apiRegister } from "../services/auth.service.js";
import {
  Mail,
  Lock,
  User,
  Loader2,
  Sparkles,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Bot,
  Zap,
  TrendingUp,
  Activity,
  Layers
} from "lucide-react";

// Login validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Work email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

// Registration validation schema
const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string()
    .min(1, "Work email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const AuthPage = ({ initialMode = "login" }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode state with route location
  useEffect(() => {
    if (location.pathname === "/register") {
      setMode("register");
    } else if (location.pathname === "/login") {
      setMode("login");
    }
  }, [location.pathname]);

  const switchMode = (targetMode) => {
    setMode(targetMode);
    setShowPassword(false);
    if (targetMode === "register") {
      navigate("/register", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  // Login Form Hook
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Register Form Hook
  const {
    register: regRegister,
    handleSubmit: handleRegSubmit,
    watch: watchRegFields,
    formState: { errors: regErrors },
    reset: resetRegForm,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const regPasswordValue = watchRegFields("password", "");

  // Password Requirement Validator Helpers
  const passwordCriteria = [
    { label: "8+ characters", met: regPasswordValue.length >= 8 },
    { label: "1 uppercase letter", met: /[A-Z]/.test(regPasswordValue) },
    { label: "1 lowercase letter", met: /[a-z]/.test(regPasswordValue) },
    { label: "1 number", met: /[0-9]/.test(regPasswordValue) },
    { label: "1 special character", met: /[^A-Za-z0-9]/.test(regPasswordValue) },
  ];

  // Submit Handlers
  const onLoginSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (error) {
      // Toast notification is managed by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await apiRegister(data.name, data.email, data.password);
      toast.success(response.message || "Account created successfully!");
      // Automatically attempt login after successful creation
      try {
        await login(data.email, data.password);
        navigate("/dashboard");
      } catch (loginErr) {
        switchMode("login");
      }
    } catch (error) {
      const msg = error.body?.message || error.message || "Registration failed.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020817] text-slate-100 flex flex-col justify-between selection:bg-[#34D399]/30 selection:text-white relative overflow-hidden font-sans">
      
      {/* Dynamic Background Mesh Gradients & Floating Auroras */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-[#3B82F6]/15 via-[#10B981]/10 to-transparent rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-br from-[#34D399]/15 via-[#3B82F6]/10 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none" />

      {/* Floating Pill Glass Navbar */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-5 max-w-6xl w-[92%] sm:w-[95%] mx-auto z-50 rounded-full bg-[#030712]/85 border border-white/15 backdrop-blur-2xl px-6 py-3 flex items-center justify-between shadow-2xl shadow-black/80 hover:border-[#34D399]/30 transition-all"
      >
        {/* Left: PF Monogram Icon Logo + Brand Name + Tagline */}
        <Link to="/" className="flex items-center group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#34D399] via-[#10B981] to-[#3B82F6] text-slate-950 font-black text-sm shadow-md shadow-[#34D399]/25 group-hover:scale-105 transition-all">
            PF
          </div>
          <span className="font-display font-black text-lg tracking-tight text-white group-hover:text-[#A7F3D0] transition-colors ml-3">
            PathForge AI
          </span>
          <span className="hidden md:inline-flex items-center ml-3 pl-3 border-l border-white/15 text-xs font-semibold text-[#A7F3D0]">
            AI Career Intelligence
          </span>
        </Link>

        {/* Right: Live Status & Quick Action Button */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI Engine Online</span>
          </div>

          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#34D399] to-[#3B82F6] text-slate-950 font-black text-xs hover:opacity-90 transition-all shadow-md shadow-[#34D399]/20"
          >
            {mode === "login" ? "Create Account" : "Sign In"}
          </button>
        </div>
      </motion.header>

      {/* Main Split Layout Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 px-6 sm:px-12 pt-8 pb-12 items-center z-10">
        
        {/* LEFT PANEL: Hero Introduction & AI Neural Visualizer (Span 7) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-7 space-y-7 py-2"
        >
          {/* Tag & Hero Headline */}
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-full border border-[#34D399]/30 bg-[#34D399]/10 px-3.5 py-1 text-xs font-extrabold text-[#A7F3D0] shadow-sm">
              <Sparkles size={14} className="text-[#34D399] animate-pulse" />
              <span>Enterprise Candidate Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-slate-100 tracking-tight leading-[1.1]">
              Build Your Dream Career <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#A7F3D0] via-[#34D399] to-[#3B82F6] bg-clip-text text-transparent">
                Engineered by AI
              </span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
              PathForge AI analyzes your resume, optimizes for ATS algorithms, generates custom 8-week career roadmaps, conducts real-time AI mock interviews, and simulates executive trajectory.
            </p>
          </div>

          {/* Interactive CSS / SVG Neural Visualizer */}
          <div className="relative h-52 sm:h-60 w-full rounded-3xl border border-white/10 bg-[#041220]/70 p-6 backdrop-blur-2xl overflow-hidden flex items-center justify-center shadow-2xl shadow-black/50 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#3B82F6]/10 via-transparent to-[#34D399]/10 opacity-70 group-hover:opacity-100 transition-opacity" />

            {/* Glowing Flow Lines */}
            <svg className="absolute inset-0 w-full h-full stroke-emerald-500/20" fill="none">
              <line x1="15%" y1="50%" x2="40%" y2="50%" strokeWidth="2" strokeDasharray="6 6" className="animate-pulse" />
              <line x1="40%" y1="50%" x2="65%" y2="50%" strokeWidth="2" />
              <line x1="65%" y1="50%" x2="88%" y2="50%" strokeWidth="2" strokeDasharray="6 6" />
            </svg>

            {/* Glowing Nodes */}
            <div className="relative z-10 flex items-center justify-between w-full max-w-xl px-2 sm:px-6">
              
              <div className="flex flex-col items-center space-y-2.5">
                <div className="h-12 w-12 rounded-2xl bg-[#091C2E] border border-white/15 flex items-center justify-center text-[#A7F3D0] shadow-lg shadow-emerald-500/10 hover:border-[#34D399]/50 transition-all">
                  <Cpu size={22} />
                </div>
                <span className="text-[11px] font-bold text-slate-300">Resume Parser</span>
              </div>

              <div className="flex flex-col items-center space-y-2.5">
                <div className="h-12 w-12 rounded-2xl bg-[#091C2E] border border-white/15 flex items-center justify-center text-[#60A5FA] shadow-lg shadow-blue-500/10 hover:border-[#3B82F6]/50 transition-all">
                  <ShieldCheck size={22} />
                </div>
                <span className="text-[11px] font-bold text-slate-300">ATS Optimizer</span>
              </div>

              <div className="flex flex-col items-center space-y-2.5">
                <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-[#3B82F6] via-[#10B981] to-[#34D399] p-0.5 shadow-xl shadow-emerald-500/30">
                  <div className="h-full w-full bg-[#041220] rounded-[22px] flex items-center justify-center text-[#A7F3D0]">
                    <Sparkles size={28} className="animate-spin-slow" />
                  </div>
                </div>
                <span className="text-xs font-black text-white">AI Core Engine</span>
              </div>

              <div className="flex flex-col items-center space-y-2.5">
                <div className="h-12 w-12 rounded-2xl bg-[#091C2E] border border-white/15 flex items-center justify-center text-[#F472B6] shadow-lg shadow-pink-500/10 hover:border-pink-500/50 transition-all">
                  <Bot size={22} />
                </div>
                <span className="text-[11px] font-bold text-slate-300">AI Mentor</span>
              </div>

            </div>
          </div>

          {/* Feature Showcase Pills */}
          <div className="flex flex-wrap gap-2.5">
            {[
              "✓ Real-time ATS Scorer",
              "✓ 8-Week AI Roadmap",
              "✓ AI Mock Interviews",
              "✓ Job Match Matrix",
              "✓ Career Twin Simulation",
              "✓ AI CEO Mode",
            ].map((pill, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-xl bg-[#071A2C]/80 border border-white/10 text-slate-300 text-xs font-bold hover:border-[#34D399]/40 hover:text-white transition-all shadow-sm cursor-default"
              >
                {pill}
              </span>
            ))}
          </div>

          {/* Trust Metric Cards */}
          <div className="grid grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-[#041220]/80 border border-white/10 backdrop-blur-md">
              <span className="text-2xl font-black text-[#A7F3D0] block">+34%</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ATS Score Growth</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#041220]/80 border border-white/10 backdrop-blur-md">
              <span className="text-2xl font-black text-[#60A5FA] block">15K+</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mock Interviews</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#041220]/80 border border-white/10 backdrop-blur-md">
              <span className="text-2xl font-black text-slate-100 block">94%</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Career Accuracy</span>
            </div>
          </div>

        </motion.div>

        {/* RIGHT PANEL: Premium Glass Auth Card (Span 5) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5 flex justify-center lg:justify-end"
        >
          <div className="w-full max-w-[520px] bg-[#0C1828]/85 border border-white/15 rounded-[32px] p-7 sm:p-9 backdrop-blur-2xl shadow-2xl shadow-black/80 space-y-6 relative overflow-hidden">
            
            {/* Subtle Gradient Glow Ring inside card */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-gradient-to-bl from-[#34D399]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Segmented Mode Switcher Bar */}
            <div className="grid grid-cols-2 p-1.5 bg-[#041220]/90 border border-white/10 rounded-2xl relative z-10">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`py-2.5 text-xs font-black rounded-xl transition-all relative z-10 flex items-center justify-center space-x-2 ${
                  mode === "login" ? "text-slate-950" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {mode === "login" && (
                  <motion.div
                    layoutId="activeAuthTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#34D399] to-[#3B82F6] rounded-xl shadow-md -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`py-2.5 text-xs font-black rounded-xl transition-all relative z-10 flex items-center justify-center space-x-2 ${
                  mode === "register" ? "text-slate-950" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {mode === "register" && (
                  <motion.div
                    layoutId="activeAuthTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#34D399] to-[#3B82F6] rounded-xl shadow-md -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span>Create Account</span>
              </button>
            </div>

            {/* Dynamic Form Header */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-1"
              >
                <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-100 tracking-tight">
                  {mode === "login" ? "Welcome Back 👋" : "Get Started Free 🚀"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {mode === "login"
                    ? "Sign in to access your AI Career Intelligence workspace."
                    : "Build your AI-powered career roadmap and resume audit."}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Dynamic Form Body */}
            <AnimatePresence mode="wait">
              {mode === "login" ? (
                /* LOGIN FORM */
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleLoginSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-xs font-extrabold text-slate-300 mb-1.5 uppercase tracking-wider"
                    >
                      Work Email
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                        <Mail size={18} />
                      </span>
                      <input
                        id="login-email"
                        type="email"
                        disabled={isLoading}
                        placeholder="name@company.com"
                        className="w-full bg-[#041220]/90 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/20 transition-all disabled:opacity-50"
                        {...loginRegister("email")}
                      />
                    </div>
                    {loginErrors.email && (
                      <p className="mt-1 text-xs text-rose-400 font-semibold">{loginErrors.email.message}</p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label
                        htmlFor="login-password"
                        className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider"
                      >
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                        <Lock size={18} />
                      </span>
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        disabled={isLoading}
                        placeholder="••••••••"
                        className="w-full bg-[#041220]/90 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/20 transition-all disabled:opacity-50"
                        {...loginRegister("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="mt-1 text-xs text-rose-400 font-semibold">{loginErrors.password.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#34D399] via-[#10B981] to-[#3B82F6] hover:opacity-95 transition-all shadow-xl shadow-[#34D399]/20 disabled:opacity-50 disabled:cursor-not-allowed mt-3 group"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2" size={18} />
                        Authenticating Session...
                      </>
                    ) : (
                      <>
                        <span>Sign In to Workspace</span>
                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-xs text-slate-400">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="font-extrabold text-[#A7F3D0] hover:underline transition-colors ml-1"
                    >
                      Create Account
                    </button>
                  </div>
                </motion.form>
              ) : (
                /* REGISTER FORM */
                <motion.form
                  key="register-form"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleRegSubmit(onRegisterSubmit)}
                  className="space-y-3.5"
                >
                  {/* Full Name Input */}
                  <div>
                    <label
                      htmlFor="reg-name"
                      className="block text-xs font-extrabold text-slate-300 mb-1 uppercase tracking-wider"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                        <User size={18} />
                      </span>
                      <input
                        id="reg-name"
                        type="text"
                        disabled={isLoading}
                        placeholder="John Doe"
                        className="w-full bg-[#041220]/90 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/20 transition-all disabled:opacity-50"
                        {...regRegister("name")}
                      />
                    </div>
                    {regErrors.name && (
                      <p className="mt-1 text-xs text-rose-400 font-semibold">{regErrors.name.message}</p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor="reg-email"
                      className="block text-xs font-extrabold text-slate-300 mb-1 uppercase tracking-wider"
                    >
                      Work Email
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                        <Mail size={18} />
                      </span>
                      <input
                        id="reg-email"
                        type="email"
                        disabled={isLoading}
                        placeholder="you@company.com"
                        className="w-full bg-[#041220]/90 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/20 transition-all disabled:opacity-50"
                        {...regRegister("email")}
                      />
                    </div>
                    {regErrors.email && (
                      <p className="mt-1 text-xs text-rose-400 font-semibold">{regErrors.email.message}</p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div>
                    <label
                      htmlFor="reg-password"
                      className="block text-xs font-extrabold text-slate-300 mb-1 uppercase tracking-wider"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                        <Lock size={18} />
                      </span>
                      <input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        disabled={isLoading}
                        placeholder="••••••••"
                        className="w-full bg-[#041220]/90 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/20 transition-all disabled:opacity-50"
                        {...regRegister("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Password Criteria Pill Indicators */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {passwordCriteria.map((c, idx) => (
                        <span
                          key={idx}
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border transition-all ${
                            c.met
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                              : "bg-white/5 border-white/5 text-slate-500"
                          }`}
                        >
                          {c.met ? "✓ " : "• "}{c.label}
                        </span>
                      ))}
                    </div>

                    {regErrors.password && (
                      <p className="mt-1 text-xs text-rose-400 font-semibold">{regErrors.password.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#34D399] via-[#10B981] to-[#3B82F6] hover:opacity-95 transition-all shadow-xl shadow-[#34D399]/20 disabled:opacity-50 disabled:cursor-not-allowed mt-3 group"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2" size={18} />
                        Creating AI Account...
                      </>
                    ) : (
                      <>
                        <span>Create AI Account</span>
                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-xs text-slate-400">
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="font-extrabold text-[#A7F3D0] hover:underline transition-colors ml-1"
                    >
                      Sign In
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </motion.div>

      </main>

      {/* Footer with Technology Badges */}
      <footer className="w-full py-5 px-6 sm:px-12 border-t border-white/5 bg-[#020817] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 z-20">
        <p>© {new Date().getFullYear()} PathForge AI Inc. All rights reserved.</p>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-400 mr-1">Engineered with:</span>
          {["React 19", "Express", "MongoDB", "Gemini AI", "Tailwind"].map((tech, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-lg bg-[#041220] border border-white/5 text-[11px] font-bold text-slate-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
