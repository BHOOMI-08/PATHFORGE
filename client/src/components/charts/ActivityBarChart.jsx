import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export const ActivityBarChart = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center px-6 text-center text-xs text-slate-500">
        Create a roadmap to track scheduled and completed tasks by week.
      </div>
    );
  }

  return (
    <div className="h-64 w-full" role="img" aria-label="Roadmap tasks scheduled and completed by milestone start week">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis dataKey="label" stroke="#CBD5E1" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} stroke="#CBD5E1" tick={{ fontSize: 11 }} />
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
          <Legend wrapperStyle={{ fontSize: "11px", color: "#CBD5E1" }} />
          <Bar dataKey="target" name="Scheduled" fill="#3B82F6" radius={[8, 8, 0, 0]} />
          <Bar dataKey="completed" name="Completed" fill="#34D399" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityBarChart;
