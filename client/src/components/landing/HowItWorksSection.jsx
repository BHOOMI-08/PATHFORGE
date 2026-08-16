import { motion } from "framer-motion";
import { Upload, Cpu, Target, Map, Bot, Trophy } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Upload Resume",
    description: "Drop your PDF/Word resume into our secure parser.",
    icon: Upload,
    color: "from-blue-500 to-indigo-500",
  },
  {
    number: "02",
    title: "AI Analysis",
    description: "Gemini AI parses structure, metrics, and skill depth.",
    icon: Cpu,
    color: "from-[#3B82F6] to-cyan-500",
  },
  {
    number: "03",
    title: "ATS Optimization",
    description: "Align keywords & format with high-scoring ATS templates.",
    icon: Target,
    color: "from-[#34D399] to-emerald-500",
  },
  {
    number: "04",
    title: "Career Roadmap",
    description: "Receive a step-by-step 8-week targeted action plan.",
    icon: Map,
    color: "from-purple-500 to-indigo-500",
  },
  {
    number: "05",
    title: "Mock Interview",
    description: "Practice real role questions with voice/text AI coach.",
    icon: Bot,
    color: "from-pink-500 to-rose-500",
  },
  {
    number: "06",
    title: "Land Interviews",
    description: "Apply with maximum confidence and candidate power.",
    icon: Trophy,
    color: "from-amber-400 to-[#34D399]",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="relative w-full py-24 px-6 sm:px-12 max-w-[1400px] mx-auto z-10">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
        <div className="inline-flex items-center space-x-2 rounded-full border border-[#34D399]/30 bg-[#34D399]/10 px-3.5 py-1 text-xs font-extrabold text-[#A7F3D0]">
          <span>6-Step Engine</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-100 tracking-tight">
          How PathForge <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#A7F3D0] via-[#34D399] to-[#3B82F6] bg-clip-text text-transparent">
            Transforms Your Journey
          </span>
        </h2>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          From initial upload to signing your offer letter, experience an automated intelligence pipeline built for candidate success.
        </p>
      </div>

      {/* Steps Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
        
        {STEPS.map((step, idx) => {
          const IconComponent = step.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="relative rounded-3xl bg-[#041220]/80 border border-white/10 p-7 backdrop-blur-xl hover:border-[#34D399]/40 transition-all duration-300 shadow-xl group"
            >
              {/* Step Badge */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-2xl font-black bg-gradient-to-r from-[#34D399] to-[#3B82F6] bg-clip-text text-transparent">
                  {step.number}
                </span>
                <div className="h-10 w-10 rounded-2xl bg-[#091C2E] border border-white/10 flex items-center justify-center text-[#A7F3D0] group-hover:scale-110 transition-transform">
                  <IconComponent size={20} />
                </div>
              </div>

              {/* Step Content */}
              <h3 className="text-base font-black text-slate-100 mb-2 group-hover:text-[#A7F3D0] transition-colors">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {step.description}
              </p>

              {/* Connecting Accent Bar */}
              <div className="mt-6 h-1 w-full rounded-full bg-white/5 overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-[#34D399] to-[#3B82F6] rounded-full group-hover:w-full transition-all duration-500" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorksSection;
