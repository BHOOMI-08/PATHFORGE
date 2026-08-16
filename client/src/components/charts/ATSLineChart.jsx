import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export const ATSLineChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        No ATS audit history data available yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full" role="img" aria-label={`ATS score trajectory containing ${data.length} completed analyses`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis
            dataKey="createdAt"
            stroke="#94A3B8"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          />
          <YAxis domain={[0, 100]} stroke="#94A3B8" tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) => [`${value}%`, "ATS Score"]}
            labelFormatter={(value, payload) => {
              const record = payload?.[0]?.payload;
              const date = new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
              return `${record?.label || "ATS Audit"} · ${date}`;
            }}
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
          <Line
            type="monotone"
            dataKey="score"
            name="ATS Score"
            stroke="#34D399"
            strokeWidth={3.5}
            dot={{ fill: "#3B82F6", r: 5 }}
            activeDot={{ r: 8, fill: "#34D399", stroke: "#F8FAFC", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ATSLineChart;
