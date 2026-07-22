import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";

export const SkillRadarChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        No skill dimension metrics available yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.06)" />
          <PolarAngleAxis dataKey="subject" stroke="#CBD5E1" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255, 255, 255, 0.12)" />
          <Radar
            name="Skill Strength"
            dataKey="A"
            stroke="#34D399"
            fill="#34D399"
            fillOpacity={0.35}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(16, 38, 61, 0.95)",
              borderColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              color: "#F8FAFC",
              fontSize: "12px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
              backdropFilter: "blur(12px)",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillRadarChart;
