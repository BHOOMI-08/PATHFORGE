import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const COMPARISONS = [
  { feature: "ATS Keyword & Semantic Matching", traditional: false, pathforge: true },
  { feature: "Custom 8-Week Skill Roadmap", traditional: false, pathforge: true },
  { feature: "AI Voice/Text Mock Interviews", traditional: false, pathforge: true },
  { feature: "24/7 Conversational AI Mentor", traditional: false, pathforge: true },
  { feature: "Recruiter Shortlist Simulation", traditional: false, pathforge: true },
  { feature: "Emerging Opportunity Market Radar", traditional: false, pathforge: true },
  { feature: "AI CEO Executive Leadership Prep", traditional: false, pathforge: true },
  { feature: "Static PDF Template Export", traditional: true, pathforge: true },
];

export const ComparisonSection = () => {
  return (
    <section className="relative w-full py-24 px-6 sm:px-12 max-w-[1400px] mx-auto z-10">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center space-x-2 rounded-full border border-[#34D399]/30 bg-[#34D399]/10 px-3.5 py-1 text-xs font-extrabold text-[#A7F3D0]">
          <span>Unmatched Advantage</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-100 tracking-tight">
          Why Choose <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#A7F3D0] via-[#34D399] to-[#3B82F6] bg-clip-text text-transparent">
            PathForge AI?
          </span>
        </h2>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Compare traditional static template generators with our complete AI career intelligence system.
        </p>
      </div>

      {/* Glass Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-[32px] bg-[#041220]/80 border border-white/15 p-4 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-x-auto"
      >
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-4 px-6 text-sm font-black text-slate-300 uppercase tracking-wider">
                Capabilities
              </th>
              <th className="py-4 px-6 text-sm font-black text-slate-500 text-center uppercase tracking-wider">
                Traditional Builder
              </th>
              <th className="py-4 px-6 text-sm font-black text-[#A7F3D0] text-center uppercase tracking-wider bg-[#071A2C]/60 rounded-t-2xl">
                PathForge AI Engine
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {COMPARISONS.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6 text-xs sm:text-sm font-bold text-slate-200">
                  {row.feature}
                </td>
                <td className="py-4 px-6 text-center">
                  {row.traditional ? (
                    <div className="h-7 w-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                      <Check size={16} />
                    </div>
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                      <X size={16} />
                    </div>
                  )}
                </td>
                <td className="py-4 px-6 text-center bg-[#071A2C]/40">
                  <div className="h-7 w-7 rounded-full bg-[#34D399]/20 border border-[#34D399]/50 flex items-center justify-center text-[#34D399] mx-auto shadow-md shadow-[#34D399]/20">
                    <Check size={16} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </section>
  );
};

export default ComparisonSection;
