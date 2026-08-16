import { motion } from "framer-motion";
import { Target, Activity, Map, Bot, Award, TrendingUp } from "lucide-react";

export const IntelligenceShowcaseSection = () => {
  return (
    <section className="relative w-full py-24 px-6 sm:px-12 max-w-[1400px] mx-auto z-10">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center space-x-2 rounded-full border border-[#34D399]/30 bg-[#34D399]/10 px-3.5 py-1 text-xs font-extrabold text-[#A7F3D0]">
          <Activity size={14} className="text-[#34D399]" />
          <span>Real-Time Intelligence Dashboard</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-100 tracking-tight">
          Live Analytical Analytics <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#A7F3D0] via-[#34D399] to-[#3B82F6] bg-clip-text text-transparent">
            Built Into Every Module
          </span>
        </h2>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Monitor your ATS compliance, skill gap velocity, and interview performance metrics with precision.
        </p>
      </div>

      {/* Simulated Live Dashboard Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="rounded-[32px] bg-[#041220]/90 border border-white/15 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-black/80 space-y-8"
      >
        {/* Top Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="p-5 rounded-2xl bg-[#071A2C] border border-white/10 flex items-center space-x-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#34D399]">
              <Target size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ATS Score</p>
              <p className="text-xl sm:text-2xl font-black text-[#A7F3D0]">94%</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#071A2C] border border-white/10 flex items-center space-x-4">
            <div className="h-11 w-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#60A5FA]">
              <Award size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resume Health</p>
              <p className="text-xl sm:text-2xl font-black text-slate-100">98 / 100</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#071A2C] border border-white/10 flex items-center space-x-4">
            <div className="h-11 w-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Map size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Roadmap Speed</p>
              <p className="text-xl sm:text-2xl font-black text-purple-300">2.4x Avg</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#071A2C] border border-white/10 flex items-center space-x-4">
            <div className="h-11 w-11 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Bot size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Interview Score</p>
              <p className="text-xl sm:text-2xl font-black text-pink-300">92.5%</p>
            </div>
          </div>

        </div>

        {/* Inner Graphic Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Widget 1: Skill Gap Visualizer */}
          <div className="p-6 rounded-2xl bg-[#071A2C]/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">Skill Gap Coverage</h4>
              <span className="text-xs font-bold text-[#34D399] flex items-center gap-1">
                <TrendingUp size={14} /> +18% this week
              </span>
            </div>
            <div className="space-y-3">
              {[
                { name: "System Architecture", value: 92 },
                { name: "Distributed Systems", value: 85 },
                { name: "GraphQL & Microservices", value: 78 },
                { name: "CI/CD & Kubernetes", value: 88 },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>{item.name}</span>
                    <span className="text-[#A7F3D0]">{item.value}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="h-full bg-gradient-to-r from-[#34D399] to-[#3B82F6] rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Career Match Matrix */}
          <div className="p-6 rounded-2xl bg-[#071A2C]/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">Target Job Match</h4>
              <span className="text-xs font-bold text-[#60A5FA]">Senior AI Engineer</span>
            </div>

            {/* Circular Gauge Representation */}
            <div className="flex flex-col items-center justify-center py-2 space-y-3">
              <div className="relative h-28 w-28 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                <div className="absolute inset-0 rounded-full border-4 border-[#34D399] border-t-transparent animate-spin-slow" />
                <div className="text-center">
                  <span className="text-2xl font-black text-white">96%</span>
                  <span className="block text-[10px] text-slate-400 font-bold">MATCH</span>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400 max-w-xs">
                Your profile ranks in the top 4% of candidate submissions for enterprise technology roles.
              </p>
            </div>
          </div>

          {/* Widget 3: Live AI Feedback Log */}
          <div className="p-6 rounded-2xl bg-[#071A2C]/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">Recent AI Insights</h4>
              <span className="h-2 w-2 rounded-full bg-[#34D399] animate-ping" />
            </div>

            <div className="space-y-2.5">
              {[
                { label: "ATS Keyword Added", text: "'Kubernetes Orchestration' detected in experience section.", badge: "Optimized" },
                { label: "Roadmap Milestone", text: "Completed Week 3: Microservices Communication Patterns.", badge: "Passed" },
                { label: "Mock Interview Score", text: "Answer structure scored 9.4/10 on STAR methodology.", badge: "High Score" },
              ].map((log, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#041220] border border-white/5 space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-200">{log.label}</span>
                    <span className="text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-md">{log.badge}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{log.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </motion.div>

    </section>
  );
};

export default IntelligenceShowcaseSection;
