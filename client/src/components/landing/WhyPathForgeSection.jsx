import { motion } from "framer-motion";
import { FileText, Target, Map, Bot, Zap, CheckCircle2, TrendingUp } from "lucide-react";

export const WhyPathForgeSection = () => {
  return (
    <section className="relative w-full py-24 px-6 sm:px-12 max-w-[1400px] mx-auto z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Side: Content */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 space-y-6"
        >
          <div className="inline-flex items-center space-x-2 rounded-full border border-[#34D399]/30 bg-[#34D399]/10 px-3.5 py-1 text-xs font-extrabold text-[#A7F3D0]">
            <Zap size={14} className="text-[#34D399]" />
            <span>The Next-Gen Career Stack</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-100 tracking-tight leading-[1.15]">
            Why Modern Careers <br />
            <span className="bg-gradient-to-r from-[#A7F3D0] via-[#34D399] to-[#3B82F6] bg-clip-text text-transparent">
              Need AI Intelligence
            </span>
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Traditional static resume builders fail because 75%+ of applications are rejected by automated ATS screeners before a human recruiter ever reads them.
          </p>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            PathForge AI provides an end-to-end career intelligence engine. From real-time ATS optimization and custom 8-week roadmaps to AI mock interviews and recruiter simulations—we turn candidate preparation into a scientific advantage.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Real-Time Keyword & Semantic Match Optimization",
              "Dynamic 8-Week Skill Gap Closing Roadmaps",
              "Conversational AI Mock Interviews with Live Feedback",
              "Recruiter Trajectory & Salary Potential Simulation",
            ].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-xs sm:text-sm font-semibold text-slate-200">
                <CheckCircle2 size={18} className="text-[#34D399] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Animated Floating Cards Illustration */}
        <div className="lg:col-span-6 relative h-[440px] sm:h-[480px] w-full flex items-center justify-center">
          
          {/* Background Ambient Glow */}
          <div className="absolute w-72 h-72 bg-[#34D399]/15 rounded-full blur-[100px] pointer-events-none" />

          {/* Central Showcase Stack */}
          <div className="relative w-full max-w-md h-full flex flex-col justify-center space-y-4">
            
            {/* Card 1: Resume Analysis */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="p-4 rounded-2xl bg-[#041220]/90 border border-white/15 backdrop-blur-xl shadow-xl shadow-black/40 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#60A5FA]">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-100">Resume Semantic Audit</p>
                  <p className="text-[11px] text-slate-400">98.4% Match Rate • Senior Role</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-black border border-emerald-500/30">
                Passed ATS
              </span>
            </motion.div>

            {/* Card 2: ATS Score Badge (Highlighted) */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="p-5 rounded-2xl bg-gradient-to-r from-[#071A2C] via-[#09223A] to-[#05101B] border border-[#34D399]/40 backdrop-blur-xl shadow-2xl shadow-[#34D399]/10 relative z-10"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-[#34D399]/20 border border-[#34D399]/40 flex items-center justify-center text-[#34D399]">
                    <Target size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">Live ATS Optimization</p>
                    <p className="text-[11px] text-slate-400">Real-time keyword scoring</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-[#A7F3D0]">94 / 100</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  whileInView={{ width: "94%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-[#34D399] to-[#3B82F6] rounded-full"
                />
              </div>
            </motion.div>

            {/* Card 3: Career Roadmap */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="p-4 rounded-2xl bg-[#041220]/90 border border-white/15 backdrop-blur-xl shadow-xl shadow-black/40 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Map size={20} />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-100">8-Week Skill Roadmap</p>
                  <p className="text-[11px] text-slate-400">Week 4: System Architecture</p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-[#A7F3D0] font-bold">
                <TrendingUp size={14} />
                <span>50% Complete</span>
              </div>
            </motion.div>

            {/* Card 4: AI Mentor */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="p-4 rounded-2xl bg-[#041220]/90 border border-white/15 backdrop-blur-xl shadow-xl shadow-black/40 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Bot size={20} />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-100">AI Mock Interviewer</p>
                  <p className="text-[11px] text-slate-400">Behavioral & Technical Simulator</p>
                </div>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-[#34D399] animate-pulse" />
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default WhyPathForgeSection;
