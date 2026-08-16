import { motion } from "framer-motion";
import { Sparkles, FileText, Briefcase, Cpu, Bot, Map, Users } from "lucide-react";

const NODES = [
  { label: "Resume Audit", icon: FileText, angle: 0, color: "text-blue-400" },
  { label: "Job Matcher", icon: Briefcase, angle: 45, color: "text-cyan-400" },
  { label: "Skill Matrix", icon: Cpu, angle: 90, color: "text-[#34D399]" },
  { label: "AI Interview", icon: Bot, angle: 135, color: "text-pink-400" },
  { label: "8-Wk Roadmap", icon: Map, angle: 180, color: "text-purple-400" },
  { label: "AI Mentor", icon: Sparkles, angle: 225, color: "text-amber-400" },
  { label: "Recruiters", icon: Users, angle: 315, color: "text-indigo-400" },
];

export const EcosystemSection = () => {
  return (
    <section className="relative w-full py-24 px-6 sm:px-12 max-w-[1400px] mx-auto z-10">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center space-x-2 rounded-full border border-[#34D399]/30 bg-[#34D399]/10 px-3.5 py-1 text-xs font-extrabold text-[#A7F3D0]">
          <Sparkles size={14} className="text-[#34D399]" />
          <span>Connected Neural Network</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-100 tracking-tight">
          The Integrated AI <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#A7F3D0] via-[#34D399] to-[#3B82F6] bg-clip-text text-transparent">
            Career Ecosystem
          </span>
        </h2>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Every tool feeds real-time data back into the central AI engine, continuously updating your career readiness index.
        </p>
      </div>

      {/* Network Diagram Graphic */}
      <div className="relative h-[480px] sm:h-[540px] w-full flex items-center justify-center">
        
        {/* Central Core Node */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-20 h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-gradient-to-tr from-[#3B82F6] via-[#10B981] to-[#34D399] p-1 shadow-2xl shadow-[#34D399]/30 flex items-center justify-center"
        >
          <div className="h-full w-full bg-[#041220] rounded-full flex flex-col items-center justify-center text-center p-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#34D399] to-[#3B82F6] text-slate-950 font-black text-xs flex items-center justify-center mb-1">
              PF
            </div>
            <span className="text-xs font-black text-white">PathForge AI</span>
            <span className="text-[9px] font-bold text-[#A7F3D0]">Core Engine</span>
          </div>
        </motion.div>

        {/* Orbit Rings & SVG Lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[300px] sm:w-[420px] h-[300px] sm:h-[420px] rounded-full border border-white/10 animate-spin-slow opacity-40" />
        </div>

        {/* Outer Nodes Grid Layout */}
        <div className="absolute inset-0 max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 items-center justify-center p-4 my-auto">
          {NODES.map((node, idx) => {
            const IconComponent = node.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ scale: 1.1 }}
                className="p-3.5 rounded-2xl bg-[#041220]/90 border border-white/15 backdrop-blur-xl shadow-xl flex items-center space-x-3 group cursor-default"
              >
                <div className="h-9 w-9 rounded-xl bg-[#091C2E] border border-white/10 flex items-center justify-center shrink-0">
                  <IconComponent className={node.color} size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-100 group-hover:text-[#A7F3D0] transition-colors truncate">
                    {node.label}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">Active Sync</p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

    </section>
  );
};

export default EcosystemSection;
