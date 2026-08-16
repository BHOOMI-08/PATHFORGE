import { motion } from "framer-motion";
import {
  FileSearch,
  Target,
  Map,
  Bot,
  UserCheck,
  Compass,
  Sparkles,
  Crown
} from "lucide-react";

const FEATURES = [
  {
    icon: FileSearch,
    title: "Resume Parser",
    description: "Deep parsing engine that extracts skills, metrics, experience, and format errors in seconds.",
    color: "from-blue-500 to-indigo-500",
    iconColor: "text-blue-400",
  },
  {
    icon: Target,
    title: "ATS Optimizer",
    description: "Real-time scoring against target job descriptions with instant keyword placement recommendations.",
    color: "from-emerald-500 to-teal-500",
    iconColor: "text-[#34D399]",
  },
  {
    icon: Map,
    title: "AI Career Roadmap",
    description: "Personalized 8-week structured roadmap with step-by-step milestones to close your skill gaps.",
    color: "from-purple-500 to-indigo-500",
    iconColor: "text-purple-400",
  },
  {
    icon: Bot,
    title: "Mock Interview",
    description: "Conversational voice/text AI interviewer providing role-specific questions and immediate feedback.",
    color: "from-pink-500 to-rose-500",
    iconColor: "text-pink-400",
  },
  {
    icon: Sparkles,
    title: "AI Mentor",
    description: "24/7 dedicated AI career coach to answer questions, guide decisions, and provide tactical advice.",
    color: "from-amber-500 to-orange-500",
    iconColor: "text-amber-400",
  },
  {
    icon: UserCheck,
    title: "Recruiter Simulator",
    description: "Simulates recruiter evaluations to predict shortlist probabilities before you submit your application.",
    color: "from-cyan-500 to-blue-500",
    iconColor: "text-cyan-400",
  },
  {
    icon: Compass,
    title: "Opportunity Radar",
    description: "Scans high-growth tech markets to detect emerging roles matching your evolving career profile.",
    color: "from-[#3B82F6] to-cyan-400",
    iconColor: "text-[#60A5FA]",
  },
  {
    icon: Crown,
    title: "AI CEO Mode",
    description: "Strategic executive simulator that develops high-level leadership decision-making capabilities.",
    color: "from-violet-500 to-purple-500",
    iconColor: "text-violet-400",
  },
];

export const FeatureGridSection = () => {
  return (
    <section className="relative w-full py-24 px-6 sm:px-12 max-w-[1400px] mx-auto z-10">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center space-x-2 rounded-full border border-[#34D399]/30 bg-[#34D399]/10 px-3.5 py-1 text-xs font-extrabold text-[#A7F3D0]">
          <Sparkles size={14} className="text-[#34D399]" />
          <span>Full-Stack AI Suite</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-100 tracking-tight">
          Everything You Need To <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#A7F3D0] via-[#34D399] to-[#3B82F6] bg-clip-text text-transparent">
            Build Your Dream Career
          </span>
        </h2>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Explore our suite of enterprise-grade AI tools designed to analyze, optimize, and elevate your professional trajectory.
        </p>
      </div>

      {/* 3x3 Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {FEATURES.map((feature, idx) => {
          const IconComponent = feature.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="group relative rounded-3xl bg-[#041220]/70 border border-white/10 p-7 backdrop-blur-xl hover:border-[#34D399]/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#34D399]/10 overflow-hidden flex flex-col justify-between"
            >
              {/* Subtle top border glow on hover */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#34D399]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                {/* Icon Container */}
                <div className="h-12 w-12 rounded-2xl bg-[#091C2E] border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-white/20 transition-all shadow-md">
                  <IconComponent className={feature.iconColor} size={24} />
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-black text-slate-100 mb-2 group-hover:text-[#A7F3D0] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Subtle Indicator */}
              <div className="pt-6 flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-[#34D399] transition-colors">
                <span>Module Included</span>
                <span>→</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default FeatureGridSection;
