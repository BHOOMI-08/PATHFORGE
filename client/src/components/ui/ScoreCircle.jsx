import React from "react";
import { motion } from "framer-motion";

/**
 * Animated SVG Score Circle component with Deep Navy & Pastel Mint gradients
 */
export const ScoreCircle = ({
  score = 0,
  size = 180,
  strokeWidth = 14,
  label = "ATS Match Score",
  sublabel = "",
}) => {
  const normalizedScore = Math.min(100, Math.max(0, Number(score) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedScore / 100) * circumference;

  let colorConfig = {
    stroke: "#F87171",
    text: "text-rose-400",
    gradientStart: "#F87171",
    gradientEnd: "#EF4444",
    bgTrack: "stroke-rose-950/40",
    glow: "drop-shadow-[0_0_15px_rgba(248,113,113,0.3)]",
  };

  if (normalizedScore >= 75) {
    colorConfig = {
      stroke: "#34D399",
      text: "text-[#34D399]",
      gradientStart: "#A7F3D0",
      gradientEnd: "#34D399",
      bgTrack: "stroke-emerald-950/40",
      glow: "drop-shadow-[0_0_15px_rgba(52,211,153,0.35)]",
    };
  } else if (normalizedScore >= 50) {
    colorConfig = {
      stroke: "#3B82F6",
      text: "text-[#3B82F6]",
      gradientStart: "#60A5FA",
      gradientEnd: "#3B82F6",
      bgTrack: "stroke-blue-950/40",
      glow: "drop-shadow-[0_0_15px_rgba(59,130,246,0.35)]",
    };
  }

  const gradientId = `score-gradient-${normalizedScore}-${Math.round(Math.random() * 1000)}`;

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className={`transform -rotate-90 ${colorConfig.glow}`}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorConfig.gradientStart} />
              <stop offset="100%" stopColor={colorConfig.gradientEnd} />
            </linearGradient>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${colorConfig.bgTrack}`}
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated Value Stroke Circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>

        {/* Center Text Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            className={`text-4xl font-display font-black tracking-tight ${colorConfig.text}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {normalizedScore}%
          </motion.span>
          {sublabel && <span className="text-xs font-medium text-slate-400 mt-0.5">{sublabel}</span>}
        </div>
      </div>

      {label && <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</span>}
    </div>
  );
};

export default ScoreCircle;
