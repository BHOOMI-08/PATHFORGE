import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export const FinalCTASection = ({ onGetStarted }) => {
  return (
    <section className="relative w-full py-24 px-6 sm:px-12 max-w-[1400px] mx-auto z-10">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-[36px] bg-gradient-to-br from-[#071A2C] via-[#09223A] to-[#041220] border border-[#34D399]/30 p-10 sm:p-16 backdrop-blur-2xl shadow-2xl shadow-[#34D399]/10 text-center space-y-8 overflow-hidden"
      >
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#3B82F6]/15 via-[#34D399]/20 to-transparent rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center space-x-2 rounded-full border border-[#34D399]/40 bg-[#34D399]/10 px-4 py-1.5 text-xs font-extrabold text-[#A7F3D0]">
            <Sparkles size={14} className="text-[#34D399] animate-pulse" />
            <span>Transform Your Professional Trajectory Today</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-slate-100 tracking-tight leading-[1.15]">
            Ready To Build Your <br />
            <span className="bg-gradient-to-r from-[#A7F3D0] via-[#34D399] to-[#3B82F6] bg-clip-text text-transparent">
              Dream AI Career?
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Join thousands of candidates using PathForge AI to pass ATS screeners, master interview prep, and accelerate their career growth.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#34D399] via-[#10B981] to-[#3B82F6] text-slate-950 font-black text-sm hover:opacity-95 transition-all shadow-2xl shadow-[#34D399]/30 flex items-center justify-center space-x-3 group cursor-pointer"
            >
              <span>Start Your AI Journey</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>

    </section>
  );
};

export default FinalCTASection;
