import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const DEFAULT_GOALS = [
  { name: "Week 1", Target: 8, Completed: 6 },
  { name: "Week 2", Target: 10, Completed: 8 },
  { name: "Week 3", Target: 12, Completed: 11 },
  { name: "Week 4", Target: 10, Completed: 9 },
];

export const ActivityBarChart = ({ data = DEFAULT_GOALS }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis dataKey="name" stroke="#CBD5E1" tick={{ fontSize: 11 }} />
          <YAxis stroke="#CBD5E1" tick={{ fontSize: 11 }} />
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
          <Bar dataKey="Target" fill="#071A2C" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Completed" fill="#34D399" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityBarChart;
