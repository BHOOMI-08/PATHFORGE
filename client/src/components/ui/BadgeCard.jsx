import React from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";

export const BadgeCard = ({ badge }) => {
  const { title, description, unlocked } = badge;

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className={`p-6 rounded-3xl border transition-all relative overflow-hidden backdrop-blur-xl flex flex-col justify-between ${
        unlocked
          ? "bg-[#10263D]/80 border-[#34D399]/40 shadow-lg shadow-[#34D399]/10"
          : "bg-[#041220]/40 border-white/5 opacity-50 grayscale"
      }`}
    >
      {unlocked && (
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#A7F3D0]/15 rounded-full blur-xl pointer-events-none" />
      )}

      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">{title.split(" ")[0]}</span>
        {unlocked ? (
          <span className="px-3 py-1 bg-[#34D399]/20 text-[#A7F3D0] border border-[#34D399]/40 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Unlocked
          </span>
        ) : (
          <span className="px-3 py-1 bg-[#020817] text-slate-500 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Lock className="w-3 h-3" /> Locked
          </span>
        )}
      </div>

      <div className="mt-4">
        <h4 className="font-display font-extrabold text-slate-100 text-base">{title}</h4>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

export default BadgeCard;
